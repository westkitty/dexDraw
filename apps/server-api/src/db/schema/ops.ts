import {
  integer,
  jsonb,
  pgTable,
  serial,
  timestamp,
  uniqueIndex,
  uuid,
  varchar,
} from 'drizzle-orm/pg-core';
import { boards } from './boards.js';

export const ops = pgTable(
  'ops',
  {
    id: serial('id').primaryKey(),
    boardId: uuid('board_id')
      .notNull()
      .references(() => boards.id, { onDelete: 'cascade' }),
    serverSeq: integer('server_seq').notNull(),
    clientId: uuid('client_id').notNull(),
    clientSeq: integer('client_seq').notNull(),
    opType: varchar('op_type', { length: 64 }).notNull(),
    payload: jsonb('payload').notNull(),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [
    uniqueIndex('ops_board_seq').on(table.boardId, table.serverSeq),
    uniqueIndex('ops_dedup').on(table.boardId, table.clientId, table.clientSeq),
  ],
);
