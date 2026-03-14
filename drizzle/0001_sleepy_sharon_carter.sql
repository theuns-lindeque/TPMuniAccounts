CREATE TYPE "public"."user_role" AS ENUM('admin', 'editor', 'contributor');--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "role" "user_role" DEFAULT 'contributor' NOT NULL;