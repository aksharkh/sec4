import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, X, ArrowUpRight } from "lucide-react";

const LINKS = [
  { label: "Approach", href: "#approach" },
  { label: "Capabilities", href: "#capabilities" },
  { label: "Solutions", href: "#solutions" },
  { label: "Contact", href: "#contact" },
];

export function KnotMark({
  className = "h-6 w-6",
  gold = true,
}: {
  className?: string;
  gold?: boolean;
}) {
  return (
    <svg viewBox="0 0 32 32" fill="none" className={className} aria-hidden>
      <circle
        cx="16"
        cy="12"
        r="6.8"
        stroke={gold ? "#C99A50" : "currentColor"}
        strokeWidth="1.4"
      />
      <circle cx="12.5" cy="18.2" r="6.8" stroke="currentColor" strokeWidth="1.4" />
      <circle cx="19.5" cy="18.2" r="6.8" stroke="currentColor" strokeWidth="1.4" />
    </svg>
  );
}

export default function Nav() {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  return (
    <>
      <header className="fixed inset-x-0 top-0 z-40 mix-blend-difference">
        <div className="mx-auto flex max-w-[1500px] items-center justify-between px-6 py-5 text-[#f3f0e8] md:px-10">
          <a href="#top" className="flex items-center gap-2.5" aria-label="SecureKnots home">
            <KnotMark className="h-6 w-6" />
            <span className="font-display text-[17px] font-semibold tracking-tight">SecureKnots</span>
          </a>

          <nav className="hidden items-center gap-9 md:flex">
            {LINKS.map((l) => (
              <a
                key={l.href}
                href={l.href}
                className="group relative text-[13px] font-medium tracking-wide opacity-80 transition-opacity hover:opacity-100"
              >
                {l.label}
                <span className="absolute -bottom-1 left-0 h-px w-full origin-left scale-x-0 bg-current transition-transform duration-300 group-hover:scale-x-100" />
              </a>
            ))}
            <a
              href="#contact"
              className="flex items-center gap-1.5 rounded-full border border-current px-4 py-1.5 text-[13px] font-medium transition-colors duration-300 hover:bg-[#f3f0e8] hover:text-[#090b0e]"
            >
              Talk to us
              <ArrowUpRight className="h-3.5 w-3.5" />
            </a>
          </nav>

          <button
            className="md:hidden"
            onClick={() => setOpen((v) => !v)}
            aria-label={open ? "Close menu" : "Open menu"}
          >
            {open ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>
      </header>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.35 }}
            className="fixed inset-0 z-30 flex flex-col justify-center bg-ivory px-8"
          >
            <p className="mb-8 text-[10px] uppercase tracking-[0.28em] text-mute">Menu</p>
            <nav className="flex flex-col">
              {LINKS.map((l, i) => (
                <motion.a
                  key={l.href}
                  href={l.href}
                  onClick={() => setOpen(false)}
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.08 + i * 0.06 }}
                  className="flex items-baseline justify-between border-b border-ink/10 py-5 font-display text-4xl font-medium tracking-tight text-ink"
                >
                  {l.label}
                  <span className="text-xs text-gold tabular-nums">0{i + 1}</span>
                </motion.a>
              ))}
            </nav>
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4 }}
              className="mt-10 text-[10px] uppercase tracking-[0.28em] text-mute"
            >
              Cybersecurity · GRC · Assurance
            </motion.p>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
