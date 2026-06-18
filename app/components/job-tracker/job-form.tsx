"use client";

import { useActionState, useEffect, useId, useState } from "react";
import { createJobApplication, updateJobApplication } from "@/app/actions";
import { APPLICATION_STATUSES, STATUS_LABELS } from "@/lib/status";
import { INTERVIEW_TYPE_OPTIONS } from "./constants";
import type { ActionState, FormMode, JobInterviewView } from "./types";

export function createInterviewRow(interview: JobInterviewView | undefined, index: number) {
  return {
    key: interview?.id ?? `new-${index}`,
    interviewDate: interview?.interviewDate ?? "",
    interviewType: interview?.interviewType ?? "",
  };
}

export function createEmptyInterviewRow(key: string) {
  return {
    key,
    interviewDate: "",
    interviewType: "",
  };
}

export function toDateTimeLocal(value: string) {
  if (!value) {
    return "";
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "";
  }

  return date.toISOString().slice(0, 16);
}

export function JobForm({ mode, onDone }: { mode: FormMode; onDone: () => void }) {
  const isEdit = mode.type === "edit";
  const job = mode.type === "edit" ? mode.job : null;
  const action =
    mode.type === "edit" ? updateJobApplication.bind(null, mode.job.id) : createJobApplication;
  const rowIdPrefix = useId();
  const [interviewRows, setInterviewRows] = useState(() =>
    job?.interviews.length
      ? job.interviews.map((interview, index) => createInterviewRow(interview, index))
      : [createInterviewRow(undefined, 0)],
  );
  const [nextInterviewRowIndex, setNextInterviewRowIndex] = useState(() => interviewRows.length);
  const initialActionState: ActionState = { ok: false };
  const [state, formAction, pending] = useActionState(action, initialActionState);

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
          <span>
            Title <span className="text-red-500">*</span>
          </span>
          <input
            className="h-11 w-full border-2 border-black bg-white px-3 font-sans text-sm font-semibold text-black outline-none shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] focus:bg-yellow-50 focus:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] transition-all"
            name="title"
            required
            defaultValue={job?.title ?? ""}
            placeholder="e.g. Senior Frontend Engineer"
          />
        </label>

        <label className="flex flex-col gap-2 font-mono text-xs font-black uppercase tracking-wider text-black">
          <span>
            Company name <span className="text-red-500">*</span>
          </span>
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
          <span>
            Status <span className="text-red-500">*</span>
          </span>
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
                createEmptyInterviewRow(`${rowIdPrefix}-new-${nextInterviewRowIndex}`),
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
                  {row.interviewType && !INTERVIEW_TYPE_OPTIONS.includes(row.interviewType) ? (
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
