import { pgTable, uuid, integer, jsonb, timestamp, serial } from 'drizzle-orm/pg-core';
import { boards } from './boards.js';

export const snapshots = pgTable('snapshots', {
  id: serial('id').primaryKey(),
  boardId: uuid('board_id')
    .notNull()
    .references(() => boards.id, { onDelete: 'cascade' }),
  atServerSeq: integer('at_server_seq').notNull(),
  data: jsonb('data').notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
});
