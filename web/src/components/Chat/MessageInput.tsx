import { useRef, useState, useCallback, type KeyboardEvent, type ChangeEvent } from "react";
import { Paperclip, Send } from "lucide-react";
import { FilePreviewBar } from "../shared/FilePreviewBar";
import { IconButton } from "../shared/IconButton";
import { Spinner } from "../shared/Spinner";

interface MessageInputProps {
  onSendText: (content: string) => void;
  onSendFile: (file: File, content?: string) => void | Promise<void>;
  onTyping: () => void;
  onStopTyping: () => void;
  isUploading: boolean;
}

export function MessageInput({
  onSendText,
  onSendFile,
  onTyping,
  onStopTyping,
  isUploading,
}: MessageInputProps) {
  const [text, setText] = useState("");
  const [pendingFile, setPendingFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleSend = useCallback(async () => {
    if (isUploading) return;
    if (pendingFile) {
      await onSendFile(pendingFile, text.trim());
      setPendingFile(null);
      setText("");
    } else if (text.trim()) {
      onSendText(text);
      setText("");
    }
    onStopTyping();
  }, [pendingFile, text, isUploading, onSendFile, onSendText, onStopTyping]);

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) setPendingFile(file);
    e.target.value = "";
  };

  const canSend = !isUploading && (!!text.trim() || !!pendingFile);

  return (
    <div className="shrink-0 border-t border-line">
      {pendingFile && <FilePreviewBar file={pendingFile} onRemove={() => setPendingFile(null)} />}

      <div className="flex items-end gap-2 bg-surface px-3 py-3">
        <IconButton
          label="Attach file"
          onClick={() => fileInputRef.current?.click()}
          disabled={isUploading}
        >
          <Paperclip size={22} />
        </IconButton>
        <input
          ref={fileInputRef}
          type="file"
          className="hidden"
          accept="image/*,video/mp4,video/quicktime,video/webm,application/pdf"
          onChange={handleFileChange}
        />

        <label htmlFor="message-input" className="sr-only">
          Type a message
        </label>
        <textarea
          id="message-input"
          value={text}
          onChange={(e) => {
            setText(e.target.value);
            onTyping();
          }}
          onKeyDown={handleKeyDown}
          placeholder="Type a message"
          rows={1}
          className="max-h-32 flex-1 resize-none rounded-lg bg-input px-4 py-2.5 text-sm leading-relaxed text-fg outline-none placeholder:text-faint"
        />

        <button
          type="button"
          onClick={handleSend}
          disabled={!canSend}
          aria-label="Send message"
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-brand-strong text-white transition-colors hover:bg-brand-strong-hover disabled:cursor-not-allowed disabled:opacity-40"
        >
          {isUploading ? <Spinner size={18} /> : <Send size={18} />}
        </button>
      </div>
    </div>
  );
}
