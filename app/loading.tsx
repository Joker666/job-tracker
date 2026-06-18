export default function Loading() {
  return (
    <main className="min-h-screen bg-zinc-50 px-4 py-8 text-zinc-950 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <div className="mb-8 flex items-end justify-between">
          <div>
            <div className="h-8 w-48 rounded-md bg-zinc-200" />
            <div className="mt-3 h-4 w-80 max-w-full rounded-md bg-zinc-200" />
          </div>
          <div className="h-10 w-44 rounded-md bg-zinc-200" />
        </div>
        <section className="grid gap-4 lg:grid-cols-5">
          {Array.from({ length: 5 }).map((_, index) => (
            <div
              // eslint-disable-next-line react/no-array-index-key
              key={index}
              className="min-h-48 rounded-lg border border-zinc-200 bg-zinc-100/60 p-3"
            >
              <div className="mb-4 h-4 w-24 rounded-md bg-zinc-200" />
              <div className="space-y-3">
                <div className="h-36 rounded-lg bg-white shadow-sm" />
                <div className="h-28 rounded-lg bg-white shadow-sm" />
              </div>
            </div>
          ))}
        </section>
      </div>
    </main>
  );
}
