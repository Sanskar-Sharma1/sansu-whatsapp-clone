import { X, FileText, ImageIcon, Film, Paperclip } from "lucide-react";
import { formatBytes } from "../../utils/format";
import { IconButton } from "./IconButton";

interface FilePreviewBarProps {
  file: File;
  onRemove: () => void;
}

function FileTypeIcon({ mimeType }: { mimeType: string }) {
  const props = { size: 22, className: "shrink-0 text-muted", "aria-hidden": true } as const;
  if (mimeType.startsWith("image/")) return <ImageIcon {...props} />;
  if (mimeType.startsWith("video/")) return <Film {...props} />;
  if (mimeType === "application/pdf") return <FileText {...props} />;
  return <Paperclip {...props} />;
}

export function FilePreviewBar({ file, onRemove }: FilePreviewBarProps) {
  return (
    <div className="flex items-center gap-3 border-t border-line bg-input px-4 py-2">
      <FileTypeIcon mimeType={file.type} />
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm text-fg">{file.name}</p>
        <p className="text-xs text-muted">{formatBytes(file.size)}</p>
      </div>
      <IconButton label="Remove file" onClick={onRemove}>
        <X size={18} />
      </IconButton>
    </div>
  );
}
