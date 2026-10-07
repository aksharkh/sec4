import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import SectionLabel from "./SectionLabel";

/* ------------------------------------------------------------------ */
/* Thin-line technical diagrams — one per capability                    */
/* ------------------------------------------------------------------ */

function D({
  d,
  delay = 0,
  gold = false,
  dim = 0.45,
}: {
  d: string;
  delay?: number;
  gold?: boolean;
  dim?: number;
}) {
  return (
    <motion.path
      d={d}
      fill="none"
      stroke={gold ? "#C99A50" : "#171A1F"}
      strokeOpacity={gold ? 0.9 : dim}
      strokeWidth={gold ? 1.6 : 1.1}
      initial={{ pathLength: 0, opacity: 0 }}
      animate={{ pathLength: 1, opacity: 1 }}
      transition={{ duration: 1.1, delay, ease: "easeInOut" }}
    />
  );
}

function Mark({ cx, cy, delay = 0 }: { cx: number; cy: number; delay?: number }) {
  return (
    <motion.circle
      cx={cx}
      cy={cy}
      r="3.2"
      fill="#C99A50"
      initial={{ scale: 0, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ duration: 0.5, delay, ease: "backOut" }}
      style={{ transformOrigin: `${cx}px ${cy}px` }}
    />
  );
}

function GrcDiagram() {
  return (
    <svg viewBox="0 0 200 200" className="h-full w-full">
      <motion.g
        animate={{ rotate: 360 }}
        transition={{ duration: 36, repeat: Infinity, ease: "linear" }}
        style={{ transformOrigin: "100px 92px" }}
      >
        <D d="M100 28 a44 44 0 1 0 0.01 0" delay={0} />
        <D d="M76 72 a44 44 0 1 0 0.01 0" delay={0.15} />
        <D d="M124 72 a44 44 0 1 0 0.01 0" delay={0.3} gold />
        <Mark cx={100} cy={28} delay={0.55} />
        <Mark cx={56} cy={116} delay={0.65} />
        <Mark cx={144} cy={116} delay={0.75} />
      </motion.g>
      <Mark cx={100} cy={92} delay={0.85} />
    </svg>
  );
}

function ReadinessDiagram() {
  const ticks = Array.from({ length: 12 }, (_, i) => {
    const a = (i * Math.PI) / 6;
    const x1 = 100 + 86 * Math.cos(a);
    const y1 = 100 + 86 * Math.sin(a);
    const x2 = 100 + 92 * Math.cos(a);
    const y2 = 100 + 92 * Math.sin(a);
    return `M${x1.toFixed(1)} ${y1.toFixed(1)} L${x2.toFixed(1)} ${y2.toFixed(1)}`;
  });
  return (
    <svg viewBox="0 0 200 200" className="h-full w-full">
      <D d="M100 70 a30 30 0 1 0 0.01 0" delay={0} dim={0.3} />
      <D d="M100 44 a56 56 0 1 0 0.01 0" delay={0.12} dim={0.35} />
      <D d="M100 18 a82 82 0 1 0 0.01 0" delay={0.24} dim={0.4} />
      {ticks.map((t, i) => (
        <D key={i} d={t} delay={0.45 + i * 0.03} dim={0.35} />
      ))}
      <motion.g
        animate={{ rotate: 360 }}
        transition={{ duration: 28, repeat: Infinity, ease: "linear" }}
        style={{ transformOrigin: "100px 100px" }}
      >
        <D d="M142.9 64 A56 56 0 0 1 136 142.9" delay={0.7} gold />
        <Mark cx={136} cy={142.9} delay={0.95} />
      </motion.g>
      <Mark cx={100} cy={100} delay={1.1} />
    </svg>
  );
}

function TestingDiagram() {
  return (
    <svg viewBox="0 0 200 200" className="h-full w-full">
      <D d="M100 26 L154 47 V102 C154 136 131 157 100 168 C69 157 46 136 46 102 V47 Z" delay={0} />
      <D d="M100 63 V131" delay={0.4} />
      <D d="M66 97 H134" delay={0.5} />
      <motion.g
        animate={{ rotate: -360 }}
        transition={{ duration: 24, repeat: Infinity, ease: "linear" }}
        style={{ transformOrigin: "100px 97px" }}
      >
        <D d="M100 73 a24 24 0 1 0 0.01 0" delay={0.6} gold />
        <Mark cx={100} cy={73} delay={0.85} />
      </motion.g>
      <Mark cx={100} cy={97} delay={1} />
    </svg>
  );
}

function CloudDiagram() {
  return (
    <svg viewBox="0 0 200 200" className="h-full w-full">
      {/* Three interlocking orbital ellipses around the cloud */}
      <motion.g
        animate={{ rotate: 360 }}
        transition={{ duration: 42, repeat: Infinity, ease: "linear" }}
        style={{ transformOrigin: "100px 100px" }}
      >
        <D d="M22 100 a78 32 0 1 0 156 0 a78 32 0 1 0 -156 0" delay={0.15} dim={0.26} />
        <D d="M61 32.5 a32 78 30 1 0 78 135 a32 78 30 1 0 -78 -135" delay={0.28} dim={0.26} />
        <D d="M139 32.5 a78 32 60 1 0 -78 135 a78 32 60 1 0 78 -135" delay={0.4} gold />
        <Mark cx={100} cy={32} delay={0.75} />
        <Mark cx={38} cy={120} delay={0.85} />
        <Mark cx={162} cy={120} delay={0.95} />
      </motion.g>
      {/* Central cloud silhouette */}
      <D
        d="M66 116 C52 116 44 106 44 96 C44 86 52 78 62 77 C63 62 76 50 92 50 C107 50 119 60 122 74 C135 74 145 83 145 95 C145 107 135 116 122 116 Z"
        delay={0}
      />
      <Mark cx={68} cy={156} delay={1.05} />
      <Mark cx={132} cy={156} delay={1.15} />
    </svg>
  );
}

/* ------------------------------------------------------------------ */

const ITEMS = [
  {
    title: "Governance, Risk & Compliance",
    desc: "Programmes that make risk visible and decisions defensible — from board-level framework to engineering-level control.",
    caption: "Direction · accountability · oversight",
    Diagram: GrcDiagram,
  },
  {
    title: "Regulatory Readiness",
    desc: "SOC 2, ISO 27001, GDPR, FedRAMP — audit-ready and evidence-led, kept in a continuous state of readiness.",
    caption: "Evidence, always in order",
    Diagram: ReadinessDiagram,
  },
  {
    title: "Security Testing",
    desc: "Adversarial testing of applications, infrastructure and people — finding the loose thread before someone else pulls it.",
    caption: "Find it before they do",
    Diagram: TestingDiagram,
  },
  {
    title: "Cloud Assurance",
    desc: "Configuration, posture and continuity assurance across every environment you run — consistent by design, not by luck.",
    caption: "Every environment, assured",
    Diagram: CloudDiagram,
  },
];

export default function Capabilities() {
  const [active, setActive] = useState(0);
  const ActiveDiagram = ITEMS[active].Diagram;

  return (
    <section id="capabilities" className="relative rounded-t-[44px] bg-stone">
      <div className="mx-auto w-full max-w-[1500px] px-6 py-24 md:px-10 md:py-32">
        <div className="grid gap-14 lg:grid-cols-12 lg:gap-16">
          {/* editorial column */}
          <div className="lg:col-span-5">
            <SectionLabel index="02" text="Capabilities" />
            <h2 className="mt-6 font-display text-4xl font-medium leading-[1.05] tracking-tight text-ink md:text-5xl">
              Deep where trust is won.
            </h2>
            <p className="mt-6 max-w-md leading-relaxed text-mute">
              Four practices, one standard of craft. Every engagement feeds the whole — the edges
              stay tied to the centre.
            </p>

            {/* diagram panel — one deeply curved corner */}
            <div className="relative mt-12 max-w-[430px]">
              <div className="relative aspect-square overflow-hidden rounded-[28px] rounded-bl-[120px] border border-ink/10 bg-ivory">
                <AnimatePresence mode="wait">
                  <motion.div
                    key={active}
                    initial={{ opacity: 0, scale: 0.96 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.985 }}
                    transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
                    className="absolute inset-0 p-12 md:p-14"
                  >
                    <div className="h-full w-full">
                      <ActiveDiagram />
                    </div>
                  </motion.div>
                </AnimatePresence>
                <AnimatePresence mode="wait">
                  <motion.p
                    key={`c-${active}`}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.35 }}
                    className="absolute bottom-6 left-8 text-[10px] uppercase tracking-[0.25em] text-mute"
                  >
                    {ITEMS[active].caption}
                  </motion.p>
                </AnimatePresence>
              </div>
            </div>
          </div>

          {/* interactive index */}
          <div className="lg:col-span-7">
            <div className="border-t border-ink/10">
              {ITEMS.map((item, i) => {
                const isActive = i === active;
                return (
                  <div key={item.title} className="border-b border-ink/10">
                    <button
                      onClick={() => setActive(i)}
                      onMouseEnter={() => setActive(i)}
                      className="group w-full py-6 text-left md:py-7"
                      aria-expanded={isActive}
                    >
                      <div className="flex items-center justify-between gap-6">
                        <div className="flex items-baseline gap-5 md:gap-8">
                          <span
                            className={`text-xs tabular-nums transition-colors duration-300 ${
                              isActive ? "text-gold" : "text-mute/60"
                            }`}
                          >
                            0{i + 1}
                          </span>
                          <h3
                            className={`font-display text-[1.45rem] font-medium tracking-tight transition-all duration-300 md:text-[2.1rem] ${
                              isActive ? "translate-x-1 text-ink" : "text-ink/35 group-hover:text-ink/70"
                            }`}
                          >
                            {item.title}
                          </h3>
                        </div>
                        <span className="relative mr-1 h-4 w-4 shrink-0">
                          <span className="absolute left-0 top-1/2 h-px w-full -translate-y-1/2 bg-ink/50" />
                          <span
                            className={`absolute left-1/2 top-0 h-full w-px -translate-x-1/2 bg-ink/50 transition-transform duration-300 ${
                              isActive ? "scale-y-0" : "scale-y-100"
                            }`}
                          />
                        </span>
                      </div>
                    </button>
                    <AnimatePresence initial={false}>
                      {isActive && (
                        <motion.div
                          key="desc"
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: "auto", opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
                          className="overflow-hidden"
                        >
                          <p className="max-w-xl pb-7 pl-9 leading-relaxed text-ink/60 md:pl-[3.6rem]">
                            {item.desc}
                          </p>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
