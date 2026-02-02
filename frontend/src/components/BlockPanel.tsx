"use client";

import { useState } from "react";
import { Button, Modal } from "@/components/ui";
import { WeekTabs } from "./WeekTabs";
import { DayList } from "./DayList";
import { CreateDayModal } from "./CreateDayModal";
import { weeks as weeksApi, days as daysApi } from "@/lib/api";
import type { Block, Week, Day } from "@/types";

interface BlockPanelProps {
  block: Block;
  onBlockUpdate: (block: Block) => void;
}

export function BlockPanel({ block, onBlockUpdate }: BlockPanelProps) {
  const [selectedWeekIndex, setSelectedWeekIndex] = useState(0);
  const [isWeekModalOpen, setIsWeekModalOpen] = useState(false);
  const [isDayModalOpen, setIsDayModalOpen] = useState(false);
  const [creatingWeek, setCreatingWeek] = useState(false);

  const currentWeek = block.weeks[selectedWeekIndex];

  const handleAddWeek = async () => {
    setCreatingWeek(true);
    try {
      const { week } = await weeksApi.create(block.id);
      const newWeek: Week = { ...week, days: [] };
      const updatedBlock = {
        ...block,
        weeks: [...block.weeks, newWeek],
      };
      onBlockUpdate(updatedBlock);
      setSelectedWeekIndex(updatedBlock.weeks.length - 1);
      setIsWeekModalOpen(false);
    } catch (error) {
      console.error("Failed to create week:", error);
    } finally {
      setCreatingWeek(false);
    }
  };

  const handleAddDay = async (name: string | undefined, columns: string[]) => {
    if (!currentWeek) return;

    const { day } = await daysApi.create(currentWeek.id, columns, name);
    const newDay: Day = { ...day };

    const updatedWeeks = block.weeks.map((w, i) =>
      i === selectedWeekIndex ? { ...w, days: [...w.days, newDay] } : w
    );

    onBlockUpdate({ ...block, weeks: updatedWeeks });
    setIsDayModalOpen(false);
  };

  const handleDeleteWeek = async (weekId: string) => {
    try {
      await weeksApi.delete(weekId);
      const updatedWeeks = block.weeks.filter((w) => w.id !== weekId);
      onBlockUpdate({ ...block, weeks: updatedWeeks });

      // Adjust selected index if needed
      if (selectedWeekIndex >= updatedWeeks.length && updatedWeeks.length > 0) {
        setSelectedWeekIndex(updatedWeeks.length - 1);
      } else if (updatedWeeks.length === 0) {
        setSelectedWeekIndex(0);
      }
    } catch (error) {
      console.error("Failed to delete week:", error);
    }
  };

  const handleDeleteDay = async (dayId: string) => {
    try {
      await daysApi.delete(dayId);
      const updatedWeeks = block.weeks.map((w, i) =>
        i === selectedWeekIndex
          ? { ...w, days: w.days.filter((d) => d.id !== dayId) }
          : w
      );
      onBlockUpdate({ ...block, weeks: updatedWeeks });
    } catch (error) {
      console.error("Failed to delete day:", error);
    }
  };

  const handleDayUpdate = (updatedDay: Day) => {
    const updatedWeeks = block.weeks.map((w, i) =>
      i === selectedWeekIndex
        ? { ...w, days: w.days.map((d) => (d.id === updatedDay.id ? updatedDay : d)) }
        : w
    );
    onBlockUpdate({ ...block, weeks: updatedWeeks });
  };

  return (
    <div className="h-full flex flex-col bg-bg-100 rounded-lg border border-border">
      {/* Header */}
      <div className="p-4 border-b border-border">
        <h2 className="text-lg font-semibold text-fg">{block.name}</h2>
      </div>

      {/* Week Tabs */}
      <WeekTabs
        weeks={block.weeks}
        selectedIndex={selectedWeekIndex}
        onSelectWeek={setSelectedWeekIndex}
        onAddWeek={() => setIsWeekModalOpen(true)}
        onDeleteWeek={handleDeleteWeek}
      />

      {/* Days Content */}
      <div className="flex-1 overflow-y-auto p-4">
        {currentWeek ? (
          <DayList
            days={currentWeek.days}
            onAddDay={() => setIsDayModalOpen(true)}
            onDeleteDay={handleDeleteDay}
            onDayUpdate={handleDayUpdate}
          />
        ) : (
          <div className="flex flex-col items-center justify-center h-full text-center">
            <p className="text-fg-500 mb-4">Add a week to get started</p>
          </div>
        )}
      </div>

      {/* Create Week Modal */}
      <Modal isOpen={isWeekModalOpen} onClose={() => setIsWeekModalOpen(false)} title="Add Week">
        <p className="text-fg-400 mb-6">
          Add Week {block.weeks.length + 1} to {block.name}?
        </p>
        <div className="flex gap-3">
          <Button type="button" variant="secondary" onClick={() => setIsWeekModalOpen(false)}>
            Cancel
          </Button>
          <Button onClick={handleAddWeek} isLoading={creatingWeek}>
            Add Week
          </Button>
        </div>
      </Modal>

      {/* Create Day Modal */}
      {currentWeek && (
        <CreateDayModal
          isOpen={isDayModalOpen}
          onClose={() => setIsDayModalOpen(false)}
          onSubmit={handleAddDay}
          weekNumber={currentWeek.weekNumber}
        />
      )}
    </div>
  );
}
