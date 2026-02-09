import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as schema from './schema/index.js';

let db: ReturnType<typeof drizzle<typeof schema>> | null = null;

export function getDb(databaseUrl: string) {
  if (!db) {
    const sql = postgres(databaseUrl, { max: 10 });
    db = drizzle(sql, { schema });
  }
  return db;
}

export type Database = ReturnType<typeof getDb>;
