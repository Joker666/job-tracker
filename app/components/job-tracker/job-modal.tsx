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
