CREATE TABLE "route_point_rating_upvote" (
	"id" serial PRIMARY KEY NOT NULL,
	"user" integer NOT NULL,
	"route_point_rating" integer NOT NULL,
	"vote" smallint NOT NULL
);
--> statement-breakpoint
ALTER TABLE "route_point_rating_upvote" ADD CONSTRAINT "route_point_rating_upvote_user_user_id_fk" FOREIGN KEY ("user") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "route_point_rating_upvote" ADD CONSTRAINT "route_point_rating_upvote_route_point_rating_route_point_rating_id_fk" FOREIGN KEY ("route_point_rating") REFERENCES "public"."route_point_rating"("id") ON DELETE cascade ON UPDATE cascade;