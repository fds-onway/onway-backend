CREATE TABLE "route_point_upvote" (
	"id" serial PRIMARY KEY NOT NULL,
	"user" integer NOT NULL,
	"routePoint" integer NOT NULL,
	"vote" smallint NOT NULL
);
--> statement-breakpoint
ALTER TABLE "route_point_upvote" ADD CONSTRAINT "route_point_upvote_user_user_id_fk" FOREIGN KEY ("user") REFERENCES "public"."user"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "route_point_upvote" ADD CONSTRAINT "route_point_upvote_routePoint_route_point_id_fk" FOREIGN KEY ("routePoint") REFERENCES "public"."route_point"("id") ON DELETE no action ON UPDATE no action;