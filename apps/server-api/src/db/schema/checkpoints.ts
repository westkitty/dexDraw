import { integer, pgTable, serial, timestamp, uuid, varchar } from 'drizzle-orm/pg-core';
import { boards } from './boards.js';

export const checkpoints = pgTable('checkpoints', {
  id: serial('id').primaryKey(),
  checkpointId: uuid('checkpoint_id').notNull().unique(),
  boardId: uuid('board_id')
    .notNull()
    .references(() => boards.id, { onDelete: 'cascade' }),
  name: varchar('name', { length: 255 }),
  atServerSeq: integer('at_server_seq').notNull(),
  createdBy: varchar('created_by', { length: 255 }).notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
});
