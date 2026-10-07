import { useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

/**
 * Brief logo-loading animation: the interlocking knot draws itself,
 * the wordmark settles, then the curtain lifts.
 */
export default function Loader({ done, onDone }: { done: boolean; onDone: () => void }) {
  useEffect(() => {
    if (done) return;
    const t = window.setTimeout(onDone, 2000);
    return () => window.clearTimeout(t);
  }, [done, onDone]);

  return (
    <AnimatePresence>
      {!done && (
        <motion.div
          className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-ivory"
          exit={{ y: "-100%" }}
          transition={{ duration: 0.85, ease: [0.76, 0, 0.24, 1] }}
        >
          <div className="flex flex-col items-center">
            <svg width="76" height="76" viewBox="0 0 76 76" fill="none" aria-hidden>
              <motion.circle
                cx="38"
                cy="29"
                r="15"
                stroke="#C99A50"
                strokeWidth="1.5"
                initial={{ pathLength: 0 }}
                animate={{ pathLength: 1 }}
                transition={{ duration: 1.0, ease: [0.65, 0, 0.35, 1] }}
              />
              <motion.circle
                cx="31"
                cy="42"
                r="15"
                stroke="#090B0E"
                strokeWidth="1.5"
                initial={{ pathLength: 0 }}
                animate={{ pathLength: 1 }}
                transition={{ duration: 1.0, delay: 0.18, ease: [0.65, 0, 0.35, 1] }}
              />
              <motion.circle
                cx="45"
                cy="42"
                r="15"
                stroke="#090B0E"
                strokeWidth="1.5"
                initial={{ pathLength: 0 }}
                animate={{ pathLength: 1 }}
                transition={{ duration: 1.0, delay: 0.34, ease: [0.65, 0, 0.35, 1] }}
              />
              <motion.circle
                cx="38"
                cy="38"
                r="2.4"
                fill="#C99A50"
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ duration: 0.5, delay: 0.75 }}
              />
            </svg>
            <motion.p
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.45 }}
              className="mt-6 font-display text-xl font-semibold tracking-tight text-ink"
            >
              SecureKnots
            </motion.p>
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.7, delay: 0.7 }}
              className="mt-2 text-[10px] uppercase tracking-[0.28em] text-mute"
            >
              Cybersecurity · GRC · Assurance
            </motion.p>
            <motion.div
              initial={{ scaleX: 0 }}
              animate={{ scaleX: 1 }}
              transition={{ duration: 1.2, delay: 0.4, ease: [0.65, 0, 0.35, 1] }}
              className="mt-6 h-px w-24 origin-center bg-gold"
            />
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
