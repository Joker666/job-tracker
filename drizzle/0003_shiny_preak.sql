CREATE TABLE "job_application_status_events" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"job_application_id" uuid NOT NULL,
	"from_status" "application_status",
	"to_status" "application_status" NOT NULL,
	"changed_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "job_application_status_events" ADD CONSTRAINT "job_application_status_events_job_application_id_job_applications_id_fk" FOREIGN KEY ("job_application_id") REFERENCES "public"."job_applications"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "job_application_status_events_job_application_id_idx" ON "job_application_status_events" USING btree ("job_application_id");--> statement-breakpoint
CREATE INDEX "job_application_status_events_changed_at_idx" ON "job_application_status_events" USING btree ("changed_at");
--> statement-breakpoint
INSERT INTO "job_application_status_events" ("job_application_id", "from_status", "to_status", "changed_at")
SELECT "id", NULL, "status", "created_at"
FROM "job_applications";
