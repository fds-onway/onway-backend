import { InferInsertModel, InferSelectModel } from 'drizzle-orm';
import {
  integer,
  pgEnum,
  pgTable,
  serial,
  text,
  timestamp,
  varchar,
} from 'drizzle-orm/pg-core';
import route from './route';

const routePointTypeEnum = pgEnum('route_point_type', [
  'restaurante',
  'parque',
  'natureza',
  'servico',
  'hotel',
  'entretenimento',
  'miscelania',
]);

const routePoint = pgTable('route_point', {
  id: serial().primaryKey(),
  name: varchar({ length: 256 }).notNull(),
  description: text().notNull(),
  route: integer()
    .notNull()
    .references(() => route.id, { onDelete: 'cascade', onUpdate: 'cascade' }),
  sequence: integer().notNull(),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  type: routePointTypeEnum().notNull(),
  upvotes: integer().notNull().default(0),
  latitude: text().notNull(),
  longitude: text().notNull(),
});

export default routePoint;
export { routePointTypeEnum };
export type RoutePoint = InferSelectModel<typeof routePoint>;
export type NewRoutePoint = InferInsertModel<typeof routePoint>;
