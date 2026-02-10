import type { Checkpoint, ReplayOp } from '../store/useCheckpointStore';

const API_BASE = '/api';

/** Fetch all checkpoints for a board. */
export async function fetchCheckpoints(boardId: string): Promise<Checkpoint[]> {
  const res = await fetch(`${API_BASE}/boards/${boardId}/checkpoints`);
  if (!res.ok) throw new Error(`Failed to fetch checkpoints: ${res.status}`);
  const data = (await res.json()) as { checkpoints: Checkpoint[] };
  return data.checkpoints;
}

/** Fetch ops for replay between two serverSeq values. */
export async function fetchReplayOps(
  boardId: string,
  fromSeq: number,
  toSeq: number,
): Promise<ReplayOp[]> {
  const res = await fetch(`${API_BASE}/boards/${boardId}/replay?from=${fromSeq}&to=${toSeq}`);
  if (!res.ok) throw new Error(`Failed to fetch replay ops: ${res.status}`);
  const data = (await res.json()) as { ops: ReplayOp[] };
  return data.ops;
}

/** Fetch snapshot at or before a given serverSeq. */
export async function fetchSnapshotAt(
  boardId: string,
  atSeq: number,
): Promise<{
  atServerSeq: number;
  data: { objects?: Record<string, Record<string, unknown>> };
} | null> {
  const res = await fetch(`${API_BASE}/boards/${boardId}/snapshot?at=${atSeq}`);
  if (!res.ok) throw new Error(`Failed to fetch snapshot: ${res.status}`);
  const data = await res.json();
  if (data.error) return null;
  return data as {
    atServerSeq: number;
    data: { objects?: Record<string, Record<string, unknown>> };
  };
}
