import { InferInsertModel, InferSelectModel } from 'drizzle-orm';
import {
  pgEnum,
  pgTable,
  serial,
  timestamp,
  varchar,
} from 'drizzle-orm/pg-core';

export const roleEnum = pgEnum('role', ['admin', 'user']);

export const user = pgTable('user', {
  id: serial().primaryKey(),
  name: varchar({ length: 128 }),
  email: varchar({ length: 256 }).notNull().unique(),
  passwordHash: varchar({ length: 256 }).notNull(),
  salt: varchar({ length: 16 }).notNull(),
  role: roleEnum().notNull().default('user'),
  createdAt: timestamp().notNull().defaultNow(),
});

export type User = InferSelectModel<typeof user>;
export type NewUser = InferInsertModel<typeof user>;
