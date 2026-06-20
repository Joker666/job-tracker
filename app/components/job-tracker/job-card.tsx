"use client";

import { useDraggable } from "@dnd-kit/core";
import { formatFriendlyDateTime } from "./date-format";
import { formatInterviewDate } from "./job-detail-modal";
import type { JobApplicationView } from "./types";

function getAppliedAt(job: JobApplicationView) {
  return job.statusEvents.find((event) => event.toStatus === "APPLIED")?.changedAt ?? null;
}

export function JobCard({
  job,
  onViewDetails,
  nowMs,
}: {
  job: JobApplicationView;
  onViewDetails: (job: JobApplicationView) => void;
  nowMs: number | null;
}) {
  const nextInterview =
    nowMs === null
      ? undefined
      : job.interviews.find((interview) => new Date(interview.interviewDate).getTime() >= nowMs);
  const appliedAt = job.status === "APPLIED" ? getAppliedAt(job) : null;
  const featuredInterview =
    nextInterview ??
    (nowMs === null ? job.interviews[0] : job.interviews[job.interviews.length - 1]);
  const { attributes, listeners, setActivatorNodeRef, setNodeRef, transform, isDragging } =
    useDraggable({
      id: job.id,
      data: {
        status: job.status,
      },
    });
  const style = {
    transform: transform ? `translate3d(${transform.x}px, ${transform.y}px, 0)` : undefined,
    opacity: isDragging ? 0.3 : 1,
    zIndex: isDragging ? 50 : undefined,
  };

  return (
    // biome-ignore lint/a11y/useKeyWithClickEvents: JobCard uses dnd-kit pointer sensors for dragging rather than static keyboard click events
    <article
      ref={(node) => {
        setNodeRef(node);
        setActivatorNodeRef(node);
      }}
      style={style}
      onClick={() => onViewDetails(job)}
      className="border-3 border-border-custom p-4 shadow-[4px_4px_0px_0px_var(--shadow-color)] transition-all bg-card relative group cursor-pointer hover:-translate-x-0.5 hover:-translate-y-0.5 hover:shadow-[6px_6px_0px_0px_var(--shadow-color)]"
      {...listeners}
      {...attributes}
    >
      <div className="flex items-start justify-between gap-3">
        <div>
          <h3 className="font-mono text-sm font-black uppercase tracking-tight text-foreground line-clamp-1">
            {job.title}
          </h3>
          <p className="font-mono text-xs font-bold text-foreground/70 mt-0.5">{job.companyName}</p>
        </div>
      </div>

      <div className="mt-4 border-t-2 border-dashed border-border-custom/25 pt-3 space-y-1.5">
        {job.location ? (
          <div className="flex items-center gap-1.5 font-mono text-[11px] font-semibold text-foreground/75">
            <span className="w-[30px] inline-flex items-center justify-center uppercase text-[9px] font-bold py-0.5 border border-border-custom bg-label shadow-[1px_1px_0px_0px_var(--shadow-color)]">
              Loc
            </span>
            <span className="truncate">{job.location}</span>
          </div>
        ) : null}
        {job.salaryRange ? (
          <div className="flex items-center gap-1.5 font-mono text-[11px] font-semibold text-foreground/75">
            <span className="w-[30px] inline-flex items-center justify-center uppercase text-[9px] font-bold py-0.5 border border-border-custom bg-[#4ADE80] text-black shadow-[1px_1px_0px_0px_var(--shadow-color)]">
              Sal
            </span>
            <span className="truncate">{job.salaryRange}</span>
          </div>
        ) : null}
        {appliedAt ? (
          <div className="flex items-center gap-1.5 font-mono text-[11px] font-semibold text-foreground/75">
            <span className="w-[30px] inline-flex items-center justify-center uppercase text-[9px] font-bold py-0.5 border border-border-custom bg-[#38BDF8] text-black shadow-[1px_1px_0px_0px_var(--shadow-color)]">
              App
            </span>
            <span className="truncate">{formatFriendlyDateTime(appliedAt)}</span>
          </div>
        ) : null}
      </div>

      {job.interviews.length > 0 ? (
        <div className="mt-3 border border-border-custom bg-interview p-2 shadow-[2px_2px_0px_0px_var(--shadow-color)]">
          <div className="mb-1 flex items-center justify-between gap-2">
            <span className="font-mono text-[9px] font-black uppercase tracking-wider text-foreground">
              Interviews
            </span>
            <span className="border border-border-custom bg-label px-1.5 py-0.5 font-mono text-[9px] font-black text-foreground shadow-[1px_1px_0px_0px_var(--shadow-color)]">
              {job.interviews.length}
            </span>
          </div>
          <p className="font-mono text-[11px] font-bold leading-normal text-foreground/80">
            {featuredInterview
              ? `${featuredInterview.interviewType} · ${formatInterviewDate(
                  featuredInterview.interviewDate,
                )}`
              : null}
          </p>
        </div>
      ) : null}
    </article>
  );
}
