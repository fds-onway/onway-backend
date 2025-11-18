import { InferInsertModel, InferSelectModel } from 'drizzle-orm';
import { integer, pgTable, serial, smallint } from 'drizzle-orm/pg-core';
import routePoint from './route-point';
import { user } from './user';

const routePointUpvote = pgTable('route_point_upvote', {
  id: serial().primaryKey(),
  user: integer()
    .notNull()
    .references(() => user.id),
  routePoint: integer()
    .notNull()
    .references(() => routePoint.id),
  vote: smallint().notNull(),
});

export default routePointUpvote;
export type RoutePointUpvote = InferSelectModel<typeof routePointUpvote>;
export type NewRoutePointUpvote = InferInsertModel<typeof routePointUpvote>;
