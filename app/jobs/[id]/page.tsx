import { notFound } from "next/navigation";
import type { JobApplicationView } from "@/app/components/job-tracker";
import { JobDetailPageContent } from "@/app/components/job-tracker/job-detail-page";
import { getJobApplicationById } from "@/app/data";

export const dynamic = "force-dynamic";

function serializeJob(
  job: NonNullable<Awaited<ReturnType<typeof getJobApplicationById>>>,
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
  };
}

export default async function JobDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const job = await getJobApplicationById(id);

  if (!job) {
    notFound();
  }

  return <JobDetailPageContent job={serializeJob(job)} />;
}
