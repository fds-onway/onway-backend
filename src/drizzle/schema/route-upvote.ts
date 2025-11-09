import { InferInsertModel, InferSelectModel } from 'drizzle-orm';
import { integer, pgTable, serial, smallint } from 'drizzle-orm/pg-core';
import route from './route';
import { user } from './user';

const routeUpvote = pgTable('route_upvote', {
  id: serial().primaryKey(),
  user: integer()
    .notNull()
    .references(() => user.id),
  route: integer()
    .notNull()
    .references(() => route.id),
  vote: smallint().notNull(),
});

export default routeUpvote;
export type RouteUpvote = InferSelectModel<typeof routeUpvote>;
export type NewRouteUpvote = InferInsertModel<typeof routeUpvote>;
