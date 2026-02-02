"use client";

import { useState } from "react";
import { Button, DropdownMenu, ConfirmModal, AutoSaveInput } from "@/components/ui";
import type { Block } from "@/types";

interface BlockListProps {
  blocks: Block[];
  selectedBlockId: string | null;
  onBlockSelect: (block: Block) => void;
  onAddBlock: () => void;
  onBlockRename: (blockId: string, name: string) => Promise<void>;
  onBlockDelete: (blockId: string) => Promise<void>;
}

export function BlockList({
  blocks,
  selectedBlockId,
  onBlockSelect,
  onAddBlock,
  onBlockRename,
  onBlockDelete,
}: BlockListProps) {
  const [editingBlockId, setEditingBlockId] = useState<string | null>(null);
  const [deleteBlockId, setDeleteBlockId] = useState<string | null>(null);

  const blockToDelete = deleteBlockId ? blocks.find((b) => b.id === deleteBlockId) : null;

  return (
    <div className="flex flex-col gap-3">
      {blocks.map((block) => (
        <div
          key={block.id}
          onClick={() => onBlockSelect(block)}
          className={`bg-bg-100 border rounded-lg p-4 cursor-pointer transition-all hover:border-accent ${
            selectedBlockId === block.id ? "border-accent bg-accent/5" : "border-border"
          }`}
        >
          <div className="flex items-start justify-between gap-2">
            <div className="flex-1 min-w-0">
              {editingBlockId === block.id ? (
                <AutoSaveInput
                  initialValue={block.name}
                  onSave={async (name) => {
                    await onBlockRename(block.id, name);
                  }}
                  onBlur={() => setEditingBlockId(null)}
                  className="font-medium"
                  autoFocus
                  saveOnlyOnBlur
                />
              ) : (
                <h3 className="font-medium text-fg truncate">{block.name}</h3>
              )}
              <p className="text-sm text-fg-500 mt-1">
                {block.weeks.length} {block.weeks.length === 1 ? "week" : "weeks"}
              </p>
            </div>
            <DropdownMenu
              items={[
                {
                  label: "Rename",
                  onClick: () => setEditingBlockId(block.id),
                  icon: (
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                    </svg>
                  ),
                },
                {
                  label: "Delete",
                  onClick: () => setDeleteBlockId(block.id),
                  variant: "danger",
                  icon: (
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  ),
                },
              ]}
            />
          </div>
        </div>
      ))}
      <Button variant="secondary" onClick={onAddBlock} className="w-full">
        + Add Block
      </Button>

      <ConfirmModal
        isOpen={!!deleteBlockId}
        onClose={() => setDeleteBlockId(null)}
        onConfirm={async () => {
          if (deleteBlockId) {
            await onBlockDelete(deleteBlockId);
            setDeleteBlockId(null);
          }
        }}
        title="Delete Block"
        message={`Are you sure you want to delete "${blockToDelete?.name}"? This will also delete all weeks and days within this block.`}
        confirmText="Delete"
        variant="danger"
      />
    </div>
  );
}
