import { InferInsertModel, InferSelectModel } from 'drizzle-orm';
import { integer, pgTable, serial, smallint } from 'drizzle-orm/pg-core';
import routePointRating from './route-point-rating';
import { user } from './user';

const routePointRatingUpvote = pgTable('route_point_rating_upvote', {
  id: serial().primaryKey(),
  user: integer()
    .notNull()
    .references(() => user.id, { onDelete: 'cascade', onUpdate: 'cascade' }),
  routePointRating: integer('route_point_rating')
    .notNull()
    .references(() => routePointRating.id, {
      onDelete: 'cascade',
      onUpdate: 'cascade',
    }),
  vote: smallint().notNull(),
});

export default routePointRatingUpvote;
export type RoutePointRatingUpvote = InferSelectModel<
  typeof routePointRatingUpvote
>;
export type NewRoutePointRatingUpvote = InferInsertModel<
  typeof routePointRatingUpvote
>;
