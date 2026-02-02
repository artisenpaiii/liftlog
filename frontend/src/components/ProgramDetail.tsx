"use client";

import { useState } from "react";
import { Button, Modal, Input } from "@/components/ui";
import { BlockList } from "./BlockList";
import { BlockPanel } from "./BlockPanel";
import { blocks as blocksApi } from "@/lib/api";
import type { ProgramDetail as ProgramDetailType, Block } from "@/types";

interface ProgramDetailProps {
  program: ProgramDetailType;
}

export function ProgramDetail({ program: initialProgram }: ProgramDetailProps) {
  const [program, setProgram] = useState(initialProgram);
  const [selectedBlock, setSelectedBlock] = useState<Block | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [blockName, setBlockName] = useState("");
  const [creating, setCreating] = useState(false);

  const hasBlocks = program.blocks.length > 0;

  const handleCreateBlock = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!blockName.trim()) return;

    setCreating(true);
    try {
      const { block } = await blocksApi.create(program.id, blockName.trim());
      const newBlock = { ...block, weeks: [] };
      setProgram((prev) => ({
        ...prev,
        blocks: [...prev.blocks, newBlock],
      }));
      setSelectedBlock(newBlock);
      setBlockName("");
      setIsModalOpen(false);
    } catch (error) {
      console.error("Failed to create block:", error);
    } finally {
      setCreating(false);
    }
  };

  const handleBlockUpdate = (updatedBlock: Block) => {
    setProgram((prev) => ({
      ...prev,
      blocks: prev.blocks.map((b) => (b.id === updatedBlock.id ? updatedBlock : b)),
    }));
    setSelectedBlock(updatedBlock);
  };

  const handleBlockRename = async (blockId: string, name: string) => {
    try {
      const { block } = await blocksApi.rename(blockId, name);
      setProgram((prev) => ({
        ...prev,
        blocks: prev.blocks.map((b) =>
          b.id === blockId ? { ...b, name: block.name } : b
        ),
      }));
      if (selectedBlock?.id === blockId) {
        setSelectedBlock((prev) => (prev ? { ...prev, name: block.name } : null));
      }
    } catch (error) {
      console.error("Failed to rename block:", error);
    }
  };

  const handleBlockDelete = async (blockId: string) => {
    try {
      await blocksApi.delete(blockId);
      setProgram((prev) => ({
        ...prev,
        blocks: prev.blocks.filter((b) => b.id !== blockId),
      }));
      if (selectedBlock?.id === blockId) {
        setSelectedBlock(null);
      }
    } catch (error) {
      console.error("Failed to delete block:", error);
    }
  };

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-semibold text-fg">{program.name}</h1>
      </div>

      {/* Empty State */}
      {!hasBlocks ? (
        <div className="flex flex-col items-center justify-center flex-1">
          <div className="text-center">
            <svg className="w-16 h-16 mx-auto mb-4 text-fg-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
              />
            </svg>
            <p className="text-fg-500 mb-6">No blocks yet. Create your first training block!</p>
            <Button onClick={() => setIsModalOpen(true)} className="w-auto px-8">
              Create Block
            </Button>
          </div>
        </div>
      ) : (
        /* Split Layout */
        <div className="flex-1 grid grid-cols-[280px_1fr] gap-6 min-h-0">
          {/* Left: Block List */}
          <div className="overflow-y-auto">
            <BlockList
              blocks={program.blocks}
              selectedBlockId={selectedBlock?.id ?? null}
              onBlockSelect={setSelectedBlock}
              onAddBlock={() => setIsModalOpen(true)}
              onBlockRename={handleBlockRename}
              onBlockDelete={handleBlockDelete}
            />
          </div>

          {/* Right: Block Details */}
          <div className="overflow-hidden">
            {selectedBlock ? (
              <BlockPanel block={selectedBlock} onBlockUpdate={handleBlockUpdate} />
            ) : (
              <div className="h-full flex items-center justify-center bg-bg-100 rounded-lg border border-border">
                <p className="text-fg-500">Select a block to view details</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Create Block Modal */}
      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Create Block">
        <form onSubmit={handleCreateBlock}>
          <Input
            label="Block Name"
            placeholder="e.g., Hypertrophy Phase"
            value={blockName}
            onChange={(e) => setBlockName(e.target.value)}
            autoFocus
          />
          <div className="flex gap-3 mt-6">
            <Button type="button" variant="secondary" onClick={() => setIsModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" isLoading={creating} disabled={!blockName.trim()}>
              Create
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
