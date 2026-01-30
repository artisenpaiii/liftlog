export interface Program {
  id: string;
  name: string;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}

export interface ProgramsResponse {
  programs: Program[];
}

export interface CreateProgramResponse {
  id: string;
}
