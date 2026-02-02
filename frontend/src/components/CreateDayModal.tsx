"use client";

import { useState, DragEvent } from "react";
import { Button, Modal, Input } from "@/components/ui";

interface CreateDayModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (name: string | undefined, columns: string[]) => Promise<void>;
  weekNumber: number;
}

export function CreateDayModal({ isOpen, onClose, onSubmit, weekNumber }: CreateDayModalProps) {
  const [name, setName] = useState("");
  const [columns, setColumns] = useState<string[]>(["Exercise", "Sets", "Reps", "Weight"]);
  const [newColumn, setNewColumn] = useState("");
  const [creating, setCreating] = useState(false);
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);

  const handleAddColumn = () => {
    if (newColumn.trim() && !columns.includes(newColumn.trim())) {
      setColumns([...columns, newColumn.trim()]);
      setNewColumn("");
    }
  };

  const handleRemoveColumn = (index: number) => {
    setColumns(columns.filter((_, i) => i !== index));
  };

  const handleDragStart = (e: DragEvent<HTMLDivElement>, index: number) => {
    setDraggedIndex(index);
    e.dataTransfer.effectAllowed = "move";
  };

  const handleDragOver = (e: DragEvent<HTMLDivElement>, index: number) => {
    e.preventDefault();
    if (draggedIndex === null || draggedIndex === index) return;
    setDragOverIndex(index);
  };

  const handleDragLeave = () => {
    setDragOverIndex(null);
  };

  const handleDrop = (e: DragEvent<HTMLDivElement>, dropIndex: number) => {
    e.preventDefault();
    if (draggedIndex === null || draggedIndex === dropIndex) {
      setDraggedIndex(null);
      setDragOverIndex(null);
      return;
    }

    const newColumns = [...columns];
    const [draggedItem] = newColumns.splice(draggedIndex, 1);
    newColumns.splice(dropIndex, 0, draggedItem);
    setColumns(newColumns);
    setDraggedIndex(null);
    setDragOverIndex(null);
  };

  const handleDragEnd = () => {
    setDraggedIndex(null);
    setDragOverIndex(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (columns.length === 0) return;

    setCreating(true);
    try {
      await onSubmit(name.trim() || undefined, columns);
      setName("");
      setColumns(["Exercise", "Sets", "Reps", "Weight"]);
    } finally {
      setCreating(false);
    }
  };

  const handleClose = () => {
    setName("");
    setColumns(["Exercise", "Sets", "Reps", "Weight"]);
    setNewColumn("");
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title={`Add Day to Week ${weekNumber}`}>
      <form onSubmit={handleSubmit}>
        <Input
          label="Day Name (optional)"
          placeholder="e.g., Push Day, Upper Body"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />

        <div className="mt-4">
          <label className="block text-sm font-medium text-fg-400 mb-2">
            Columns <span className="text-fg-600 font-normal">(drag to reorder)</span>
          </label>

          {/* Column List */}
          <div className="flex flex-wrap gap-2 mb-3 min-h-[40px]">
            {columns.map((col, index) => (
              <div
                key={`${col}-${index}`}
                draggable
                onDragStart={(e) => handleDragStart(e, index)}
                onDragOver={(e) => handleDragOver(e, index)}
                onDragLeave={handleDragLeave}
                onDrop={(e) => handleDrop(e, index)}
                onDragEnd={handleDragEnd}
                className={`flex items-center gap-1 bg-bg-200 px-3 py-1.5 rounded-lg text-sm cursor-grab active:cursor-grabbing select-none transition-all ${
                  draggedIndex === index ? "opacity-50" : ""
                } ${dragOverIndex === index ? "ring-2 ring-accent" : ""}`}
              >
                <svg className="w-3 h-3 text-fg-600 mr-1" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M8 6a2 2 0 1 1-4 0 2 2 0 0 1 4 0zm0 6a2 2 0 1 1-4 0 2 2 0 0 1 4 0zm0 6a2 2 0 1 1-4 0 2 2 0 0 1 4 0zm8-12a2 2 0 1 1-4 0 2 2 0 0 1 4 0zm0 6a2 2 0 1 1-4 0 2 2 0 0 1 4 0zm0 6a2 2 0 1 1-4 0 2 2 0 0 1 4 0z" />
                </svg>
                <span className="text-fg">{col}</span>
                <button
                  type="button"
                  onClick={() => handleRemoveColumn(index)}
                  className="text-fg-500 hover:text-fg ml-1"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            ))}
          </div>

          {/* Add Column Input */}
          <div className="flex gap-2">
            <input
              type="text"
              placeholder="Add column..."
              value={newColumn}
              onChange={(e) => setNewColumn(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  handleAddColumn();
                }
              }}
              className="flex-1 px-3 py-2 bg-bg-200 border border-border rounded-lg text-fg text-sm placeholder:text-fg-600 focus:outline-none focus:border-accent"
            />
            <Button
              type="button"
              variant="secondary"
              onClick={handleAddColumn}
              disabled={!newColumn.trim()}
              className="w-auto px-4"
            >
              Add
            </Button>
          </div>
        </div>

        <div className="flex gap-3 mt-6">
          <Button type="button" variant="secondary" onClick={handleClose}>
            Cancel
          </Button>
          <Button type="submit" isLoading={creating} disabled={columns.length === 0}>
            Create Day
          </Button>
        </div>
      </form>
    </Modal>
  );
}
