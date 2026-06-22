"use client";

import { DndContext, type DragEndEvent, KeyboardSensor, PointerSensor, useSensor, useSensors } from "@dnd-kit/core";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useOptimistic, useState, useTransition } from "react";
import { updateJobApplicationStatus } from "@/app/actions";
import { APPLICATION_STATUSES } from "@/lib/status";
import { AccessCheckingOverlay, AccessModal } from "./access-modal";
import { ACCESS_STORAGE_KEY, VIEW_MODE_STORAGE_KEY } from "./constants";
import { JobDetailModal } from "./job-detail-modal";
import { JobListView } from "./job-list";
import { JobModal } from "./job-modal";
import { KanbanColumn } from "./kanban-column";
import type { FormMode, JobApplicationView, TrackerProps } from "./types";

export type { JobApplicationView };

export function JobTracker({ jobs, initialAccessGranted }: TrackerProps) {
  const router = useRouter();
  const [modal, setModal] = useState<FormMode | null>(null);
  const [detailJob, setDetailJob] = useState<JobApplicationView | null>(null);
  const [accessGranted, setAccessGranted] = useState(initialAccessGranted);
  const [accessChecked, setAccessChecked] = useState(initialAccessGranted);
  const [nowMs, setNowMs] = useState<number | null>(null);
  const [statusError, setStatusError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const [viewMode, setViewMode] = useState<"kanban" | "list">("kanban");
  const [toast, setToast] = useState<{
    message: string;
    type: "success" | "error" | "info";
  } | null>(null);

  const handleViewChange = (mode: "kanban" | "list") => {
    setViewMode(mode);
    localStorage.setItem(VIEW_MODE_STORAGE_KEY, mode);
  };

  const [optimisticJobs, setOptimisticJobs] = useOptimistic(
    jobs,
    (state, update: { jobId: string; nextStatus: (typeof APPLICATION_STATUSES)[number] }) =>
      state.map((job) => (job.id === update.jobId ? { ...job, status: update.nextStatus } : job)),
  );

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(KeyboardSensor),
  );

  useEffect(() => {
    setNowMs(Date.now());
  }, []);

  useEffect(() => {
    const localAccess = localStorage.getItem(ACCESS_STORAGE_KEY) === "true";
    if (localAccess && !initialAccessGranted) {
      localStorage.removeItem(ACCESS_STORAGE_KEY);
      setAccessGranted(false);
      setAccessChecked(true);
    } else {
      setAccessGranted(initialAccessGranted);
      setAccessChecked(true);
    }

    const savedViewMode = localStorage.getItem(VIEW_MODE_STORAGE_KEY);
    if (savedViewMode === "kanban" || savedViewMode === "list") {
      setViewMode(savedViewMode);
    }
  }, [initialAccessGranted]);

  // biome-ignore lint/correctness/useExhaustiveDependencies: run when modal or detail closes to consume toast
  useEffect(() => {
    const pendingToast = sessionStorage.getItem("pending_toast");
    if (pendingToast) {
      setToast({ message: pendingToast, type: "success" });
      sessionStorage.removeItem("pending_toast");
    }
  }, [modal, detailJob]);

  useEffect(() => {
    if (toast) {
      const timer = setTimeout(() => {
        setToast(null);
      }, 4000);
      return () => clearTimeout(timer);
    }
  }, [toast]);

  const jobsByStatus = useMemo(() => {
    return APPLICATION_STATUSES.map((status) => ({
      status,
      jobs: optimisticJobs.filter((job) => job.status === status),
    }));
  }, [optimisticJobs]);

  function handleDragEnd(event: DragEndEvent) {
    const jobId = String(event.active.id);
    const nextStatus = event.over?.id as (typeof APPLICATION_STATUSES)[number] | undefined;

    if (!nextStatus || !APPLICATION_STATUSES.includes(nextStatus)) {
      return;
    }

    const job = jobs.find((candidate) => candidate.id === jobId);

    if (!job || job.status === nextStatus) {
      return;
    }

    setStatusError(null);

    startTransition(async () => {
      setOptimisticJobs({ jobId, nextStatus });
      const result = await updateJobApplicationStatus(jobId, nextStatus);
      if (!result.ok) {
        setStatusError(result.error ?? "Status update failed.");
        setToast({ message: result.error ?? "Status update failed.", type: "error" });
        return;
      }
      setToast({
        message: `Moved "${job.companyName}" to ${nextStatus.toLowerCase()}`,
        type: "success",
      });
      router.refresh();
    });
  }

  return (
    <main className="min-h-screen bg-background px-4 py-10 text-foreground sm:px-6 lg:px-8 font-sans">
      {!accessChecked ? <AccessCheckingOverlay /> : null}
      {accessChecked && !accessGranted ? (
        <AccessModal
          onGranted={() => {
            setAccessGranted(true);
            router.refresh();
          }}
        />
      ) : null}
      <div
        className={`mx-auto max-w-7xl ${accessGranted ? "" : "pointer-events-none select-none blur-sm"}`}
        aria-hidden={!accessGranted}
      >
        <header className="mb-12 flex flex-col gap-6 md:flex-row md:items-end md:justify-between border-b-4 border-border-custom pb-8">
          <div>
            <div className="inline-block border-4 border-border-custom bg-[#FFDE4D] px-6 py-2 shadow-[4px_4px_0px_0px_var(--shadow-color)] -rotate-1 transform">
              <h1 className="text-3xl font-black uppercase tracking-wider md:text-4xl text-black">Job Tracker</h1>
            </div>
            <p className="mt-6 font-mono text-xs font-bold uppercase tracking-wider text-foreground/70">
              // MONITOR PIPELINES, SUBMITTED RESUMES, AND OFFERS
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-4">
            <div className="hidden sm:flex gap-2">
              <button
                type="button"
                onClick={() => handleViewChange("kanban")}
                className={`h-12 border-3 border-border-custom px-4 font-mono text-xs font-black uppercase tracking-wider shadow-[3px_3px_0px_0px_var(--shadow-color)] hover:-translate-x-0.5 hover:-translate-y-0.5 hover:shadow-[5px_5px_0px_0px_var(--shadow-color)] active:translate-x-0 active:translate-y-0 active:shadow-[1px_1px_0px_0px_var(--shadow-color)] transition-all cursor-pointer ${
                  viewMode === "kanban" ? "bg-[#FFDE4D] text-black" : "bg-card text-foreground"
                }`}
              >
                Kanban
              </button>
              <button
                type="button"
                onClick={() => handleViewChange("list")}
                className={`h-12 border-3 border-border-custom px-4 font-mono text-xs font-black uppercase tracking-wider shadow-[3px_3px_0px_0px_var(--shadow-color)] hover:-translate-x-0.5 hover:-translate-y-0.5 hover:shadow-[5px_5px_0px_0px_var(--shadow-color)] active:translate-x-0 active:translate-y-0 active:shadow-[1px_1px_0px_0px_var(--shadow-color)] transition-all cursor-pointer ${
                  viewMode === "list" ? "bg-[#FFDE4D] text-black" : "bg-card text-foreground"
                }`}
              >
                List View
              </button>
            </div>
            <button
              type="button"
              onClick={() => setModal({ type: "create" })}
              className="inline-flex h-12 items-center justify-center border-3 border-border-custom bg-[#4ADE80] px-6 text-sm font-black uppercase tracking-wider text-black shadow-[4px_4px_0px_0px_var(--shadow-color)] hover:-translate-x-0.5 hover:-translate-y-0.5 hover:shadow-[6px_6px_0px_0px_var(--shadow-color)] active:translate-x-0 active:translate-y-0 active:shadow-[2px_2px_0px_0px_var(--shadow-color)] transition-all cursor-pointer"
            >
              + Create Application
            </button>
          </div>
        </header>

        {statusError ? (
          <div className="mb-6 border-3 border-border-custom bg-[#FB7185] p-4 font-mono text-sm font-bold text-black shadow-[4px_4px_0px_0px_var(--shadow-color)]">
            <span className="uppercase">[ERROR]</span> {statusError}
          </div>
        ) : null}

        {/* Kanban View - Desktop/Tablet only */}
        {viewMode === "kanban" && (
          <div className="hidden sm:block -mx-4 overflow-x-auto px-4 pb-4 sm:-mx-6 sm:px-6 lg:-mx-8 lg:px-8">
            <DndContext id="job-tracker-kanban" sensors={sensors} onDragEnd={handleDragEnd}>
              <section
                className={`grid gap-6 sm:grid-cols-2 lg:min-w-[1496px] lg:grid-cols-5 ${
                  isPending ? "opacity-80" : ""
                }`}
              >
                {jobsByStatus.map(({ status, jobs: statusJobs }) => (
                  <KanbanColumn
                    key={status}
                    status={status}
                    jobs={statusJobs}
                    onViewDetails={(selectedJob) => setDetailJob(selectedJob)}
                    nowMs={nowMs}
                  />
                ))}
              </section>
            </DndContext>
          </div>
        )}

        {/* List View - Mobile default, and desktop when selected */}
        <div className={viewMode === "list" ? "block" : "block sm:hidden"}>
          <JobListView jobs={optimisticJobs} onViewDetails={(selectedJob) => setDetailJob(selectedJob)} nowMs={nowMs} />
        </div>
      </div>

      {modal ? (
        <JobModal
          mode={modal}
          onClose={() => {
            setModal(null);
            router.refresh();
          }}
        />
      ) : null}

      {detailJob ? (
        <JobDetailModal
          job={detailJob}
          onClose={() => setDetailJob(null)}
          onEdit={() => {
            setModal({ type: "edit", job: detailJob });
            setDetailJob(null);
          }}
          nowMs={nowMs}
        />
      ) : null}

      {toast ? (
        <div
          className={`fixed bottom-6 right-6 z-50 flex items-center gap-3 border-4 border-border-custom px-4 py-3 font-mono text-xs font-black uppercase tracking-wider text-black shadow-[4px_4px_0px_0px_var(--shadow-color)] animate-slide-in ${
            toast.type === "error" ? "bg-[#FB7185]" : toast.type === "info" ? "bg-[#38BDF8]" : "bg-[#4ADE80]"
          }`}
        >
          <span>{toast.message}</span>
          <button
            type="button"
            onClick={() => setToast(null)}
            className="ml-2 font-black hover:opacity-75 transition-opacity"
            aria-label="Close notification"
          >
            ✕
          </button>
        </div>
      ) : null}
    </main>
  );
}
