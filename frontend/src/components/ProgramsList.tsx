"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button, Modal, Input } from "@/components/ui";
import { programs as programsApi } from "@/lib/api";
import type { Program } from "@/types";

interface ProgramsListProps {
  initialPrograms: Program[];
}

export function ProgramsList({ initialPrograms }: ProgramsListProps) {
  const router = useRouter();
  const [programs, setPrograms] = useState<Program[]>(initialPrograms);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newProgramName, setNewProgramName] = useState("");
  const [creating, setCreating] = useState(false);

  const handleCreateProgram = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newProgramName.trim()) return;

    setCreating(true);
    try {
      await programsApi.create(newProgramName.trim());
      setNewProgramName("");
      setIsModalOpen(false);
      const response = await programsApi.getAll();
      setPrograms(response.programs);
    } catch (error) {
      console.error("Failed to create program:", error);
    } finally {
      setCreating(false);
    }
  };

  const handleProgramClick = (programId: string) => {
    router.push(`/program/${programId}`);
  };

  return (
    <div className="h-full">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-semibold text-fg">Programs</h1>
        {programs.length > 0 && (
          <Button onClick={() => setIsModalOpen(true)} className="w-auto max-w-2xs px-6">
            New Program
          </Button>
        )}
      </div>

      {programs.length === 0 ? (
        <div className="flex flex-col items-center justify-center h-[calc(100vh-200px)]">
          <div className="text-center">
            <svg className="w-16 h-16 mx-auto mb-4 text-fg-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
              />
            </svg>
            <p className="text-fg-500 mb-6">No programs yet. Create your first training program!</p>
            <Button onClick={() => setIsModalOpen(true)} className="w-auto px-8">
              Create Program
            </Button>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {programs.map((program) => (
            <div
              key={program.id}
              onClick={() => handleProgramClick(program.id)}
              className="bg-bg-100 border border-border rounded-lg p-6 hover:border-accent transition-colors cursor-pointer group"
            >
              <div className="flex items-start gap-4">
                <div className="p-3 bg-bg-200 rounded-lg group-hover:bg-accent/10 transition-colors">
                  <svg className="w-6 h-6 text-accent" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01"
                    />
                  </svg>
                </div>
                <div className="flex-1 min-w-0">
                  <h2 className="text-lg font-medium text-fg truncate">{program.name}</h2>
                  <p className="text-sm text-fg-500 mt-1">Created {new Date(program.createdAt).toLocaleDateString()}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Create Program">
        <form onSubmit={handleCreateProgram}>
          <Input
            label="Program Name"
            placeholder="e.g., Strength Training"
            value={newProgramName}
            onChange={(e) => setNewProgramName(e.target.value)}
            autoFocus
          />
          <div className="flex gap-3 mt-6">
            <Button type="button" variant="secondary" onClick={() => setIsModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" isLoading={creating} disabled={!newProgramName.trim()}>
              Create
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
