import { InferInsertModel, InferSelectModel } from 'drizzle-orm';
import { integer, pgTable, serial, timestamp } from 'drizzle-orm/pg-core';
import route from './route';
import { user } from './user';

const routeProgress = pgTable('route_progress', {
  id: serial().primaryKey(),
  route: integer()
    .notNull()
    .references(() => route.id, { onDelete: 'cascade', onUpdate: 'cascade' }),
  lastPoint: integer('last_point').notNull().default(0),
  user: integer()
    .notNull()
    .references(() => user.id, { onDelete: 'cascade', onUpdate: 'cascade' }),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
});

export default routeProgress;
export type RouteProgress = InferSelectModel<typeof routeProgress>;
export type NewRouteProgress = InferInsertModel<typeof routeProgress>;
