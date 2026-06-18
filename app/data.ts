import { asc, desc, inArray } from "drizzle-orm";
import { db } from "@/db";
import { jobApplications, jobInterviews } from "@/db/schema";

export async function getJobApplications() {
  const jobs = await db
    .select()
    .from(jobApplications)
    .orderBy(desc(jobApplications.createdAt));

  if (jobs.length === 0) {
    return [];
  }

  const interviews = await db
    .select()
    .from(jobInterviews)
    .where(
      inArray(
        jobInterviews.jobApplicationId,
        jobs.map((job) => job.id),
      ),
    )
    .orderBy(asc(jobInterviews.interviewDate));

  const interviewsByJobId = new Map<string, typeof interviews>();

  for (const interview of interviews) {
    const existing = interviewsByJobId.get(interview.jobApplicationId) ?? [];
    existing.push(interview);
    interviewsByJobId.set(interview.jobApplicationId, existing);
  }

  return jobs.map((job) => ({
    ...job,
    interviews: interviewsByJobId.get(job.id) ?? [],
  }));
}
