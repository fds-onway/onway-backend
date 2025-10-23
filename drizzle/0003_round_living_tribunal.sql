CREATE TYPE "public"."route_point_type" AS ENUM('restaurante', 'parque', 'natureza', 'servico', 'hotel', 'entretenimento', 'miscelania');--> statement-breakpoint
CREATE TABLE "route" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" varchar(256) NOT NULL,
	"description" text NOT NULL,
	"owner" integer NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"upvotes" integer DEFAULT 0 NOT NULL
);
--> statement-breakpoint
CREATE TABLE "route_image" (
	"id" serial PRIMARY KEY NOT NULL,
	"image_url" varchar(512) NOT NULL,
	"route" integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE "route_point" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" varchar(256) NOT NULL,
	"description" text NOT NULL,
	"route" integer NOT NULL,
	"sequence" integer NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"type" "route_point_type" NOT NULL,
	"upvotes" integer DEFAULT 0 NOT NULL
);
--> statement-breakpoint
CREATE TABLE "route_point_image" (
	"id" serial PRIMARY KEY NOT NULL,
	"image_url" varchar(512) NOT NULL,
	"route_point" integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE "route_point_rating" (
	"id" serial PRIMARY KEY NOT NULL,
	"review" numeric(3, 2) NOT NULL,
	"route_point" integer NOT NULL,
	"title" varchar(256) NOT NULL,
	"description" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"upvotes" integer DEFAULT 0 NOT NULL,
	"user" integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE "route_point_suggestion" (
	"id" serial PRIMARY KEY NOT NULL,
	"route" integer NOT NULL,
	"sequence" integer NOT NULL,
	"name" varchar(127) NOT NULL,
	"image_url" varchar(512) NOT NULL,
	"description" text NOT NULL,
	"reason" varchar(512) NOT NULL,
	"user" integer NOT NULL,
	"feedback" varchar(512)
);
--> statement-breakpoint
CREATE TABLE "route_progress" (
	"id" serial PRIMARY KEY NOT NULL,
	"route" integer NOT NULL,
	"last_point" integer DEFAULT 0 NOT NULL,
	"user" integer NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "route_rating" (
	"id" serial PRIMARY KEY NOT NULL,
	"route" integer NOT NULL,
	"review" numeric(3, 2) NOT NULL,
	"title" varchar(127) NOT NULL,
	"description" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"upvotes" integer DEFAULT 0 NOT NULL,
	"user" integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE "route_tag" (
	"id" serial PRIMARY KEY NOT NULL,
	"tag" varchar(128),
	"route" integer NOT NULL
);
--> statement-breakpoint
ALTER TABLE "user" RENAME COLUMN "passwordHash" TO "password_hash";--> statement-breakpoint
ALTER TABLE "user" RENAME COLUMN "googleId" TO "google_id";--> statement-breakpoint
ALTER TABLE "user" RENAME COLUMN "createdAt" TO "created_at";--> statement-breakpoint
ALTER TABLE "user" DROP CONSTRAINT "user_googleId_unique";--> statement-breakpoint
ALTER TABLE "route" ADD CONSTRAINT "route_owner_user_id_fk" FOREIGN KEY ("owner") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "route_image" ADD CONSTRAINT "route_image_route_route_id_fk" FOREIGN KEY ("route") REFERENCES "public"."route"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "route_point" ADD CONSTRAINT "route_point_route_route_id_fk" FOREIGN KEY ("route") REFERENCES "public"."route"("id") ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "route_point_image" ADD CONSTRAINT "route_point_image_route_point_route_point_id_fk" FOREIGN KEY ("route_point") REFERENCES "public"."route_point"("id") ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "route_point_rating" ADD CONSTRAINT "route_point_rating_route_point_route_point_id_fk" FOREIGN KEY ("route_point") REFERENCES "public"."route_point"("id") ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "route_point_rating" ADD CONSTRAINT "route_point_rating_user_user_id_fk" FOREIGN KEY ("user") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "route_point_suggestion" ADD CONSTRAINT "route_point_suggestion_route_route_id_fk" FOREIGN KEY ("route") REFERENCES "public"."route"("id") ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "route_point_suggestion" ADD CONSTRAINT "route_point_suggestion_user_user_id_fk" FOREIGN KEY ("user") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "route_progress" ADD CONSTRAINT "route_progress_route_route_id_fk" FOREIGN KEY ("route") REFERENCES "public"."route"("id") ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "route_progress" ADD CONSTRAINT "route_progress_user_user_id_fk" FOREIGN KEY ("user") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "route_rating" ADD CONSTRAINT "route_rating_route_route_id_fk" FOREIGN KEY ("route") REFERENCES "public"."route"("id") ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "route_rating" ADD CONSTRAINT "route_rating_user_user_id_fk" FOREIGN KEY ("user") REFERENCES "public"."user"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "route_tag" ADD CONSTRAINT "route_tag_route_route_id_fk" FOREIGN KEY ("route") REFERENCES "public"."route"("id") ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "user" ADD CONSTRAINT "user_google_id_unique" UNIQUE("google_id");