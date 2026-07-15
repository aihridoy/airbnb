"use client";

export default function Error({ error, reset }) {
  return (
    <div className="flex flex-col items-center justify-center min-h-[50vh] text-center px-4">
      <h2 className="font-serif text-lg text-ink mb-2">Something went wrong</h2>
      <p className="text-sm text-muted mb-4">{error?.message || "Please try again."}</p>
      <button
        onClick={() => reset()}
        className="px-4 py-2 rounded-lg bg-brass-dark text-cream hover:bg-brass transition-colors"
      >
        Try again
      </button>
    </div>
  );
}
