import { InferInsertModel, InferSelectModel } from 'drizzle-orm';
import { integer, pgTable, serial, varchar } from 'drizzle-orm/pg-core';
import route from './route';

const routeTag = pgTable('route_tag', {
  id: serial().primaryKey(),
  tag: varchar({ length: 128 }).notNull(),
  route: integer()
    .notNull()
    .references(() => route.id, { onDelete: 'cascade', onUpdate: 'cascade' }),
});

export default routeTag;
export type RouteTag = InferSelectModel<typeof routeTag>;
export type NewRouteTag = InferInsertModel<typeof routeTag>;
