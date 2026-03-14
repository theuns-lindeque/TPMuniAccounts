CREATE TYPE "public"."risk_level" AS ENUM('Low', 'Medium', 'High');--> statement-breakpoint
CREATE TYPE "public"."utility_type" AS ENUM('Electricity', 'Solar', 'Water', 'Sewerage', 'Assessment Rates', 'CID Levy');--> statement-breakpoint
CREATE TABLE "analysis_reports" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"building_id" uuid NOT NULL,
	"period" date NOT NULL,
	"total_invoice_amount" numeric(12, 2) NOT NULL,
	"total_recovery_amount" numeric(12, 2) NOT NULL,
	"deficit" numeric(12, 2) NOT NULL,
	"risk_level" "risk_level" NOT NULL,
	"anomalies_found" jsonb,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "app_settings" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"chat_model" varchar(255) DEFAULT 'gemini-3-flash' NOT NULL,
	"analysis_model" varchar(255) DEFAULT 'gemini-3.1-pro' NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "buildings" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" varchar(255) NOT NULL,
	"address" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"municipal_value" numeric(15, 2)
);
--> statement-breakpoint
CREATE TABLE "feedback_loop" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"analysis_report_id" uuid NOT NULL,
	"field_corrected" varchar(255) NOT NULL,
	"old_value" text,
	"new_value" text,
	"user_notes" text,
	"ai_learned" boolean DEFAULT false NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "invoices" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"utility_account_id" uuid NOT NULL,
	"billing_period" date NOT NULL,
	"amount" numeric(12, 2) NOT NULL,
	"basic_charge" numeric(12, 2),
	"usage_charge" numeric(12, 2),
	"demand_charge" numeric(12, 2),
	"usage" numeric(12, 2),
	"pdf_url" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "media" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"alt" text NOT NULL,
	"url" text,
	"filename" text,
	"mime_type" text,
	"filesize" integer,
	"width" integer,
	"height" integer,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "recoveries" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"building_id" uuid NOT NULL,
	"tenant_name" varchar(255) NOT NULL,
	"amount_billed" numeric(12, 2) NOT NULL,
	"basic_charge" numeric(12, 2),
	"usage_charge" numeric(12, 2),
	"demand_charge" numeric(12, 2),
	"solar_produced" numeric(12, 2),
	"period" date NOT NULL,
	"pdf_url" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" text NOT NULL,
	"email" varchar(255) NOT NULL,
	"reset_password_token" text,
	"reset_password_expiration" timestamp,
	"salt" text,
	"hash" text,
	"login_attempts" integer DEFAULT 0,
	"lock_until" timestamp,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "users_email_unique" UNIQUE("email")
);
--> statement-breakpoint
CREATE TABLE "users_sessions" (
	"id" text PRIMARY KEY NOT NULL,
	"_parent_id" uuid NOT NULL,
	"_order" integer NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"expires_at" timestamp NOT NULL
);
--> statement-breakpoint
CREATE TABLE "utility_accounts" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"building_id" uuid NOT NULL,
	"account_number" varchar(255) NOT NULL,
	"type" "utility_type" NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "analysis_reports" ADD CONSTRAINT "analysis_reports_building_id_buildings_id_fk" FOREIGN KEY ("building_id") REFERENCES "public"."buildings"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "feedback_loop" ADD CONSTRAINT "feedback_loop_analysis_report_id_analysis_reports_id_fk" FOREIGN KEY ("analysis_report_id") REFERENCES "public"."analysis_reports"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "invoices" ADD CONSTRAINT "invoices_utility_account_id_utility_accounts_id_fk" FOREIGN KEY ("utility_account_id") REFERENCES "public"."utility_accounts"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "recoveries" ADD CONSTRAINT "recoveries_building_id_buildings_id_fk" FOREIGN KEY ("building_id") REFERENCES "public"."buildings"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "users_sessions" ADD CONSTRAINT "users_sessions__parent_id_users_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "utility_accounts" ADD CONSTRAINT "utility_accounts_building_id_buildings_id_fk" FOREIGN KEY ("building_id") REFERENCES "public"."buildings"("id") ON DELETE no action ON UPDATE no action;