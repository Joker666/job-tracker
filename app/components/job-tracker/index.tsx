"use client";

import {
  DndContext,
  KeyboardSensor,
  PointerSensor,
  type DragEndEvent,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import { useRouter } from "next/navigation";
import {
  useEffect,
  useMemo,
  useState,
  useTransition,
  useOptimistic,
} from "react";
import { updateJobApplicationStatus } from "@/app/actions";
import { APPLICATION_STATUSES } from "@/lib/status";
import { ACCESS_STORAGE_KEY } from "./constants";
import { AccessModal, AccessCheckingOverlay } from "./access-modal";
import { JobModal } from "./job-modal";
import { JobDetailModal } from "./job-detail-modal";
import { KanbanColumn } from "./kanban-column";
import { JobApplicationView, FormMode, TrackerProps } from "./types";

export type { JobApplicationView };

export function JobTracker({ jobs }: TrackerProps) {
  const router = useRouter();
  const [modal, setModal] = useState<FormMode | null>(null);
  const [detailJob, setDetailJob] = useState<JobApplicationView | null>(null);
  const [accessGranted, setAccessGranted] = useState(false);
  const [accessChecked, setAccessChecked] = useState(false);
  const [nowMs, setNowMs] = useState<number | null>(null);
  const [statusError, setStatusError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const [optimisticJobs, setOptimisticJobs] = useOptimistic(
    jobs,
    (state, update: { jobId: string; nextStatus: typeof APPLICATION_STATUSES[number] }) =>
      state.map((job) =>
        job.id === update.jobId ? { ...job, status: update.nextStatus } : job
      )
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
    setAccessGranted(localStorage.getItem(ACCESS_STORAGE_KEY) === "true");
    setAccessChecked(true);
  }, []);

  const jobsByStatus = useMemo(() => {
    return APPLICATION_STATUSES.map((status) => ({
      status,
      jobs: optimisticJobs.filter((job) => job.status === status),
    }));
  }, [optimisticJobs]);

  function handleDragEnd(event: DragEndEvent) {
    const jobId = String(event.active.id);
    const nextStatus = event.over?.id as typeof APPLICATION_STATUSES[number] | undefined;

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
        return;
      }
      router.refresh();
    });
  }

  return (
    <main className="min-h-screen bg-[#f4f3ef] px-4 py-10 text-black sm:px-6 lg:px-8 font-sans">
      {!accessChecked ? <AccessCheckingOverlay /> : null}
      {accessChecked && !accessGranted ? (
        <AccessModal onGranted={() => setAccessGranted(true)} />
      ) : null}
      <div
        className={`mx-auto max-w-7xl ${
          accessGranted ? "" : "pointer-events-none select-none blur-sm"
        }`}
        aria-hidden={!accessGranted}
      >
        <header className="mb-12 flex flex-col gap-6 md:flex-row md:items-end md:justify-between border-b-4 border-black pb-8">
          <div>
            <div className="inline-block border-4 border-black bg-[#FFDE4D] px-6 py-2 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] -rotate-1 transform">
              <h1 className="text-3xl font-black uppercase tracking-wider md:text-4xl text-black">
                Job Tracker
              </h1>
            </div>
            <p className="mt-6 font-mono text-xs font-bold uppercase tracking-wider text-black/70">
              // MONITOR PIPELINES, SUBMITTED RESUMES, AND OFFERS
            </p>
          </div>
          <button
            type="button"
            onClick={() => setModal({ type: "create" })}
            className="inline-flex h-12 items-center justify-center border-3 border-black bg-[#4ADE80] px-6 text-sm font-black uppercase tracking-wider text-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:-translate-x-0.5 hover:-translate-y-0.5 hover:shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] active:translate-x-0 active:translate-y-0 active:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] transition-all cursor-pointer"
          >
            + Create Application
          </button>
        </header>

        {statusError ? (
          <div className="mb-6 border-3 border-black bg-[#FB7185] p-4 font-mono text-sm font-bold text-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
            <span className="uppercase">[ERROR]</span> {statusError}
          </div>
        ) : null}

        <div className="-mx-4 overflow-x-auto px-4 pb-4 sm:-mx-6 sm:px-6 lg:-mx-8 lg:px-8">
          <DndContext
            id="job-tracker-kanban"
            sensors={sensors}
            onDragEnd={handleDragEnd}
          >
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
                  onEdit={(selectedJob) =>
                    setModal({ type: "edit", job: selectedJob })
                  }
                  onViewDetails={(selectedJob) =>
                    setDetailJob(selectedJob)
                  }
                  nowMs={nowMs}
                />
              ))}
            </section>
          </DndContext>
        </div>
      </div>

      {modal ? <JobModal mode={modal} onClose={() => setModal(null)} /> : null}

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
    </main>
  );
}
