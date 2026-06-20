"use client";

import { useEffect } from "react";
import { JobForm } from "./job-form";
import type { FormMode } from "./types";

export function JobModal({ mode, onClose }: { mode: FormMode; onClose: () => void }) {
  useEffect(() => {
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, []);

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto overscroll-contain bg-black/60 sm:px-4 sm:py-8 backdrop-blur-[2px]">
      <div className="w-full min-h-screen sm:min-h-0 sm:max-w-2xl border-0 sm:border-4 border-border-custom bg-background p-6 shadow-none sm:shadow-[8px_8px_0px_0px_var(--shadow-color)] md:p-8">
        <div className="mb-6 flex items-center justify-between gap-4 border-b-2 border-border-custom pb-4">
          <h2 className="font-mono text-lg font-black uppercase tracking-wider text-foreground">
            {mode.type === "edit" ? ":: Edit Job Application" : ":: New Job Application"}
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="border-2 border-border-custom bg-card px-3 py-1 font-mono text-xs font-black uppercase tracking-wider text-foreground shadow-[2px_2px_0px_0px_var(--shadow-color)] hover:-translate-x-0.5 hover:-translate-y-0.5 hover:shadow-[4px_4px_0px_0px_var(--shadow-color)] active:translate-x-0 active:translate-y-0 active:shadow-[1px_1px_0px_0px_var(--shadow-color)] transition-all cursor-pointer"
          >
            CLOSE
          </button>
        </div>
        <JobForm mode={mode} onDone={onClose} />
      </div>
    </div>
  );
}
