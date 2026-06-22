"use client";

import { useMemo } from "react";
import type { JobApplicationView } from "./types";
import { STATUS_LABELS } from "@/lib/status";

// Timezone is locked to America/Toronto to match date-format.ts
const dateFormatter = new Intl.DateTimeFormat("en-US", {
  weekday: "long",
  year: "numeric",
  month: "long",
  day: "numeric",
  timeZone: "America/Toronto",
});

const timeFormatter = new Intl.DateTimeFormat("en-US", {
  timeStyle: "short",
  timeZone: "America/Toronto",
});

function getDayString(date: Date) {
  return dateFormatter.format(date);
}

function formatTime(date: Date) {
  return timeFormatter.format(date);
}

interface TimelineEvent {
  id: string;
  date: Date;
  type: "SAVED" | "APPLIED" | "INTERVIEWING" | "OFFER" | "REJECTED" | "INTERVIEW_SCHEDULED";
  title: string;
  companyName: string;
  job: JobApplicationView;
  details?: string;
}

const EVENT_CONFIG: Record<
  TimelineEvent["type"],
  { emoji: string; bg: string; border: string }
> = {
  SAVED: { emoji: "💾", bg: "bg-[#FFDE4D]", border: "border-[#D6B51E]" },
  APPLIED: { emoji: "✉️", bg: "bg-[#38BDF8]", border: "border-[#0284C7]" },
  INTERVIEWING: { emoji: "👥", bg: "bg-[#C084FC]", border: "border-[#9333EA]" },
  OFFER: { emoji: "🎉", bg: "bg-[#4ADE80]", border: "border-[#16A34A]" },
  REJECTED: { emoji: "❌", bg: "bg-[#FB7185]", border: "border-[#E11D48]" },
  INTERVIEW_SCHEDULED: { emoji: "📅", bg: "bg-[#F472B6]", border: "border-[#DB2777]" },
};

export function TimelineView({
  jobs,
  onViewDetails,
  nowMs,
}: {
  jobs: JobApplicationView[];
  onViewDetails: (job: JobApplicationView) => void;
  nowMs: number | null;
}) {
  const groupedEvents = useMemo(() => {
    const allEvents: TimelineEvent[] = [];

    for (const job of jobs) {
      // 1. Process Status Events
      const eventsToUse =
        job.statusEvents.length > 0
          ? job.statusEvents
          : [
              {
                id: `fallback-${job.id}`,
                fromStatus: null,
                toStatus: job.status,
                changedAt: job.createdAt,
              },
            ];

      for (const event of eventsToUse) {
        const eventDate = new Date(event.changedAt);
        let title = "";

        if (event.fromStatus === null) {
          if (event.toStatus === "SAVED") {
            title = "Saved job application";
          } else {
            title = `Saved & marked as ${STATUS_LABELS[event.toStatus]}`;
          }
        } else {
          if (event.toStatus === "SAVED") {
            title = "Moved application back to Saved";
          } else if (event.toStatus === "APPLIED") {
            title = "Applied to job";
          } else if (event.toStatus === "INTERVIEWING") {
            title = "Started interviewing";
          } else if (event.toStatus === "OFFER") {
            title = "Received job offer! 🎉";
          } else if (event.toStatus === "REJECTED") {
            title = "Application marked as Rejected";
          }
        }

        allEvents.push({
          id: `status-${event.id}`,
          date: eventDate,
          type: event.toStatus,
          title,
          companyName: job.companyName,
          job,
          details: job.title,
        });
      }

      // 2. Process Interviews
      for (const interview of job.interviews) {
        const interviewDate = new Date(interview.interviewDate);
        const isFuture = nowMs !== null ? interviewDate.getTime() > nowMs : false;

        allEvents.push({
          id: `interview-${interview.id}`,
          date: interviewDate,
          type: "INTERVIEW_SCHEDULED",
          title: isFuture ? "Upcoming interview scheduled" : "Had interview",
          companyName: job.companyName,
          job,
          details: `${interview.interviewType} Interview for ${job.title}`,
        });
      }
    }

    // Group by Day
    const groups: Record<string, TimelineEvent[]> = {};
    for (const event of allEvents) {
      const dayKey = getDayString(event.date);
      if (!groups[dayKey]) {
        groups[dayKey] = [];
      }
      groups[dayKey].push(event);
    }

    // Sort days descending
    const sortedDays = Object.keys(groups).sort((a, b) => {
      // Compare by date of the first item in each group
      const dateA = groups[a][0].date.getTime();
      const dateB = groups[b][0].date.getTime();
      return dateB - dateA;
    });

    // Sort events within each day descending by time
    const sortedGroupedEvents = sortedDays.map((day) => {
      const sortedDayEvents = [...groups[day]].sort((a, b) => b.date.getTime() - a.date.getTime());
      return {
        day,
        events: sortedDayEvents,
      };
    });

    return sortedGroupedEvents;
  }, [jobs, nowMs]);

  if (groupedEvents.length === 0) {
    return (
      <div className="border-3 border-border-custom bg-card p-12 text-center shadow-[4px_4px_0px_0px_var(--shadow-color)]">
        <p className="font-mono text-base font-bold text-foreground/70">
          // NO ACTIVITY RECORDED YET. GET STARTED BY CREATING A JOB APPLICATION!
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-12 pb-12">
      {groupedEvents.map(({ day, events }) => (
        <section key={day} className="space-y-6">
          <div className="inline-block border-3 border-border-custom bg-[#FCE7F3] dark:bg-[#3b202f] px-4 py-1.5 shadow-[3px_3px_0px_0px_var(--shadow-color)] -rotate-0.5 transform">
            <h2 className="font-mono text-sm font-black uppercase tracking-wider text-black dark:text-white">
              {day}
            </h2>
          </div>

          <div className="relative border-l-4 border-border-custom ml-5 pl-8 space-y-6">
            {events.map((event) => {
              const config = EVENT_CONFIG[event.type];
              return (
                <div key={event.id} className="relative">
                  {/* Timeline Bullet */}
                  <div
                    className={`absolute -left-[46px] top-1 flex h-8 w-8 items-center justify-center rounded-full border-3 border-border-custom ${config.bg} text-sm shadow-[2px_2px_0px_0px_var(--shadow-color)] z-10`}
                    title={event.type}
                  >
                    <span>{config.emoji}</span>
                  </div>

                  {/* Card Container */}
                  {/* biome-ignore lint/a11y/useKeyWithClickEvents: Click handler opens details modal for job application */}
                  <div
                    onClick={() => onViewDetails(event.job)}
                    className="border-3 border-border-custom bg-card p-4 shadow-[3px_3px_0px_0px_var(--shadow-color)] hover:-translate-x-0.5 hover:-translate-y-0.5 hover:shadow-[5px_5px_0px_0px_var(--shadow-color)] transition-all cursor-pointer"
                  >
                    <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                      <div className="space-y-1">
                        <span className="inline-block border border-border-custom bg-label font-mono text-[9px] font-black uppercase px-1.5 py-0.5 shadow-[1px_1px_0px_0px_var(--shadow-color)] mr-2">
                          {formatTime(event.date)}
                        </span>
                        <h3 className="inline-flex font-mono text-sm font-black uppercase tracking-tight text-foreground">
                          {event.title}
                        </h3>
                        <p className="font-mono text-xs font-semibold text-foreground/75 mt-1">
                          {event.details} · <span className="font-bold">{event.companyName}</span>
                        </p>
                      </div>

                      {/* Current Job Status Badge */}
                      <div className="self-start sm:self-center">
                        <span className="border-2 border-border-custom bg-[#F3F4F6] dark:bg-[#1F2937] px-2 py-0.5 font-mono text-[9px] font-black uppercase tracking-wider text-foreground shadow-[1.5px_1.5px_0px_0px_var(--shadow-color)]">
                          Current: {STATUS_LABELS[event.job.status]}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      ))}
    </div>
  );
}
