ALTER TABLE "route_image" DROP CONSTRAINT "route_image_route_route_id_fk";
--> statement-breakpoint
ALTER TABLE "route_point_image" DROP CONSTRAINT "route_point_image_route_point_route_point_id_fk";
--> statement-breakpoint
ALTER TABLE "route_image" ADD COLUMN "file_path" varchar(512) NOT NULL;--> statement-breakpoint
ALTER TABLE "route_point_image" ADD COLUMN "file_path" varchar(512) NOT NULL;--> statement-breakpoint
ALTER TABLE "route_point_suggestion" ADD COLUMN "image_file_path" varchar(512) NOT NULL;--> statement-breakpoint
ALTER TABLE "route_image" ADD CONSTRAINT "route_image_route_route_id_fk" FOREIGN KEY ("route") REFERENCES "public"."route"("id") ON DELETE restrict ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "route_point_image" ADD CONSTRAINT "route_point_image_route_point_route_point_id_fk" FOREIGN KEY ("route_point") REFERENCES "public"."route_point"("id") ON DELETE restrict ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "route_image" ADD CONSTRAINT "route_image_file_path_unique" UNIQUE("file_path");--> statement-breakpoint
ALTER TABLE "route_point_image" ADD CONSTRAINT "route_point_image_file_path_unique" UNIQUE("file_path");--> statement-breakpoint
ALTER TABLE "route_point_suggestion" ADD CONSTRAINT "route_point_suggestion_image_file_path_unique" UNIQUE("image_file_path");