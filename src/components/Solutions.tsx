import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, ArrowRight } from "lucide-react";
import SectionLabel from "./SectionLabel";

const SOLUTIONS = [
  {
    title: "SOC 2 & ISO 27001",
    copy: "From gap assessment to clean report — audits become a rhythm, not a scramble.",
    img: "https://images.pexels.com/photos/31099297/pexels-photo-31099297.jpeg?auto=compress&cs=tinysrgb&fit=crop&h=627&w=1200",
    alt: "Rhythmic curved lines of modern architecture",
  },
  {
    title: "FedRAMP & CMMC",
    copy: "Federal-grade assurance, translated into an achievable engineering plan.",
    img: "https://images.pexels.com/photos/8485045/pexels-photo-8485045.jpeg?auto=compress&cs=tinysrgb&fit=crop&h=627&w=1200",
    alt: "Engineered metal lattice of a concert hall facade",
  },
  {
    title: "Privacy & Data Protection",
    copy: "Privacy programmes that live inside your product — not in a binder.",
    img: "https://images.pexels.com/photos/2058169/pexels-photo-2058169.jpeg?auto=compress&cs=tinysrgb&fit=crop&h=627&w=1200",
    alt: "A quiet rounded enclosure against the sky",
  },
  {
    title: "Third-Party Risk",
    copy: "Your surface includes your vendors. We help you see all of it.",
    img: "https://images.pexels.com/photos/15202033/pexels-photo-15202033.jpeg?auto=compress&cs=tinysrgb&fit=crop&h=627&w=1200",
    alt: "Interlocking metal bars forming a network",
  },
];

export default function Solutions() {
  const [i, setI] = useState(0);
  const s = SOLUTIONS[i];
  const go = (dir: 1 | -1) => setI((v) => (v + dir + SOLUTIONS.length) % SOLUTIONS.length);

  return (
    <section id="solutions" className="relative rounded-t-[44px] bg-charcoal text-ivory">
      <div className="mx-auto w-full max-w-[1500px] px-6 py-24 md:px-10 md:py-32">
        <div className="flex items-end justify-between">
          <SectionLabel index="03" text="Solutions & experience" light />
          <p className="hidden text-xs text-white/35 md:block">Selected engagements</p>
        </div>

        <div className="mt-12 grid items-center gap-12 md:mt-16 lg:grid-cols-12 lg:gap-16">
          {/* sculptural image mask */}
          <div className="lg:col-span-7">
            <motion.div
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-80px" }}
              transition={{ duration: 1, ease: [0.22, 1, 0.36, 1] }}
              className="relative aspect-[4/3] overflow-hidden rounded-[110px_24px_110px_24px] border border-white/10 md:aspect-[16/11] md:rounded-[200px_32px_200px_32px]"
            >
              <AnimatePresence>
                <motion.img
                  key={i}
                  src={s.img}
                  alt={s.alt}
                  loading="lazy"
                  initial={{ opacity: 0, scale: 1.06 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
                  className="absolute inset-0 h-full w-full object-cover saturate-[0.82]"
                />
              </AnimatePresence>
              {/* quiet material grade */}
              <div className="pointer-events-none absolute inset-0 bg-charcoal/10" />
            </motion.div>
          </div>

          {/* editorial column */}
          <div className="lg:col-span-5">
            <div className="flex items-baseline gap-2">
              <span className="font-display text-5xl font-medium tracking-tight text-goldlight tabular-nums">
                0{i + 1}
              </span>
              <span className="text-white/35 tabular-nums">/ 0{SOLUTIONS.length}</span>
            </div>

            <AnimatePresence mode="wait">
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 18 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -12 }}
                transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
              >
                <h3 className="mt-6 font-display text-3xl font-medium tracking-tight md:text-[2.6rem] md:leading-tight">
                  {s.title}
                </h3>
                <p className="mt-4 max-w-md leading-relaxed text-white/55">{s.copy}</p>
              </motion.div>
            </AnimatePresence>

            <div className="mt-10 flex items-center gap-5">
              <button
                onClick={() => go(-1)}
                aria-label="Previous solution"
                className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full border border-white/25 transition-colors duration-300 hover:bg-ivory hover:text-ink"
              >
                <ArrowLeft className="h-4 w-4" />
              </button>
              <div className="relative h-px flex-1 bg-white/15">
                <motion.div
                  className="absolute inset-y-0 left-0 bg-goldlight"
                  animate={{ width: `${((i + 1) / SOLUTIONS.length) * 100}%` }}
                  transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
                />
              </div>
              <button
                onClick={() => go(1)}
                aria-label="Next solution"
                className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full border border-white/25 transition-colors duration-300 hover:bg-ivory hover:text-ink"
              >
                <ArrowRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
