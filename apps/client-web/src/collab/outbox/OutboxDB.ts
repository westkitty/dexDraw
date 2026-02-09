import { openDB, type IDBPDatabase } from 'idb';

interface OutboxEntry {
  clientSeq: number;
  boardId: string;
  envelope: string; // serialized JSON
  createdAt: number;
}

const DB_NAME = 'dexdraw-outbox';
const DB_VERSION = 1;
const STORE_NAME = 'outbox';

let dbPromise: Promise<IDBPDatabase> | null = null;

function getDB(): Promise<IDBPDatabase> {
  if (!dbPromise) {
    dbPromise = openDB(DB_NAME, DB_VERSION, {
      upgrade(db) {
        if (!db.objectStoreNames.contains(STORE_NAME)) {
          const store = db.createObjectStore(STORE_NAME, { keyPath: 'clientSeq' });
          store.createIndex('boardId', 'boardId');
        }
      },
    });
  }
  return dbPromise;
}

export async function putOp(entry: OutboxEntry): Promise<void> {
  const db = await getDB();
  await db.put(STORE_NAME, entry);
}

export async function removeOp(clientSeq: number): Promise<void> {
  const db = await getDB();
  await db.delete(STORE_NAME, clientSeq);
}

export async function getAllOps(boardId: string): Promise<OutboxEntry[]> {
  const db = await getDB();
  const all = await db.getAllFromIndex(STORE_NAME, 'boardId', boardId);
  return all.sort((a, b) => a.clientSeq - b.clientSeq) as OutboxEntry[];
}

export async function clearBoard(boardId: string): Promise<void> {
  const db = await getDB();
  const tx = db.transaction(STORE_NAME, 'readwrite');
  const index = tx.store.index('boardId');
  let cursor = await index.openCursor(boardId);
  while (cursor) {
    await cursor.delete();
    cursor = await cursor.continue();
  }
  await tx.done;
}
