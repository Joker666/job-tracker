import { desc } from "drizzle-orm";
import { db } from "@/db";
import { jobApplications } from "@/db/schema";

export async function getJobApplications() {
  return db
    .select()
    .from(jobApplications)
    .orderBy(desc(jobApplications.createdAt));
}
