import { useEffect, useRef, useState } from "react";
import {
  motion,
  AnimatePresence,
  useScroll,
  useMotionValueEvent,
  type Variants,
} from "framer-motion";
import { ArrowUpRight, Layers, RotateCcw } from "lucide-react";
import { bus, TIERS } from "../lib/bus";

const lineVar: Variants = {
  hidden: { y: "112%" },
  show: (i: number) => ({
    y: "0%",
    transition: { duration: 0.9, ease: [0.22, 1, 0.36, 1], delay: 0.05 + i * 0.08 },
  }),
};

const fadeVar: Variants = {
  hidden: { opacity: 0, y: 14 },
  show: (d: number) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.75, ease: [0.22, 1, 0.36, 1], delay: d },
  }),
};

const LINES = ["Security built to", "operate without", "hesitation"];

export default function Hero({ loaded }: { loaded: boolean }) {
  const ref = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end start"] });

  const [isExploded, setIsExploded] = useState(false);
  const [activeTierIdx, setActiveTierIdx] = useState<number>(-1);

  useMotionValueEvent(scrollYProgress, "change", (v) => {
    bus.hero = v;
  });

  useEffect(() => {
    bus.hero = scrollYProgress.get();
  }, [scrollYProgress]);

  useEffect(() => {
    const syncUI = () => {
      setIsExploded(bus.manualExplode > 0.5);
      const t = bus.selectedTier !== -1 ? bus.selectedTier : bus.hoveredTier;
      setActiveTierIdx(t);
    };
    bus.onInteractionChange = syncUI;
    return () => {
      if (bus.onInteractionChange === syncUI) {
        bus.onInteractionChange = null;
      }
    };
  }, []);

  const toggleExplode = () => {
    const next = bus.manualExplode > 0.5 ? 0 : 1;
    bus.manualExplode = next;
    bus.pulseWave = 1.0;
    if (next === 0) {
      bus.selectedTier = -1;
    }
    setIsExploded(next === 1);
    setActiveTierIdx(bus.selectedTier);
  };

  const selectDiscipline = (idx: number) => {
    bus.pulseWave = 1.0;
    if (bus.selectedTier === idx) {
      bus.selectedTier = -1;
      setActiveTierIdx(-1);
    } else {
      bus.selectedTier = idx;
      bus.manualExplode = 1;
      setIsExploded(true);
      setActiveTierIdx(idx);
    }
  };

  const resetView = () => {
    bus.manualExplode = 0;
    bus.selectedTier = -1;
    bus.hoveredTier = -1;
    bus.dragYaw = 0;
    bus.dragPitch = 0;
    bus.velYaw = 0;
    bus.velPitch = 0;
    bus.pulseWave = 0.8;
    setIsExploded(false);
    setActiveTierIdx(-1);
  };

  const state = loaded ? "show" : "hidden";
  const focusedTier = activeTierIdx >= 0 ? TIERS[activeTierIdx] : null;

  return (
    <section ref={ref} id="top" className="relative min-h-svh pb-28">
      <div className="mx-auto w-full max-w-[1500px] px-6 pt-28 md:px-10 md:pt-36">
        {/* eyebrow */}
        <motion.div
          variants={fadeVar}
          custom={0.02}
          initial="hidden"
          animate={state}
          className="flex items-center gap-4"
        >
          <span className="h-px w-10 bg-gold" />
          <span className="text-[10px] uppercase tracking-[0.3em] text-mute md:text-[11px]">
            Cybersecurity / GRC / Assurance
          </span>
        </motion.div>

        {/* headline — reveals line by line */}
        <h1 className="mt-7 max-w-2xl font-display text-[clamp(2.75rem,6.4vw,5.8rem)] font-medium leading-[1.01] tracking-[-0.03em] text-ink">
          {LINES.map((l, i) => (
            <span key={l} className="block overflow-hidden pb-1">
              <motion.span
                className="block"
                variants={lineVar}
                custom={i}
                initial="hidden"
                animate={state}
              >
                {l}
                {i === LINES.length - 1 && <span className="text-gold">.</span>}
              </motion.span>
            </span>
          ))}
        </h1>

        {/* mobile: breathing room for the centred 3D model */}
        <div className="h-[32vh] md:hidden" />

        {/* supporting sentence + CTA */}
        <div className="mt-6 max-w-md">
          <motion.p
            variants={fadeVar}
            custom={0.3}
            initial="hidden"
            animate={state}
            className="text-base leading-relaxed text-mute md:text-[17px]"
          >
            SecureKnots weaves governance, risk, compliance, privacy and security into one
            continuous system — so trust holds under pressure.
          </motion.p>

          <motion.div
            variants={fadeVar}
            custom={0.42}
            initial="hidden"
            animate={state}
            className="mt-7 flex flex-wrap items-center gap-x-6 gap-y-3"
          >
            <a
              href="#contact"
              data-ui-interactive="true"
              className="group inline-flex items-center gap-2 rounded-full bg-ink px-7 py-3.5 text-sm font-medium text-ivory transition-colors duration-300 hover:bg-charcoal"
            >
              Start a conversation
              <ArrowUpRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
            </a>
            <a
              href="#approach"
              data-ui-interactive="true"
              className="text-sm font-medium text-ink underline decoration-gold decoration-1 underline-offset-8 transition-colors hover:decoration-2"
            >
              Scroll the 3D breakdown
            </a>
          </motion.div>

          {/* Live 3D Layer Inspector Readout when hovering/clicking any ring */}
          <div className="mt-6 min-h-[76px]">
            <AnimatePresence mode="wait">
              {focusedTier ? (
                <motion.div
                  key={focusedTier.id}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -6 }}
                  transition={{ duration: 0.25 }}
                  className="border-l-2 border-gold pl-4"
                >
                  <p className="text-[10px] uppercase tracking-[0.26em] text-gold">
                    {focusedTier.code} · {focusedTier.subtitle} · {focusedTier.metric}
                  </p>
                  <p className="mt-0.5 font-display text-base font-medium text-ink">
                    {focusedTier.name}
                  </p>
                  <p className="mt-0.5 max-w-sm text-xs leading-relaxed text-mute">
                    {focusedTier.desc}
                  </p>
                </motion.div>
              ) : (
                <motion.p
                  key="hint"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="pt-2 text-xs text-mute/80"
                >
                  Drag the 3D core to rotate · Click any ring or discipline below to expand
                </motion.p>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>

      {/* Interactive 3D Controller Bar along the bottom rail */}
      <motion.div
        variants={fadeVar}
        custom={0.55}
        initial="hidden"
        animate={state}
        className="absolute inset-x-0 bottom-6 z-30"
      >
        <div className="mx-auto flex w-full max-w-[1500px] flex-wrap items-end justify-between gap-4 px-6 md:px-10">
          <div
            data-ui-interactive="true"
            className="flex flex-wrap items-center gap-2"
          >
            {/* Primary Interactive Explode / Assemble Toggle */}
            <button
              type="button"
              onClick={toggleExplode}
              className={`inline-flex items-center gap-2 rounded-full px-4 py-2 text-xs font-medium transition-all duration-300 ${
                isExploded
                  ? "bg-gold text-ink shadow-xs"
                  : "bg-ink text-ivory hover:bg-charcoal"
              }`}
            >
              <Layers className="h-3.5 w-3.5" />
              {isExploded ? "Assemble Core" : "Expand 5 Layers"}
            </button>

            {/* 5 Interactive Discipline Layer Triggers */}
            <div className="hidden items-center gap-1.5 sm:flex">
              {TIERS.map((t, idx) => {
                const isSelected = activeTierIdx === idx;
                return (
                  <button
                    key={t.id}
                    type="button"
                    onMouseEnter={() => {
                      bus.hoveredTier = idx;
                      setActiveTierIdx(idx);
                    }}
                    onMouseLeave={() => {
                      bus.hoveredTier = -1;
                      setActiveTierIdx(bus.selectedTier);
                    }}
                    onClick={() => selectDiscipline(idx)}
                    className={`rounded-full px-3 py-1.5 text-[11px] font-medium transition-all duration-200 ${
                      isSelected
                        ? "border border-gold bg-gold/20 text-ink"
                        : "border border-ink/15 bg-ivory/80 text-ink/75 hover:border-ink/40 hover:text-ink"
                    }`}
                  >
                    <span className="mr-1 text-[10px] text-gold tabular-nums">
                      {t.code}
                    </span>
                    {t.name}
                  </button>
                );
              })}
            </div>

            {(isExploded || activeTierIdx !== -1) && (
              <button
                type="button"
                onClick={resetView}
                className="inline-flex items-center gap-1 rounded-full border border-ink/15 bg-ivory/80 px-3 py-1.5 text-[11px] text-mute transition-colors hover:border-ink/40 hover:text-ink"
                title="Reset 3D view"
              >
                <RotateCcw className="h-3 w-3" />
                Reset
              </button>
            )}
          </div>

          <a
            href="#approach"
            data-ui-interactive="true"
            className="group flex flex-col items-center gap-2 md:items-end"
          >
            <span className="text-[10px] uppercase tracking-[0.3em] text-mute transition-colors group-hover:text-ink">
              Scroll to expand
            </span>
            <div className="h-10 w-px overflow-hidden bg-ink/15">
              <motion.div
                className="h-full w-full origin-top bg-gold"
                initial={{ scaleY: 0 }}
                animate={loaded ? { scaleY: 1 } : {}}
                transition={{ duration: 1.0, delay: 0.4, ease: [0.65, 0, 0.35, 1] }}
              />
            </div>
          </a>
        </div>
      </motion.div>
    </section>
  );
}
