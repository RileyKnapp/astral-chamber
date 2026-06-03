import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Headphones } from "lucide-react";

const KEY = "threshold.headphones.ack";

export function HeadphonesPrompt({
  onConfirm,
  open,
  onOpenChange,
}: {
  onConfirm: () => void;
  open: boolean;
  onOpenChange: (v: boolean) => void;
}) {
  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-50 flex items-end justify-center bg-black/70 backdrop-blur-md sm:items-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={() => onOpenChange(false)}
        >
          <motion.div
            onClick={(e) => e.stopPropagation()}
            initial={{ y: 40, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 40, opacity: 0 }}
            className="m-4 max-w-sm rounded-3xl border border-white/10 bg-gradient-to-b from-indigo-950/80 to-black/90 p-7 text-center"
            style={{ paddingBottom: "calc(1.75rem + env(safe-area-inset-bottom))" }}
          >
            <div className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-full bg-white/5">
              <Headphones className="text-violet-200" />
            </div>
            <h2 className="text-lg font-light tracking-wide text-white">
              Put on headphones
            </h2>
            <p className="mt-2 text-sm leading-relaxed text-white/60">
              Binaural beats only work in stereo. Each ear hears a slightly
              different tone — your brain creates the third frequency in
              between.
            </p>
            <button
              onClick={() => {
                localStorage.setItem(KEY, "1");
                onOpenChange(false);
                onConfirm();
              }}
              className="mt-6 w-full rounded-full bg-white py-3 text-sm font-medium text-black transition-opacity hover:opacity-90"
            >
              I'm wearing headphones
            </button>
            <button
              onClick={() => onOpenChange(false)}
              className="mt-2 w-full py-2 text-xs text-white/40"
            >
              Cancel
            </button>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

export function useHeadphoneGate() {
  const [open, setOpen] = useState(false);
  const [pendingAction, setPendingAction] = useState<(() => void) | null>(null);

  useEffect(() => {}, []);

  const request = (action: () => void) => {
    const ack = typeof window !== "undefined" && localStorage.getItem(KEY);
    if (ack) {
      action();
    } else {
      setPendingAction(() => action);
      setOpen(true);
    }
  };

  const confirm = () => {
    pendingAction?.();
    setPendingAction(null);
  };

  return { open, setOpen, request, confirm };
}
