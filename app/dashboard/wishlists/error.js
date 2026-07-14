"use client";

export default function Error({ error, reset }) {
  return (
    <div className="flex flex-col items-center justify-center min-h-[50vh] text-center px-4">
      <h2 className="text-lg font-semibold text-gray-900 mb-2">Something went wrong</h2>
      <p className="text-sm text-gray-500 mb-4">{error?.message || "Please try again."}</p>
      <button
        onClick={() => reset()}
        className="px-4 py-2 rounded-lg bg-primary text-white hover:brightness-90"
      >
        Try again
      </button>
    </div>
  );
}
