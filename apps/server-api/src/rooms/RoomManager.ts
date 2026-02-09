import type { WebSocket } from 'ws';
import type { Database } from '../db/client.js';
import type { Logger } from '../lib/logger.js';
import { Room } from './Room.js';

export class RoomManager {
  private rooms = new Map<string, Room>();

  constructor(
    private db: Database,
    private log: Logger,
  ) {}

  async getOrCreate(boardId: string): Promise<Room> {
    let room = this.rooms.get(boardId);
    if (!room) {
      room = new Room(boardId, this.db, this.log, (id) => this.destroyRoom(id));
      this.rooms.set(boardId, room);
      await room.load();
    }
    return room;
  }

  async handleConnection(
    boardId: string,
    clientId: string,
    socket: WebSocket,
    displayName: string,
    lastSeenServerSeq: number,
  ): Promise<void> {
    const room = await this.getOrCreate(boardId);
    room.addClient(clientId, socket, displayName, lastSeenServerSeq);

    socket.on('message', async (data) => {
      try {
        await room.handleMessage(clientId, data.toString());
      } catch (err) {
        this.log.error({ err, boardId, clientId }, 'Error handling message');
      }
    });

    socket.on('close', () => {
      room.removeClient(clientId);
    });

    socket.on('error', (err) => {
      this.log.error({ err, boardId, clientId }, 'Socket error');
      room.removeClient(clientId);
    });
  }

  private destroyRoom(boardId: string): void {
    const room = this.rooms.get(boardId);
    if (room && room.clientCount === 0) {
      this.rooms.delete(boardId);
      this.log.info({ boardId }, 'Room destroyed');
    }
  }

  get roomCount(): number {
    return this.rooms.size;
  }
}
