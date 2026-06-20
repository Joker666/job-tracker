"use client";

import { APPLICATION_STATUSES, STATUS_LABELS } from "@/lib/status";
import { STATUS_COLORS } from "./constants";
import { formatInterviewDate } from "./job-detail-modal";
import type { JobApplicationView } from "./types";

export function JobListView({
  jobs,
  onViewDetails,
  nowMs,
}: {
  jobs: JobApplicationView[];
  onViewDetails: (job: JobApplicationView) => void;
  nowMs: number | null;
}) {
  return (
    <div className="space-y-8">
      {APPLICATION_STATUSES.map((status) => {
        const statusJobs = jobs
          .filter((job) => job.status === status)
          .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
        const colorConfig = STATUS_COLORS[status];

        return (
          <section
            key={status}
            className="border-4 border-border-custom bg-card shadow-[6px_6px_0px_0px_var(--shadow-color)] overflow-hidden"
          >
            {/* Group Header */}
            <div
              className={`border-b-4 border-border-custom px-6 py-3.5 flex items-center justify-between ${colorConfig.bg}`}
            >
              <h2 className="font-mono text-sm font-black uppercase tracking-wider text-black">
                {STATUS_LABELS[status]}
              </h2>
              <span className="border border-border-custom bg-label px-2 py-0.5 font-mono text-xs font-bold text-foreground shadow-[1px_1px_0px_0px_var(--shadow-color)]">
                {statusJobs.length}
              </span>
            </div>

            {/* Group Body */}
            {statusJobs.length === 0 ? (
              <div className="px-6 py-4 font-mono text-[10px] font-bold uppercase tracking-wider text-foreground/35">
                // No jobs in this category
              </div>
            ) : (
              <div className="divide-y-2 divide-border-custom/25">
                {statusJobs.map((job) => {
                  const nextInterview =
                    nowMs === null
                      ? undefined
                      : job.interviews.find(
                          (interview) => new Date(interview.interviewDate).getTime() >= nowMs,
                        );
                  const featuredInterview =
                    nextInterview ??
                    (nowMs === null
                      ? job.interviews[0]
                      : job.interviews[job.interviews.length - 1]);

                  return (
                    // biome-ignore lint/a11y/useKeyWithClickEvents: JobCard rows use pointer events and details modals, keyboard actions are handled in individual modal focus loops
                    // biome-ignore lint/a11y/noStaticElementInteractions: click handlers are applied to row containers for cleaner neo-brutalist visuals
                    <div
                      key={job.id}
                      onClick={() => onViewDetails(job)}
                      className="px-6 py-4 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between hover:bg-foreground/5 cursor-pointer transition-colors text-foreground"
                    >
                      {/* Left: Role, Company */}
                      <div className="flex-1 min-w-0">
                        <h4 className="font-mono text-sm font-black uppercase tracking-tight line-clamp-1">
                          {job.title}
                        </h4>
                        <p className="font-mono text-xs font-bold text-foreground/60 mt-0.5">
                          {job.companyName}
                        </p>
                      </div>

                      {/* Right: Location & Salary, Interview Timeline, Links */}
                      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:gap-6 shrink-0">
                        {/* Interview info */}
                        {featuredInterview ? (
                          <div className="sm:w-[150px] shrink-0">
                            <span className="inline-block border border-border-custom bg-interview px-1 py-0.5 font-mono text-[8px] font-black uppercase tracking-wider text-foreground mb-1">
                              {featuredInterview.interviewType}
                            </span>
                            <p className="font-mono text-[10px] font-bold text-foreground/75">
                              {formatInterviewDate(featuredInterview.interviewDate)}
                            </p>
                          </div>
                        ) : null}

                        {/* Location & Salary */}
                        {job.location || job.salaryRange ? (
                          <div className="flex flex-col gap-1.5 sm:w-[160px] shrink-0">
                            {job.location ? (
                              <div className="flex items-center gap-1.5 font-mono text-[10px] font-semibold text-foreground/75">
                                <span className="w-[28px] inline-flex items-center justify-center uppercase text-[8px] font-bold py-0.5 border border-border-custom bg-label shadow-[1px_1px_0px_0px_var(--shadow-color)]">
                                  Loc
                                </span>
                                <span className="truncate max-w-[120px]">{job.location}</span>
                              </div>
                            ) : null}
                            {job.salaryRange ? (
                              <div className="flex items-center gap-1.5 font-mono text-[10px] font-semibold text-foreground/75">
                                <span className="w-[28px] inline-flex items-center justify-center uppercase text-[8px] font-bold py-0.5 border border-border-custom bg-[#4ADE80] text-black shadow-[1px_1px_0px_0px_var(--shadow-color)]">
                                  Sal
                                </span>
                                <span className="truncate max-w-[120px]">{job.salaryRange}</span>
                              </div>
                            ) : null}
                          </div>
                        ) : null}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </section>
        );
      })}
    </div>
  );
}
