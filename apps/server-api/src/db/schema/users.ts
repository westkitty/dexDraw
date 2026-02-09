import { pgTable, uuid, varchar, pgEnum } from 'drizzle-orm/pg-core';
import { boards } from './boards.js';

export const boardRoleEnum = pgEnum('board_role', ['view', 'comment', 'edit']);

export const boardMembers = pgTable('board_members', {
  id: uuid('id').primaryKey().defaultRandom(),
  boardId: uuid('board_id')
    .notNull()
    .references(() => boards.id, { onDelete: 'cascade' }),
  memberId: varchar('member_id', { length: 255 }).notNull(),
  email: varchar('email', { length: 255 }),
  role: boardRoleEnum('role').notNull().default('view'),
});
