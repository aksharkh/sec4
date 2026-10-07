import { motionValue } from "framer-motion";

/** Projected 2D screen coordinates (in viewport pixels) for each of the 5 3D ring rim anchors. */
export interface ProjectedNode {
  /** Pixel X in viewport (0 .. window.innerWidth) */
  x: number;
  /** Pixel Y in viewport (0 .. window.innerHeight) */
  y: number;
  /** How far this ring is currently expanded (0..1) */
  open: number;
}

/**
 * Shared real-time state between the Three.js WebGL stage and the React UI.
 * Read and written inside `requestAnimationFrame` at 60fps without triggering React re-renders.
 */
export const bus = {
  /** 0 → 1 as the hero scrolls out of view. Moves the model from hero offset to centre. */
  hero: 0,
  /** Viewport flag, kept in sync by the canvas host. */
  mobile: false,
  /** Normalized pointer coordinates (-1..1) for interactive 3D tilt & raycasting */
  pointerX: 0,
  pointerY: 0,
  /** User drag-rotation offsets (radians) + angular velocity for inertia */
  dragYaw: 0,
  dragPitch: 0,
  velYaw: 0,
  velPitch: 0,
  isDragging: false,
  /** Currently hovered ring index (0..4) from either 3D raycast or DOM label hover (-1 = none) */
  hoveredTier: -1,
  /** Locked/selected ring index (0..4) when user clicks a ring or pill (-1 = none) */
  selectedTier: -1,
  /** Manual explode override (0 = follow scroll, 1 = manually expanded in Hero/stage) */
  manualExplode: 0,
  /** Pulse shockwave timer (triggered on click/interaction) */
  pulseWave: 0,
  /** Live 2D screen positions of the 5 ring callout anchors, updated every WebGL frame. */
  nodes: Array.from({ length: 5 }, (): ProjectedNode => ({
    x: 0,
    y: 0,
    open: 0,
  })),
  /** Frame listener so the SVG leader-line overlay in Breakdown updates in lockstep with Three.js. */
  onFrame: null as (() => void) | null,
  /** UI listener when 3D raycast changes hovered/selected ring or manualExplode */
  onInteractionChange: null as (() => void) | null,
};

/** Scroll progress of the sticky model-breakdown section (0 → 1). */
export const breakdownMV = motionValue(0);

/* ------------------------------------------------------------------ */
/* 5 Precision Architectural Rings of the SecureKnots System           */
/* ------------------------------------------------------------------ */

export interface TierDef {
  id: string;
  code: string;
  name: string;
  subtitle: string;
  desc: string;
  metric: string;
  /** Assembled Y position in local model units (nested 5-ring stack) */
  yAsm: number;
  /** Expanded Y position in local model units (5-ring architectural spread) */
  yExp: number;
  /** Expanded X offset so the 5 rings fan out with clean silhouette separation */
  xExp: number;
  /** Outer rim X coordinate where the callout pin sits in local ring space */
  anchorX: number;
  /** Scroll window [start, end] when this ring expands outward */
  openWin: [number, number];
  /** Scroll window [start, end] when its label & leader line are visible */
  labelWin: [number, number];
  /** Side of the viewport where the editorial label sits */
  side: "left" | "right";
  /** Vertical screen percentage for the label on desktop */
  topPct: string;
  /** Primary material color */
  color: string;
  /** Accent material color */
  accent: string;
}

export const TIERS: TierDef[] = [
  {
    id: "governance",
    code: "01",
    name: "Governance",
    subtitle: "Crown Policy Bezel Ring",
    desc: "Accountability, policy architecture, and board-level oversight that set direction from the top ring.",
    metric: "12 Precision Index Markers",
    yAsm: 0.32,
    yExp: 1.62,
    xExp: -0.14,
    anchorX: -1.10,
    openWin: [0.02, 0.16],
    labelWin: [0.06, 0.68],
    side: "left",
    topPct: "23%",
    color: "#232832",
    accent: "#c99a50",
  },
  {
    id: "risk",
    code: "02",
    name: "Risk",
    subtitle: "Orbital Telemetry Ring",
    desc: "Continuous perimeter visibility — risk identified clearly, sized honestly, and owned by name.",
    metric: "3 Active Orbital Nodes",
    yAsm: 0.16,
    yExp: 0.81,
    xExp: 0.18,
    anchorX: 1.22,
    openWin: [0.08, 0.22],
    labelWin: [0.12, 0.68],
    side: "right",
    topPct: "36.5%",
    color: "#343d4b",
    accent: "#2a58d6",
  },
  {
    id: "compliance",
    code: "03",
    name: "Compliance",
    subtitle: "Master Assurance Ring",
    desc: "The central champagne-gold & silver twin-track ring — regulatory obligations met continuously.",
    metric: "Twin-Track Verification Collar",
    yAsm: 0.0,
    yExp: 0.0,
    xExp: -0.06,
    anchorX: -1.26,
    openWin: [0.14, 0.28],
    labelWin: [0.18, 0.68],
    side: "left",
    topPct: "50%",
    color: "#c99a50",
    accent: "#e7c27a",
  },
  {
    id: "security",
    code: "04",
    name: "Security",
    subtitle: "6-Segment Shield Ring",
    desc: "Six articulated armor segments that iris-expand for inspection and lock shut around every workload.",
    metric: "6 Articulated Shield Arcs",
    yAsm: -0.16,
    yExp: -0.81,
    xExp: 0.18,
    anchorX: 1.22,
    openWin: [0.20, 0.34],
    labelWin: [0.24, 0.68],
    side: "right",
    topPct: "63.5%",
    color: "#15294e",
    accent: "#c7cfd8",
  },
  {
    id: "privacy",
    code: "05",
    name: "Privacy",
    subtitle: "Cryptographic Base Ring",
    desc: "Foundational data protection and cryptographic restraint sealed into the base ring.",
    metric: "Dual-Channel Seal Inlay",
    yAsm: -0.32,
    yExp: -1.62,
    xExp: -0.14,
    anchorX: -1.10,
    openWin: [0.26, 0.40],
    labelWin: [0.30, 0.68],
    side: "left",
    topPct: "77%",
    color: "#1e232b",
    accent: "#c99a50",
  },
];

/** Backwards-compatible aliases */
export const KNOT_POINTS = TIERS;
export const LAYERS = TIERS;
export type KnotPointDef = TierDef;
export type LayerDef = TierDef;
