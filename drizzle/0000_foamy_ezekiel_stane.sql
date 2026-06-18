CREATE TYPE "public"."application_status" AS ENUM('SAVED', 'APPLIED', 'INTERVIEWING', 'OFFER', 'REJECTED');--> statement-breakpoint
CREATE TABLE "job_applications" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"title" text NOT NULL,
	"company_name" text NOT NULL,
	"description" text DEFAULT '' NOT NULL,
	"location" text DEFAULT '' NOT NULL,
	"salary_range" text DEFAULT '' NOT NULL,
	"note" text DEFAULT '' NOT NULL,
	"status" "application_status" DEFAULT 'SAVED' NOT NULL,
	"resume_url" text,
	"resume_name" text,
	"resume_uploaded_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
