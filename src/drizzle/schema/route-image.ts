import { InferInsertModel, InferSelectModel } from 'drizzle-orm';
import { integer, pgTable, serial, varchar } from 'drizzle-orm/pg-core';
import route from './route';

const routeImage = pgTable('route_image', {
  id: serial().primaryKey(),
  filePath: varchar('file_path', { length: 512 }).notNull().unique(),
  imageUrl: varchar('image_url', { length: 512 }).notNull(),
  route: integer()
    .notNull()
    .references(() => route.id, { onDelete: 'restrict', onUpdate: 'cascade' }),
});

export default routeImage;
export type RouteImage = InferSelectModel<typeof routeImage>;
export type NewRouteImage = InferInsertModel<typeof routeImage>;
