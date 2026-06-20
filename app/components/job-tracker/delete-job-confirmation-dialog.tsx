"use client";

export function DeleteJobConfirmationDialog({
  isDeleting,
  error,
  jobTitle,
  onCancel,
  onConfirm,
}: {
  isDeleting: boolean;
  error?: string | null;
  jobTitle: string;
  onCancel: () => void;
  onConfirm: () => void;
}) {
  return (
    <div
      className="fixed inset-0 z-[60] flex items-center justify-center bg-black/70 px-4 backdrop-blur-[2px]"
      role="dialog"
      aria-modal="true"
      aria-labelledby="delete-job-dialog-title"
    >
      <div className="w-full max-w-md border-4 border-black bg-[#f4f3ef] p-6 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
        <h2
          id="delete-job-dialog-title"
          className="font-mono text-xl font-black uppercase tracking-tight text-black"
        >
          Delete job?
        </h2>
        <p className="mt-3 text-sm font-semibold leading-relaxed text-black/75">
          This will permanently delete{" "}
          <span className="font-mono font-black text-black">{jobTitle}</span>. This action cannot
          be undone.
        </p>

        {error ? (
          <p className="mt-4 border-2 border-black bg-[#FB7185] p-3 font-mono text-xs font-black uppercase text-black">
            {error}
          </p>
        ) : null}

        <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
          <button
            type="button"
            onClick={onCancel}
            disabled={isDeleting}
            className="h-10 border-2 border-black bg-white px-5 font-mono text-xs font-black uppercase tracking-wider text-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] transition-all hover:-translate-x-0.5 hover:-translate-y-0.5 hover:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] active:translate-x-0 active:translate-y-0 active:shadow-[1px_1px_0px_0px_rgba(0,0,0,1)] disabled:cursor-not-allowed disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={isDeleting}
            className="h-10 border-2 border-black bg-[#FB7185] px-5 font-mono text-xs font-black uppercase tracking-wider text-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] transition-all hover:-translate-x-0.5 hover:-translate-y-0.5 hover:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] active:translate-x-0 active:translate-y-0 active:shadow-[1px_1px_0px_0px_rgba(0,0,0,1)] disabled:cursor-not-allowed disabled:opacity-50"
          >
            {isDeleting ? "Deleting..." : "Delete job"}
          </button>
        </div>
      </div>
    </div>
  );
}
