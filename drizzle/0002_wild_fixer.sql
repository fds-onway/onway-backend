CREATE TYPE "public"."provider" AS ENUM('local', 'google');--> statement-breakpoint
ALTER TABLE "user" ALTER COLUMN "passwordHash" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "user" ALTER COLUMN "salt" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "user" ADD COLUMN "provider" "provider" DEFAULT 'local' NOT NULL;--> statement-breakpoint
ALTER TABLE "user" ADD COLUMN "googleId" varchar(256);--> statement-breakpoint
ALTER TABLE "user" ADD CONSTRAINT "user_googleId_unique" UNIQUE("googleId");