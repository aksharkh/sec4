import { Component, type ReactNode } from "react";
import { motion, useTransform } from "framer-motion";
import Nav from "./components/Nav";
import Hero from "./components/Hero";
import Breakdown from "./components/Breakdown";
import Capabilities from "./components/Capabilities";
import Solutions from "./components/Solutions";
import FinalCTA from "./components/FinalCTA";
import SceneCanvas from "./components/three/SceneCanvas";
import { breakdownMV } from "./lib/bus";

class CanvasBoundary extends Component<
  { children: ReactNode },
  { failed: boolean }
> {
  state = { failed: false };
  static getDerivedStateFromError() {
    return { failed: true };
  }
  render() {
    return this.state.failed ? null : this.props.children;
  }
}

export default function App() {
  /* the room darkens as the model opens, settling into deep navy */
  const bg = useTransform(
    breakdownMV,
    [0, 0.32, 0.55, 0.8],
    ["#F3F0E8", "#DDD6C6", "#12161D", "#071328"]
  );

  return (
    <>
      {/* ambient page colour behind everything */}
      <motion.div className="fixed inset-0 z-0" style={{ backgroundColor: bg }} />

      {/* the Secure Trust Core — one fixed canvas serving hero + breakdown */}
      <CanvasBoundary>
        <SceneCanvas loaded={true} />
      </CanvasBoundary>

      <Nav />

      <main className="relative z-10">
        <Hero loaded={true} />
        <Breakdown />
        <Capabilities />
        <Solutions />
        <FinalCTA />
      </main>
    </>
  );
}
