"use client";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <main className="flex min-h-screen items-center justify-center bg-zinc-50 px-4 text-zinc-950">
      <div className="max-w-md rounded-lg border border-zinc-200 bg-white p-6 shadow-sm">
        <h1 className="text-xl font-semibold">Could not load jobs</h1>
        <p className="mt-2 text-sm leading-6 text-zinc-600">
          {error.message || "Check the database connection and try again."}
        </p>
        <button
          type="button"
          onClick={reset}
          className="mt-5 h-10 rounded-md bg-zinc-950 px-4 text-sm font-medium text-white transition hover:bg-zinc-800"
        >
          Try again
        </button>
      </div>
    </main>
  );
}
