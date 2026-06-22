"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { deleteJobApplication } from "@/app/actions";
import { STATUS_LABELS } from "@/lib/status";
import { MONTH_LABELS, STATUS_COLORS } from "./constants";
import { DeleteJobConfirmationDialog } from "./delete-job-confirmation-dialog";
import { StatusTimeline } from "./status-timeline";
import type { JobApplicationView } from "./types";

export function formatInterviewDate(value: string) {
  const date = new Date(value);

  return `${MONTH_LABELS[date.getUTCMonth()]} ${date.getUTCDate()}, ${date.getUTCFullYear()}`;
}

export function formatResumeUploadedAt(value: string) {
  const date = new Date(value);
  const month = String(date.getUTCMonth() + 1).padStart(2, "0");
  const day = String(date.getUTCDate()).padStart(2, "0");
  const hours = String(date.getUTCHours()).padStart(2, "0");
  const minutes = String(date.getUTCMinutes()).padStart(2, "0");

  return `${date.getUTCFullYear()}-${month}-${day} ${hours}:${minutes} UTC`;
}

export function JobDetailModal({
  job,
  onClose,
  onEdit,
  nowMs,
}: {
  job: JobApplicationView;
  onClose: () => void;
  onEdit: () => void;
  nowMs: number | null;
}) {
  const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  useEffect(() => {
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, []);

  const colorConfig = STATUS_COLORS[job.status];

  // Sort interviews chronologically
  const sortedInterviews = [...job.interviews].sort(
    (a, b) => new Date(a.interviewDate).getTime() - new Date(b.interviewDate).getTime(),
  );

  async function handleDeleteConfirm() {
    setIsDeleting(true);
    setDeleteError(null);

    try {
      await deleteJobApplication(job.id);
      sessionStorage.setItem("pending_toast", "Successfully deleted application!");
      onClose();
    } catch (err) {
      console.error(err);
      setDeleteError("Failed to delete job. Try again.");
      setIsDeleting(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto overscroll-contain bg-black/60 sm:px-4 sm:py-8 backdrop-blur-[2px]">
      <div className="w-full min-h-screen sm:min-h-0 sm:max-w-2xl border-0 sm:border-4 border-border-custom bg-background p-6 shadow-none sm:shadow-[8px_8px_0px_0px_var(--shadow-color)] md:p-8 relative">
        {/* Header */}
        <div className="mb-6 flex flex-col gap-4 border-b-2 border-border-custom pb-5">
          <div className="flex items-start justify-between gap-4">
            <div>
              <div
                className={`inline-block border-2 border-border-custom ${colorConfig.bg} px-2.5 py-1 font-mono text-[10px] font-black uppercase tracking-wider text-black shadow-[2px_2px_0px_0px_var(--shadow-color)] mb-3`}
              >
                {STATUS_LABELS[job.status]}
              </div>
              <h2 className="font-mono text-xl font-black uppercase tracking-tight text-foreground md:text-2xl">
                {job.title}
              </h2>
              <p className="font-mono text-sm font-bold text-foreground/70 mt-1">{job.companyName}</p>
            </div>
            <div className="flex gap-2 shrink-0">
              <Link
                href={`/jobs/${job.id}`}
                className="inline-flex items-center justify-center border-2 border-border-custom bg-card p-2 font-mono text-xs font-black uppercase tracking-wider text-foreground shadow-[2px_2px_0px_0px_var(--shadow-color)] hover:-translate-x-0.5 hover:-translate-y-0.5 hover:shadow-[4px_4px_0px_0px_var(--shadow-color)] active:translate-x-0 active:translate-y-0 active:shadow-[1px_1px_0px_0px_var(--shadow-color)] transition-all cursor-pointer"
                title="Open in dedicated page"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={2.5}
                  stroke="currentColor"
                  className="h-4 w-4"
                >
                  <title>Open in dedicated page</title>
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M13.5 6H5.25A2.25 2.25 0 0 0 3 8.25v10.5A2.25 2.25 0 0 0 5.25 21h10.5A2.25 2.25 0 0 0 18 18.75V10.5m-10.5 6L21 3m0 0h-5.25M21 3v5.25"
                  />
                </svg>
              </Link>
              <button
                type="button"
                onClick={onClose}
                className="border-2 border-border-custom bg-card px-3 py-1 font-mono text-xs font-black uppercase tracking-wider text-foreground shadow-[2px_2px_0px_0px_var(--shadow-color)] hover:-translate-x-0.5 hover:-translate-y-0.5 hover:shadow-[4px_4px_0px_0px_var(--shadow-color)] active:translate-x-0 active:translate-y-0 active:shadow-[1px_1px_0px_0px_var(--shadow-color)] transition-all cursor-pointer"
              >
                CLOSE
              </button>
            </div>
          </div>

          {/* Quick Meta */}
          <div className="flex flex-wrap gap-2.5">
            {job.location ? (
              <div className="flex items-center gap-1.5 font-mono text-xs font-semibold text-foreground/75">
                <span className="uppercase text-[9px] font-bold px-1.5 py-0.5 border border-border-custom bg-label shadow-[1px_1px_0px_0px_var(--shadow-color)]">
                  Loc
                </span>
                <span>{job.location}</span>
              </div>
            ) : null}
            {job.salaryRange ? (
              <div className="flex items-center gap-1.5 font-mono text-xs font-semibold text-foreground/75">
                <span className="uppercase text-[9px] font-bold px-1.5 py-0.5 border border-border-custom bg-[#4ADE80] text-black shadow-[1px_1px_0px_0px_var(--shadow-color)]">
                  Sal
                </span>
                <span>{job.salaryRange}</span>
              </div>
            ) : null}
            {job.jobUrl ? (
              <a
                href={job.jobUrl}
                target="_blank"
                rel="noreferrer"
                onClick={(e) => e.stopPropagation()}
                className="flex items-center gap-1.5 font-mono text-xs font-semibold text-foreground hover:underline"
              >
                <span className="uppercase text-[9px] font-bold px-1.5 py-0.5 border border-border-custom bg-[#FFDE4D] text-black shadow-[1px_1px_0px_0px_var(--shadow-color)]">
                  Post
                </span>
                <span className="truncate max-w-[200px]">{job.jobUrl}</span>
              </a>
            ) : null}
          </div>
        </div>

        {/* Content sections */}
        <div className="space-y-6">
          {/* Description */}
          <div className="border-2 border-border-custom bg-card p-4 shadow-[2px_2px_0px_0px_var(--shadow-color)]">
            <h4 className="font-mono text-xs font-black uppercase tracking-wider text-foreground mb-2.5">
              // Job Description
            </h4>
            <div className="text-sm font-medium leading-relaxed max-h-44 overflow-y-auto pr-2 whitespace-pre-wrap text-foreground/90">
              {job.description || (
                <span className="font-mono text-xs font-bold text-foreground/40 uppercase">
                  No description provided.
                </span>
              )}
            </div>
          </div>

          {/* Note */}
          <div className="border-2 border-border-custom bg-card p-4 shadow-[2px_2px_0px_0px_var(--shadow-color)]">
            <h4 className="font-mono text-xs font-black uppercase tracking-wider text-foreground mb-2.5">
              // Personal Notes
            </h4>
            <div className="text-sm font-medium leading-relaxed max-h-32 overflow-y-auto pr-2 whitespace-pre-wrap text-foreground/90">
              {job.note || (
                <span className="font-mono text-xs font-bold text-foreground/40 uppercase">No notes added.</span>
              )}
            </div>
          </div>

          <div className="grid gap-6 md:grid-cols-2">
            {/* Interviews */}
            <div className="border-2 border-border-custom bg-interview p-4 shadow-[2px_2px_0px_0px_var(--shadow-color)] flex flex-col justify-between">
              <div>
                <h4 className="font-mono text-xs font-black uppercase tracking-wider text-foreground mb-3">
                  // Interview Timeline
                </h4>
                {sortedInterviews.length > 0 ? (
                  <div className="space-y-2 max-h-48 overflow-y-auto pr-2">
                    {sortedInterviews.map((interview, index) => {
                      const isUpcoming = nowMs !== null && new Date(interview.interviewDate).getTime() >= nowMs;
                      return (
                        <div
                          key={interview.id}
                          className={`flex items-start gap-3 border border-border-custom bg-card p-2.5 shadow-[1.5px_1.5px_0px_0px_var(--shadow-color)] ${isUpcoming ? "border-l-4 border-l-[#C084FC]" : ""}`}
                        >
                          <span className="border border-border-custom bg-label px-1.5 py-0.5 font-mono text-[8px] font-black text-foreground">
                            #{index + 1}
                          </span>
                          <div>
                            <p className="font-mono text-xs font-black uppercase text-foreground">
                              {interview.interviewType}
                            </p>
                            <p className="font-mono text-[9px] font-bold text-foreground/60 mt-0.5">
                              {formatInterviewDate(interview.interviewDate)}
                            </p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <p className="font-mono text-[10px] font-bold text-foreground/40 uppercase">
                    // No interviews scheduled yet.
                  </p>
                )}
              </div>
            </div>

            {/* Resume */}
            <div className="border-2 border-border-custom bg-[#E0F7FA] dark:bg-[#1a3a3d] p-4 shadow-[2px_2px_0px_0px_var(--shadow-color)] flex flex-col justify-between gap-4">
              <div>
                <h4 className="font-mono text-xs font-black uppercase tracking-wider text-black dark:text-white mb-3">
                  // Resume Submitted
                </h4>
                {job.resumeUrl ? (
                  <div className="space-y-2">
                    <p className="font-mono text-xs font-bold truncate text-black/80 dark:text-white/80">
                      {job.resumeName}
                    </p>
                    {job.resumeUploadedAt ? (
                      <p className="font-mono text-[9px] text-black/55 dark:text-white/55 uppercase font-bold">
                        Uploaded: {formatResumeUploadedAt(job.resumeUploadedAt)}
                      </p>
                    ) : null}
                  </div>
                ) : (
                  <p className="font-mono text-[10px] font-bold text-black/40 dark:text-white/40 uppercase">
                    // No resume uploaded.
                  </p>
                )}
              </div>

              {job.resumeUrl ? (
                <div className="flex">
                  <a
                    href={job.resumeUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center justify-center border border-border-custom bg-card px-3 py-1.5 font-mono text-[10px] font-black uppercase tracking-wider text-foreground shadow-[2px_2px_0px_0px_var(--shadow-color)] hover:-translate-x-0.5 hover:-translate-y-0.5 hover:shadow-[4px_4px_0px_0px_var(--shadow-color)] active:translate-x-0 active:translate-y-0 active:shadow-[1px_1px_0px_0px_var(--shadow-color)] transition-all cursor-pointer w-full text-center"
                  >
                    Download Resume
                  </a>
                </div>
              ) : null}
            </div>
          </div>

          <StatusTimeline job={job} />
        </div>

        {/* Footer Actions */}
        <div className="mt-8 flex justify-between items-center border-t-2 border-border-custom pt-5">
          <button
            type="button"
            onClick={() => {
              setDeleteError(null);
              setIsDeleteConfirmOpen(true);
            }}
            className="h-10 border-2 border-border-custom bg-[#FB7185] px-4 font-mono text-xs font-black uppercase tracking-wider text-black shadow-[2px_2px_0px_0px_var(--shadow-color)] hover:-translate-x-0.5 hover:-translate-y-0.5 hover:shadow-[4px_4px_0px_0px_var(--shadow-color)] active:translate-x-0 active:translate-y-0 active:shadow-[1px_1px_0px_0px_var(--shadow-color)] transition-all cursor-pointer"
          >
            Delete Job
          </button>
          <div className="flex gap-3">
            <button
              type="button"
              onClick={onClose}
              className="h-10 border-2 border-border-custom bg-card px-5 font-mono text-xs font-black uppercase tracking-wider text-foreground shadow-[2px_2px_0px_0px_var(--shadow-color)] hover:-translate-x-0.5 hover:-translate-y-0.5 hover:shadow-[4px_4px_0px_0px_var(--shadow-color)] active:translate-x-0 active:translate-y-0 active:shadow-[1px_1px_0px_0px_var(--shadow-color)] transition-all cursor-pointer"
            >
              Close
            </button>
            <button
              type="button"
              onClick={onEdit}
              className="h-10 border-2 border-border-custom bg-[#4ADE80] px-5 font-mono text-xs font-black uppercase tracking-wider text-black shadow-[2px_2px_0px_0px_var(--shadow-color)] hover:-translate-x-0.5 hover:-translate-y-0.5 hover:shadow-[4px_4px_0px_0px_var(--shadow-color)] active:translate-x-0 active:translate-y-0 active:shadow-[1px_1px_0px_0px_var(--shadow-color)] transition-all cursor-pointer"
            >
              Edit Details
            </button>
          </div>
        </div>
      </div>

      {isDeleteConfirmOpen ? (
        <DeleteJobConfirmationDialog
          isDeleting={isDeleting}
          error={deleteError}
          jobTitle={job.title}
          onCancel={() => {
            if (isDeleting) {
              return;
            }
            setIsDeleteConfirmOpen(false);
            setDeleteError(null);
          }}
          onConfirm={handleDeleteConfirm}
        />
      ) : null}
    </div>
  );
}
