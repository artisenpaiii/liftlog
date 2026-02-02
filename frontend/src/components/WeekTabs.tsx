"use client";

import { useState } from "react";
import { ConfirmModal } from "@/components/ui";
import type { Week } from "@/types";

interface WeekTabsProps {
  weeks: Week[];
  selectedIndex: number;
  onSelectWeek: (index: number) => void;
  onAddWeek: () => void;
  onDeleteWeek: (weekId: string) => Promise<void>;
}

export function WeekTabs({ weeks, selectedIndex, onSelectWeek, onAddWeek, onDeleteWeek }: WeekTabsProps) {
  const [deleteWeekId, setDeleteWeekId] = useState<string | null>(null);

  const weekToDelete = deleteWeekId ? weeks.find((w) => w.id === deleteWeekId) : null;

  return (
    <>
      <div className="flex items-center gap-2 p-4 border-b border-border overflow-x-auto">
        {weeks.length > 0 ? (
          weeks.map((week, index) => (
            <div key={week.id} className="relative group">
              <button
                onClick={() => onSelectWeek(index)}
                className={`px-4 py-2 pr-7 rounded-lg text-sm font-medium transition-colors whitespace-nowrap ${
                  selectedIndex === index
                    ? "bg-accent text-white"
                    : "bg-bg-200 text-fg-400 hover:text-fg hover:bg-bg-300"
                }`}
              >
                Week {week.weekNumber}
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setDeleteWeekId(week.id);
                }}
                className={`absolute right-1.5 top-1/2 -translate-y-1/2 p-0.5 rounded opacity-0 group-hover:opacity-100 transition-opacity ${
                  selectedIndex === index
                    ? "text-white/70 hover:text-white hover:bg-white/20"
                    : "text-fg-500 hover:text-fg hover:bg-bg-300"
                }`}
                title="Delete week"
              >
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          ))
        ) : (
          <p className="text-fg-500 text-sm">No weeks yet</p>
        )}
        <button
          onClick={onAddWeek}
          className="px-3 py-2 rounded-lg text-sm font-medium text-fg-400 hover:text-fg hover:bg-bg-200 transition-colors whitespace-nowrap"
        >
          +
        </button>
      </div>

      <ConfirmModal
        isOpen={!!deleteWeekId}
        onClose={() => setDeleteWeekId(null)}
        onConfirm={async () => {
          if (deleteWeekId) {
            await onDeleteWeek(deleteWeekId);
            setDeleteWeekId(null);
          }
        }}
        title="Delete Week"
        message={`Are you sure you want to delete Week ${weekToDelete?.weekNumber}? This will also delete all days within this week.`}
        confirmText="Delete"
        variant="danger"
      />
    </>
  );
}
