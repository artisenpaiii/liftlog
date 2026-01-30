import { cookies } from "next/headers";
import type { ProgramsResponse } from "@/types";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";

async function serverFetch<T>(endpoint: string): Promise<T> {
  const cookieStore = await cookies();
  const token = cookieStore.get("token")?.value;

  const res = await fetch(`${API_URL}${endpoint}`, {
    headers: {
      "Content-Type": "application/json",
      ...(token && { Authorization: `Bearer ${token}` }),
    },
    cache: "no-store",
  });

  if (!res.ok) {
    throw new Error(`Failed to fetch: ${res.status}`);
  }

  return res.json();
}

export async function getPrograms(): Promise<ProgramsResponse> {
  return serverFetch<ProgramsResponse>("/api/programs");
}
