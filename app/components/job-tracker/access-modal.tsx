"use client";

import { useActionState, useEffect } from "react";
import { verifyAppAccess } from "@/app/actions";
import { ACCESS_STORAGE_KEY } from "./constants";

type ActionState = {
  ok: boolean;
  error?: string;
};

const initialActionState: ActionState = { ok: false };

export function AccessModal({ onGranted }: { onGranted: () => void }) {
  const [state, formAction, pending] = useActionState(verifyAppAccess, initialActionState);

  useEffect(() => {
    if (state.ok) {
      localStorage.setItem(ACCESS_STORAGE_KEY, "true");
      onGranted();
    }
  }, [onGranted, state.ok]);

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 px-4 py-8 backdrop-blur-[2px]">
      <div className="w-full max-w-md border-4 border-black bg-[#f4f3ef] p-6 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
        <div className="mb-6 border-b-2 border-black pb-4">
          <div className="inline-block border-2 border-black bg-[#FFDE4D] px-3 py-1 font-mono text-[10px] font-black uppercase tracking-wider text-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
            Access Required
          </div>
          <h2 className="mt-4 font-mono text-xl font-black uppercase tracking-tight text-black">
            Job Tracker Login
          </h2>
        </div>

        <form action={formAction} className="space-y-5">
          {state.error ? (
            <div className="border-2 border-black bg-[#FB7185] p-3 font-mono text-xs font-bold uppercase text-black shadow-[3px_3px_0px_0px_rgba(0,0,0,1)]">
              {state.error}
            </div>
          ) : null}

          <label className="flex flex-col gap-2 font-mono text-xs font-black uppercase tracking-wider text-black">
            <span>Username</span>
            <input
              className="h-11 w-full border-2 border-black bg-white px-3 font-sans text-sm font-semibold text-black outline-none shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] focus:bg-yellow-50 focus:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] transition-all"
              name="username"
              autoComplete="username"
              required
            />
          </label>

          <label className="flex flex-col gap-2 font-mono text-xs font-black uppercase tracking-wider text-black">
            <span>Password</span>
            <input
              className="h-11 w-full border-2 border-black bg-white px-3 font-sans text-sm font-semibold text-black outline-none shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] focus:bg-yellow-50 focus:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] transition-all"
              name="password"
              type="password"
              autoComplete="current-password"
              required
            />
          </label>

          <button
            type="submit"
            disabled={pending}
            className="h-11 w-full border-2 border-black bg-[#4ADE80] px-5 font-mono text-xs font-black uppercase tracking-wider text-black shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] hover:-translate-x-0.5 hover:-translate-y-0.5 hover:shadow-[5px_5px_0px_0px_rgba(0,0,0,1)] active:translate-x-0 active:translate-y-0 active:shadow-[1px_1px_0px_0px_rgba(0,0,0,1)] transition-all disabled:cursor-not-allowed disabled:opacity-60 cursor-pointer"
          >
            {pending ? "Checking..." : "Enter"}
          </button>
        </form>
      </div>
    </div>
  );
}

export function AccessCheckingOverlay() {
  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 px-4 py-8 backdrop-blur-[2px]">
      <div className="border-4 border-black bg-[#FFDE4D] px-6 py-4 font-mono text-sm font-black uppercase tracking-wider text-black shadow-[6px_6px_0px_0px_rgba(0,0,0,1)]">
        Checking access...
      </div>
    </div>
  );
}
