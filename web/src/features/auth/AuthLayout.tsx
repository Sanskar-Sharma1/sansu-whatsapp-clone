import type { ReactNode } from "react";

const PREVIEW_MESSAGES = [
  { id: 1, text: "Free tonight? 🎮", own: false, delay: 0.6 },
  { id: 2, text: "Yeah, just wrapped up!", own: true, delay: 1.4 },
  { id: 3, text: "Jump on a call?", own: false, delay: 2.2 },
  { id: 4, text: "Starting now 👋", own: true, delay: 3.0 },
] as const;

function BrandMark({ size = 44, className = "" }: { size?: number; className?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 44 44" fill="none" aria-hidden="true" className={className}>
      <rect width="44" height="44" rx="12" fill="#25D366" fillOpacity="0.15" />
      <path
        d="M22 8C14.268 8 8 14.268 8 22c0 2.52.686 4.883 1.882 6.91L8 36l7.318-1.853A13.926 13.926 0 0022 36c7.732 0 14-6.268 14-14S29.732 8 22 8z"
        fill="#25D366"
        fillOpacity="0.9"
      />
      <path d="M16 20h12M16 24h8" stroke="#0b141a" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}

function PreviewBubble({ text, own, delay }: { text: string; own: boolean; delay: number }) {
  return (
    <div
      className={`flex opacity-0 ${own ? "justify-end" : "justify-start"}`}
      style={{ animation: `msg-in 0.45s cubic-bezier(0.34,1.4,0.64,1) ${delay}s forwards` }}
    >
      <div
        className={`max-w-[75%] px-3.5 py-2 text-[0.8rem] leading-relaxed text-fg shadow-sm ${
          own
            ? "rounded-[14px_14px_4px_14px] bg-bubble-out"
            : "rounded-[14px_14px_14px_4px] bg-surface"
        }`}
      >
        {text}
      </div>
    </div>
  );
}

function PreviewTyping({ delay }: { delay: number }) {
  return (
    <div
      className="flex justify-start opacity-0"
      style={{ animation: `msg-in 0.4s ease ${delay}s forwards` }}
    >
      <div className="flex items-center gap-1 rounded-[14px_14px_14px_4px] bg-surface px-3.5 py-2.5">
        {[0, 1, 2].map((i) => (
          <span
            key={i}
            className="block h-1.5 w-1.5 rounded-full bg-muted"
            style={{ animation: `dot-bounce 1.2s ease ${i * 0.18}s infinite` }}
          />
        ))}
      </div>
    </div>
  );
}

function DecorativePanel() {
  return (
    <aside
      aria-hidden="true"
      className="relative hidden w-[44%] flex-col justify-center overflow-hidden border-r border-line-subtle bg-[linear-gradient(155deg,#0d1e27_0%,#0b141a_60%)] p-14 md:flex"
    >
      <div className="pointer-events-none absolute left-1/2 top-1/2 w-[55%] animate-[glow-pulse_5s_ease-in-out_infinite] rounded-full bg-[radial-gradient(circle,rgba(37,211,102,0.12)_0%,transparent_70%)] pb-[55%]" />

      <div className="relative z-[1] animate-[fade-up_0.6s_ease_0.1s_both]">
        <BrandMark className="mb-6" />
        <h2 className="m-0 font-display text-[clamp(1.6rem,2.5vw,2.1rem)] font-bold leading-tight tracking-tight text-fg">
          Every message
          <br />
          <span className="text-brand">delivered.</span>
        </h2>
        <p className="m-0 mt-3 text-sm leading-relaxed text-muted">
          Real-time conversations, always on.
        </p>
      </div>

      <div className="relative z-[1] mt-10 flex flex-col gap-2.5">
        {PREVIEW_MESSAGES.map((m) => (
          <PreviewBubble key={m.id} {...m} />
        ))}
        <PreviewTyping delay={3.9} />
      </div>
    </aside>
  );
}

export function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-screen bg-canvas">
      <DecorativePanel />
      <main className="flex flex-1 flex-col items-center justify-center bg-panel px-6 py-8">
        <div className="mb-10 text-center md:hidden">
          <BrandMark size={40} className="mx-auto mb-3" />
          <h1 className="m-0 font-display text-xl font-bold text-fg">WhatsApp Clone</h1>
        </div>
        <div className="w-full max-w-[380px] animate-[fade-up_0.5s_ease_0.1s_both]">{children}</div>
      </main>
    </div>
  );
}
