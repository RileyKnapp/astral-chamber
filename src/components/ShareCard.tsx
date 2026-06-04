import { useState } from "react";

type Props =
  | { kind: "streak"; days: number }
  | { kind: "journey"; name: string; tag?: string };

export function ShareCard(props: Props) {
  const [open, setOpen] = useState(false);
  const [copied, setCopied] = useState(false);

  const title =
    props.kind === "streak"
      ? `${props.days}-day dream journaling streak`
      : `Favorite journey: ${props.name}`;
  const body =
    props.kind === "streak"
      ? `I've journaled my dreams ${props.days} days in a row with The Astral Chamber.`
      : `Listening to "${props.name}"${props.tag ? ` — ${props.tag}` : ""} in The Astral Chamber.`;

  const share = async () => {
    const data = { title, text: body, url: typeof window !== "undefined" ? window.location.origin : "" };
    if (typeof navigator !== "undefined" && "share" in navigator) {
      try {
        await navigator.share(data);
        return;
      } catch {}
    }
    setOpen(true);
  };

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(`${body} ${typeof window !== "undefined" ? window.location.origin : ""}`);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {}
  };

  return (
    <>
      <button
        onClick={share}
        className="rounded-sm border border-[#c0b0f0]/40 px-3 py-1 text-[10px] tracking-[0.25em] text-[#c0b0f0] hover:border-[#c0b0f0]"
      >
        ◆ SHARE
      </button>

      {open && (
        <div
          className="fixed inset-0 z-[95] flex items-center justify-center bg-black/60 px-4 backdrop-blur-sm"
          onClick={() => setOpen(false)}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-sm overflow-hidden rounded-2xl border border-[#c0b0f0]/30 bg-[#070411] font-mono text-[#cfe7ff]"
          >
            <div
              className="relative p-8 text-center"
              style={{
                background:
                  "radial-gradient(ellipse at top, #2a0a20 0%, #0a0518 60%, #02050d 100%)",
              }}
            >
              <div className="text-[10px] tracking-[0.3em] text-[#c0b0f0]/80">
                ◆ THE ASTRAL CHAMBER
              </div>
              <div className="mt-6 font-serif text-3xl leading-tight text-white">
                {props.kind === "streak" ? (
                  <>
                    <span className="text-[#c0b0f0]">{props.days}</span>
                    <br />
                    nights in a row
                  </>
                ) : (
                  <>{props.name}</>
                )}
              </div>
              <div className="mt-4 text-[11px] leading-relaxed text-[#cfe7ff]/80">
                {body}
              </div>
            </div>
            <div className="space-y-2 p-4">
              <button
                onClick={copy}
                className="w-full rounded-sm border border-[#c0b0f0] bg-[#c0b0f0] py-2 text-[10px] font-bold tracking-[0.3em] text-[#0a1010]"
              >
                {copied ? "◆ COPIED" : "◆ COPY MESSAGE"}
              </button>
              <button
                onClick={() => setOpen(false)}
                className="w-full rounded-sm border border-white/15 py-2 text-[10px] tracking-[0.3em] text-[#cfe7ff]"
              >
                CLOSE
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
