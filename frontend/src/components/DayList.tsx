"use client";

import { useState, DragEvent } from "react";
import { Button, AutoSaveInput, ConfirmModal, Modal, Input } from "@/components/ui";
import { days } from "@/lib/api";
import type { Day, DayRow, DayCell, DayColumn } from "@/types";

interface DayListProps {
  days: Day[];
  onAddDay: () => void;
  onDeleteDay: (dayId: string) => Promise<void>;
  onDayUpdate: (day: Day) => void;
}

export function DayList({ days: daysList, onAddDay, onDeleteDay, onDayUpdate }: DayListProps) {
  if (daysList.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-fg-500 mb-4">No days in this week</p>
        <Button variant="secondary" onClick={onAddDay} className="w-auto px-6">
          + Add Day
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {daysList.map((day) => (
        <DayTable
          key={day.id}
          day={day}
          onDeleteDay={onDeleteDay}
          onDayUpdate={onDayUpdate}
        />
      ))}
      <Button variant="secondary" onClick={onAddDay} className="w-full">
        + Add Day
      </Button>
    </div>
  );
}

interface DayTableProps {
  day: Day;
  onDeleteDay: (dayId: string) => Promise<void>;
  onDayUpdate: (day: Day) => void;
}

function DayTable({ day, onDeleteDay, onDayUpdate }: DayTableProps) {
  const [isAddingRow, setIsAddingRow] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showAddColumnModal, setShowAddColumnModal] = useState(false);
  const [newColumnName, setNewColumnName] = useState("");
  const [addingColumn, setAddingColumn] = useState(false);

  // Drag state for rows
  const [draggedRowIndex, setDraggedRowIndex] = useState<number | null>(null);
  const [dragOverRowIndex, setDragOverRowIndex] = useState<number | null>(null);

  // Drag state for columns
  const [draggedColIndex, setDraggedColIndex] = useState<number | null>(null);
  const [dragOverColIndex, setDragOverColIndex] = useState<number | null>(null);

  const columns = day.columns || [];
  const rows = day.rows || [];

  const handleAddRow = async () => {
    setIsAddingRow(true);
    try {
      const { row } = await days.addRow(day.id);
      const newRow: DayRow = { ...row, cells: columns.map((col) => ({ id: "", columnId: col.id, rowId: row.id, value: "", createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() })) };
      onDayUpdate({ ...day, rows: [...rows, newRow] });
    } catch (error) {
      console.error("Failed to add row:", error);
    } finally {
      setIsAddingRow(false);
    }
  };

  const handleDeleteRow = async (rowId: string) => {
    try {
      await days.deleteRow(rowId);
      onDayUpdate({ ...day, rows: rows.filter((r) => r.id !== rowId) });
    } catch (error) {
      console.error("Failed to delete row:", error);
    }
  };

  const handleUpdateCell = async (cellId: string, value: string) => {
    await days.updateCell(cellId, value);
    // Update local state
    const updatedRows = rows.map((row) => ({
      ...row,
      cells: row.cells?.map((cell) =>
        cell.id === cellId ? { ...cell, value } : cell
      ),
    }));
    onDayUpdate({ ...day, rows: updatedRows });
  };

  const handleUpsertCell = async (rowId: string, columnId: string, value: string) => {
    try {
      const { cell } = await days.upsertCell(rowId, columnId, value);
      // Update local state with the new cell
      const updatedRows = rows.map((row) => {
        if (row.id !== rowId) return row;
        const existingCellIndex = row.cells?.findIndex((c) => c.columnId === columnId) ?? -1;
        if (existingCellIndex >= 0) {
          return {
            ...row,
            cells: row.cells?.map((c) => (c.columnId === columnId ? cell : c)),
          };
        } else {
          return {
            ...row,
            cells: [...(row.cells || []), cell],
          };
        }
      });
      onDayUpdate({ ...day, rows: updatedRows });
    } catch (error) {
      console.error("Failed to upsert cell:", error);
    }
  };

  const handleUpdateColumn = async (columnId: string, name: string) => {
    await days.updateColumn(columnId, name);
    const updatedColumns = columns.map((col) =>
      col.id === columnId ? { ...col, name } : col
    );
    onDayUpdate({ ...day, columns: updatedColumns });
  };

  const handleUpdateDayName = async (name: string) => {
    await days.update(day.id, name || undefined);
    onDayUpdate({ ...day, name: name || null });
  };

  const handleAddColumn = async () => {
    if (!newColumnName.trim()) return;
    setAddingColumn(true);
    try {
      const { column } = await days.addColumn(day.id, newColumnName.trim());
      onDayUpdate({ ...day, columns: [...columns, column] });
      setNewColumnName("");
      setShowAddColumnModal(false);
    } catch (error) {
      console.error("Failed to add column:", error);
    } finally {
      setAddingColumn(false);
    }
  };

  const handleDeleteColumn = async (columnId: string) => {
    try {
      await days.deleteColumn(columnId);
      onDayUpdate({
        ...day,
        columns: columns.filter((col) => col.id !== columnId),
        rows: rows.map((row) => ({
          ...row,
          cells: row.cells?.filter((cell) => cell.columnId !== columnId),
        })),
      });
    } catch (error) {
      console.error("Failed to delete column:", error);
    }
  };

  // Row drag handlers
  const handleRowDragStart = (e: DragEvent<HTMLTableRowElement>, index: number) => {
    setDraggedRowIndex(index);
    e.dataTransfer.effectAllowed = "move";
  };

  const handleRowDragOver = (e: DragEvent<HTMLTableRowElement>, index: number) => {
    e.preventDefault();
    if (draggedRowIndex === null || draggedRowIndex === index) return;
    setDragOverRowIndex(index);
  };

  const handleRowDrop = async (e: DragEvent<HTMLTableRowElement>, dropIndex: number) => {
    e.preventDefault();
    if (draggedRowIndex === null || draggedRowIndex === dropIndex) {
      setDraggedRowIndex(null);
      setDragOverRowIndex(null);
      return;
    }

    const newRows = [...rows];
    const [draggedRow] = newRows.splice(draggedRowIndex, 1);
    newRows.splice(dropIndex, 0, draggedRow);

    // Update local state first
    onDayUpdate({ ...day, rows: newRows });

    // Then update server
    try {
      await days.reorderRow(draggedRow.id, dropIndex);
    } catch (error) {
      console.error("Failed to reorder row:", error);
    }

    setDraggedRowIndex(null);
    setDragOverRowIndex(null);
  };

  const handleRowDragEnd = () => {
    setDraggedRowIndex(null);
    setDragOverRowIndex(null);
  };

  // Column drag handlers
  const handleColDragStart = (e: DragEvent<HTMLTableHeaderCellElement>, index: number) => {
    setDraggedColIndex(index);
    e.dataTransfer.effectAllowed = "move";
  };

  const handleColDragOver = (e: DragEvent<HTMLTableHeaderCellElement>, index: number) => {
    e.preventDefault();
    if (draggedColIndex === null || draggedColIndex === index) return;
    setDragOverColIndex(index);
  };

  const handleColDrop = async (e: DragEvent<HTMLTableHeaderCellElement>, dropIndex: number) => {
    e.preventDefault();
    if (draggedColIndex === null || draggedColIndex === dropIndex) {
      setDraggedColIndex(null);
      setDragOverColIndex(null);
      return;
    }

    const newColumns = [...columns];
    const [draggedCol] = newColumns.splice(draggedColIndex, 1);
    newColumns.splice(dropIndex, 0, draggedCol);

    // Update local state first
    onDayUpdate({ ...day, columns: newColumns });

    // Then update server
    try {
      await days.reorderColumn(draggedCol.id, dropIndex);
    } catch (error) {
      console.error("Failed to reorder column:", error);
    }

    setDraggedColIndex(null);
    setDragOverColIndex(null);
  };

  const handleColDragEnd = () => {
    setDraggedColIndex(null);
    setDragOverColIndex(null);
  };

  // Helper to get cell value for a specific row and column
  const getCellForColumn = (row: DayRow, columnId: string): DayCell | undefined => {
    return row.cells?.find((cell) => cell.columnId === columnId);
  };

  return (
    <div className="bg-bg-200 rounded-lg overflow-hidden">
      {/* Day Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-border">
        <h4 className="font-medium text-fg flex items-center gap-2">
          Day {day.dayNumber}
          <span className="text-fg-400 font-normal">-</span>
          <AutoSaveInput
            initialValue={day.name || ""}
            onSave={handleUpdateDayName}
            placeholder="Day name"
            className="text-fg-400 font-normal"
          />
        </h4>
        <button
          onClick={() => setShowDeleteConfirm(true)}
          className="p-1.5 rounded-md text-fg-500 hover:text-red-500 hover:bg-red-500/10 transition-colors"
          title="Delete day"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
          </svg>
        </button>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border">
              {/* Drag handle column */}
              <th className="w-8 bg-bg-300"></th>
              {columns.map((col, colIndex) => (
                <th
                  key={col.id}
                  draggable
                  onDragStart={(e) => handleColDragStart(e, colIndex)}
                  onDragOver={(e) => handleColDragOver(e, colIndex)}
                  onDrop={(e) => handleColDrop(e, colIndex)}
                  onDragEnd={handleColDragEnd}
                  onDragLeave={() => setDragOverColIndex(null)}
                  className={`px-3 py-2 text-left text-fg-400 font-medium bg-bg-300 cursor-grab active:cursor-grabbing group/col ${
                    draggedColIndex === colIndex ? "opacity-50" : ""
                  } ${dragOverColIndex === colIndex ? "ring-2 ring-accent ring-inset" : ""}`}
                >
                  <div className="flex items-center gap-1">
                    <svg className="w-3 h-3 text-fg-600 flex-shrink-0" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M8 6a2 2 0 1 1-4 0 2 2 0 0 1 4 0zm0 6a2 2 0 1 1-4 0 2 2 0 0 1 4 0zm0 6a2 2 0 1 1-4 0 2 2 0 0 1 4 0zm8-12a2 2 0 1 1-4 0 2 2 0 0 1 4 0zm0 6a2 2 0 1 1-4 0 2 2 0 0 1 4 0zm0 6a2 2 0 1 1-4 0 2 2 0 0 1 4 0z" />
                    </svg>
                    <AutoSaveInput
                      initialValue={col.name}
                      onSave={(name) => handleUpdateColumn(col.id, name)}
                      className="font-medium flex-1"
                    />
                    <button
                      onClick={() => handleDeleteColumn(col.id)}
                      className="opacity-0 group-hover/col:opacity-100 p-0.5 text-fg-500 hover:text-red-500 transition-all"
                      title="Delete column"
                    >
                      <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                </th>
              ))}
              {/* Add column button */}
              <th className="w-10 bg-bg-300">
                <button
                  onClick={() => setShowAddColumnModal(true)}
                  className="w-full py-2 text-fg-500 hover:text-fg transition-colors"
                  title="Add column"
                >
                  +
                </button>
              </th>
              {/* Delete row column */}
              <th className="w-10 bg-bg-300"></th>
            </tr>
          </thead>
          <tbody>
            {rows.length > 0 ? (
              rows.map((row, rowIndex) => (
                <tr
                  key={row.id}
                  draggable
                  onDragStart={(e) => handleRowDragStart(e, rowIndex)}
                  onDragOver={(e) => handleRowDragOver(e, rowIndex)}
                  onDrop={(e) => handleRowDrop(e, rowIndex)}
                  onDragEnd={handleRowDragEnd}
                  onDragLeave={() => setDragOverRowIndex(null)}
                  className={`border-b border-border last:border-0 group cursor-grab active:cursor-grabbing ${
                    draggedRowIndex === rowIndex ? "opacity-50" : ""
                  } ${dragOverRowIndex === rowIndex ? "bg-accent/10" : ""}`}
                >
                  {/* Drag handle */}
                  <td className="w-8 px-2">
                    <svg className="w-3 h-3 text-fg-600 mx-auto" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M8 6a2 2 0 1 1-4 0 2 2 0 0 1 4 0zm0 6a2 2 0 1 1-4 0 2 2 0 0 1 4 0zm0 6a2 2 0 1 1-4 0 2 2 0 0 1 4 0zm8-12a2 2 0 1 1-4 0 2 2 0 0 1 4 0zm0 6a2 2 0 1 1-4 0 2 2 0 0 1 4 0zm0 6a2 2 0 1 1-4 0 2 2 0 0 1 4 0z" />
                    </svg>
                  </td>
                  {columns.map((col) => {
                    const cell = getCellForColumn(row, col.id);
                    return (
                      <td key={col.id} className="px-3 py-2 text-fg">
                        {cell && cell.id ? (
                          <AutoSaveInput
                            initialValue={cell.value}
                            onSave={(value) => handleUpdateCell(cell.id, value)}
                            placeholder=""
                          />
                        ) : (
                          <AutoSaveInput
                            initialValue=""
                            onSave={(value) => handleUpsertCell(row.id, col.id, value)}
                            placeholder=""
                          />
                        )}
                      </td>
                    );
                  })}
                  {/* Empty cell for add column */}
                  <td className="w-10"></td>
                  {/* Delete row button */}
                  <td className="w-10">
                    <button
                      onClick={() => handleDeleteRow(row.id)}
                      className="opacity-0 group-hover:opacity-100 w-full py-2 text-red-500 hover:text-red-400 transition-all"
                      title="Delete row"
                    >
                      ×
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={columns.length + 3} className="px-3 py-4 text-center text-fg-500">
                  No rows yet
                </td>
              </tr>
            )}
            {/* Add Row Button */}
            <tr>
              <td colSpan={columns.length + 3} className="p-0">
                <button
                  onClick={handleAddRow}
                  disabled={isAddingRow}
                  className="w-full py-2 text-fg-500 hover:text-fg hover:bg-bg-300 transition-colors text-sm disabled:opacity-50"
                >
                  {isAddingRow ? "Adding..." : "+ Add Row"}
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      {/* Delete Day Confirmation Modal */}
      <ConfirmModal
        isOpen={showDeleteConfirm}
        onClose={() => setShowDeleteConfirm(false)}
        onConfirm={async () => {
          await onDeleteDay(day.id);
          setShowDeleteConfirm(false);
        }}
        title="Delete Day"
        message={`Are you sure you want to delete Day ${day.dayNumber}${day.name ? ` (${day.name})` : ""}? This will delete all rows and data.`}
        confirmText="Delete"
        variant="danger"
      />

      {/* Add Column Modal */}
      <Modal
        isOpen={showAddColumnModal}
        onClose={() => {
          setShowAddColumnModal(false);
          setNewColumnName("");
        }}
        title="Add Column"
      >
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleAddColumn();
          }}
        >
          <Input
            label="Column Name"
            placeholder="e.g., RPE, Notes"
            value={newColumnName}
            onChange={(e) => setNewColumnName(e.target.value)}
            autoFocus
          />
          <div className="flex gap-3 mt-6">
            <Button
              type="button"
              variant="secondary"
              onClick={() => {
                setShowAddColumnModal(false);
                setNewColumnName("");
              }}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              isLoading={addingColumn}
              disabled={!newColumnName.trim()}
            >
              Add
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
