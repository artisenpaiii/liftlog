"use client";

interface LoadingProps {
  size?: "sm" | "md" | "lg";
  className?: string;
}

const sizes = {
  sm: "w-8 h-8",
  md: "w-12 h-12",
  lg: "w-16 h-16",
};

export function Loading({ size = "md", className = "" }: LoadingProps) {
  return (
    <div className={`flex items-center justify-center ${className}`}>
      <svg
        className={`animate-spin ${sizes[size]}`}
        viewBox="0 0 64 64"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        {/* Left weight plate */}
        <rect
          x="4"
          y="20"
          width="12"
          height="24"
          rx="2"
          className="fill-accent"
        />
        {/* Left inner plate */}
        <rect
          x="16"
          y="24"
          width="6"
          height="16"
          rx="1"
          className="fill-accent-600"
        />
        {/* Bar */}
        <rect
          x="22"
          y="29"
          width="20"
          height="6"
          rx="1"
          className="fill-fg-500"
        />
        {/* Right inner plate */}
        <rect
          x="42"
          y="24"
          width="6"
          height="16"
          rx="1"
          className="fill-accent-600"
        />
        {/* Right weight plate */}
        <rect
          x="48"
          y="20"
          width="12"
          height="24"
          rx="2"
          className="fill-accent"
        />
      </svg>
    </div>
  );
}
