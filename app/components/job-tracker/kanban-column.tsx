"use client";

import { useDroppable } from "@dnd-kit/core";
import { type ApplicationStatus, STATUS_LABELS } from "@/lib/status";
import { STATUS_COLORS } from "./constants";
import { JobCard } from "./job-card";
import type { JobApplicationView } from "./types";

export function KanbanColumn({
  status,
  jobs,
  onViewDetails,
  nowMs,
}: {
  status: ApplicationStatus;
  jobs: JobApplicationView[];
  onViewDetails: (job: JobApplicationView) => void;
  nowMs: number | null;
}) {
  const { isOver, setNodeRef } = useDroppable({
    id: status,
  });

  const colorConfig = STATUS_COLORS[status];

  return (
    <div
      ref={setNodeRef}
      className={`min-h-[500px] border-3 border-black p-4 transition-all shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] ${
        isOver ? "bg-[#FFFDEB]" : "bg-white"
      }`}
    >
      {/* Column Title Sticker */}
      <div
        className={`mb-6 flex items-center justify-between border-2 border-black p-2.5 ${colorConfig.bg} shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]`}
      >
        <h2 className="font-mono text-xs font-black uppercase tracking-wider text-black">
          {STATUS_LABELS[status]}
        </h2>
        <span className="border border-black bg-white px-2 py-0.5 font-mono text-xs font-bold text-black shadow-[1px_1px_0px_0px_rgba(0,0,0,1)]">
          {jobs.length}
        </span>
      </div>

      <div className="space-y-4">
        {jobs.length > 0 ? (
          jobs.map((job) => (
            <JobCard key={job.id} job={job} onViewDetails={onViewDetails} nowMs={nowMs} />
          ))
        ) : (
          <div className="w-full border-2 border-dashed border-black/35 bg-[#FAF8F5] px-4 py-8 text-center font-mono text-xs font-bold uppercase tracking-wider text-black/40">
            Drop jobs here
          </div>
        )}
      </div>
    </div>
  );
}
