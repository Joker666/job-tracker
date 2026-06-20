"use client";

import { STATUS_LABELS } from "@/lib/status";
import { formatFriendlyDateTime } from "./date-format";
import type { JobApplicationView } from "./types";

export function StatusTimeline({ job }: { job: JobApplicationView }) {
  const events =
    job.statusEvents.length > 0
      ? job.statusEvents
      : [
          {
            id: "current-status",
            fromStatus: null,
            toStatus: job.status,
            changedAt: job.createdAt,
          },
        ];

  return (
    <div className="border-2 border-border-custom bg-[#FCE7F3] dark:bg-[#3b202f] p-4 shadow-[2px_2px_0px_0px_var(--shadow-color)]">
      <h4 className="mb-3 font-mono text-xs font-black uppercase tracking-wider text-black dark:text-white">
        // Status Timeline
      </h4>
      <div className="space-y-2">
        {events.map((event) => (
          <div
            key={event.id}
            className="border border-border-custom bg-card p-2.5 shadow-[1.5px_1.5px_0px_0px_var(--shadow-color)]"
          >
            <p className="font-mono text-xs font-black uppercase text-foreground">
              {event.fromStatus ? `${STATUS_LABELS[event.fromStatus]} -> ` : ""}
              {STATUS_LABELS[event.toStatus]}
            </p>
            <p className="mt-1 font-mono text-[9px] font-bold uppercase text-foreground/55">
              {formatFriendlyDateTime(event.changedAt)}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
