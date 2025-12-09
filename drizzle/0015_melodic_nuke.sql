ALTER TABLE "route_progress" RENAME COLUMN "last_point" TO "last_point_id";--> statement-breakpoint
ALTER TABLE "route_progress" ALTER COLUMN "updated_at" DROP DEFAULT;--> statement-breakpoint
ALTER TABLE "route_progress" ALTER COLUMN "updated_at" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "route_progress" ADD COLUMN "completed_at" timestamp;--> statement-breakpoint
ALTER TABLE "route_progress" ADD CONSTRAINT "route_progress_last_point_id_route_point_id_fk" FOREIGN KEY ("last_point_id") REFERENCES "public"."route_point"("id") ON DELETE cascade ON UPDATE cascade;