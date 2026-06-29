import type { ReactNode } from "react";

interface PanelHeaderProps {
  children: ReactNode;
  className?: string;
}

/** Fixed-height header shared by the sidebar and chat panels so they align. */
export function PanelHeader({ children, className = "" }: PanelHeaderProps) {
  return (
    <header
      className={`flex h-16 shrink-0 items-center gap-3 border-b border-line bg-surface px-4 ${className}`}
    >
      {children}
    </header>
  );
}
