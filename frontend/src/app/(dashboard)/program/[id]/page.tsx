"use client";

import { useParams } from "next/navigation";

export default function ProgramDetailPage() {
  const params = useParams();
  const programId = params.id as string;

  return (
    <div>
      <h1 className="text-2xl font-semibold text-fg mb-6">Program Details</h1>
      <p className="text-fg-500">Program ID: {programId}</p>
    </div>
  );
}
