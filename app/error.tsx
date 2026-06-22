"use client";

export default function Error({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <main className="flex min-h-screen items-center justify-center bg-background px-4 text-foreground font-sans">
      <div className="max-w-md border-4 border-border-custom bg-card p-6 shadow-[8px_8px_0px_0px_var(--shadow-color)]">
        <h1 className="font-mono text-lg font-black uppercase tracking-wider">:: System Error</h1>
        <p className="mt-4 font-mono text-xs font-bold uppercase tracking-wider text-foreground/60">
          // could not load jobs
        </p>
        <p className="mt-3 text-sm font-medium leading-relaxed">
          {error.message || "Check the database connection and try again."}
        </p>
        <button
          type="button"
          onClick={reset}
          className="mt-6 inline-flex h-11 items-center justify-center border-2 border-border-custom bg-[#FB7185] px-5 font-mono text-xs font-black uppercase tracking-wider text-black shadow-[3px_3px_0px_0px_var(--shadow-color)] hover:-translate-x-0.5 hover:-translate-y-0.5 hover:shadow-[5px_5px_0px_0px_var(--shadow-color)] active:translate-x-0 active:translate-y-0 active:shadow-[1px_1px_0px_0px_var(--shadow-color)] transition-all cursor-pointer"
        >
          Try Again
        </button>
      </div>
    </main>
  );
}
