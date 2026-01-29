import { ReactNode } from "react";

export default function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-bg flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-accent tracking-tight">
            LiftLog
          </h1>
          <p className="text-fg-500 mt-2">Track your fitness journey</p>
        </div>
        <div className="bg-bg-100 rounded-2xl border border-border p-8">
          {children}
        </div>
      </div>
    </div>
  );
}
