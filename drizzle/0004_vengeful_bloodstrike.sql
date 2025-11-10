ALTER TABLE "user" ADD COLUMN "is_verified" boolean NOT NULL;--> statement-breakpoint
ALTER TABLE "user" ADD COLUMN "verification_token" varchar(64);--> statement-breakpoint
ALTER TABLE "user" ADD CONSTRAINT "user_verification_token_unique" UNIQUE("verification_token");