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

type JobInterviewView = {
  id: string;
  interviewDate: string;
  interviewType: string;
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
  interviews: JobInterviewView[];
};

type TrackerProps = {
  jobs: JobApplicationView[];
};

type FormMode =
  | { type: "create"; job?: never }
  | { type: "edit"; job: JobApplicationView };

const initialActionState: ActionState = { ok: false };
const INTERVIEW_TYPE_OPTIONS = [
  "Recruiter screen",
  "Behavioral",
  "Technical",
  "System design",
  "Take-home",
  "Hiring manager",
  "Final",
];

function createInterviewRow(interview?: JobInterviewView) {
  return {
    key: interview?.id ?? `new-${Date.now()}-${Math.random()}`,
    interviewDate: interview?.interviewDate ?? "",
    interviewType: interview?.interviewType ?? "",
  };
}

function toDateTimeLocal(value: string) {
  if (!value) {
    return "";
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "";
  }

  const offsetDate = new Date(date.getTime() - date.getTimezoneOffset() * 60000);

  return offsetDate.toISOString().slice(0, 16);
}

function formatInterviewDate(value: string) {
  return new Intl.DateTimeFormat("en", {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  }).format(new Date(value));
}

const STATUS_COLORS: Record<
  ApplicationStatus,
  { bg: string; accentBg: string }
> = {
  SAVED: { bg: "bg-[#FFDE4D]", accentBg: "bg-[#FFF9C4]" },
  APPLIED: { bg: "bg-[#38BDF8]", accentBg: "bg-[#E0F7FA]" },
  INTERVIEWING: { bg: "bg-[#C084FC]", accentBg: "bg-[#F3E5F5]" },
  OFFER: { bg: "bg-[#4ADE80]", accentBg: "bg-[#E8F5E9]" },
  REJECTED: { bg: "bg-[#FB7185]", accentBg: "bg-[#FFEBEE]" },
};

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
  const [interviewRows, setInterviewRows] = useState(() =>
    job?.interviews.length
      ? job.interviews.map(createInterviewRow)
      : [createInterviewRow()],
  );
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
    <form action={formAction} className="space-y-6">
      {state.error ? (
        <div className="border-2 border-black bg-[#FB7185] p-3 font-mono text-xs font-bold text-black shadow-[3px_3px_0px_0px_rgba(0,0,0,1)]">
          <span className="uppercase">[ERROR]</span> {state.error}
        </div>
      ) : null}

      <div className="grid gap-6 sm:grid-cols-2">
        <label className="flex flex-col gap-2 font-mono text-xs font-black uppercase tracking-wider text-black">
          <span>Title <span className="text-red-500">*</span></span>
          <input
            className="h-11 w-full border-2 border-black bg-white px-3 font-sans text-sm font-semibold text-black outline-none shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] focus:bg-yellow-50 focus:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] transition-all"
            name="title"
            required
            defaultValue={job?.title ?? ""}
            placeholder="e.g. Senior Frontend Engineer"
          />
        </label>

        <label className="flex flex-col gap-2 font-mono text-xs font-black uppercase tracking-wider text-black">
          <span>Company name <span className="text-red-500">*</span></span>
          <input
            className="h-11 w-full border-2 border-black bg-white px-3 font-sans text-sm font-semibold text-black outline-none shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] focus:bg-yellow-50 focus:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] transition-all"
            name="companyName"
            required
            defaultValue={job?.companyName ?? ""}
            placeholder="e.g. Acme Corp"
          />
        </label>

        <label className="flex flex-col gap-2 font-mono text-xs font-black uppercase tracking-wider text-black">
          <span>Location</span>
          <input
            className="h-11 w-full border-2 border-black bg-white px-3 font-sans text-sm font-semibold text-black outline-none shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] focus:bg-yellow-50 focus:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] transition-all"
            name="location"
            defaultValue={job?.location ?? ""}
            placeholder="e.g. New York, NY (Hybrid)"
          />
        </label>

        <label className="flex flex-col gap-2 font-mono text-xs font-black uppercase tracking-wider text-black">
          <span>Salary range</span>
          <input
            className="h-11 w-full border-2 border-black bg-white px-3 font-sans text-sm font-semibold text-black outline-none shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] focus:bg-yellow-50 focus:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] transition-all"
            name="salaryRange"
            defaultValue={job?.salaryRange ?? ""}
            placeholder="e.g. $120k - $140k"
          />
        </label>

        <label className="flex flex-col gap-2 font-mono text-xs font-black uppercase tracking-wider text-black">
          <span>Status <span className="text-red-500">*</span></span>
          <div className="relative">
            <select
              className="h-11 w-full border-2 border-black bg-white px-3 font-mono text-xs font-bold text-black outline-none shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] focus:bg-yellow-50 focus:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] transition-all appearance-none"
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
            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-black font-black border-l-2 border-black bg-[#FFDE4D]">
              ▼
            </div>
          </div>
        </label>

        <label className="flex flex-col gap-2 font-mono text-xs font-black uppercase tracking-wider text-black">
          <span>Resume PDF</span>
          <input
            accept="application/pdf,.pdf"
            className="block w-full border-2 border-black bg-white text-xs font-semibold text-black/60 outline-none shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] focus:bg-yellow-50 focus:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] transition-all file:mr-4 file:border-0 file:border-r-2 file:border-black file:bg-[#38BDF8] file:px-4 file:py-3 file:font-mono file:text-xs file:font-black file:uppercase file:text-black hover:file:bg-[#7dd3fc] cursor-pointer"
            name="resume"
            type="file"
          />
        </label>
      </div>

      <label className="flex flex-col gap-2 font-mono text-xs font-black uppercase tracking-wider text-black">
        <span>Description</span>
        <textarea
          className="min-h-24 w-full border-2 border-black bg-white px-3 py-2 font-sans text-sm font-semibold text-black outline-none shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] focus:bg-yellow-50 focus:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] transition-all"
          name="description"
          defaultValue={job?.description ?? ""}
          placeholder="Detailed job description..."
        />
      </label>

      <label className="flex flex-col gap-2 font-mono text-xs font-black uppercase tracking-wider text-black">
        <span>Notes / Activity Log</span>
        <textarea
          className="min-h-20 w-full border-2 border-black bg-white px-3 py-2 font-sans text-sm font-semibold text-black outline-none shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] focus:bg-yellow-50 focus:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] transition-all"
          name="note"
          defaultValue={job?.note ?? ""}
          placeholder="Keep updates here..."
        />
      </label>

      <section className="border-2 border-black bg-[#FFFDEB] p-4 shadow-[3px_3px_0px_0px_rgba(0,0,0,1)]">
        <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h3 className="font-mono text-sm font-black uppercase tracking-wider text-black">
              Interview Tracking
            </h3>
            <p className="mt-1 font-mono text-[10px] font-bold uppercase tracking-wider text-black/55">
              Add every scheduled round, not just the next one.
            </p>
          </div>
          <button
            type="button"
            onClick={() =>
              setInterviewRows((currentRows) => [
                ...currentRows,
                createInterviewRow(),
              ])
            }
            className="inline-flex h-9 items-center justify-center border-2 border-black bg-[#38BDF8] px-3 font-mono text-[10px] font-black uppercase tracking-wider text-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:-translate-x-0.5 hover:-translate-y-0.5 hover:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] active:translate-x-0 active:translate-y-0 active:shadow-[1px_1px_0px_0px_rgba(0,0,0,1)] transition-all cursor-pointer"
          >
            + Add Round
          </button>
        </div>

        <datalist id="interview-type-options">
          {INTERVIEW_TYPE_OPTIONS.map((option) => (
            <option key={option} value={option} />
          ))}
        </datalist>

        <div className="space-y-3">
          {interviewRows.map((row, index) => (
            <div
              key={row.key}
              className="grid gap-3 border-2 border-black bg-white p-3 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] sm:grid-cols-[1fr_1fr_auto]"
            >
              <label className="flex flex-col gap-2 font-mono text-[10px] font-black uppercase tracking-wider text-black">
                <span>Interview Date</span>
                <input
                  className="h-10 w-full border-2 border-black bg-white px-3 font-sans text-sm font-semibold text-black outline-none shadow-[1.5px_1.5px_0px_0px_rgba(0,0,0,1)] focus:bg-yellow-50 focus:shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] transition-all"
                  name="interviewDate"
                  type="datetime-local"
                  defaultValue={toDateTimeLocal(row.interviewDate)}
                />
              </label>
              <label className="flex flex-col gap-2 font-mono text-[10px] font-black uppercase tracking-wider text-black">
                <span>Interview Type</span>
                <input
                  className="h-10 w-full border-2 border-black bg-white px-3 font-sans text-sm font-semibold text-black outline-none shadow-[1.5px_1.5px_0px_0px_rgba(0,0,0,1)] focus:bg-yellow-50 focus:shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] transition-all"
                  name="interviewType"
                  list="interview-type-options"
                  defaultValue={row.interviewType}
                  placeholder="Technical, Behavioral..."
                />
              </label>
              <div className="flex items-end">
                <button
                  type="button"
                  onClick={() =>
                    setInterviewRows((currentRows) =>
                      currentRows.length === 1
                        ? [createInterviewRow()]
                        : currentRows.filter((candidate) => candidate.key !== row.key),
                    )
                  }
                  className="h-10 w-full border-2 border-black bg-[#FB7185] px-3 font-mono text-[10px] font-black uppercase tracking-wider text-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:-translate-x-0.5 hover:-translate-y-0.5 hover:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] active:translate-x-0 active:translate-y-0 active:shadow-[1px_1px_0px_0px_rgba(0,0,0,1)] transition-all cursor-pointer"
                  aria-label={`Remove interview row ${index + 1}`}
                >
                  Remove
                </button>
              </div>
            </div>
          ))}
        </div>
      </section>

      {job?.resumeUrl ? (
        <div className="flex">
          <a
            className="inline-flex items-center gap-2 border border-black bg-[#80DEEA] px-3 py-1.5 font-mono text-xs font-black uppercase tracking-wider text-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:-translate-x-0.5 hover:-translate-y-0.5 hover:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] active:translate-x-0 active:translate-y-0 active:shadow-[1px_1px_0px_0px_rgba(0,0,0,1)] transition-all"
            href={job.resumeUrl}
            target="_blank"
            rel="noreferrer"
          >
            📄 VIEW CURRENT RESUME: {job.resumeName ?? "PDF"}
          </a>
        </div>
      ) : null}

      <div className="flex justify-end gap-3 border-t-2 border-black pt-6">
        <button
          type="button"
          onClick={onDone}
          className="h-11 border-2 border-black bg-white px-5 font-mono text-xs font-black uppercase tracking-wider text-black shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] hover:-translate-x-0.5 hover:-translate-y-0.5 hover:shadow-[5px_5px_0px_0px_rgba(0,0,0,1)] active:translate-x-0 active:translate-y-0 active:shadow-[1px_1px_0px_0px_rgba(0,0,0,1)] transition-all cursor-pointer"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={pending}
          className="h-11 border-2 border-black bg-[#4ADE80] px-5 font-mono text-xs font-black uppercase tracking-wider text-black shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] hover:-translate-x-0.5 hover:-translate-y-0.5 hover:shadow-[5px_5px_0px_0px_rgba(0,0,0,1)] active:translate-x-0 active:translate-y-0 active:shadow-[1px_1px_0px_0px_rgba(0,0,0,1)] transition-all disabled:cursor-not-allowed disabled:opacity-60 cursor-pointer"
        >
          {pending ? "Saving..." : isEdit ? "Save Changes" : "Create Job"}
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
  useEffect(() => {
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, []);

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto overscroll-contain bg-black/60 px-4 py-8 backdrop-blur-[2px]">
      <div className="w-full max-w-2xl border-4 border-black bg-[#f4f3ef] p-6 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] md:p-8">
        <div className="mb-6 flex items-center justify-between gap-4 border-b-2 border-black pb-4">
          <h2 className="font-mono text-lg font-black uppercase tracking-wider text-black">
            {mode.type === "edit" ? ":: Edit Job Application" : ":: New Job Application"}
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="border-2 border-black bg-white px-3 py-1 font-mono text-xs font-black uppercase tracking-wider text-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:-translate-x-0.5 hover:-translate-y-0.5 hover:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] active:translate-x-0 active:translate-y-0 active:shadow-[1px_1px_0px_0px_rgba(0,0,0,1)] transition-all cursor-pointer"
          >
            CLOSE
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
  const nextInterview = job.interviews.find(
    (interview) => new Date(interview.interviewDate).getTime() >= Date.now(),
  );
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
    opacity: isDragging ? 0.3 : 1,
    zIndex: isDragging ? 50 : undefined,
  };

  return (
    <article
      ref={setNodeRef}
      style={style}
      className="border-3 border-black p-4 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] transition-all bg-[#FAF8F5] relative group"
    >
      <div className="flex items-start justify-between gap-3">
        <div>
          <h3 className="font-mono text-sm font-black uppercase tracking-tight text-black line-clamp-1">
            {job.title}
          </h3>
          <p className="font-mono text-xs font-bold text-black/70 mt-0.5">
            {job.companyName}
          </p>
        </div>
        <button
          ref={setActivatorNodeRef}
          type="button"
          className="cursor-grab border border-black bg-white px-2 py-1 font-mono text-[10px] font-black uppercase tracking-wider text-black shadow-[1.5px_1.5px_0px_0px_rgba(0,0,0,1)] active:cursor-grabbing hover:bg-yellow-50 shrink-0 select-none"
          aria-label={`Drag ${job.title}`}
          {...listeners}
          {...attributes}
        >
          DRAG
        </button>
      </div>

      <div className="mt-4 border-t-2 border-dashed border-black/25 pt-3 space-y-1.5">
        {job.location ? (
          <div className="flex items-center gap-1.5 font-mono text-[11px] font-semibold text-black/75">
            <span className="uppercase text-[9px] font-bold px-1.5 py-0.5 border border-black bg-white shadow-[1px_1px_0px_0px_rgba(0,0,0,1)]">Loc</span>
            <span className="truncate">{job.location}</span>
          </div>
        ) : null}
        {job.salaryRange ? (
          <div className="flex items-center gap-1.5 font-mono text-[11px] font-semibold text-black/75">
            <span className="uppercase text-[9px] font-bold px-1.5 py-0.5 border border-black bg-[#4ADE80] shadow-[1px_1px_0px_0px_rgba(0,0,0,1)]">Sal</span>
            <span className="truncate">{job.salaryRange}</span>
          </div>
        ) : null}
      </div>

      {notePreview ? (
        <div className="mt-3 border border-black bg-white p-2 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
          <p className="line-clamp-2 text-xs leading-normal font-sans font-medium text-black/80">
            {notePreview}
          </p>
        </div>
      ) : null}

      {job.interviews.length > 0 ? (
        <div className="mt-3 border border-black bg-[#FFFDEB] p-2 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
          <div className="mb-1 flex items-center justify-between gap-2">
            <span className="font-mono text-[9px] font-black uppercase tracking-wider text-black">
              Interviews
            </span>
            <span className="border border-black bg-white px-1.5 py-0.5 font-mono text-[9px] font-black text-black shadow-[1px_1px_0px_0px_rgba(0,0,0,1)]">
              {job.interviews.length}
            </span>
          </div>
          <p className="font-mono text-[11px] font-bold leading-normal text-black/80">
            {nextInterview
              ? `${nextInterview.interviewType} · ${formatInterviewDate(
                  nextInterview.interviewDate,
                )}`
              : `${job.interviews[job.interviews.length - 1].interviewType} · ${formatInterviewDate(
                  job.interviews[job.interviews.length - 1].interviewDate,
                )}`}
          </p>
        </div>
      ) : null}

      <div className="mt-5 flex flex-wrap items-center gap-2 border-t-2 border-black/10 pt-3">
        {job.resumeUrl ? (
          <a
            className="inline-flex items-center justify-center border border-black bg-[#38BDF8] px-2.5 py-1 font-mono text-[10px] font-black uppercase tracking-wider text-black shadow-[1.5px_1.5px_0px_0px_rgba(0,0,0,1)] hover:-translate-x-0.5 hover:-translate-y-0.5 hover:shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] active:translate-x-0 active:translate-y-0 active:shadow-[1px_1px_0px_0px_rgba(0,0,0,1)] transition-all"
            href={job.resumeUrl}
            target="_blank"
            rel="noreferrer"
          >
            Resume
          </a>
        ) : null}
        <button
          type="button"
          onClick={() => onEdit(job)}
          className="inline-flex items-center justify-center border border-black bg-white px-2.5 py-1 font-mono text-[10px] font-black uppercase tracking-wider text-black shadow-[1.5px_1.5px_0px_0px_rgba(0,0,0,1)] hover:-translate-x-0.5 hover:-translate-y-0.5 hover:shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] active:translate-x-0 active:translate-y-0 active:shadow-[1px_1px_0px_0px_rgba(0,0,0,1)] transition-all cursor-pointer"
        >
          Edit
        </button>
        <form action={deleteJobApplication.bind(null, job.id)} className="inline">
          <button
            type="submit"
            className="inline-flex items-center justify-center border border-black bg-[#FB7185] px-2.5 py-1 font-mono text-[10px] font-black uppercase tracking-wider text-black shadow-[1.5px_1.5px_0px_0px_rgba(0,0,0,1)] hover:-translate-x-0.5 hover:-translate-y-0.5 hover:shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] active:translate-x-0 active:translate-y-0 active:shadow-[1px_1px_0px_0px_rgba(0,0,0,1)] transition-all cursor-pointer"
          >
            Del
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

  const colorConfig = STATUS_COLORS[status];

  return (
    <div
      ref={setNodeRef}
      className={`min-h-[500px] border-3 border-black p-4 transition-all shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] ${
        isOver ? "bg-[#FFFDEB]" : "bg-white"
      }`}
    >
      {/* Column Title Sticker */}
      <div className={`mb-6 flex items-center justify-between border-2 border-black p-2.5 ${colorConfig.bg} shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]`}>
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
            <JobCard key={job.id} job={job} onEdit={onEdit} />
          ))
        ) : (
          <div className="border-2 border-dashed border-black/35 bg-[#FAF8F5] px-4 py-8 text-center font-mono text-xs font-bold uppercase tracking-wider text-black/40">
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
    <main className="min-h-screen bg-[#f4f3ef] px-4 py-10 text-black sm:px-6 lg:px-8 font-sans">
      <div className="mx-auto max-w-7xl">
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

        <DndContext onDragEnd={handleDragEnd}>
          <section
            className={`grid gap-6 sm:grid-cols-2 lg:grid-cols-5 ${
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
              />
            ))}
          </section>
        </DndContext>
      </div>

      {modal ? <JobModal mode={modal} onClose={() => setModal(null)} /> : null}
    </main>
  );
}
