import { useState } from "react";

interface AvatarProps {
  name: string;
  avatarUrl?: string;
  size?: number;
  className?: string;
}

const COLORS = ["#2D9CDB", "#27AE60", "#EB5757", "#F2994A", "#9B51E0", "#00A884"];

/** Deterministic color from the whole name (not just the first char). */
function pickColor(name: string): string {
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = (hash * 31 + name.charCodeAt(i)) | 0;
  }
  return COLORS[Math.abs(hash) % COLORS.length];
}

function getInitials(name: string): string {
  const trimmed = name.trim();
  if (!trimmed) return "?";
  return trimmed
    .split(/\s+/)
    .map((word) => word[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

export function Avatar({ name, avatarUrl, size = 40, className = "" }: AvatarProps) {
  const [hasError, setHasError] = useState(false);

  if (avatarUrl && !hasError) {
    return (
      <img
        src={avatarUrl}
        alt=""
        width={size}
        height={size}
        loading="lazy"
        onError={() => setHasError(true)}
        className={`rounded-full object-cover ${className}`}
        style={{ width: size, height: size }}
      />
    );
  }

  const safeName = name.trim() || "?";
  return (
    <div
      aria-hidden="true"
      className={`flex items-center justify-center rounded-full font-medium text-white ${className}`}
      style={{
        width: size,
        height: size,
        backgroundColor: pickColor(safeName),
        fontSize: size * 0.4,
      }}
    >
      {getInitials(name)}
    </div>
  );
}
