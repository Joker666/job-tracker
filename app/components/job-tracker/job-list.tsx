"use client";

import { STATUS_LABELS } from "@/lib/status";
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
  const sortedJobs = [...jobs].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
  );

  return (
    <div className="border-4 border-black bg-white shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] overflow-hidden">
      {sortedJobs.length === 0 ? (
        <div className="px-6 py-20 text-center font-mono text-sm font-bold uppercase tracking-wider text-black/40">
          No job applications found. Click "+ Create Application" to add one!
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full min-w-[800px] border-collapse text-left text-black font-sans">
            <thead>
              <tr className="border-b-4 border-black bg-[#FFDE4D] font-mono text-xs font-black uppercase tracking-wider">
                <th className="border-r-2 border-black px-4 py-3">Role & Company</th>
                <th className="border-r-2 border-black px-4 py-3">Details</th>
                <th className="border-r-2 border-black px-4 py-3 text-center">Status</th>
                <th className="border-r-2 border-black px-4 py-3">Next Interview</th>
                <th className="px-4 py-3">Attachments & Links</th>
              </tr>
            </thead>
            <tbody>
              {sortedJobs.map((job) => {
                const colorConfig = STATUS_COLORS[job.status];
                const nextInterview =
                  nowMs === null
                    ? undefined
                    : job.interviews.find(
                        (interview) => new Date(interview.interviewDate).getTime() >= nowMs,
                      );
                const featuredInterview =
                  nextInterview ??
                  (nowMs === null ? job.interviews[0] : job.interviews[job.interviews.length - 1]);

                return (
                  <tr
                    key={job.id}
                    onClick={() => onViewDetails(job)}
                    className="border-b-2 border-black hover:bg-yellow-50/50 cursor-pointer last:border-b-0 transition-colors"
                  >
                    {/* Role & Company */}
                    <td className="border-r-2 border-black px-4 py-3.5">
                      <h4 className="font-mono text-sm font-black uppercase tracking-tight line-clamp-1">
                        {job.title}
                      </h4>
                      <p className="font-mono text-xs font-bold text-black/60 mt-0.5">
                        {job.companyName}
                      </p>
                    </td>

                    {/* Details (Location, Salary) */}
                    <td className="border-r-2 border-black px-4 py-3.5 space-y-1">
                      {job.location ? (
                        <div className="flex items-center gap-1.5 font-mono text-[10px] font-semibold text-black/75">
                          <span className="uppercase text-[8px] font-bold px-1 py-0.5 border border-black bg-white shadow-[1px_1px_0px_0px_rgba(0,0,0,1)]">
                            Loc
                          </span>
                          <span className="truncate max-w-[120px]">{job.location}</span>
                        </div>
                      ) : null}
                      {job.salaryRange ? (
                        <div className="flex items-center gap-1.5 font-mono text-[10px] font-semibold text-black/75">
                          <span className="uppercase text-[8px] font-bold px-1 py-0.5 border border-black bg-[#4ADE80] shadow-[1px_1px_0px_0px_rgba(0,0,0,1)]">
                            Sal
                          </span>
                          <span className="truncate max-w-[120px]">{job.salaryRange}</span>
                        </div>
                      ) : null}
                      {!job.location && !job.salaryRange ? (
                        <span className="font-mono text-[10px] font-bold text-black/30 uppercase">
                          --
                        </span>
                      ) : null}
                    </td>

                    {/* Status badge */}
                    <td className="border-r-2 border-black px-4 py-3.5 text-center">
                      <div
                        className={`inline-block border border-black ${colorConfig.bg} px-2 py-0.5 font-mono text-[10px] font-black uppercase tracking-wider text-black shadow-[1.5px_1.5px_0px_0px_rgba(0,0,0,1)]`}
                      >
                        {STATUS_LABELS[job.status]}
                      </div>
                    </td>

                    {/* Next Interview */}
                    <td className="border-r-2 border-black px-4 py-3.5">
                      {featuredInterview ? (
                        <div>
                          <span className="inline-block border border-black bg-[#FFFDEB] px-1 py-0.5 font-mono text-[8px] font-black uppercase tracking-wider text-black mb-1">
                            {featuredInterview.interviewType}
                          </span>
                          <p className="font-mono text-[10px] font-bold text-black/70">
                            {formatInterviewDate(featuredInterview.interviewDate)}
                          </p>
                        </div>
                      ) : (
                        <span className="font-mono text-[10px] font-bold text-black/30 uppercase">
                          No timeline
                        </span>
                      )}
                    </td>

                    {/* Attachments & Links */}
                    <td className="px-4 py-3.5">
                      <div className="flex flex-wrap gap-2">
                        {job.jobUrl ? (
                          <a
                            className="inline-flex items-center justify-center border border-black bg-[#FFDE4D] px-2 py-1 font-mono text-[9px] font-black uppercase tracking-wider text-black shadow-[1px_1px_0px_0px_rgba(0,0,0,1)] hover:-translate-x-0.5 hover:-translate-y-0.5 hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] active:translate-x-0 active:translate-y-0 active:shadow-[0.5px_0.5px_0px_0px_rgba(0,0,0,1)] transition-all"
                            href={job.jobUrl}
                            target="_blank"
                            rel="noreferrer"
                            onClick={(e) => e.stopPropagation()}
                          >
                            Post
                          </a>
                        ) : null}
                        {job.resumeUrl ? (
                          <a
                            className="inline-flex items-center justify-center border border-black bg-[#38BDF8] px-2 py-1 font-mono text-[9px] font-black uppercase tracking-wider text-black shadow-[1px_1px_0px_0px_rgba(0,0,0,1)] hover:-translate-x-0.5 hover:-translate-y-0.5 hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] active:translate-x-0 active:translate-y-0 active:shadow-[0.5px_0.5px_0px_0px_rgba(0,0,0,1)] transition-all"
                            href={job.resumeUrl}
                            target="_blank"
                            rel="noreferrer"
                            onClick={(e) => e.stopPropagation()}
                          >
                            Resume
                          </a>
                        ) : null}
                        {!job.jobUrl && !job.resumeUrl ? (
                          <span className="font-mono text-[10px] font-bold text-black/30 uppercase">
                            No links
                          </span>
                        ) : null}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
