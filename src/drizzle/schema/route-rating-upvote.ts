import { InferInsertModel, InferSelectModel } from 'drizzle-orm';
import { integer, pgTable, serial, smallint } from 'drizzle-orm/pg-core';
import routeRating from './route-rating';
import { user } from './user';

const routeRatingUpvote = pgTable('route_rating_upvote', {
  id: serial().primaryKey(),
  user: integer()
    .notNull()
    .references(() => user.id, { onDelete: 'cascade', onUpdate: 'cascade' }),
  routeRating: integer('route_rating')
    .notNull()
    .references(() => routeRating.id, {
      onDelete: 'cascade',
      onUpdate: 'cascade',
    }),
  vote: smallint().notNull(),
});

export default routeRatingUpvote;
export type RouteRatingUpvote = InferSelectModel<typeof routeRatingUpvote>;
export type NewRouteRatingUpvote = InferInsertModel<typeof routeRatingUpvote>;
