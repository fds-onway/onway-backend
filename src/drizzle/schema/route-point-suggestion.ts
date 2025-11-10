import { InferInsertModel, InferSelectModel } from 'drizzle-orm';
import { integer, pgTable, serial, text, varchar } from 'drizzle-orm/pg-core';
import route from './route';
import { user } from './user';

const routePointSuggestion = pgTable('route_point_suggestion', {
  id: serial().primaryKey(),
  route: integer()
    .notNull()
    .references(() => route.id, { onDelete: 'cascade', onUpdate: 'cascade' }),
  sequence: integer().notNull(),
  name: varchar({ length: 127 }).notNull(),
  imageUrl: varchar('image_url', { length: 512 }).notNull(),
  imageFilePath: varchar('image_file_path', { length: 512 }).notNull().unique(),
  description: text().notNull(),
  reason: varchar({ length: 512 }).notNull(),
  user: integer()
    .notNull()
    .references(() => user.id, { onDelete: 'cascade', onUpdate: 'cascade' }),
  feedback: varchar({ length: 512 }),
});

export default routePointSuggestion;
export type RoutePointSuggestion = InferSelectModel<
  typeof routePointSuggestion
>;
export type NewRoutePointSuggestion = InferInsertModel<
  typeof routePointSuggestion
>;
