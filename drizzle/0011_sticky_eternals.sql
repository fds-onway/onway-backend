ALTER TABLE "route_upvote" RENAME TO "route_rating_upvote";--> statement-breakpoint
ALTER TABLE "route_rating_upvote" RENAME COLUMN "route" TO "route_rating";--> statement-breakpoint
ALTER TABLE "route_rating_upvote" DROP CONSTRAINT "route_upvote_user_user_id_fk";
--> statement-breakpoint
ALTER TABLE "route_rating_upvote" DROP CONSTRAINT "route_upvote_route_route_id_fk";
--> statement-breakpoint
ALTER TABLE "route_rating" ALTER COLUMN "title" SET DATA TYPE varchar(128);--> statement-breakpoint
ALTER TABLE "route_rating_upvote" ADD CONSTRAINT "route_rating_upvote_user_user_id_fk" FOREIGN KEY ("user") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "route_rating_upvote" ADD CONSTRAINT "route_rating_upvote_route_rating_route_rating_id_fk" FOREIGN KEY ("route_rating") REFERENCES "public"."route_rating"("id") ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "route_rating" DROP COLUMN "upvotes";