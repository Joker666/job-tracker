import { verifyAppAccessCookie } from "@/app/actions";
import { type JobApplicationView, JobTracker } from "@/app/components/job-tracker";
import { getJobApplications } from "@/app/data";

export const dynamic = "force-dynamic";

function serializeJob(
  job: Awaited<ReturnType<typeof getJobApplications>>[number],
): JobApplicationView {
  return {
    ...job,
    resumeUploadedAt: job.resumeUploadedAt?.toISOString() ?? null,
    createdAt: job.createdAt.toISOString(),
    updatedAt: job.updatedAt.toISOString(),
    interviews: job.interviews.map((interview) => ({
      id: interview.id,
      interviewDate: interview.interviewDate.toISOString(),
      interviewType: interview.interviewType,
    })),
    statusEvents: job.statusEvents.map((statusEvent) => ({
      id: statusEvent.id,
      fromStatus: statusEvent.fromStatus,
      toStatus: statusEvent.toStatus,
      changedAt: statusEvent.changedAt.toISOString(),
    })),
  };
}

export default async function Home() {
  const hasAccess = await verifyAppAccessCookie();
  const jobs = hasAccess ? await getJobApplications() : [];

  return <JobTracker jobs={jobs.map(serializeJob)} initialAccessGranted={hasAccess} />;
}
