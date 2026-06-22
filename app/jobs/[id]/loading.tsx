export default function JobDetailLoading() {
  return (
    <main className="min-h-screen bg-background px-4 py-10 text-foreground sm:px-6 lg:px-8 font-sans">
      <div className="mx-auto max-w-6xl animate-pulse">
        <div className="mb-8">
          <div className="h-10 w-36 border-2 border-border-custom bg-zinc-300 shadow-[3px_3px_0px_0px_var(--shadow-color)] dark:bg-zinc-700" />
        </div>

        <div className="border-0 bg-transparent p-0 sm:border-4 sm:border-border-custom sm:bg-background sm:p-6 sm:shadow-[8px_8px_0px_0px_var(--shadow-color)] md:p-8">
          <div className="mb-8 flex flex-col gap-5 border-b-4 border-border-custom pb-6">
            <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
              <div>
                <div className="mb-3 h-7 w-28 border-2 border-border-custom bg-zinc-300 shadow-[2px_2px_0px_0px_var(--shadow-color)] dark:bg-zinc-700" />
                <div className="h-10 w-72 max-w-full bg-zinc-300 dark:bg-zinc-700" />
                <div className="mt-3 h-5 w-44 bg-zinc-300 dark:bg-zinc-700" />
              </div>

              <div className="flex gap-3">
                <div className="h-10 w-20 border-2 border-border-custom bg-zinc-300 shadow-[2px_2px_0px_0px_var(--shadow-color)] dark:bg-zinc-700" />
                <div className="h-10 w-24 border-2 border-border-custom bg-zinc-300 shadow-[2px_2px_0px_0px_var(--shadow-color)] dark:bg-zinc-700" />
              </div>
            </div>

            <div className="flex flex-wrap gap-3">
              <div className="h-8 w-40 bg-zinc-300 dark:bg-zinc-700" />
              <div className="h-8 w-36 bg-zinc-300 dark:bg-zinc-700" />
              <div className="h-8 w-52 bg-zinc-300 dark:bg-zinc-700" />
            </div>
          </div>

          <div className="grid gap-8 md:grid-cols-3">
            <div className="md:col-span-2">
              <div className="min-h-[240px] border-2 border-border-custom bg-card p-5 shadow-[3px_3px_0px_0px_var(--shadow-color)]">
                <div className="mb-5 h-4 w-44 bg-zinc-300 dark:bg-zinc-700" />
                <div className="space-y-3">
                  <div className="h-4 w-full bg-zinc-300 dark:bg-zinc-700" />
                  <div className="h-4 w-11/12 bg-zinc-300 dark:bg-zinc-700" />
                  <div className="h-4 w-3/4 bg-zinc-300 dark:bg-zinc-700" />
                </div>
              </div>
            </div>

            <div className="space-y-6">
              <div className="min-h-44 border-2 border-border-custom bg-card p-5 shadow-[3px_3px_0px_0px_var(--shadow-color)]">
                <div className="mb-5 h-4 w-40 bg-zinc-300 dark:bg-zinc-700" />
                <div className="space-y-3">
                  <div className="h-14 border-2 border-border-custom bg-zinc-200 dark:bg-zinc-800" />
                  <div className="h-14 border-2 border-border-custom bg-zinc-200 dark:bg-zinc-800" />
                </div>
              </div>

              <div className="min-h-36 border-2 border-border-custom bg-card p-5 shadow-[3px_3px_0px_0px_var(--shadow-color)]">
                <div className="mb-5 h-4 w-36 bg-zinc-300 dark:bg-zinc-700" />
                <div className="h-5 w-48 bg-zinc-300 dark:bg-zinc-700" />
                <div className="mt-4 h-9 w-full border-2 border-border-custom bg-zinc-300 dark:bg-zinc-700" />
              </div>
            </div>
          </div>

          <div className="mt-8 min-h-[160px] border-2 border-border-custom bg-card p-5 shadow-[3px_3px_0px_0px_var(--shadow-color)]">
            <div className="mb-5 h-4 w-40 bg-zinc-300 dark:bg-zinc-700" />
            <div className="space-y-3">
              <div className="h-4 w-full bg-zinc-300 dark:bg-zinc-700" />
              <div className="h-4 w-10/12 bg-zinc-300 dark:bg-zinc-700" />
              <div className="h-4 w-2/3 bg-zinc-300 dark:bg-zinc-700" />
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
