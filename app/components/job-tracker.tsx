"use client";

import {
  DndContext,
  KeyboardSensor,
  PointerSensor,
  type DragEndEvent,
  useDraggable,
  useDroppable,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import { useRouter } from "next/navigation";
import {
  useActionState,
  useEffect,
  useId,
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
  jobUrl: string | null;
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
const MONTH_LABELS = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
];

function createInterviewRow(interview: JobInterviewView | undefined, index: number) {
  return {
    key: interview?.id ?? `new-${index}`,
    interviewDate: interview?.interviewDate ?? "",
    interviewType: interview?.interviewType ?? "",
  };
}

function createEmptyInterviewRow(key: string) {
  return {
    key,
    interviewDate: "",
    interviewType: "",
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

  return date.toISOString().slice(0, 16);
}

function formatInterviewDate(value: string) {
  const date = new Date(value);
  const hours = date.getUTCHours();
  const minutes = String(date.getUTCMinutes()).padStart(2, "0");
  const period = hours >= 12 ? "PM" : "AM";
  const hour = hours % 12 || 12;

  return `${MONTH_LABELS[date.getUTCMonth()]} ${date.getUTCDate()}, ${hour}:${minutes} ${period}`;
}

function formatResumeUploadedAt(value: string) {
  const date = new Date(value);
  const month = String(date.getUTCMonth() + 1).padStart(2, "0");
  const day = String(date.getUTCDate()).padStart(2, "0");
  const hours = String(date.getUTCHours()).padStart(2, "0");
  const minutes = String(date.getUTCMinutes()).padStart(2, "0");

  return `${date.getUTCFullYear()}-${month}-${day} ${hours}:${minutes} UTC`;
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
  const rowIdPrefix = useId();
  const [interviewRows, setInterviewRows] = useState(() =>
    job?.interviews.length
      ? job.interviews.map((interview, index) =>
          createInterviewRow(interview, index),
        )
      : [createInterviewRow(undefined, 0)],
  );
  const [nextInterviewRowIndex, setNextInterviewRowIndex] = useState(
    () => interviewRows.length,
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
          <span>Job URL</span>
          <input
            className="h-11 w-full border-2 border-black bg-white px-3 font-sans text-sm font-semibold text-black outline-none shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] focus:bg-yellow-50 focus:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] transition-all"
            name="jobUrl"
            type="url"
            defaultValue={job?.jobUrl ?? ""}
            placeholder="https://company.com/jobs/..."
          />
        </label>

        <label className="flex flex-col gap-2 font-mono text-xs font-black uppercase tracking-wider text-black">
          <span>Status <span className="text-red-500">*</span></span>
          <div className="relative h-11 border-2 border-black bg-white shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] transition-all focus-within:bg-yellow-50 focus-within:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
            <select
              className="h-full w-full appearance-none bg-transparent px-3 pr-12 font-mono text-xs font-bold text-black outline-none"
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
            <div className="pointer-events-none absolute right-0 top-0 flex h-full w-11 items-center justify-center border-l-2 border-black bg-[#FFDE4D] text-black font-black">
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
            onClick={() => {
              setInterviewRows((currentRows) => [
                ...currentRows,
                createEmptyInterviewRow(
                  `${rowIdPrefix}-new-${nextInterviewRowIndex}`,
                ),
              ]);
              setNextInterviewRowIndex((currentIndex) => currentIndex + 1);
            }}
            className="inline-flex h-9 items-center justify-center border-2 border-black bg-[#38BDF8] px-3 font-mono text-[10px] font-black uppercase tracking-wider text-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:-translate-x-0.5 hover:-translate-y-0.5 hover:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] active:translate-x-0 active:translate-y-0 active:shadow-[1px_1px_0px_0px_rgba(0,0,0,1)] transition-all cursor-pointer"
          >
            + Add Round
          </button>
        </div>

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
                <select
                  className="h-10 w-full border-2 border-black bg-white px-3 font-mono text-xs font-black uppercase tracking-wider text-black outline-none shadow-[1.5px_1.5px_0px_0px_rgba(0,0,0,1)] focus:bg-yellow-50 focus:shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] transition-all"
                  name="interviewType"
                  defaultValue={row.interviewType}
                >
                  <option value="">Select type</option>
                  {INTERVIEW_TYPE_OPTIONS.map((option) => (
                    <option key={option} value={option}>
                      {option}
                    </option>
                  ))}
                  {row.interviewType &&
                  !INTERVIEW_TYPE_OPTIONS.includes(row.interviewType) ? (
                    <option value={row.interviewType}>{row.interviewType}</option>
                  ) : null}
                </select>
              </label>
              <div className="flex items-end">
                <button
                  type="button"
                  onClick={() =>
                    setInterviewRows((currentRows) =>
                      currentRows.length === 1
                        ? [createInterviewRow(undefined, 0)]
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

function JobDetailModal({
  job,
  onClose,
  onEdit,
  nowMs,
}: {
  job: JobApplicationView;
  onClose: () => void;
  onEdit: () => void;
  nowMs: number | null;
}) {
  useEffect(() => {
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, []);

  const colorConfig = STATUS_COLORS[job.status];

  // Sort interviews chronologically
  const sortedInterviews = [...job.interviews].sort(
    (a, b) => new Date(a.interviewDate).getTime() - new Date(b.interviewDate).getTime()
  );

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto overscroll-contain bg-black/60 px-4 py-8 backdrop-blur-[2px]">
      <div className="w-full max-w-2xl border-4 border-black bg-[#f4f3ef] p-6 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] md:p-8 relative">
        
        {/* Header */}
        <div className="mb-6 flex flex-col gap-4 border-b-2 border-black pb-5">
          <div className="flex items-start justify-between gap-4">
            <div>
              <div className={`inline-block border-2 border-black ${colorConfig.bg} px-2.5 py-1 font-mono text-[10px] font-black uppercase tracking-wider text-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] mb-3`}>
                {STATUS_LABELS[job.status]}
              </div>
              <h2 className="font-mono text-xl font-black uppercase tracking-tight text-black md:text-2xl">
                {job.title}
              </h2>
              <p className="font-mono text-sm font-bold text-black/70 mt-1">
                {job.companyName}
              </p>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="border-2 border-black bg-white px-3 py-1 font-mono text-xs font-black uppercase tracking-wider text-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:-translate-x-0.5 hover:-translate-y-0.5 hover:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] active:translate-x-0 active:translate-y-0 active:shadow-[1px_1px_0px_0px_rgba(0,0,0,1)] transition-all cursor-pointer shrink-0"
            >
              CLOSE
            </button>
          </div>

          {/* Quick Meta */}
          <div className="flex flex-wrap gap-2.5">
            {job.location ? (
              <div className="flex items-center gap-1.5 font-mono text-xs font-semibold text-black/75">
                <span className="uppercase text-[9px] font-bold px-1.5 py-0.5 border border-black bg-white shadow-[1px_1px_0px_0px_rgba(0,0,0,1)]">Loc</span>
                <span>{job.location}</span>
              </div>
            ) : null}
            {job.salaryRange ? (
              <div className="flex items-center gap-1.5 font-mono text-xs font-semibold text-black/75">
                <span className="uppercase text-[9px] font-bold px-1.5 py-0.5 border border-black bg-[#4ADE80] shadow-[1px_1px_0px_0px_rgba(0,0,0,1)]">Sal</span>
                <span>{job.salaryRange}</span>
              </div>
            ) : null}
            {job.jobUrl ? (
              <a
                href={job.jobUrl}
                target="_blank"
                rel="noreferrer"
                onClick={(e) => e.stopPropagation()}
                className="flex items-center gap-1.5 font-mono text-xs font-semibold text-black hover:underline"
              >
                <span className="uppercase text-[9px] font-bold px-1.5 py-0.5 border border-black bg-[#FFDE4D] shadow-[1px_1px_0px_0px_rgba(0,0,0,1)]">Post</span>
                <span className="truncate max-w-[200px]">{job.jobUrl}</span>
              </a>
            ) : null}
          </div>
        </div>

        {/* Content sections */}
        <div className="space-y-6">
          {/* Description */}
          <div className="border-2 border-black bg-white p-4 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
            <h4 className="font-mono text-xs font-black uppercase tracking-wider text-black mb-2.5">// Job Description</h4>
            <div className="text-sm font-medium leading-relaxed max-h-44 overflow-y-auto pr-2 whitespace-pre-wrap text-black/90">
              {job.description || <span className="font-mono text-xs font-bold text-black/40 uppercase">No description provided.</span>}
            </div>
          </div>

          {/* Note */}
          <div className="border-2 border-black bg-white p-4 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
            <h4 className="font-mono text-xs font-black uppercase tracking-wider text-black mb-2.5">// Personal Notes</h4>
            <div className="text-sm font-medium leading-relaxed max-h-32 overflow-y-auto pr-2 whitespace-pre-wrap text-black/90">
              {job.note || <span className="font-mono text-xs font-bold text-black/40 uppercase">No notes added.</span>}
            </div>
          </div>

          <div className="grid gap-6 md:grid-cols-2">
            {/* Interviews */}
            <div className="border-2 border-black bg-[#FFFDEB] p-4 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] flex flex-col justify-between">
              <div>
                <h4 className="font-mono text-xs font-black uppercase tracking-wider text-black mb-3">// Interview Timeline</h4>
                {sortedInterviews.length > 0 ? (
                  <div className="space-y-2 max-h-48 overflow-y-auto pr-2">
                    {sortedInterviews.map((interview, index) => {
                      const isUpcoming =
                        nowMs !== null &&
                        new Date(interview.interviewDate).getTime() >= nowMs;
                      return (
                        <div key={interview.id} className={`flex items-start gap-3 border border-black bg-white p-2.5 shadow-[1.5px_1.5px_0px_0px_rgba(0,0,0,1)] ${isUpcoming ? "border-l-4 border-l-[#C084FC]" : ""}`}>
                          <span className="border border-black bg-zinc-100 px-1.5 py-0.5 font-mono text-[8px] font-black text-black">
                            #{index + 1}
                          </span>
                          <div>
                            <p className="font-mono text-xs font-black uppercase text-black">{interview.interviewType}</p>
                            <p className="font-mono text-[9px] font-bold text-black/60 mt-0.5">{formatInterviewDate(interview.interviewDate)}</p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <p className="font-mono text-[10px] font-bold text-black/40 uppercase">// No interviews scheduled yet.</p>
                )}
              </div>
            </div>

            {/* Resume */}
            <div className="border-2 border-black bg-[#E0F7FA] p-4 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] flex flex-col justify-between gap-4">
              <div>
                <h4 className="font-mono text-xs font-black uppercase tracking-wider text-black mb-3">// Resume Submitted</h4>
                {job.resumeUrl ? (
                  <div className="space-y-2">
                    <p className="font-mono text-xs font-bold truncate text-black/80">{job.resumeName}</p>
                    {job.resumeUploadedAt ? (
                      <p className="font-mono text-[9px] text-black/55 uppercase font-bold">
                        Uploaded: {formatResumeUploadedAt(job.resumeUploadedAt)}
                      </p>
                    ) : null}
                  </div>
                ) : (
                  <p className="font-mono text-[10px] font-bold text-black/40 uppercase">// No resume uploaded.</p>
                )}
              </div>
              
              {job.resumeUrl ? (
                <div className="flex">
                  <a
                    href={job.resumeUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center justify-center border border-black bg-white px-3 py-1.5 font-mono text-[10px] font-black uppercase tracking-wider text-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:-translate-x-0.5 hover:-translate-y-0.5 hover:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] active:translate-x-0 active:translate-y-0 active:shadow-[1px_1px_0px_0px_rgba(0,0,0,1)] transition-all cursor-pointer w-full text-center"
                  >
                    Download Resume
                  </a>
                </div>
              ) : null}
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="mt-8 flex justify-between items-center border-t-2 border-black pt-5">
          <form action={deleteJobApplication.bind(null, job.id)} onSubmit={() => onClose()}>
            <button
              type="submit"
              className="h-10 border-2 border-black bg-[#FB7185] px-4 font-mono text-xs font-black uppercase tracking-wider text-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:-translate-x-0.5 hover:-translate-y-0.5 hover:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] active:translate-x-0 active:translate-y-0 active:shadow-[1px_1px_0px_0px_rgba(0,0,0,1)] transition-all cursor-pointer"
            >
              Delete Job
            </button>
          </form>
          <div className="flex gap-3">
            <button
              type="button"
              onClick={onClose}
              className="h-10 border-2 border-black bg-white px-5 font-mono text-xs font-black uppercase tracking-wider text-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:-translate-x-0.5 hover:-translate-y-0.5 hover:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] active:translate-x-0 active:translate-y-0 active:shadow-[1px_1px_0px_0px_rgba(0,0,0,1)] transition-all cursor-pointer"
            >
              Close
            </button>
            <button
              type="button"
              onClick={onEdit}
              className="h-10 border-2 border-black bg-[#4ADE80] px-5 font-mono text-xs font-black uppercase tracking-wider text-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:-translate-x-0.5 hover:-translate-y-0.5 hover:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] active:translate-x-0 active:translate-y-0 active:shadow-[1px_1px_0px_0px_rgba(0,0,0,1)] transition-all cursor-pointer"
            >
              Edit Details
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}

function JobCard({
  job,
  onEdit,
  onViewDetails,
  nowMs,
}: {
  job: JobApplicationView;
  onEdit: (job: JobApplicationView) => void;
  onViewDetails: (job: JobApplicationView) => void;
  nowMs: number | null;
}) {
  const notePreview = job.note || job.description;
  const nextInterview =
    nowMs === null
      ? undefined
      : job.interviews.find(
          (interview) => new Date(interview.interviewDate).getTime() >= nowMs,
        );
  const featuredInterview =
    nextInterview ??
    (nowMs === null ? job.interviews[0] : job.interviews[job.interviews.length - 1]);
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
      ref={(node) => {
        setNodeRef(node);
        setActivatorNodeRef(node);
      }}
      style={style}
      onClick={() => onViewDetails(job)}
      className="border-3 border-black p-4 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] transition-all bg-[#FAF8F5] relative group cursor-pointer hover:-translate-x-0.5 hover:-translate-y-0.5 hover:shadow-[6px_6px_0px_0px_rgba(0,0,0,1)]"
      {...listeners}
      {...attributes}
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
            {featuredInterview
              ? `${featuredInterview.interviewType} · ${formatInterviewDate(
                  featuredInterview.interviewDate,
                )}`
              : null}
          </p>
        </div>
      ) : null}

      {job.jobUrl || job.resumeUrl ? (
        <div className="mt-5 flex flex-wrap items-center gap-2 border-t-2 border-black/10 pt-3">
          {job.jobUrl ? (
            <a
              className="inline-flex items-center justify-center border border-black bg-[#FFDE4D] px-2.5 py-1 font-mono text-[10px] font-black uppercase tracking-wider text-black shadow-[1.5px_1.5px_0px_0px_rgba(0,0,0,1)] hover:-translate-x-0.5 hover:-translate-y-0.5 hover:shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] active:translate-x-0 active:translate-y-0 active:shadow-[1px_1px_0px_0px_rgba(0,0,0,1)] transition-all"
              href={job.jobUrl}
              target="_blank"
              rel="noreferrer"
              onClick={(e) => e.stopPropagation()}
            >
              Job Post
            </a>
          ) : null}
          {job.resumeUrl ? (
            <a
              className="inline-flex items-center justify-center border border-black bg-[#38BDF8] px-2.5 py-1 font-mono text-[10px] font-black uppercase tracking-wider text-black shadow-[1.5px_1.5px_0px_0px_rgba(0,0,0,1)] hover:-translate-x-0.5 hover:-translate-y-0.5 hover:shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] active:translate-x-0 active:translate-y-0 active:shadow-[1px_1px_0px_0px_rgba(0,0,0,1)] transition-all"
              href={job.resumeUrl}
              target="_blank"
              rel="noreferrer"
              onClick={(e) => e.stopPropagation()}
            >
              Resume
            </a>
          ) : null}
        </div>
      ) : null}
    </article>
  );
}

function KanbanColumn({
  status,
  jobs,
  onEdit,
  onViewDetails,
  nowMs,
}: {
  status: ApplicationStatus;
  jobs: JobApplicationView[];
  onEdit: (job: JobApplicationView) => void;
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
            <JobCard
              key={job.id}
              job={job}
              onEdit={onEdit}
              onViewDetails={onViewDetails}
              nowMs={nowMs}
            />
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
  const [detailJob, setDetailJob] = useState<JobApplicationView | null>(null);
  const [localJobs, setLocalJobs] = useState(jobs);
  const [nowMs, setNowMs] = useState<number | null>(null);
  const [statusError, setStatusError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(KeyboardSensor),
  );

  useEffect(() => {
    setLocalJobs(jobs);
  }, [jobs]);

  useEffect(() => {
    setNowMs(Date.now());
  }, []);

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

        <DndContext
          id="job-tracker-kanban"
          sensors={sensors}
          onDragEnd={handleDragEnd}
        >
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
                onViewDetails={(selectedJob) =>
                  setDetailJob(selectedJob)
                }
                nowMs={nowMs}
              />
            ))}
          </section>
        </DndContext>
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
