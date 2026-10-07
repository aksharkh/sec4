import { motion } from "framer-motion";
import { ArrowUpRight } from "lucide-react";
import SectionLabel from "./SectionLabel";
import { KnotMark } from "./Nav";

const fade = (delay: number) => ({
  initial: { opacity: 0, y: 18 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: "-60px" },
  transition: { duration: 0.8, delay, ease: [0.22, 1, 0.36, 1] as const },
});

export default function FinalCTA() {
  return (
    <section id="contact" className="relative overflow-hidden rounded-t-[44px] bg-navy text-ivory">
      {/* ambient background — slow metallic lines, soft cobalt light, fine paths */}
      <div className="pointer-events-none absolute inset-0" aria-hidden>
        <div
          className="cta-drift absolute -left-48 top-1/4 h-[75vw] w-[75vw] rounded-full"
          style={{
            background:
              "radial-gradient(circle, rgba(42,88,214,0.16) 0%, rgba(42,88,214,0.05) 42%, transparent 68%)",
          }}
        />
        <div
          className="cta-shadow absolute -bottom-56 -right-48 h-[65vw] w-[65vw] rounded-full"
          style={{
            background:
              "radial-gradient(circle, rgba(0,0,0,0.5) 0%, rgba(0,0,0,0.18) 45%, transparent 70%)",
          }}
        />
        <div
          className="cta-line absolute left-[-10%] top-[30%] h-px w-[120%] -rotate-12"
          style={{
            animationDuration: "36s",
            background:
              "linear-gradient(90deg, transparent 0%, rgba(201,154,80,0.32) 30%, rgba(231,194,122,0.4) 55%, transparent 90%)",
          }}
        />
        <div
          className="cta-line absolute left-[-10%] top-[52%] h-px w-[120%] -rotate-12"
          style={{
            animationDuration: "48s",
            background:
              "linear-gradient(90deg, transparent 5%, rgba(201,154,80,0.22) 45%, transparent 85%)",
          }}
        />
        <div
          className="cta-line absolute left-[-10%] top-[74%] h-px w-[120%] -rotate-12"
          style={{
            animationDuration: "56s",
            background:
              "linear-gradient(90deg, transparent 10%, rgba(199,207,216,0.18) 50%, transparent 90%)",
          }}
        />
        <svg
          className="absolute inset-0 h-full w-full"
          viewBox="0 0 1440 900"
          preserveAspectRatio="xMidYMid slice"
          fill="none"
        >
          <path
            className="cta-path"
            pathLength={1}
            d="M-60 700 C 260 620, 480 780, 760 640 C 1030 505, 1170 640, 1520 540"
            stroke="#F3F0E8"
            strokeWidth="1"
          />
          <path
            className="cta-path"
            pathLength={1}
            style={{ animationDuration: "44s", animationDelay: "6s" }}
            d="M-60 260 C 300 340, 560 200, 860 300 C 1120 385, 1260 300, 1520 350"
            stroke="#C99A50"
            strokeWidth="1"
          />
        </svg>
      </div>

      {/* content */}
      <div className="relative mx-auto flex min-h-[92vh] w-full max-w-[1500px] flex-col px-6 md:px-10">
        <div className="flex flex-1 flex-col items-center justify-center py-32 text-center">
          <motion.div {...fade(0)}>
            <SectionLabel index="04" text="Begin" light />
          </motion.div>
          <motion.h2
            {...fade(0.1)}
            className="mt-8 font-display text-[clamp(2.6rem,6vw,5.2rem)] font-medium leading-[1.04] tracking-[-0.02em]"
          >
            Build trust into
            <br />
            what comes next<span className="text-gold">.</span>
          </motion.h2>
          <motion.p {...fade(0.2)} className="mt-7 max-w-md leading-relaxed text-white/55">
            Tell us where trust feels fragile — we will bring the knot.
          </motion.p>
          <motion.div {...fade(0.3)} className="mt-11 flex flex-col items-center gap-6">
            <a
              href="mailto:hello@secureknots.io"
              className="group inline-flex items-center gap-2 rounded-full bg-gold px-8 py-4 text-sm font-medium text-ink transition-colors duration-300 hover:bg-goldlight"
            >
              Start a conversation
              <ArrowUpRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
            </a>
            <a
              href="mailto:hello@secureknots.io"
              className="text-sm text-white/50 underline decoration-white/25 underline-offset-8 transition-colors hover:text-ivory"
            >
              hello@secureknots.io
            </a>
          </motion.div>
        </div>

        {/* footer */}
        <footer className="border-t border-white/10 py-8">
          <div className="flex flex-col items-center justify-between gap-6 md:flex-row">
            <div className="flex items-center gap-2.5">
              <KnotMark className="h-5 w-5 text-ivory" />
              <span className="font-display text-sm font-semibold tracking-tight">SecureKnots</span>
            </div>
            <nav className="flex items-center gap-7 text-xs text-white/45">
              <a href="#approach" className="transition-colors hover:text-ivory">Approach</a>
              <a href="#capabilities" className="transition-colors hover:text-ivory">Capabilities</a>
              <a href="#solutions" className="transition-colors hover:text-ivory">Solutions</a>
              <a href="#top" className="transition-colors hover:text-ivory">Top</a>
            </nav>
            <p className="text-xs text-white/35">© 2025 SecureKnots — trust, woven</p>
          </div>
        </footer>
      </div>
    </section>
  );
}
