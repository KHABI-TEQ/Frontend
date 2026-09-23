"use client";

import { motion, AnimatePresence } from "framer-motion";
import { Sparkles, X } from "lucide-react";

type Props = {
  open: boolean;
  onClose: () => void;
  title?: string;
  description: string;
};

export default function ComingSoonPrompt({
  open,
  onClose,
  title = "Coming soon",
  description,
}: Props) {
  return (
    <AnimatePresence>
      {open ? (
        <div className="fixed inset-0 z-[120] flex items-center justify-center p-4">
          <motion.button
            type="button"
            aria-label="Close"
            className="absolute inset-0 bg-[#0B423D]/70 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />
          <motion.div
            role="dialog"
            aria-modal="true"
            aria-labelledby="coming-soon-title"
            className="relative w-full max-w-md overflow-hidden rounded-3xl bg-white shadow-2xl"
            initial={{ opacity: 0, scale: 0.86, y: 28 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.92, y: 16 }}
            transition={{ type: "spring", damping: 22, stiffness: 280 }}
          >
            <div className="pointer-events-none absolute inset-0 overflow-hidden">
              <motion.div
                className="absolute -left-16 -top-10 h-40 w-40 rounded-full bg-fuchsia-400/40 blur-3xl"
                animate={{ scale: [1, 1.2, 1], x: [0, 12, 0] }}
                transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
              />
              <motion.div
                className="absolute -right-10 top-8 h-36 w-36 rounded-full bg-amber-300/50 blur-3xl"
                animate={{ scale: [1.1, 0.95, 1.1], y: [0, 10, 0] }}
                transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
              />
              <motion.div
                className="absolute bottom-0 left-1/3 h-32 w-32 rounded-full bg-emerald-400/40 blur-3xl"
                animate={{ scale: [1, 1.15, 1], x: [0, -10, 0] }}
                transition={{ duration: 4.5, repeat: Infinity, ease: "easeInOut" }}
              />
              <motion.div
                className="absolute right-8 bottom-6 h-24 w-24 rounded-full bg-sky-400/40 blur-2xl"
                animate={{ y: [0, -8, 0] }}
                transition={{ duration: 3.5, repeat: Infinity, ease: "easeInOut" }}
              />
            </div>

            <button
              type="button"
              onClick={onClose}
              className="absolute right-3 top-3 z-10 rounded-full bg-white/80 p-2 text-[#09391C] shadow"
              aria-label="Close coming soon"
            >
              <X size={16} />
            </button>

            <div className="relative px-6 pb-8 pt-10 text-center sm:px-8">
              <motion.div
                className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-fuchsia-500 via-amber-400 to-emerald-500 text-white shadow-lg"
                animate={{ rotate: [0, 8, -8, 0], scale: [1, 1.06, 1] }}
                transition={{ duration: 2.8, repeat: Infinity, ease: "easeInOut" }}
              >
                <Sparkles size={28} />
              </motion.div>
              <motion.p
                className="text-xs font-semibold uppercase tracking-[0.2em] text-fuchsia-600"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
              >
                New on Khabiteq
              </motion.p>
              <h2
                id="coming-soon-title"
                className="mt-2 bg-gradient-to-r from-fuchsia-600 via-amber-500 to-emerald-600 bg-clip-text text-3xl font-bold text-transparent"
              >
                {title}
              </h2>
              <p className="mt-3 text-sm leading-relaxed text-[#3A3F3D]">{description}</p>
              <button
                type="button"
                onClick={onClose}
                className="mt-6 inline-flex rounded-xl bg-[#09391C] px-5 py-2.5 text-sm font-semibold text-white"
              >
                Got it
              </button>
            </div>
          </motion.div>
        </div>
      ) : null}
    </AnimatePresence>
  );
}
