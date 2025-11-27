CREATE TABLE "route_upvote" (
	"id" serial PRIMARY KEY NOT NULL,
	"user" integer NOT NULL,
	"route" integer NOT NULL,
	"vote" smallint NOT NULL
);
--> statement-breakpoint
ALTER TABLE "route_upvote" ADD CONSTRAINT "route_upvote_user_user_id_fk" FOREIGN KEY ("user") REFERENCES "public"."user"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "route_upvote" ADD CONSTRAINT "route_upvote_route_route_id_fk" FOREIGN KEY ("route") REFERENCES "public"."route"("id") ON DELETE no action ON UPDATE no action;