import {
  pgEnum,
  pgTable,
  text,
  timestamp,
  uuid,
} from "drizzle-orm/pg-core";
import { APPLICATION_STATUSES, type ApplicationStatus } from "@/lib/status";

export const applicationStatusEnum = pgEnum(
  "application_status",
  APPLICATION_STATUSES,
);

export const jobApplications = pgTable("job_applications", {
  id: uuid("id").defaultRandom().primaryKey(),
  title: text("title").notNull(),
  companyName: text("company_name").notNull(),
  description: text("description").notNull().default(""),
  location: text("location").notNull().default(""),
  salaryRange: text("salary_range").notNull().default(""),
  note: text("note").notNull().default(""),
  status: applicationStatusEnum("status").notNull().default("SAVED"),
  resumeUrl: text("resume_url"),
  resumeName: text("resume_name"),
  resumeUploadedAt: timestamp("resume_uploaded_at", { withTimezone: true }),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});

export type JobApplication = typeof jobApplications.$inferSelect;
export type NewJobApplication = typeof jobApplications.$inferInsert;
export type { ApplicationStatus };
