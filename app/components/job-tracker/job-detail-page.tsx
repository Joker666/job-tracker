"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { deleteJobApplication } from "@/app/actions";
import { STATUS_LABELS } from "@/lib/status";
import { AccessCheckingOverlay, AccessModal } from "./access-modal";
import { ACCESS_STORAGE_KEY, STATUS_COLORS } from "./constants";
import { formatInterviewDate, formatResumeUploadedAt } from "./job-detail-modal";
import { JobModal } from "./job-modal";
import type { JobApplicationView } from "./types";

export function JobDetailPageContent({ job }: { job: JobApplicationView }) {
  const router = useRouter();
  const [accessGranted, setAccessGranted] = useState(false);
  const [accessChecked, setAccessChecked] = useState(false);
  const [nowMs, setNowMs] = useState<number | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    setNowMs(Date.now());
  }, []);

  useEffect(() => {
    setAccessGranted(localStorage.getItem(ACCESS_STORAGE_KEY) === "true");
    setAccessChecked(true);
  }, []);

  const colorConfig = STATUS_COLORS[job.status];

  // Sort interviews chronologically
  const sortedInterviews = [...job.interviews].sort(
    (a, b) => new Date(a.interviewDate).getTime() - new Date(b.interviewDate).getTime(),
  );

  async function handleDelete() {
    if (confirm("Are you sure you want to delete this job application?")) {
      setIsDeleting(true);
      try {
        await deleteJobApplication(job.id);
        router.push("/");
      } catch (err) {
        console.error(err);
        setIsDeleting(false);
        alert("Failed to delete the job application.");
      }
    }
  }

  return (
    <main className="min-h-screen bg-[#f4f3ef] px-4 py-10 text-black sm:px-6 lg:px-8 font-sans">
      {!accessChecked ? <AccessCheckingOverlay /> : null}
      {accessChecked && !accessGranted ? (
        <AccessModal onGranted={() => setAccessGranted(true)} />
      ) : null}

      <div
        className={`mx-auto max-w-4xl ${
          accessGranted ? "" : "pointer-events-none select-none blur-sm"
        }`}
        aria-hidden={!accessGranted}
      >
        {/* Navigation / Back Button */}
        <div className="mb-8">
          <Link
            href="/"
            className="inline-flex h-10 items-center justify-center border-2 border-black bg-white px-4 font-mono text-xs font-black uppercase tracking-wider text-black shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] hover:-translate-x-0.5 hover:-translate-y-0.5 hover:shadow-[5px_5px_0px_0px_rgba(0,0,0,1)] active:translate-x-0 active:translate-y-0 active:shadow-[1px_1px_0px_0px_rgba(0,0,0,1)] transition-all cursor-pointer"
          >
            ← Back to Board
          </Link>
        </div>

        {/* Main Job Detail Container */}
        <div className="border-4 border-black bg-[#f4f3ef] p-6 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] md:p-8 relative">
          {/* Header */}
          <div className="mb-8 flex flex-col gap-5 border-b-4 border-black pb-6">
            <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
              <div>
                <div
                  className={`inline-block border-2 border-black ${colorConfig.bg} px-3 py-1 font-mono text-xs font-black uppercase tracking-wider text-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] mb-3`}
                >
                  {STATUS_LABELS[job.status]}
                </div>
                <h1 className="font-mono text-3xl font-black uppercase tracking-tight text-black md:text-4xl">
                  {job.title}
                </h1>
                <p className="font-mono text-lg font-bold text-black/85 mt-1">{job.companyName}</p>
              </div>

              {/* Top Quick Actions */}
              <div className="flex gap-3 shrink-0">
                <button
                  type="button"
                  onClick={() => setIsEditing(true)}
                  className="h-10 border-2 border-black bg-[#4ADE80] px-5 font-mono text-xs font-black uppercase tracking-wider text-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:-translate-x-0.5 hover:-translate-y-0.5 hover:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] active:translate-x-0 active:translate-y-0 active:shadow-[1px_1px_0px_0px_rgba(0,0,0,1)] transition-all cursor-pointer"
                >
                  Edit
                </button>
                <button
                  type="button"
                  onClick={handleDelete}
                  disabled={isDeleting}
                  className="h-10 border-2 border-black bg-[#FB7185] px-4 font-mono text-xs font-black uppercase tracking-wider text-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:-translate-x-0.5 hover:-translate-y-0.5 hover:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] active:translate-x-0 active:translate-y-0 active:shadow-[1px_1px_0px_0px_rgba(0,0,0,1)] transition-all cursor-pointer disabled:opacity-50"
                >
                  {isDeleting ? "Deleting..." : "Delete"}
                </button>
              </div>
            </div>

            {/* Quick Meta Grid */}
            <div className="flex flex-wrap gap-3">
              {job.location ? (
                <div className="flex items-center gap-2 font-mono text-sm font-bold text-black/75">
                  <span className="uppercase text-[10px] font-black px-2 py-1 border-2 border-black bg-white shadow-[1.5px_1.5px_0px_0px_rgba(0,0,0,1)]">
                    Location
                  </span>
                  <span>{job.location}</span>
                </div>
              ) : null}
              {job.salaryRange ? (
                <div className="flex items-center gap-2 font-mono text-sm font-bold text-black/75">
                  <span className="uppercase text-[10px] font-black px-2 py-1 border-2 border-black bg-[#4ADE80] shadow-[1.5px_1.5px_0px_0px_rgba(0,0,0,1)]">
                    Salary
                  </span>
                  <span>{job.salaryRange}</span>
                </div>
              ) : null}
              {job.jobUrl ? (
                <a
                  href={job.jobUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center gap-2 font-mono text-sm font-bold text-black hover:underline"
                >
                  <span className="uppercase text-[10px] font-black px-2 py-1 border-2 border-black bg-[#FFDE4D] shadow-[1.5px_1.5px_0px_0px_rgba(0,0,0,1)]">
                    Post Link
                  </span>
                  <span className="truncate max-w-[240px]">{job.jobUrl}</span>
                </a>
              ) : null}
            </div>
          </div>

          {/* Details Content Grid */}
          <div className="grid gap-8 md:grid-cols-3">
            {/* Left Columns - Details (Description + Notes) */}
            <div className="md:col-span-2 space-y-6">
              {/* Job Description */}
              <div className="border-2 border-black bg-white p-5 shadow-[3px_3px_0px_0px_rgba(0,0,0,1)]">
                <h3 className="font-mono text-xs font-black uppercase tracking-wider text-black mb-3 pb-2 border-b border-black/10">
                  // Job Description
                </h3>
                <div className="text-sm font-medium leading-relaxed whitespace-pre-wrap text-black/90 min-h-[120px]">
                  {job.description || (
                    <span className="font-mono text-xs font-bold text-black/40 uppercase">
                      No description provided.
                    </span>
                  )}
                </div>
              </div>

              {/* Personal Notes */}
              <div className="border-2 border-black bg-white p-5 shadow-[3px_3px_0px_0px_rgba(0,0,0,1)]">
                <h3 className="font-mono text-xs font-black uppercase tracking-wider text-black mb-3 pb-2 border-b border-black/10">
                  // Personal Notes & Log
                </h3>
                <div className="text-sm font-medium leading-relaxed whitespace-pre-wrap text-black/90 min-h-[80px]">
                  {job.note || (
                    <span className="font-mono text-xs font-bold text-black/40 uppercase">
                      No notes added yet.
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Right Column - Timeline, Resume, Details info */}
            <div className="space-y-6">
              {/* Interview Timeline */}
              <div className="border-2 border-black bg-[#FFFDEB] p-5 shadow-[3px_3px_0px_0px_rgba(0,0,0,1)]">
                <h3 className="font-mono text-xs font-black uppercase tracking-wider text-black mb-3 pb-2 border-b border-black/10">
                  // Interview Timeline
                </h3>
                {sortedInterviews.length > 0 ? (
                  <div className="space-y-3">
                    {sortedInterviews.map((interview, index) => {
                      const isUpcoming =
                        nowMs !== null && new Date(interview.interviewDate).getTime() >= nowMs;
                      return (
                        <div
                          key={interview.id}
                          className={`flex items-start gap-3 border-2 border-black bg-white p-3 shadow-[1.5px_1.5px_0px_0px_rgba(0,0,0,1)] ${
                            isUpcoming ? "border-l-4 border-l-[#C084FC]" : ""
                          }`}
                        >
                          <span className="border border-black bg-zinc-100 px-1.5 py-0.5 font-mono text-[9px] font-black text-black">
                            #{index + 1}
                          </span>
                          <div>
                            <p className="font-mono text-xs font-black uppercase text-black">
                              {interview.interviewType}
                            </p>
                            <p className="font-mono text-[9px] font-bold text-black/60 mt-0.5">
                              {formatInterviewDate(interview.interviewDate)}
                            </p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <p className="font-mono text-[10px] font-bold text-black/40 uppercase">
                    // No interviews scheduled.
                  </p>
                )}
              </div>

              {/* Resume Info & PDF Link */}
              <div className="border-2 border-black bg-[#E0F7FA] p-5 shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] flex flex-col gap-4">
                <div>
                  <h3 className="font-mono text-xs font-black uppercase tracking-wider text-black mb-3 pb-2 border-b border-black/10">
                    // Submitted Resume
                  </h3>
                  {job.resumeUrl ? (
                    <div className="space-y-2">
                      <p className="font-mono text-xs font-bold truncate text-black/80">
                        {job.resumeName}
                      </p>
                      {job.resumeUploadedAt ? (
                        <p className="font-mono text-[9px] text-black/55 uppercase font-bold">
                          Uploaded: {formatResumeUploadedAt(job.resumeUploadedAt)}
                        </p>
                      ) : null}
                    </div>
                  ) : (
                    <p className="font-mono text-[10px] font-bold text-black/40 uppercase">
                      // No resume uploaded.
                    </p>
                  )}
                </div>

                {job.resumeUrl ? (
                  <a
                    href={job.resumeUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center justify-center border-2 border-black bg-white px-4 py-2 font-mono text-[10px] font-black uppercase tracking-wider text-black shadow-[2.5px_2.5px_0px_0px_rgba(0,0,0,1)] hover:-translate-x-0.5 hover:-translate-y-0.5 hover:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] active:translate-x-0 active:translate-y-0 active:shadow-[1px_1px_0px_0px_rgba(0,0,0,1)] transition-all cursor-pointer text-center w-full"
                  >
                    View / Download Resume
                  </a>
                ) : null}
              </div>
            </div>
          </div>
        </div>
      </div>

      {isEditing ? (
        <JobModal
          mode={{ type: "edit", job }}
          onClose={() => {
            setIsEditing(false);
            router.refresh();
          }}
        />
      ) : null}
    </main>
  );
}
