"use client";

import { useActionState, useEffect, useId, useRef, useState } from "react";
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

export function toDateInputValue(value: string) {
  if (!value) {
    return "";
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "";
  }

  return date.toISOString().slice(0, 10);
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

  const fileInputRef = useRef<HTMLInputElement>(null);
  const dragCounter = useRef(0);
  const [isDragging, setIsDragging] = useState(false);
  const [droppedFileName, setDroppedFileName] = useState<string | null>(null);
  const [clientError, setClientError] = useState<string | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      if (file.type !== "application/pdf" && !file.name.toLowerCase().endsWith(".pdf")) {
        setClientError("Only PDF resumes are accepted.");
        e.target.value = "";
        setDroppedFileName(null);
        return;
      }
      setClientError(null);
      setDroppedFileName(file.name);
    } else {
      setDroppedFileName(null);
    }
  };

  const handleDragEnter = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    dragCounter.current += 1;
    if (e.dataTransfer.items && e.dataTransfer.items.length > 0) {
      setIsDragging(true);
    }
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    dragCounter.current -= 1;
    if (dragCounter.current === 0) {
      setIsDragging(false);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    dragCounter.current = 0;

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const file = e.dataTransfer.files[0];
      if (file.type !== "application/pdf" && !file.name.toLowerCase().endsWith(".pdf")) {
        setClientError("Only PDF resumes are accepted.");
        if (fileInputRef.current) {
          fileInputRef.current.value = "";
        }
        setDroppedFileName(null);
        return;
      }
      setClientError(null);
      if (fileInputRef.current) {
        const dataTransfer = new DataTransfer();
        dataTransfer.items.add(file);
        fileInputRef.current.files = dataTransfer.files;
        setDroppedFileName(file.name);
      }
    }
  };

  return (
    <form
      action={formAction}
      onDragEnter={handleDragEnter}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      className="relative space-y-6"
    >
      {state.error || clientError ? (
        <div className="border-2 border-border-custom bg-[#FB7185] p-3 font-mono text-xs font-bold text-black shadow-[3px_3px_0px_0px_var(--shadow-color)]">
          <span className="uppercase">[ERROR]</span> {state.error || clientError}
        </div>
      ) : null}

      <div className="grid gap-6 sm:grid-cols-2">
        <label className="flex flex-col gap-2 font-mono text-xs font-black uppercase tracking-wider text-foreground">
          <span>
            Title <span className="text-red-500">*</span>
          </span>
          <input
            className="h-11 w-full border-2 border-border-custom bg-card px-3 font-sans text-sm font-semibold text-foreground outline-none shadow-[2px_2px_0px_0px_var(--shadow-color)] focus:bg-interview/25 focus:shadow-[4px_4px_0px_0px_var(--shadow-color)] transition-all"
            name="title"
            required
            defaultValue={job?.title ?? ""}
            placeholder="e.g. Senior Frontend Engineer"
          />
        </label>

        <label className="flex flex-col gap-2 font-mono text-xs font-black uppercase tracking-wider text-foreground">
          <span>
            Company name <span className="text-red-500">*</span>
          </span>
          <input
            className="h-11 w-full border-2 border-border-custom bg-card px-3 font-sans text-sm font-semibold text-foreground outline-none shadow-[2px_2px_0px_0px_var(--shadow-color)] focus:bg-interview/25 focus:shadow-[4px_4px_0px_0px_var(--shadow-color)] transition-all"
            name="companyName"
            required
            defaultValue={job?.companyName ?? ""}
            placeholder="e.g. Acme Corp"
          />
        </label>

        <label className="flex flex-col gap-2 font-mono text-xs font-black uppercase tracking-wider text-foreground">
          <span>Location</span>
          <input
            className="h-11 w-full border-2 border-border-custom bg-card px-3 font-sans text-sm font-semibold text-foreground outline-none shadow-[2px_2px_0px_0px_var(--shadow-color)] focus:bg-interview/25 focus:shadow-[4px_4px_0px_0px_var(--shadow-color)] transition-all"
            name="location"
            defaultValue={job?.location ?? ""}
            placeholder="e.g. New York, NY (Hybrid)"
          />
        </label>

        <label className="flex flex-col gap-2 font-mono text-xs font-black uppercase tracking-wider text-foreground">
          <span>Salary range</span>
          <input
            className="h-11 w-full border-2 border-border-custom bg-card px-3 font-sans text-sm font-semibold text-foreground outline-none shadow-[2px_2px_0px_0px_var(--shadow-color)] focus:bg-interview/25 focus:shadow-[4px_4px_0px_0px_var(--shadow-color)] transition-all"
            name="salaryRange"
            defaultValue={job?.salaryRange ?? ""}
            placeholder="e.g. $120k - $140k"
          />
        </label>

        <label className="flex flex-col gap-2 font-mono text-xs font-black uppercase tracking-wider text-foreground">
          <span>Job URL</span>
          <input
            className="h-11 w-full border-2 border-border-custom bg-card px-3 font-sans text-sm font-semibold text-foreground outline-none shadow-[2px_2px_0px_0px_var(--shadow-color)] focus:bg-interview/25 focus:shadow-[4px_4px_0px_0px_var(--shadow-color)] transition-all"
            name="jobUrl"
            type="url"
            defaultValue={job?.jobUrl ?? ""}
            placeholder="https://company.com/jobs/..."
          />
        </label>

        <label className="flex flex-col gap-2 font-mono text-xs font-black uppercase tracking-wider text-foreground">
          <span>
            Status <span className="text-red-500">*</span>
          </span>
          <div className="relative h-11 border-2 border-border-custom bg-card shadow-[2px_2px_0px_0px_var(--shadow-color)] transition-all focus-within:bg-interview/25 focus-within:shadow-[4px_4px_0px_0px_var(--shadow-color)]">
            <select
              className="h-full w-full appearance-none bg-transparent px-3 pr-12 font-mono text-xs font-bold text-foreground outline-none"
              name="status"
              required
              defaultValue={job?.status ?? "SAVED"}
            >
              {APPLICATION_STATUSES.map((status) => (
                <option key={status} value={status} className="bg-card text-foreground">
                  {STATUS_LABELS[status]}
                </option>
              ))}
            </select>
            <div className="pointer-events-none absolute right-0 top-0 flex h-full w-11 items-center justify-center border-l-2 border-border-custom bg-[#FFDE4D] text-black font-black">
              ▼
            </div>
          </div>
        </label>

        <label className="flex flex-col gap-2 font-mono text-xs font-black uppercase tracking-wider text-foreground">
          <span>Resume PDF</span>
          <input
            ref={fileInputRef}
            onChange={handleFileChange}
            accept="application/pdf,.pdf"
            className="block w-full border-2 border-border-custom bg-card text-xs font-semibold text-foreground/60 outline-none shadow-[2px_2px_0px_0px_var(--shadow-color)] focus:bg-interview/25 focus:shadow-[4px_4px_0px_0px_var(--shadow-color)] transition-all file:mr-4 file:border-0 file:border-r-2 file:border-border-custom file:bg-[#38BDF8] file:px-4 file:py-3 file:font-mono file:text-xs file:font-black file:uppercase file:text-black hover:file:bg-[#7dd3fc] cursor-pointer"
            name="resume"
            type="file"
          />
          {droppedFileName ? (
            <span className="mt-1 block font-mono text-[10px] font-bold normal-case text-[#4ADE80]">
              ✓ Selected: {droppedFileName}
            </span>
          ) : null}
          {clientError ? (
            <span className="mt-1 block font-mono text-[10px] font-bold normal-case text-[#FB7185]">
              ✗ Error: {clientError}
            </span>
          ) : null}
        </label>
      </div>

      <label className="flex flex-col gap-2 font-mono text-xs font-black uppercase tracking-wider text-foreground">
        <span>Description</span>
        <textarea
          className="min-h-24 w-full border-2 border-border-custom bg-card px-3 py-2 font-sans text-sm font-semibold text-foreground outline-none shadow-[2px_2px_0px_0px_var(--shadow-color)] focus:bg-interview/25 focus:shadow-[4px_4px_0px_0px_var(--shadow-color)] transition-all"
          name="description"
          defaultValue={job?.description ?? ""}
          placeholder="Detailed job description..."
        />
      </label>

      <label className="flex flex-col gap-2 font-mono text-xs font-black uppercase tracking-wider text-foreground">
        <span>Notes / Activity Log</span>
        <textarea
          className="min-h-20 w-full border-2 border-border-custom bg-card px-3 py-2 font-sans text-sm font-semibold text-foreground outline-none shadow-[2px_2px_0px_0px_var(--shadow-color)] focus:bg-interview/25 focus:shadow-[4px_4px_0px_0px_var(--shadow-color)] transition-all"
          name="note"
          defaultValue={job?.note ?? ""}
          placeholder="Keep updates here..."
        />
      </label>

      <section className="border-2 border-border-custom bg-interview p-4 shadow-[3px_3px_0px_0px_var(--shadow-color)]">
        <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h3 className="font-mono text-sm font-black uppercase tracking-wider text-foreground">
              Interview Tracking
            </h3>
            <p className="mt-1 font-mono text-[10px] font-bold uppercase tracking-wider text-foreground/55">
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
            className="inline-flex h-9 items-center justify-center border-2 border-border-custom bg-[#38BDF8] px-3 font-mono text-[10px] font-black uppercase tracking-wider text-black shadow-[2px_2px_0px_0px_var(--shadow-color)] hover:-translate-x-0.5 hover:-translate-y-0.5 hover:shadow-[4px_4px_0px_0px_var(--shadow-color)] active:translate-x-0 active:translate-y-0 active:shadow-[1px_1px_0px_0px_var(--shadow-color)] transition-all cursor-pointer"
          >
            + Add Round
          </button>
        </div>

        <div className="space-y-3">
          {interviewRows.map((row, index) => (
            <div
              key={row.key}
              className="grid gap-3 border-2 border-border-custom bg-card p-3 shadow-[2px_2px_0px_0px_var(--shadow-color)] sm:grid-cols-[1fr_1fr_auto]"
            >
              <label className="flex flex-col gap-2 min-w-0 font-mono text-[10px] font-black uppercase tracking-wider text-foreground">
                <span>Interview Date</span>
                <input
                  className="h-10 w-full min-w-0 border-2 border-border-custom bg-card px-3 font-sans text-sm font-semibold text-foreground outline-none shadow-[1.5px_1.5px_0px_0px_var(--shadow-color)] focus:bg-interview/25 focus:shadow-[3px_3px_0px_0px_var(--shadow-color)] transition-all"
                  name="interviewDate"
                  type="date"
                  defaultValue={toDateInputValue(row.interviewDate)}
                />
              </label>
              <label className="flex flex-col gap-2 min-w-0 font-mono text-[10px] font-black uppercase tracking-wider text-foreground">
                <span>Interview Type</span>
                <select
                  className="h-10 w-full min-w-0 border-2 border-border-custom bg-card px-3 font-mono text-xs font-black uppercase tracking-wider text-foreground outline-none shadow-[1.5px_1.5px_0px_0px_var(--shadow-color)] focus:bg-interview/25 focus:shadow-[3px_3px_0px_0px_var(--shadow-color)] transition-all"
                  name="interviewType"
                  defaultValue={row.interviewType}
                >
                  <option value="" className="bg-card text-foreground">
                    Select type
                  </option>
                  {INTERVIEW_TYPE_OPTIONS.map((option) => (
                    <option key={option} value={option} className="bg-card text-foreground">
                      {option}
                    </option>
                  ))}
                  {row.interviewType && !INTERVIEW_TYPE_OPTIONS.includes(row.interviewType) ? (
                    <option value={row.interviewType} className="bg-card text-foreground">
                      {row.interviewType}
                    </option>
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
                  className="h-10 w-full border-2 border-border-custom bg-[#FB7185] px-3 font-mono text-[10px] font-black uppercase tracking-wider text-black shadow-[2px_2px_0px_0px_var(--shadow-color)] hover:-translate-x-0.5 hover:-translate-y-0.5 hover:shadow-[4px_4px_0px_0px_var(--shadow-color)] active:translate-x-0 active:translate-y-0 active:shadow-[1px_1px_0px_0px_var(--shadow-color)] transition-all cursor-pointer"
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
            className="inline-flex items-center gap-2 border border-border-custom bg-[#80DEEA] px-3 py-1.5 font-mono text-xs font-black uppercase tracking-wider text-black shadow-[2px_2px_0px_0px_var(--shadow-color)] hover:-translate-x-0.5 hover:-translate-y-0.5 hover:shadow-[4px_4px_0px_0px_var(--shadow-color)] active:translate-x-0 active:translate-y-0 active:shadow-[1px_1px_0px_0px_var(--shadow-color)] transition-all"
            href={job.resumeUrl}
            target="_blank"
            rel="noreferrer"
          >
            📄 VIEW CURRENT RESUME: {job.resumeName ?? "PDF"}
          </a>
        </div>
      ) : null}

      <div className="flex justify-end gap-3 border-t-2 border-border-custom pt-6">
        <button
          type="button"
          onClick={onDone}
          className="h-11 border-2 border-border-custom bg-card px-5 font-mono text-xs font-black uppercase tracking-wider text-foreground shadow-[3px_3px_0px_0px_var(--shadow-color)] hover:-translate-x-0.5 hover:-translate-y-0.5 hover:shadow-[5px_5px_0px_0px_var(--shadow-color)] active:translate-x-0 active:translate-y-0 active:shadow-[1px_1px_0px_0px_var(--shadow-color)] transition-all cursor-pointer"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={pending}
          className="h-11 border-2 border-border-custom bg-[#4ADE80] px-5 font-mono text-xs font-black uppercase tracking-wider text-black shadow-[3px_3px_0px_0px_var(--shadow-color)] hover:-translate-x-0.5 hover:-translate-y-0.5 hover:shadow-[5px_5px_0px_0px_var(--shadow-color)] active:translate-x-0 active:translate-y-0 active:shadow-[1px_1px_0px_0px_var(--shadow-color)] transition-all disabled:cursor-not-allowed disabled:opacity-60 cursor-pointer"
        >
          {pending ? "Saving..." : isEdit ? "Save Changes" : "Create Job"}
        </button>
      </div>

      {isDragging && (
        <div className="absolute inset-0 z-40 flex flex-col items-center justify-center border-4 border-dashed border-[#FFDE4D] bg-background/95 p-6 backdrop-blur-[2px] transition-all">
          <div className="flex flex-col items-center justify-center text-center p-8 border-4 border-border-custom bg-card shadow-[6px_6px_0px_0px_var(--shadow-color)] max-w-sm">
            <svg
              className="mb-4 h-12 w-12 text-[#38BDF8]"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <title>Upload Resume PDF</title>
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
              />
            </svg>
            <p className="font-mono text-sm font-black uppercase tracking-wider text-foreground">
              Drop Resume PDF Here
            </p>
            <p className="mt-2 font-mono text-[10px] font-bold uppercase tracking-wider text-foreground/60">
              Only PDF files are supported
            </p>
          </div>
        </div>
      )}
    </form>
  );
}
