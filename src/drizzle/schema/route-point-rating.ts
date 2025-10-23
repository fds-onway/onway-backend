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
import routePoint from './route-point';
import { user } from './user';

const routePointRating = pgTable('route_point_rating', {
  id: serial().primaryKey(),
  review: numeric({ precision: 3, scale: 2 }).notNull(),
  routePoint: integer('route_point')
    .notNull()
    .references(() => routePoint.id, {
      onDelete: 'cascade',
      onUpdate: 'cascade',
    }),
  title: varchar({ length: 256 }).notNull(),
  description: text(),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  upvotes: integer().notNull().default(0),
  user: integer()
    .notNull()
    .references(() => user.id, { onDelete: 'cascade', onUpdate: 'cascade' }),
});

export default routePointRating;
export type RoutePointRating = InferSelectModel<typeof routePointRating>;
export type NewRoutePointRating = InferInsertModel<typeof routePointRating>;
