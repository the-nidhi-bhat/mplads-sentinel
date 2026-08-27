"use client";

import { useEffect } from "react";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Global app error caught:", error);
  }, [error]);

  return (
    <div className="flex min-h-screen flex-col items-center justify-center p-24 text-center">
      <h2 className="mb-4 text-2xl font-bold text-red-600">Something went wrong!</h2>
      <p className="mb-8 font-mono text-sm text-gray-500 max-w-xl text-left bg-gray-100 p-4 rounded-md overflow-auto">
        {error.message}
      </p>
      <button
        onClick={() => reset()}
        className="rounded-md bg-navy px-4 py-2 text-white hover:bg-navy-light"
      >
        Try again
      </button>
    </div>
  );
}
