import { getJobApplications } from "@/app/data";
import {
  JobTracker,
  type JobApplicationView,
} from "@/app/components/job-tracker";

export const dynamic = "force-dynamic";

function serializeJob(job: Awaited<ReturnType<typeof getJobApplications>>[number]): JobApplicationView {
  return {
    ...job,
    resumeUploadedAt: job.resumeUploadedAt?.toISOString() ?? null,
    createdAt: job.createdAt.toISOString(),
    updatedAt: job.updatedAt.toISOString(),
  };
}

export default async function Home() {
  const jobs = await getJobApplications();

  return <JobTracker jobs={jobs.map(serializeJob)} />;
}
