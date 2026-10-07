import { useEffect, useRef, useState } from "react";
import {
  motion,
  useScroll,
  useTransform,
  useMotionValueEvent,
  type MotionValue,
} from "framer-motion";
import { bus, breakdownMV, TIERS, type TierDef } from "../lib/bus";

const smooth = (t: number) => (t <= 0 ? 0 : t >= 1 ? 1 : t * t * (3 - 2 * t));
const win = (p: number, a: number, b: number) => smooth((p - a) / (b - a));

/* ------------------------------------------------------------------ */
/* Desktop Discipline Label — Boxless Editorial Callout + Hover/Click  */
/* ------------------------------------------------------------------ */

function DisciplineLabel({
  sp,
  ink,
  tier,
  index,
  isHighlighted,
  onSelect,
  anchorRef,
}: {
  sp: MotionValue<number>;
  ink: MotionValue<string>;
  tier: TierDef;
  index: number;
  isHighlighted: boolean;
  onSelect: (index: number) => void;
  anchorRef: (el: HTMLSpanElement | null) => void;
}) {
  const [start, end] = tier.labelWin;
  const opacity = useTransform(sp, [start, start + 0.05, end, end + 0.06], [0, 1, 1, 0]);
  const y = useTransform(sp, [start, start + 0.06], [12, 0]);

  const isRight = tier.side === "right";

  return (
    <motion.div
      data-ui-interactive="true"
      onMouseEnter={() => {
        bus.hoveredTier = index;
      }}
      onMouseLeave={() => {
        if (bus.hoveredTier === index) bus.hoveredTier = -1;
      }}
      onClick={() => onSelect(index)}
      className={`group absolute z-30 -translate-y-1/2 cursor-pointer select-none ${
        isRight ? "right-[4%] lg:right-[6%]" : "left-[4%] lg:left-[6%]"
      }`}
      style={{ top: tier.topPct, opacity, y, color: ink }}
    >
      <div
        className={`flex items-start gap-3.5 ${
          isRight ? "flex-row" : "flex-row-reverse"
        }`}
      >
        {/* Exact DOM anchor dot where the horizontal SVG leader line terminates */}
        <span
          ref={anchorRef}
          className={`mt-2 inline-block h-2.5 w-2.5 shrink-0 rounded-full bg-gold transition-transform duration-300 ${
            isHighlighted ? "scale-150 ring-4 ring-gold/30" : "group-hover:scale-150"
          }`}
        />

        <div className={isRight ? "text-left" : "text-right"}>
          <p className="text-[10px] uppercase tracking-[0.26em] text-gold tabular-nums">
            {tier.code} · {tier.subtitle}
          </p>
          <p
            className={`mt-0.5 font-display text-lg font-medium tracking-tight transition-transform duration-300 lg:text-xl ${
              isHighlighted
                ? "translate-x-0.5 text-gold"
                : "group-hover:translate-x-0.5"
            }`}
          >
            {tier.name}
          </p>
          <p className="mt-1 max-w-[235px] text-xs leading-relaxed opacity-75 lg:text-[13px]">
            {tier.desc}
          </p>
          <p className="mt-1 text-[10px] uppercase tracking-[0.2em] text-gold/80">
            {tier.metric}
          </p>
        </div>
      </div>
    </motion.div>
  );
}

/* ------------------------------------------------------------------ */
/* Mobile Discipline Label — One Step at a Time Below the Astrolabe    */
/* ------------------------------------------------------------------ */

function MobileLabel({
  sp,
  ink,
  tier,
  index,
}: {
  sp: MotionValue<number>;
  ink: MotionValue<string>;
  tier: TierDef;
  index: number;
}) {
  const a = tier.openWin[0];
  const nextA = index < TIERS.length - 1 ? TIERS[index + 1].openWin[0] : 0.64;
  const opacity = useTransform(sp, [a, a + 0.04, nextA - 0.02, nextA + 0.03], [0, 1, 1, 0]);
  const y = useTransform(sp, [a, a + 0.05], [10, 0]);

  return (
    <motion.div
      className="absolute inset-x-0 bottom-0 px-8 text-center"
      style={{ opacity, y, color: ink }}
    >
      <p className="text-[10px] uppercase tracking-[0.26em] text-gold tabular-nums">
        {tier.code} · {tier.subtitle}
      </p>
      <p className="mt-1 font-display text-lg font-medium tracking-tight">{tier.name}</p>
      <p className="mx-auto mt-1 max-w-[310px] text-[13px] leading-relaxed opacity-75">
        {tier.desc}
      </p>
    </motion.div>
  );
}

/* ------------------------------------------------------------------ */
/* Main Scroll-Driven Exploded-View Breakdown Section                  */
/* ------------------------------------------------------------------ */

export default function Breakdown() {
  const sectionRef = useRef<HTMLElement>(null);
  const stickyRef = useRef<HTMLDivElement>(null);
  const anchorRefs = useRef<Array<HTMLSpanElement | null>>([]);
  const svgGroupRefs = useRef<Array<SVGGElement | null>>([]);
  const polylineRefs = useRef<Array<SVGPolylineElement | null>>([]);
  const targetOuterRefs = useRef<Array<SVGCircleElement | null>>([]);
  const targetInnerRefs = useRef<Array<SVGCircleElement | null>>([]);

  const [highlightedIdx, setHighlightedIdx] = useState<number>(-1);

  const { scrollYProgress: sp } = useScroll({
    target: sectionRef,
    offset: ["start start", "end end"],
  });

  useMotionValueEvent(sp, "change", (v) => breakdownMV.set(v));

  /* Ink transitions smoothly from charcoal on warm ivory to ivory on deep navy */
  const ink = useTransform(sp, [0.32, 0.5], ["#171a1f", "#eae5da"]);

  /* Opening section header */
  const introOpacity = useTransform(sp, [0, 0.02, 0.11, 0.16], [0, 1, 1, 0]);
  const introY = useTransform(sp, [0, 0.08], [12, 0]);

  /* Closing summary statement (visible once the 5 tiers re-lock around the Torus Knot) */
  const sumOpacity = useTransform(sp, [0.74, 0.82], [0, 1]);
  const sumY = useTransform(sp, [0.74, 0.84], [16, 0]);
  const sumRule = useTransform(sp, [0.74, 0.86], [0, 1]);

  /* Jump-scroll to a specific discipline step when clicked */
  const jumpToDiscipline = (idx: number) => {
    bus.pulseWave = 1.0;
    bus.selectedTier = bus.selectedTier === idx ? -1 : idx;
    setHighlightedIdx(bus.selectedTier);

    const sec = sectionRef.current;
    if (!sec) return;
    const rect = sec.getBoundingClientRect();
    const absTop = window.scrollY + rect.top;
    const scrollable = Math.max(sec.offsetHeight - window.innerHeight, 1);
    const targetP = idx === 5 ? 0.84 : TIERS[idx].openWin[1] + 0.04;
    window.scrollTo({
      top: absTop + scrollable * targetP,
      behavior: "smooth",
    });
  };

  /* Synchronize horizontal SVG leader lines with exact 3D rim callout pins every frame */
  useEffect(() => {
    const updateLines = () => {
      const stickyEl = stickyRef.current;
      if (!stickyEl) return;
      const p = breakdownMV.get();
      const isDark = p > 0.4;
      const baseStroke = isDark ? "rgba(234, 229, 218, 0.52)" : "rgba(23, 26, 31, 0.42)";

      const activeHov =
        bus.selectedTier !== -1 ? bus.selectedTier : bus.hoveredTier;

      for (let i = 0; i < TIERS.length; i++) {
        const g = svgGroupRefs.current[i];
        const poly = polylineRefs.current[i];
        const cOuter = targetOuterRefs.current[i];
        const cInner = targetInnerRefs.current[i];
        const anchor = anchorRefs.current[i];
        if (!g || !poly || !cOuter || !cInner || !anchor) continue;

        const tier = TIERS[i];
        const [start, end] = tier.labelWin;
        const alpha = win(p, start, start + 0.05) * (1 - win(p, end, end + 0.05));

        if (alpha <= 0.005 || bus.mobile) {
          g.style.opacity = "0";
          continue;
        }

        const isHovered = activeHov === i;
        g.style.opacity = alpha.toFixed(3);

        // 1. Exact 3D Rim Callout Pin screen position (projected by Three.js in useFrame)
        const px = bus.nodes[i].x;
        const py = bus.nodes[i].y;

        // 2. HTML Label anchor dot screen position
        const rect = anchor.getBoundingClientRect();
        const lx = rect.left + rect.width * 0.5;
        const ly = rect.top + rect.height * 0.5;

        // 3. Clean architectural horizontal leader line with an elbow near the 3D rim
        const elbowX = tier.side === "left" ? px - 28 : px + 28;
        const elbowY = ly;

        poly.setAttribute(
          "points",
          `${px.toFixed(1)},${py.toFixed(1)} ${elbowX.toFixed(1)},${elbowY.toFixed(1)} ${lx.toFixed(1)},${ly.toFixed(1)}`
        );
        poly.setAttribute("stroke", isHovered ? "#C99A50" : baseStroke);
        poly.setAttribute("stroke-width", isHovered ? "1.75" : "1.15");

        cOuter.setAttribute("cx", px.toFixed(1));
        cOuter.setAttribute("cy", py.toFixed(1));
        cOuter.setAttribute("r", isHovered ? "10" : "7");
        cInner.setAttribute("cx", px.toFixed(1));
        cInner.setAttribute("cy", py.toFixed(1));
      }
    };

    bus.onFrame = updateLines;
    return () => {
      if (bus.onFrame === updateLines) {
        bus.onFrame = null;
      }
    };
  }, []);

  return (
    <section ref={sectionRef} id="approach" className="relative h-[480vh] md:h-[520vh]">
      <div ref={stickyRef} className="sticky top-0 h-svh overflow-hidden">
        {/* ============================================================ */}
        {/* HORIZONTAL 3D-TO-2D ARCHITECTURAL LEADER LINE OVERLAY        */}
        {/* ============================================================ */}
        <svg
          className="pointer-events-none absolute inset-0 z-10 hidden h-full w-full md:block"
          aria-hidden
        >
          {TIERS.map((tier, i) => (
            <g
              key={`leader-${tier.id}`}
              ref={(el) => {
                svgGroupRefs.current[i] = el;
              }}
              style={{ opacity: 0 }}
            >
              <polyline
                ref={(el) => {
                  polylineRefs.current[i] = el;
                }}
                fill="none"
                stroke="rgba(23, 26, 31, 0.42)"
                strokeWidth="1.15"
              />
              <circle
                ref={(el) => {
                  targetOuterRefs.current[i] = el;
                }}
                r="7"
                fill="none"
                stroke="#C99A50"
                strokeWidth="1.2"
                strokeOpacity="0.9"
              />
              <circle
                ref={(el) => {
                  targetInnerRefs.current[i] = el;
                }}
                r="2.5"
                fill="#C99A50"
              />
            </g>
          ))}
        </svg>

        {/* ============================================================ */}
        {/* SECTION HEADER (TOP-LEFT) + INTERACTIVE STEP JUMPER          */}
        {/* ============================================================ */}
        <motion.div
          className="absolute left-6 top-20 max-w-sm md:left-12 md:top-24"
          style={{ opacity: introOpacity, y: introY, color: ink }}
        >
          <p className="flex items-center gap-3 text-[10px] uppercase tracking-[0.3em]">
            <span className="text-gold">01</span>
            <span className="h-px w-8 bg-current opacity-40" />
            The connected system
          </p>
          <h2 className="mt-4 font-display text-3xl font-medium leading-tight tracking-tight md:text-4xl">
            Five precision rings, one connected system.
          </h2>
        </motion.div>

        {/* Interactive Step Navigator Pill Bar (Top Center) */}
        <div
          data-ui-interactive="true"
          className="absolute left-1/2 top-20 z-30 hidden -translate-x-1/2 items-center gap-1 rounded-full border border-gold/25 bg-ink/10 px-2 py-1 backdrop-blur-xs md:flex"
        >
          {TIERS.map((t, idx) => (
            <button
              key={t.id}
              type="button"
              onMouseEnter={() => {
                bus.hoveredTier = idx;
                setHighlightedIdx(idx);
              }}
              onMouseLeave={() => {
                bus.hoveredTier = -1;
                setHighlightedIdx(bus.selectedTier);
              }}
              onClick={() => jumpToDiscipline(idx)}
              className={`rounded-full px-3 py-1 text-[11px] font-medium transition-all duration-200 ${
                highlightedIdx === idx
                  ? "bg-gold text-ink"
                  : "text-gold hover:bg-gold/15"
              }`}
            >
              <span className="mr-1 opacity-70 tabular-nums">{t.code}</span>
              {t.name}
            </button>
          ))}
          <button
            type="button"
            onClick={() => jumpToDiscipline(5)}
            className="rounded-full px-3 py-1 text-[11px] font-medium text-gold transition-all duration-200 hover:bg-gold/15"
          >
            Align Rings
          </button>
        </div>

        {/* ============================================================ */}
        {/* DESKTOP DISCIPLINE CALLOUTS (ORDERED TOP TO BOTTOM)          */}
        {/* ============================================================ */}
        <div className="hidden md:block">
          {TIERS.map((tier, i) => (
            <DisciplineLabel
              key={tier.id}
              sp={sp}
              ink={ink}
              tier={tier}
              index={i}
              isHighlighted={highlightedIdx === i}
              onSelect={(idx) => {
                bus.pulseWave = 1.0;
                bus.selectedTier = bus.selectedTier === idx ? -1 : idx;
                setHighlightedIdx(bus.selectedTier);
              }}
              anchorRef={(el) => {
                anchorRefs.current[i] = el;
              }}
            />
          ))}
        </div>

        {/* ============================================================ */}
        {/* MOBILE DISCIPLINE CALLOUTS (ONE STEP AT A TIME)              */}
        {/* ============================================================ */}
        <div className="absolute inset-x-0 bottom-24 h-24 md:hidden">
          {TIERS.map((tier, i) => (
            <MobileLabel key={tier.id} sp={sp} ink={ink} tier={tier} index={i} />
          ))}
        </div>

        {/* ============================================================ */}
        {/* CLOSING REASSEMBLY STATEMENT                                 */}
        {/* ============================================================ */}
        <motion.div
          className="absolute inset-x-0 bottom-16 flex flex-col items-center gap-3.5 px-6 text-center md:bottom-20"
          style={{ opacity: sumOpacity, y: sumY }}
        >
          <motion.span className="h-px w-16 bg-gold" style={{ scaleX: sumRule }} />
          <p className="font-display text-2xl font-medium tracking-tight text-[#eae5da] md:text-3xl">
            Locked in alignment — one continuous system of trust.
          </p>
          <p className="max-w-md text-xs leading-relaxed text-[#eae5da]/65 md:text-sm">
            Governance, risk, compliance, security, and privacy seal together into a single
            precision-engineered ring architecture.
          </p>
        </motion.div>

        {/* Scroll progress hairline */}
        <div className="absolute bottom-6 left-1/2 h-px w-40 -translate-x-1/2">
          <motion.div className="absolute inset-0 bg-current opacity-15" style={{ color: ink }} />
          <motion.div className="absolute inset-0 origin-left bg-gold" style={{ scaleX: sp }} />
        </div>
      </div>
    </section>
  );
}
