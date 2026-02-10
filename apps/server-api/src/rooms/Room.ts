import { and, asc, desc, eq, gt, lte } from 'drizzle-orm';
import type { WebSocket } from 'ws';
import type { Database } from '../db/client.js';
import { checkpoints, ops, snapshots } from '../db/schema/index.js';
import type { Logger } from '../lib/logger.js';
import { type BoardRole, isOpAllowed, canSendPresence, canSendHybrid } from '../auth/roles.js';
import { ClientRateLimiter, isPayloadSizeOk, LIMITS } from '../auth/limits.js';

interface ConnectedClient {
  clientId: string;
  socket: WebSocket;
  displayName: string;
  color: string;
  role: BoardRole;
  lastCursorUpdate: number;
}

interface PersistedOp {
  serverSeq: number;
  clientId: string;
  clientSeq: number;
  opType: string;
  payload: unknown;
}

const SNAPSHOT_INTERVAL = 50;
const PRESENCE_THROTTLE_MS = 50; // 20Hz
const ROOM_GRACE_PERIOD_MS = 30_000;

const USER_COLORS = [
  '#4a9eff',
  '#ff6b6b',
  '#51cf66',
  '#fcc419',
  '#cc5de8',
  '#ff922b',
  '#20c997',
  '#845ef7',
  '#f06595',
  '#22b8cf',
];

export class Room {
  readonly boardId: string;
  private clients = new Map<string, ConnectedClient>();
  private currentSeq: number = 0;
  private seenClientOps = new Set<string>(); // "clientId:clientSeq"
  private recentOps: PersistedOp[] = []; // ring buffer for fast replay
  private objects = new Map<string, Record<string, unknown>>(); // in-memory board state
  private destroyTimer: ReturnType<typeof setTimeout> | null = null;
  private colorIdx = 0;
  private snapshotPending = false;
  private rateLimiter = new ClientRateLimiter();

  constructor(
    boardId: string,
    private db: Database,
    private log: Logger,
    private onEmpty: (boardId: string) => void,
  ) {
    this.boardId = boardId;
  }

  async load(): Promise<void> {
    // Load latest snapshot
    const [latestSnapshot] = await this.db
      .select()
      .from(snapshots)
      .where(eq(snapshots.boardId, this.boardId))
      .orderBy(desc(snapshots.atServerSeq))
      .limit(1);

    let startSeq = 0;

    if (latestSnapshot) {
      startSeq = latestSnapshot.atServerSeq;
      const snapshotData = latestSnapshot.data as {
        objects?: Record<string, Record<string, unknown>>;
      };
      if (snapshotData.objects) {
        for (const [id, obj] of Object.entries(snapshotData.objects)) {
          this.objects.set(id, obj);
        }
      }
    }

    // Load ops since snapshot
    const replayOps = await this.db
      .select()
      .from(ops)
      .where(and(eq(ops.boardId, this.boardId), gt(ops.serverSeq, startSeq)))
      .orderBy(ops.serverSeq);

    for (const op of replayOps) {
      this.applyOpToState(op.opType, op.payload as Record<string, unknown>);
      this.seenClientOps.add(`${op.clientId}:${op.clientSeq}`);
      this.recentOps.push({
        serverSeq: op.serverSeq,
        clientId: op.clientId,
        clientSeq: op.clientSeq,
        opType: op.opType,
        payload: op.payload,
      });
      if (op.serverSeq > this.currentSeq) {
        this.currentSeq = op.serverSeq;
      }
    }

    this.log.info(
      { boardId: this.boardId, seq: this.currentSeq, objects: this.objects.size },
      'Room loaded',
    );
  }

  addClient(
    clientId: string,
    socket: WebSocket,
    displayName: string,
    lastSeenServerSeq: number,
    role: BoardRole = 'edit',
  ): void {
    if (this.destroyTimer) {
      clearTimeout(this.destroyTimer);
      this.destroyTimer = null;
    }

    const color = USER_COLORS[this.colorIdx % USER_COLORS.length];
    this.colorIdx++;

    const client: ConnectedClient = {
      clientId,
      socket,
      displayName,
      color,
      role,
      lastCursorUpdate: 0,
    };

    this.clients.set(clientId, client);

    // Send join ack
    this.sendTo(socket, {
      type: 'joinAck',
      roomId: this.boardId,
      clientId,
      role,
      currentServerSeq: this.currentSeq,
      users: Array.from(this.clients.values()).map((c) => ({
        clientId: c.clientId,
        displayName: c.displayName,
        color: c.color,
      })),
    });

    // Send missed ops since lastSeenServerSeq
    const missedOps = this.recentOps.filter((op) => op.serverSeq > lastSeenServerSeq);
    for (const op of missedOps) {
      this.sendTo(socket, {
        type: 'opBroadcast',
        serverSeq: op.serverSeq,
        clientId: op.clientId,
        clientSeq: op.clientSeq,
        opType: op.opType,
        payload: op.payload,
      });
    }

    // Notify others
    this.broadcastExcept(clientId, {
      type: 'userJoined',
      clientId,
      displayName,
      color,
    });

    this.log.info({ boardId: this.boardId, clientId, displayName }, 'Client joined room');
  }

  removeClient(clientId: string): void {
    this.clients.delete(clientId);

    this.broadcastExcept(clientId, {
      type: 'userLeft',
      clientId,
    });

    this.log.info({ boardId: this.boardId, clientId }, 'Client left room');

    if (this.clients.size === 0) {
      this.destroyTimer = setTimeout(() => {
        this.onEmpty(this.boardId);
      }, ROOM_GRACE_PERIOD_MS);
    }
  }

  async handleMessage(clientId: string, raw: string): Promise<void> {
    // Payload size check
    if (raw.length > LIMITS.MAX_WS_MESSAGE_BYTES) {
      this.log.warn({ clientId, size: raw.length }, 'Message exceeds size limit');
      return;
    }

    let parsed: unknown;
    try {
      parsed = JSON.parse(raw);
    } catch {
      this.log.warn({ clientId }, 'Invalid JSON from client');
      return;
    }

    const msg = parsed as Record<string, unknown>;
    const client = this.clients.get(clientId);
    if (!client) return;

    if (msg.type === 'durable') {
      // Rate limiting
      if (!this.rateLimiter.isAllowed(clientId)) {
        this.log.warn({ clientId }, 'Rate limit exceeded');
        return;
      }
      await this.handleDurable(clientId, msg, client.role);
    } else if (msg.type === 'ephemeral') {
      if (!canSendPresence(client.role)) return;
      this.handleEphemeral(clientId, msg);
    } else if (msg.type === 'hybrid') {
      if (!canSendHybrid(client.role)) return;
      this.handleHybrid(clientId, msg);
    } else if (msg.type === 'ping') {
      this.sendTo(client.socket, { type: 'pong', ts: Date.now() });
    }
  }

  private async handleDurable(clientId: string, msg: Record<string, unknown>, role: BoardRole): Promise<void> {
    const payload = msg.payload as Record<string, unknown>;
    if (!payload || payload.kind !== 'opBatch') return;

    const batchOps = (payload.ops as Array<Record<string, unknown>>) ?? [];
    const clientSeqStart = (payload.clientSeqStart as number) ?? 0;

    // Batch size limit
    if (batchOps.length > LIMITS.MAX_BATCH_SIZE) {
      this.log.warn({ clientId, count: batchOps.length }, 'Batch exceeds max size');
      return;
    }

    for (let i = 0; i < batchOps.length; i++) {
      const op = batchOps[i];

      // Role enforcement
      const opType = (op.type as string) ?? 'unknown';
      const objectType = (op.objectType as string) ?? undefined;
      if (!isOpAllowed(role, opType, objectType)) {
        this.log.warn({ clientId, opType, role }, 'Op denied by role');
        continue;
      }

      // Object count limit for createObject
      if (opType === 'createObject' && this.objects.size >= LIMITS.MAX_OBJECTS_PER_BOARD) {
        this.log.warn({ clientId, objectCount: this.objects.size }, 'Object limit reached');
        continue;
      }

      // Payload size check per op
      if (!isPayloadSizeOk(op)) {
        this.log.warn({ clientId }, 'Op payload too large');
        continue;
      }
      const clientSeq = clientSeqStart + i;
      const dedupeKey = `${clientId}:${clientSeq}`;

      // Deduplicate
      if (this.seenClientOps.has(dedupeKey)) {
        this.log.debug({ clientId, clientSeq }, 'Duplicate op, skipping');
        continue;
      }

      // Assign serverSeq
      const serverSeq = ++this.currentSeq;

      // Persist
      try {
        await this.db.insert(ops).values({
          boardId: this.boardId,
          serverSeq,
          clientId,
          clientSeq,
          opType,
          payload: op,
        });
      } catch (err: unknown) {
        // Unique constraint violation = duplicate (race condition)
        if (err instanceof Error && err.message.includes('unique')) {
          this.log.debug({ clientId, clientSeq }, 'Duplicate op (DB constraint)');
          this.currentSeq--; // rollback
          continue;
        }
        throw err;
      }

      this.seenClientOps.add(dedupeKey);
      this.applyOpToState(opType, op);

      const persistedOp: PersistedOp = {
        serverSeq,
        clientId,
        clientSeq,
        opType,
        payload: op,
      };
      this.recentOps.push(persistedOp);

      // Keep recent ops buffer bounded
      if (this.recentOps.length > 500) {
        this.recentOps = this.recentOps.slice(-250);
      }

      // Broadcast to all clients
      this.broadcastAll({
        type: 'opBroadcast',
        serverSeq,
        clientId,
        clientSeq,
        opType,
        payload: op,
      });

      // Handle checkpoint-specific side effects
      if (opType === 'checkpointCreate') {
        const checkpointId = op.checkpointId as string;
        const checkpointName = (op.name as string) ?? null;
        // Force a snapshot at this serverSeq
        if (!this.snapshotPending) {
          this.snapshotPending = true;
          this.createSnapshot(serverSeq)
            .then(() => this.persistCheckpoint(checkpointId, checkpointName, serverSeq, clientId))
            .finally(() => {
              this.snapshotPending = false;
            });
        }
      } else if (opType === 'checkpointRestore') {
        const checkpointId = op.checkpointId as string;
        await this.restoreToCheckpoint(checkpointId, serverSeq, clientId);
      }

      // Snapshot check (regular interval)
      if (
        opType !== 'checkpointCreate' &&
        serverSeq % SNAPSHOT_INTERVAL === 0 &&
        !this.snapshotPending
      ) {
        this.snapshotPending = true;
        this.createSnapshot(serverSeq).finally(() => {
          this.snapshotPending = false;
        });
      }
    }
  }

  private handleEphemeral(clientId: string, msg: Record<string, unknown>): void {
    const client = this.clients.get(clientId);
    if (!client) return;

    const payload = msg.payload as Record<string, unknown>;
    if (!payload) return;

    // Throttle cursor updates
    if (payload.kind === 'cursor') {
      const now = Date.now();
      if (now - client.lastCursorUpdate < PRESENCE_THROTTLE_MS) return;
      client.lastCursorUpdate = now;
    }

    // Broadcast to others (best-effort, never persist)
    this.broadcastExcept(clientId, {
      type: 'ephemeral',
      clientId,
      payload,
    });
  }

  private handleHybrid(clientId: string, msg: Record<string, unknown>): void {
    // Forward Yjs updates to other clients and persist (P12 will expand)
    this.broadcastExcept(clientId, msg);
  }

  private applyOpToState(opType: string, payload: Record<string, unknown>): void {
    switch (opType) {
      case 'createObject': {
        const objectId = payload.objectId as string;
        if (objectId) {
          this.objects.set(objectId, { ...payload });
        }
        break;
      }
      case 'updateObject': {
        const objectId = payload.objectId as string;
        const existing = this.objects.get(objectId);
        if (existing && payload.patch) {
          this.objects.set(objectId, {
            ...existing,
            ...(payload.patch as Record<string, unknown>),
          });
        }
        break;
      }
      case 'deleteObject': {
        const objectId = payload.objectId as string;
        if (objectId) {
          this.objects.delete(objectId);
        }
        break;
      }
      case 'convertInkToText': {
        const inkIds = payload.inkObjectIds as string[];
        if (inkIds) {
          for (const id of inkIds) {
            if (!payload.keepInk) this.objects.delete(id);
          }
        }
        const newTextId = payload.newTextObjectId as string;
        if (newTextId) {
          this.objects.set(newTextId, { ...payload, type: 'text' });
        }
        break;
      }
      // checkpointCreate and checkpointRestore don't mutate in-memory objects during applyOpToState;
      // they are handled specially in handleDurable.
    }
  }

  /** Persist a named checkpoint record linked to the snapshot at atServerSeq. */
  private async persistCheckpoint(
    checkpointId: string,
    name: string | null,
    atServerSeq: number,
    createdBy: string,
  ): Promise<void> {
    try {
      await this.db.insert(checkpoints).values({
        checkpointId,
        boardId: this.boardId,
        name,
        atServerSeq,
        createdBy,
      });
      this.log.info({ boardId: this.boardId, checkpointId, atServerSeq }, 'Checkpoint created');
    } catch (err) {
      this.log.error({ err, boardId: this.boardId, checkpointId }, 'Failed to persist checkpoint');
    }
  }

  /** Restore board state to the snapshot associated with a checkpoint. */
  private async restoreToCheckpoint(
    checkpointId: string,
    restoreOpServerSeq: number,
    _clientId: string,
  ): Promise<void> {
    try {
      // Find the checkpoint
      const [cp] = await this.db
        .select()
        .from(checkpoints)
        .where(eq(checkpoints.checkpointId, checkpointId))
        .limit(1);

      if (!cp) {
        this.log.warn({ boardId: this.boardId, checkpointId }, 'Checkpoint not found for restore');
        return;
      }

      // Find the snapshot at that serverSeq
      const [snap] = await this.db
        .select()
        .from(snapshots)
        .where(and(eq(snapshots.boardId, this.boardId), lte(snapshots.atServerSeq, cp.atServerSeq)))
        .orderBy(desc(snapshots.atServerSeq))
        .limit(1);

      if (!snap) {
        this.log.warn(
          { boardId: this.boardId, checkpointId },
          'Snapshot not found for checkpoint restore',
        );
        return;
      }

      // Rebuild in-memory state from snapshot
      this.objects.clear();
      const snapshotData = snap.data as { objects?: Record<string, Record<string, unknown>> };
      if (snapshotData.objects) {
        for (const [id, obj] of Object.entries(snapshotData.objects)) {
          this.objects.set(id, obj);
        }
      }

      // Replay ops between snapshot and checkpoint's atServerSeq
      if (snap.atServerSeq < cp.atServerSeq) {
        const replayOps = await this.db
          .select()
          .from(ops)
          .where(
            and(
              eq(ops.boardId, this.boardId),
              gt(ops.serverSeq, snap.atServerSeq),
              lte(ops.serverSeq, cp.atServerSeq),
            ),
          )
          .orderBy(asc(ops.serverSeq));

        for (const op of replayOps) {
          this.applyOpToState(op.opType, op.payload as Record<string, unknown>);
        }
      }

      // Force a new snapshot at the restore op's serverSeq with the restored state
      await this.createSnapshot(restoreOpServerSeq);

      // Broadcast a full state reset to all clients
      const objectsData: Record<string, Record<string, unknown>> = {};
      for (const [id, obj] of this.objects) {
        objectsData[id] = obj;
      }
      this.broadcastAll({
        type: 'checkpointRestored',
        checkpointId,
        atServerSeq: cp.atServerSeq,
        restoreServerSeq: restoreOpServerSeq,
        objects: objectsData,
      });

      this.log.info(
        { boardId: this.boardId, checkpointId, restoredToSeq: cp.atServerSeq },
        'Board restored to checkpoint',
      );
    } catch (err) {
      this.log.error({ err, boardId: this.boardId, checkpointId }, 'Failed to restore checkpoint');
    }
  }

  /** List all checkpoints for this board (used by REST API). */
  async listCheckpoints(): Promise<
    Array<{
      checkpointId: string;
      name: string | null;
      atServerSeq: number;
      createdBy: string;
      createdAt: Date;
    }>
  > {
    const rows = await this.db
      .select({
        checkpointId: checkpoints.checkpointId,
        name: checkpoints.name,
        atServerSeq: checkpoints.atServerSeq,
        createdBy: checkpoints.createdBy,
        createdAt: checkpoints.createdAt,
      })
      .from(checkpoints)
      .where(eq(checkpoints.boardId, this.boardId))
      .orderBy(asc(checkpoints.atServerSeq));

    return rows;
  }

  /** Get ops within a range for time-travel replay (used by REST API). */
  async getOpsForReplay(fromSeq: number, toSeq: number): Promise<PersistedOp[]> {
    const rows = await this.db
      .select()
      .from(ops)
      .where(
        and(eq(ops.boardId, this.boardId), gt(ops.serverSeq, fromSeq), lte(ops.serverSeq, toSeq)),
      )
      .orderBy(asc(ops.serverSeq));

    return rows.map((r) => ({
      serverSeq: r.serverSeq,
      clientId: r.clientId,
      clientSeq: r.clientSeq,
      opType: r.opType,
      payload: r.payload,
    }));
  }

  /** Get snapshot at or before a given serverSeq (used by REST API). */
  async getSnapshotAt(atSeq: number): Promise<{ atServerSeq: number; data: unknown } | null> {
    const [snap] = await this.db
      .select()
      .from(snapshots)
      .where(and(eq(snapshots.boardId, this.boardId), lte(snapshots.atServerSeq, atSeq)))
      .orderBy(desc(snapshots.atServerSeq))
      .limit(1);

    return snap ? { atServerSeq: snap.atServerSeq, data: snap.data } : null;
  }

  private async createSnapshot(atSeq: number): Promise<void> {
    try {
      const objectsData: Record<string, Record<string, unknown>> = {};
      for (const [id, obj] of this.objects) {
        objectsData[id] = obj;
      }

      await this.db.insert(snapshots).values({
        boardId: this.boardId,
        atServerSeq: atSeq,
        data: { objects: objectsData },
      });

      this.log.info({ boardId: this.boardId, atSeq }, 'Snapshot created');
    } catch (err) {
      this.log.error({ err, boardId: this.boardId }, 'Failed to create snapshot');
    }
  }

  private sendTo(socket: WebSocket, msg: unknown): void {
    if (socket.readyState === 1) {
      // OPEN
      socket.send(JSON.stringify(msg));
    }
  }

  private broadcastAll(msg: unknown): void {
    const data = JSON.stringify(msg);
    for (const client of this.clients.values()) {
      if (client.socket.readyState === 1) {
        client.socket.send(data);
      }
    }
  }

  private broadcastExcept(excludeClientId: string, msg: unknown): void {
    const data = JSON.stringify(msg);
    for (const client of this.clients.values()) {
      if (client.clientId !== excludeClientId && client.socket.readyState === 1) {
        client.socket.send(data);
      }
    }
  }

  get clientCount(): number {
    return this.clients.size;
  }
}
