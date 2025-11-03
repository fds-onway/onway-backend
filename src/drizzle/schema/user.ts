import { InferInsertModel, InferSelectModel } from 'drizzle-orm';
import {
  boolean,
  pgEnum,
  pgTable,
  serial,
  timestamp,
  varchar,
} from 'drizzle-orm/pg-core';

export const roleEnum = pgEnum('role', ['admin', 'user']);
export const providerEnum = pgEnum('provider', ['local', 'google']);

export const user = pgTable('user', {
  id: serial().primaryKey(),
  name: varchar({ length: 128 }).notNull(),
  email: varchar({ length: 256 }).notNull().unique(),

  passwordHash: varchar('password_hash', { length: 256 }),
  salt: varchar({ length: 16 }),

  provider: providerEnum().notNull().default('local'),
  googleId: varchar('google_id', { length: 256 }).unique(),

  isVerified: boolean('is_verified').notNull().default(false),
  verificationToken: varchar('verification_token', { length: 64 }).unique(),

  role: roleEnum().notNull().default('user'),
  createdAt: timestamp('created_at').notNull().defaultNow(),
});

export type User = InferSelectModel<typeof user>;
export type NewUser = InferInsertModel<typeof user>;
