export default function Loading() {
  return (
    <main className="min-h-screen bg-[#f4f3ef] px-4 py-10 text-black font-sans">
      <div className="mx-auto max-w-7xl animate-pulse">
        <header className="mb-12 flex flex-col gap-6 md:flex-row md:items-end md:justify-between border-b-4 border-black pb-8">
          <div>
            <div className="inline-block border-4 border-black bg-zinc-300 px-6 py-2 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] -rotate-1 transform">
              <div className="h-8 w-48 bg-zinc-400" />
            </div>
            <div className="mt-6 h-4 w-60 bg-zinc-300" />
          </div>
          <div className="h-12 w-44 border-3 border-black bg-zinc-300 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]" />
        </header>

        <section className="grid gap-6 sm:grid-cols-2 lg:grid-cols-5">
          {Array.from({ length: 5 }).map((_, index) => (
            <div
              // eslint-disable-next-line react/no-array-index-key
              key={index}
              className="min-h-[500px] border-3 border-black p-4 bg-white shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]"
            >
              {/* Column Title Sticker Skeleton */}
              <div className="mb-6 flex items-center justify-between border-2 border-black p-2.5 bg-zinc-200 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
                <div className="h-4 w-20 bg-zinc-300" />
                <div className="h-4 w-6 bg-zinc-300" />
              </div>

              <div className="space-y-4">
                <div className="border-3 border-black p-4 bg-zinc-100 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] h-40" />
                <div className="border-3 border-black p-4 bg-zinc-100 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] h-32" />
              </div>
            </div>
          ))}
        </section>
      </div>
    </main>
  );
}
