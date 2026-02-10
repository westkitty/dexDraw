import { customType, index, integer, pgTable, serial, timestamp, uuid } from 'drizzle-orm/pg-core';
import { boards } from './boards.js';

const bytea = customType<{ data: Buffer }>({
  dataType() {
    return 'bytea';
  },
});

export const yjsUpdates = pgTable(
  'yjs_updates',
  {
    id: serial('id').primaryKey(),
    boardId: uuid('board_id')
      .notNull()
      .references(() => boards.id, { onDelete: 'cascade' }),
    textObjectId: uuid('text_object_id').notNull(),
    serverSeqRef: integer('server_seq_ref').notNull(),
    update: bytea('update').notNull(),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [index('yjs_board_seq_ref').on(table.boardId, table.serverSeqRef)],
);
