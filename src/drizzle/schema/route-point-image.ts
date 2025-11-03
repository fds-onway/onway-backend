import { InferInsertModel, InferSelectModel } from 'drizzle-orm';
import { integer, pgTable, serial, varchar } from 'drizzle-orm/pg-core';
import routePoint from './route-point';

const routePointImage = pgTable('route_point_image', {
  id: serial().primaryKey(),
  filePath: varchar('file_path', { length: 512 }).notNull().unique(),
  imageUrl: varchar('image_url', { length: 512 }).notNull(),
  routePoint: integer('route_point')
    .notNull()
    .references(() => routePoint.id, {
      onDelete: 'restrict',
      onUpdate: 'cascade',
    }),
});

export default routePointImage;
export type RoutePointImage = InferSelectModel<typeof routePointImage>;
export type NewRoutePointImage = InferInsertModel<typeof routePointImage>;
