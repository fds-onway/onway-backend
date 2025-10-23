import { InferInsertModel, InferSelectModel } from 'drizzle-orm';
import {
  integer,
  numeric,
  pgTable,
  serial,
  text,
  timestamp,
  varchar,
} from 'drizzle-orm/pg-core';
import route from './route';
import { user } from './user';

const routeRating = pgTable('route_rating', {
  id: serial().primaryKey(),
  route: integer()
    .notNull()
    .references(() => route.id, { onDelete: 'cascade', onUpdate: 'cascade' }),
  review: numeric({ precision: 3, scale: 2 }).notNull(),
  title: varchar({ length: 127 }).notNull(),
  description: text(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  upvotes: integer().notNull().default(0),
  user: integer()
    .notNull()
    .references(() => user.id),
});

export default routeRating;
export type RouteRating = InferSelectModel<typeof routeRating>;
export type NewRouteRating = InferInsertModel<typeof routeRating>;
