"use client";

import {
  DndContext,
  type DragEndEvent,
  useDraggable,
  useDroppable,
} from "@dnd-kit/core";
import { useRouter } from "next/navigation";
import {
  useActionState,
  useEffect,
  useMemo,
  useState,
  useTransition,
} from "react";
import {
  createJobApplication,
  deleteJobApplication,
  updateJobApplicationStatus,
  updateJobApplication,
} from "@/app/actions";
import {
  APPLICATION_STATUSES,
  STATUS_LABELS,
  type ApplicationStatus,
} from "@/lib/status";

type ActionState = {
  ok: boolean;
  error?: string;
};

export type JobApplicationView = {
  id: string;
  title: string;
  companyName: string;
  description: string;
  location: string;
  salaryRange: string;
  note: string;
  status: ApplicationStatus;
  resumeUrl: string | null;
  resumeName: string | null;
  resumeUploadedAt: string | null;
  createdAt: string;
  updatedAt: string;
};

type TrackerProps = {
  jobs: JobApplicationView[];
};

type FormMode =
  | { type: "create"; job?: never }
  | { type: "edit"; job: JobApplicationView };

const initialActionState: ActionState = { ok: false };

function JobForm({
  mode,
  onDone,
}: {
  mode: FormMode;
  onDone: () => void;
}) {
  const isEdit = mode.type === "edit";
  const job = mode.type === "edit" ? mode.job : null;
  const action =
    mode.type === "edit"
      ? updateJobApplication.bind(null, mode.job.id)
      : createJobApplication;
  const [state, formAction, pending] = useActionState(
    action,
    initialActionState,
  );

  useEffect(() => {
    if (state.ok) {
      onDone();
    }
  }, [onDone, state.ok]);

  return (
    <form action={formAction} className="space-y-5">
      {state.error ? (
        <div className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
          {state.error}
        </div>
      ) : null}

      <div className="grid gap-4 sm:grid-cols-2">
        <label className="space-y-1.5 text-sm font-medium text-zinc-700">
          <span>Title</span>
          <input
            className="h-10 w-full rounded-md border border-zinc-200 bg-white px-3 text-sm outline-none transition focus:border-zinc-500"
            name="title"
            required
            defaultValue={job?.title ?? ""}
          />
        </label>

        <label className="space-y-1.5 text-sm font-medium text-zinc-700">
          <span>Company name</span>
          <input
            className="h-10 w-full rounded-md border border-zinc-200 bg-white px-3 text-sm outline-none transition focus:border-zinc-500"
            name="companyName"
            required
            defaultValue={job?.companyName ?? ""}
          />
        </label>

        <label className="space-y-1.5 text-sm font-medium text-zinc-700">
          <span>Location</span>
          <input
            className="h-10 w-full rounded-md border border-zinc-200 bg-white px-3 text-sm outline-none transition focus:border-zinc-500"
            name="location"
            defaultValue={job?.location ?? ""}
          />
        </label>

        <label className="space-y-1.5 text-sm font-medium text-zinc-700">
          <span>Salary range</span>
          <input
            className="h-10 w-full rounded-md border border-zinc-200 bg-white px-3 text-sm outline-none transition focus:border-zinc-500"
            name="salaryRange"
            defaultValue={job?.salaryRange ?? ""}
          />
        </label>

        <label className="space-y-1.5 text-sm font-medium text-zinc-700">
          <span>Status</span>
          <select
            className="h-10 w-full rounded-md border border-zinc-200 bg-white px-3 text-sm outline-none transition focus:border-zinc-500"
            name="status"
            required
            defaultValue={job?.status ?? "SAVED"}
          >
            {APPLICATION_STATUSES.map((status) => (
              <option key={status} value={status}>
                {STATUS_LABELS[status]}
              </option>
            ))}
          </select>
        </label>

        <label className="space-y-1.5 text-sm font-medium text-zinc-700">
          <span>Resume PDF</span>
          <input
            accept="application/pdf,.pdf"
            className="block h-10 w-full rounded-md border border-zinc-200 bg-white px-3 py-2 text-sm file:mr-3 file:rounded-md file:border-0 file:bg-zinc-900 file:px-3 file:py-1 file:text-xs file:font-medium file:text-white"
            name="resume"
            type="file"
          />
        </label>
      </div>

      <label className="block space-y-1.5 text-sm font-medium text-zinc-700">
        <span>Description</span>
        <textarea
          className="min-h-24 w-full rounded-md border border-zinc-200 bg-white px-3 py-2 text-sm outline-none transition focus:border-zinc-500"
          name="description"
          defaultValue={job?.description ?? ""}
        />
      </label>

      <label className="block space-y-1.5 text-sm font-medium text-zinc-700">
        <span>Note</span>
        <textarea
          className="min-h-20 w-full rounded-md border border-zinc-200 bg-white px-3 py-2 text-sm outline-none transition focus:border-zinc-500"
          name="note"
          defaultValue={job?.note ?? ""}
        />
      </label>

      {job?.resumeUrl ? (
        <a
          className="inline-flex text-sm font-medium text-zinc-900 underline decoration-zinc-300 underline-offset-4 hover:decoration-zinc-900"
          href={job.resumeUrl}
          target="_blank"
          rel="noreferrer"
        >
          Current resume: {job.resumeName ?? "PDF"}
        </a>
      ) : null}

      <div className="flex justify-end gap-2 border-t border-zinc-100 pt-5">
        <button
          type="button"
          onClick={onDone}
          className="h-10 rounded-md border border-zinc-200 px-4 text-sm font-medium text-zinc-700 transition hover:bg-zinc-50"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={pending}
          className="h-10 rounded-md bg-zinc-950 px-4 text-sm font-medium text-white transition hover:bg-zinc-800 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {pending ? "Saving..." : isEdit ? "Save changes" : "Create job"}
        </button>
      </div>
    </form>
  );
}

function JobModal({
  mode,
  onClose,
}: {
  mode: FormMode;
  onClose: () => void;
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-zinc-950/30 px-4 py-8 backdrop-blur-sm">
      <div className="w-full max-w-3xl rounded-lg bg-white p-6 shadow-xl">
        <div className="mb-5 flex items-center justify-between gap-4">
          <h2 className="text-xl font-semibold text-zinc-950">
            {mode.type === "edit" ? "Edit job application" : "New job application"}
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="h-9 rounded-md border border-zinc-200 px-3 text-sm font-medium text-zinc-600 transition hover:bg-zinc-50"
          >
            Close
          </button>
        </div>
        <JobForm mode={mode} onDone={onClose} />
      </div>
    </div>
  );
}

function JobCard({
  job,
  onEdit,
}: {
  job: JobApplicationView;
  onEdit: (job: JobApplicationView) => void;
}) {
  const notePreview = job.note || job.description;
  const {
    attributes,
    listeners,
    setActivatorNodeRef,
    setNodeRef,
    transform,
    isDragging,
  } = useDraggable({
    id: job.id,
    data: {
      status: job.status,
    },
  });
  const style = {
    transform: transform
      ? `translate3d(${transform.x}px, ${transform.y}px, 0)`
      : undefined,
    opacity: isDragging ? 0.55 : 1,
  };

  return (
    <article
      ref={setNodeRef}
      style={style}
      className="rounded-lg border border-zinc-200 bg-white p-4 shadow-sm"
    >
      <div className="flex items-start justify-between gap-3">
        <div>
          <h3 className="text-base font-semibold text-zinc-950">{job.title}</h3>
          <p className="text-sm text-zinc-600">{job.companyName}</p>
        </div>
        <div className="flex shrink-0 items-center gap-2">
          <span className="rounded-md bg-zinc-100 px-2 py-1 text-xs font-medium text-zinc-700">
            {STATUS_LABELS[job.status]}
          </span>
          <button
            ref={setActivatorNodeRef}
            type="button"
            className="cursor-grab rounded-md border border-zinc-200 px-2 py-1 text-xs font-medium text-zinc-500 active:cursor-grabbing"
            aria-label={`Drag ${job.title}`}
            {...listeners}
            {...attributes}
          >
            Drag
          </button>
        </div>
      </div>

      <dl className="mt-4 space-y-1.5 text-sm text-zinc-600">
        {job.location ? (
          <div className="flex gap-2">
            <dt className="font-medium text-zinc-800">Location</dt>
            <dd>{job.location}</dd>
          </div>
        ) : null}
        {job.salaryRange ? (
          <div className="flex gap-2">
            <dt className="font-medium text-zinc-800">Salary</dt>
            <dd>{job.salaryRange}</dd>
          </div>
        ) : null}
      </dl>

      {notePreview ? (
        <p className="mt-3 line-clamp-3 text-sm leading-6 text-zinc-600">
          {notePreview}
        </p>
      ) : null}

      <div className="mt-4 flex flex-wrap items-center gap-2">
        {job.resumeUrl ? (
          <a
            className="rounded-md border border-zinc-200 px-3 py-1.5 text-xs font-medium text-zinc-700 transition hover:bg-zinc-50"
            href={job.resumeUrl}
            target="_blank"
            rel="noreferrer"
          >
            Resume PDF
          </a>
        ) : null}
        <button
          type="button"
          onClick={() => onEdit(job)}
          className="rounded-md border border-zinc-200 px-3 py-1.5 text-xs font-medium text-zinc-700 transition hover:bg-zinc-50"
        >
          Edit
        </button>
        <form action={deleteJobApplication.bind(null, job.id)}>
          <button
            type="submit"
            className="rounded-md border border-red-200 px-3 py-1.5 text-xs font-medium text-red-700 transition hover:bg-red-50"
          >
            Delete
          </button>
        </form>
      </div>
    </article>
  );
}

function KanbanColumn({
  status,
  jobs,
  onEdit,
}: {
  status: ApplicationStatus;
  jobs: JobApplicationView[];
  onEdit: (job: JobApplicationView) => void;
}) {
  const { isOver, setNodeRef } = useDroppable({
    id: status,
  });

  return (
    <div
      ref={setNodeRef}
      className={`min-h-48 rounded-lg border p-3 transition ${
        isOver
          ? "border-zinc-400 bg-zinc-200/80"
          : "border-zinc-200 bg-zinc-100/60"
      }`}
    >
      <div className="mb-3 flex items-center justify-between">
        <h2 className="text-sm font-semibold text-zinc-900">
          {STATUS_LABELS[status]}
        </h2>
        <span className="rounded-full bg-white px-2 py-0.5 text-xs font-medium text-zinc-500">
          {jobs.length}
        </span>
      </div>
      <div className="space-y-3">
        {jobs.length > 0 ? (
          jobs.map((job) => (
            <JobCard key={job.id} job={job} onEdit={onEdit} />
          ))
        ) : (
          <div className="rounded-lg border border-dashed border-zinc-300 bg-white/60 p-4 text-center text-sm text-zinc-500">
            Drop jobs here
          </div>
        )}
      </div>
    </div>
  );
}

export function JobTracker({ jobs }: TrackerProps) {
  const router = useRouter();
  const [modal, setModal] = useState<FormMode | null>(null);
  const [localJobs, setLocalJobs] = useState(jobs);
  const [statusError, setStatusError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    setLocalJobs(jobs);
  }, [jobs]);

  const jobsByStatus = useMemo(() => {
    return APPLICATION_STATUSES.map((status) => ({
      status,
      jobs: localJobs.filter((job) => job.status === status),
    }));
  }, [localJobs]);

  function handleDragEnd(event: DragEndEvent) {
    const jobId = String(event.active.id);
    const nextStatus = event.over?.id as ApplicationStatus | undefined;

    if (!nextStatus || !APPLICATION_STATUSES.includes(nextStatus)) {
      return;
    }

    const job = localJobs.find((candidate) => candidate.id === jobId);

    if (!job || job.status === nextStatus) {
      return;
    }

    const previousJobs = localJobs;
    setStatusError(null);
    setLocalJobs((currentJobs) =>
      currentJobs.map((candidate) =>
        candidate.id === jobId
          ? { ...candidate, status: nextStatus }
          : candidate,
      ),
    );

    startTransition(() => {
      void updateJobApplicationStatus(jobId, nextStatus).then((result) => {
        if (!result.ok) {
          setLocalJobs(previousJobs);
          setStatusError(result.error ?? "Status update failed.");
          return;
        }

        router.refresh();
      });
    });
  }

  return (
    <main className="min-h-screen bg-zinc-50 px-4 py-8 text-zinc-950 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <header className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h1 className="text-3xl font-semibold tracking-tight">
              Job tracker
            </h1>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-zinc-600">
              Track each application, the exact submitted resume, and where it
              stands in your pipeline.
            </p>
          </div>
          <button
            type="button"
            onClick={() => setModal({ type: "create" })}
            className="h-10 rounded-md bg-zinc-950 px-4 text-sm font-medium text-white transition hover:bg-zinc-800"
          >
            Create job application
          </button>
        </header>

        {statusError ? (
          <div className="mb-4 rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
            {statusError}
          </div>
        ) : null}

        <DndContext onDragEnd={handleDragEnd}>
          <section
            className={`grid gap-4 lg:grid-cols-5 ${isPending ? "opacity-90" : ""}`}
          >
            {jobsByStatus.map(({ status, jobs: statusJobs }) => (
              <KanbanColumn
                key={status}
                status={status}
                jobs={statusJobs}
                onEdit={(selectedJob) =>
                  setModal({ type: "edit", job: selectedJob })
                }
              />
            ))}
          </section>
        </DndContext>
      </div>

      {modal ? <JobModal mode={modal} onClose={() => setModal(null)} /> : null}
    </main>
  );
}
