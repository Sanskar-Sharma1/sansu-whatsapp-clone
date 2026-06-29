import type { ReactNode } from "react";
import { Avatar } from "./Avatar";
import { OnlineIndicator } from "./OnlineIndicator";

interface ListRowProps {
  avatarName: string;
  avatarUrl?: string;
  avatarSize?: number;
  title: string;
  subtitle?: string;
  /** Pass a boolean to show the presence dot; omit to hide it entirely. */
  isOnline?: boolean;
  active?: boolean;
  trailing?: ReactNode;
  onClick?: () => void;
  role?: string;
  ariaChecked?: boolean;
}

/**
 * Shared avatar + two-line row used by the user list, room list, and group
 * picker — one consistent layout, hover, and active state for all of them.
 */
export function ListRow({
  avatarName,
  avatarUrl,
  avatarSize = 48,
  title,
  subtitle,
  isOnline,
  active = false,
  trailing,
  onClick,
  role,
  ariaChecked,
}: ListRowProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      role={role}
      aria-checked={ariaChecked}
      className={`flex w-full items-center gap-3 px-4 py-3 text-left transition-colors ${
        active ? "bg-input" : "hover:bg-surface"
      }`}
    >
      <div className="relative shrink-0">
        <Avatar name={avatarName} avatarUrl={avatarUrl} size={avatarSize} />
        {isOnline !== undefined && <OnlineIndicator isOnline={isOnline} />}
      </div>
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-medium text-fg">{title}</p>
        {subtitle && <p className="truncate text-xs text-muted">{subtitle}</p>}
      </div>
      {trailing && <div className="shrink-0">{trailing}</div>}
    </button>
  );
}
