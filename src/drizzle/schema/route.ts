import { InferInsertModel, InferSelectModel } from 'drizzle-orm';
import {
  integer,
  pgTable,
  serial,
  text,
  timestamp,
  varchar,
} from 'drizzle-orm/pg-core';
import { user } from './user';

const route = pgTable('route', {
  id: serial().primaryKey(),
  name: varchar({ length: 256 }).notNull(),
  description: text().notNull(),
  owner: integer()
    .notNull()
    .references(() => user.id, { onDelete: 'cascade', onUpdate: 'cascade' }),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  upvotes: integer().notNull().default(0),
});

export default route;
export type Route = InferSelectModel<typeof route>;
export type NewRoute = InferInsertModel<typeof route>;
