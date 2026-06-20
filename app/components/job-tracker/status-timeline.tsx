"use client";

import { STATUS_LABELS } from "@/lib/status";
import type { JobApplicationView } from "./types";

const friendlyDateTimeFormatter = new Intl.DateTimeFormat(undefined, {
  dateStyle: "medium",
  timeStyle: "short",
});

function formatStatusChangedAt(value: string) {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "Unknown time";
  }

  return friendlyDateTimeFormatter.format(date);
}

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
    <div className="border-2 border-black bg-[#FCE7F3] p-4 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
      <h4 className="mb-3 font-mono text-xs font-black uppercase tracking-wider text-black">
        // Status Timeline
      </h4>
      <div className="space-y-2">
        {events.map((event) => (
          <div
            key={event.id}
            className="border border-black bg-white p-2.5 shadow-[1.5px_1.5px_0px_0px_rgba(0,0,0,1)]"
          >
            <p className="font-mono text-xs font-black uppercase text-black">
              {event.fromStatus ? `${STATUS_LABELS[event.fromStatus]} -> ` : ""}
              {STATUS_LABELS[event.toStatus]}
            </p>
            <p className="mt-1 font-mono text-[9px] font-bold uppercase text-black/55">
              {formatStatusChangedAt(event.changedAt)}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
