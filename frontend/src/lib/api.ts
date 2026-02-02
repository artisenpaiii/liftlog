import type { AuthResponse, ProfileResponse } from "@/types/auth";
import type { ProgramsResponse, CreateProgramResponse, Block, Week, Day, DayRow, DayCell, DayColumn } from "@/types/program";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";

export class ApiError extends Error {
  constructor(
    public status: number,
    message: string,
    public field?: string,
  ) {
    super(message);
    this.name = "ApiError";
  }
}

export async function api<T>(endpoint: string, options?: RequestInit): Promise<T> {
  const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
  const hasBody = options?.body !== undefined;

  const headers: Record<string, string> = {
    ...(token && { Authorization: `Bearer ${token}` }),
    ...(hasBody && { "Content-Type": "application/json" }),
  };

  const res = await fetch(`${API_URL}${endpoint}`, {
    ...options,
    headers: {
      ...headers,
      ...options?.headers,
    },
  });

  if (!res.ok) {
    const error = await res.json().catch(() => ({ error: "Request failed" }));
    throw new ApiError(res.status, error.error || "Request failed", error.field);
  }

  // Handle 204 No Content responses
  if (res.status === 204 || res.headers.get("content-length") === "0") {
    return undefined as T;
  }

  return res.json();
}

export function setToken(token: string) {
  document.cookie = `token=${token}; path=/; max-age=${60 * 60 * 24 * 7}`; // 7 days
  localStorage.setItem("token", token);
}

export function removeToken() {
  document.cookie = "token=; path=/; max-age=0";
  localStorage.removeItem("token");
}

export const auth = {
  login: (email: string, password: string) =>
    api<AuthResponse>("/api/auth/login", {
      method: "POST",
      body: JSON.stringify({ email, password }),
    }),

  register: (username: string, email: string, password: string) =>
    api<AuthResponse>("/api/auth/register", {
      method: "POST",
      body: JSON.stringify({ username, email, password }),
    }),

  profile: () => api<ProfileResponse>("/api/auth/profile"),

  logout: () => {
    removeToken();
  },
};

export const programs = {
  getAll: () => api<ProgramsResponse>("/api/programs"),

  create: (name: string) =>
    api<CreateProgramResponse>("/api/programs/new", {
      method: "POST",
      body: JSON.stringify({ name }),
    }),
};

export const blocks = {
  create: (programId: string, name: string) =>
    api<{ block: Block }>("/api/blocks/new", {
      method: "POST",
      body: JSON.stringify({ programId, name }),
    }),

  rename: (blockId: string, name: string) =>
    api<{ block: Block }>(`/api/blocks/${blockId}`, {
      method: "PATCH",
      body: JSON.stringify({ name }),
    }),

  delete: (blockId: string) =>
    api<void>(`/api/blocks/${blockId}`, {
      method: "DELETE",
    }),
};

export const weeks = {
  create: (blockId: string) =>
    api<{ week: Week }>("/api/weeks/new", {
      method: "POST",
      body: JSON.stringify({ blockId }),
    }),

  delete: (weekId: string) =>
    api<void>(`/api/weeks/${weekId}`, {
      method: "DELETE",
    }),
};

export const days = {
  create: (weekId: string, columns: string[], name?: string) =>
    api<{ day: Day }>("/api/days/new", {
      method: "POST",
      body: JSON.stringify({ weekId, columns, name }),
    }),

  update: (dayId: string, name?: string) =>
    api<{ day: Day }>("/api/days", {
      method: "PUT",
      body: JSON.stringify({ dayId, name }),
    }),

  addRow: (dayId: string) =>
    api<{ row: DayRow }>("/api/days/row", {
      method: "POST",
      body: JSON.stringify({ dayId }),
    }),

  deleteRow: (rowId: string) =>
    api<void>("/api/days/row", {
      method: "DELETE",
      body: JSON.stringify({ rowId }),
    }),

  updateCell: (cellId: string, value: string) =>
    api<{ cell: DayCell }>("/api/days/cell", {
      method: "PUT",
      body: JSON.stringify({ cellId, value }),
    }),

  updateColumn: (columnId: string, name: string) =>
    api<{ column: DayColumn }>("/api/days/column", {
      method: "PUT",
      body: JSON.stringify({ columnId, name }),
    }),

  deleteColumn: (columnId: string) =>
    api<void>("/api/days/column", {
      method: "DELETE",
      body: JSON.stringify({ columnId }),
    }),

  delete: (dayId: string) =>
    api<void>(`/api/days/${dayId}`, {
      method: "DELETE",
    }),

  addColumn: (dayId: string, name: string) =>
    api<{ column: DayColumn }>("/api/days/column", {
      method: "POST",
      body: JSON.stringify({ dayId, name }),
    }),

  reorderColumn: (columnId: string, order: number) =>
    api<{ column: DayColumn }>("/api/days/column/order", {
      method: "PATCH",
      body: JSON.stringify({ columnId, order }),
    }),

  reorderRow: (rowId: string, order: number) =>
    api<{ row: DayRow }>("/api/days/row/order", {
      method: "PATCH",
      body: JSON.stringify({ rowId, order }),
    }),

  upsertCell: (rowId: string, columnId: string, value: string) =>
    api<{ cell: DayCell }>("/api/days/cell/upsert", {
      method: "PUT",
      body: JSON.stringify({ rowId, columnId, value }),
    }),
};
