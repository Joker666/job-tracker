import { asc, desc, eq, inArray } from "drizzle-orm";
import { db } from "@/db";
import { jobApplicationStatusEvents, jobApplications, jobInterviews } from "@/db/schema";

export async function getJobApplications() {
  const jobs = await db.select().from(jobApplications).orderBy(desc(jobApplications.createdAt));

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

  const statusEvents = await db
    .select()
    .from(jobApplicationStatusEvents)
    .where(
      inArray(
        jobApplicationStatusEvents.jobApplicationId,
        jobs.map((job) => job.id),
      ),
    )
    .orderBy(asc(jobApplicationStatusEvents.changedAt));

  const statusEventsByJobId = new Map<string, typeof statusEvents>();

  for (const statusEvent of statusEvents) {
    const existing = statusEventsByJobId.get(statusEvent.jobApplicationId) ?? [];
    existing.push(statusEvent);
    statusEventsByJobId.set(statusEvent.jobApplicationId, existing);
  }

  return jobs.map((job) => ({
    ...job,
    interviews: interviewsByJobId.get(job.id) ?? [],
    statusEvents: statusEventsByJobId.get(job.id) ?? [],
  }));
}

export async function getJobApplicationById(id: string) {
  const [job] = await db.select().from(jobApplications).where(eq(jobApplications.id, id)).limit(1);

  if (!job) {
    return null;
  }

  const interviews = await db
    .select()
    .from(jobInterviews)
    .where(eq(jobInterviews.jobApplicationId, id))
    .orderBy(asc(jobInterviews.interviewDate));

  const statusEvents = await db
    .select()
    .from(jobApplicationStatusEvents)
    .where(eq(jobApplicationStatusEvents.jobApplicationId, id))
    .orderBy(asc(jobApplicationStatusEvents.changedAt));

  return {
    ...job,
    interviews,
    statusEvents,
  };
}
