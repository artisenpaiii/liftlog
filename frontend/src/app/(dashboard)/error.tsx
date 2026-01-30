"use client";

import { Button } from "@/components/ui";

export default function DashboardError({
  error,
  reset,
}: {
  error: Error;
  reset: () => void;
}) {
  return (
    <div className="h-full flex items-center justify-center">
      <div className="text-center">
        <h2 className="text-xl font-semibold text-fg mb-2">Something went wrong</h2>
        <p className="text-fg-500 mb-6">{error.message || "Failed to load data"}</p>
        <Button onClick={reset} className="w-auto px-6">
          Try again
        </Button>
      </div>
    </div>
  );
}
