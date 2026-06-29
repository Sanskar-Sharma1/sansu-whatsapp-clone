interface OnlineIndicatorProps {
  isOnline: boolean;
  size?: number;
}

export function OnlineIndicator({ isOnline, size = 11 }: OnlineIndicatorProps) {
  if (!isOnline) return null;
  return (
    <span
      aria-hidden="true"
      className="absolute bottom-0 right-0 rounded-full border-2 border-panel bg-brand"
      style={{ width: size, height: size }}
    />
  );
}
