import * as THREE from "three";
import { TIERS } from "../../lib/bus";

/* ------------------------------------------------------------------ */
/* Precision Beveled Lathe Profile Builder                             */
/* ------------------------------------------------------------------ */

function pushBevelCorner(
  pts: THREE.Vector2[],
  from: [number, number],
  corner: [number, number],
  to: [number, number],
  b = 0.014
) {
  const v1x = from[0] - corner[0];
  const v1y = from[1] - corner[1];
  const l1 = Math.hypot(v1x, v1y) || 1;

  const v2x = to[0] - corner[0];
  const v2y = to[1] - corner[1];
  const l2 = Math.hypot(v2x, v2y) || 1;

  pts.push(
    new THREE.Vector2(corner[0] + (v1x / l1) * b * 1.35, corner[1] + (v1y / l1) * b * 1.35),
    new THREE.Vector2(corner[0] + (v1x / l1) * b, corner[1] + (v1y / l1) * b),
    new THREE.Vector2(
      corner[0] + ((v1x / l1 + v2x / l2) * 0.55) * b,
      corner[1] + ((v1y / l1 + v2y / l2) * 0.55) * b
    ),
    new THREE.Vector2(corner[0] + (v2x / l2) * b, corner[1] + (v2y / l2) * b),
    new THREE.Vector2(corner[0] + (v2x / l2) * b * 1.35, corner[1] + (v2y / l2) * b * 1.35)
  );
}

/**
 * Creates a CNC-machined beveled ring with a stepped outer shoulder and a
 * completely clean, open inner aperture.
 */
function createMachinedRingGeo(
  innerR: number,
  outerR: number,
  height: number,
  stepR = 0.045,
  stepH = 0.026,
  bevel = 0.011
): THREE.LatheGeometry {
  const h2 = height * 0.5;
  const corners: Array<[number, number]> = [
    [innerR, -h2],
    [outerR - stepR, -h2],
    [outerR - stepR, -h2 + stepH],
    [outerR, -h2 + stepH],
    [outerR, h2 - stepH],
    [outerR - stepR, h2 - stepH],
    [outerR - stepR, h2],
    [innerR, h2],
  ];

  const pts: THREE.Vector2[] = [];
  const n = corners.length;
  for (let i = 0; i < n; i++) {
    pushBevelCorner(pts, corners[(i - 1 + n) % n], corners[i], corners[(i + 1) % n], bevel);
  }
  pts.push(pts[0].clone());

  const geo = new THREE.LatheGeometry(pts, 96);
  geo.computeVertexNormals();
  return geo;
}

/**
 * Builds a curved, beveled armor shield sector (spanning `arcAngle` radians)
 * for Ring 04 (Security 6-Segment Shield Ring).
 */
function createCurvedShieldSegmentGeo(
  innerR: number,
  outerR: number,
  height: number,
  arcAngle: number
): THREE.LatheGeometry {
  const h2 = height * 0.5;
  const corners: Array<[number, number]> = [
    [innerR, -h2 * 0.85],
    [outerR - 0.03, -h2],
    [outerR, -h2 * 0.6],
    [outerR, h2 * 0.6],
    [outerR - 0.03, h2],
    [innerR, h2 * 0.85],
  ];
  const pts: THREE.Vector2[] = [];
  const n = corners.length;
  for (let i = 0; i < n; i++) {
    pushBevelCorner(pts, corners[(i - 1 + n) % n], corners[i], corners[(i + 1) % n], 0.009);
  }
  pts.push(pts[0].clone());

  const geo = new THREE.LatheGeometry(pts, 28, -arcAngle * 0.5, arcAngle);
  geo.computeVertexNormals();
  return geo;
}

/* ------------------------------------------------------------------ */
/* Complete 5-Ring Precision Architectural Rig (Clean Open Center)     */
/* ------------------------------------------------------------------ */

export interface KineticAstrolabeRig {
  root: THREE.Group;
  tiltGroup: THREE.Group;
  tierGroups: THREE.Group[];
  tierAnchors: THREE.Object3D[];
  raycastMeshes: THREE.Mesh[];
  tierHighlightMats: THREE.MeshPhysicalMaterial[];
  guideRailsGroup: THREE.Group;
  guideRailMat: THREE.MeshBasicMaterial;
  triadLoopsGroup: THREE.Group;
  triadLoopMats: THREE.MeshPhysicalMaterial[];
  /** Called every frame inside requestAnimationFrame */
  update: (t: number, dt: number, openAmounts: number[], closeWeight: number) => void;
}

function tagTierMeshes(rootObj: THREE.Object3D, tierIndex: number, list: THREE.Mesh[]) {
  rootObj.traverse((child) => {
    if ((child as THREE.Mesh).isMesh) {
      child.userData.tierIndex = tierIndex;
      list.push(child as THREE.Mesh);
    }
  });
}

export function createKineticAstrolabeRig(): KineticAstrolabeRig {
  const root = new THREE.Group();
  const tiltGroup = new THREE.Group();
  root.add(tiltGroup);

  const tierGroups: THREE.Group[] = [];
  const tierAnchors: THREE.Object3D[] = [];
  const raycastMeshes: THREE.Mesh[] = [];

  /* ---------------------------------------------------------------- */
  /* Studio PBR Materials                                             */
  /* ---------------------------------------------------------------- */
  const tierHighlightMats = TIERS.map(
    (tier, idx) =>
      new THREE.MeshPhysicalMaterial({
        color: tier.color,
        metalness: idx === 2 ? 0.95 : 0.88,
        roughness: idx === 2 ? 0.17 : 0.23,
        clearcoat: 0.84,
        clearcoatRoughness: 0.16,
        emissive: idx === 2 ? "#5e4010" : "#000000",
        emissiveIntensity: idx === 2 ? 0.22 : 0.0,
        side: THREE.DoubleSide,
      })
  );

  const goldMat = new THREE.MeshPhysicalMaterial({
    color: "#d9ab5c",
    metalness: 0.96,
    roughness: 0.18,
    clearcoat: 0.88,
    clearcoatRoughness: 0.14,
    emissive: "#573c10",
    emissiveIntensity: 0.18,
  });

  const silverMat = new THREE.MeshPhysicalMaterial({
    color: "#c9d2dc",
    metalness: 0.94,
    roughness: 0.2,
    clearcoat: 0.82,
    clearcoatRoughness: 0.16,
  });

  const cobaltGlowMat = new THREE.MeshPhysicalMaterial({
    color: "#2a58d6",
    metalness: 0.65,
    roughness: 0.2,
    clearcoat: 0.9,
    emissive: "#2350cc",
    emissiveIntensity: 0.7,
  });

  const pulseGoldMat = new THREE.MeshPhysicalMaterial({
    color: "#f2d28b",
    metalness: 0.92,
    roughness: 0.12,
    emissive: "#d9a243",
    emissiveIntensity: 0.9,
  });

  const pinGeo = new THREE.SphereGeometry(0.04, 20, 20);
  const pinCollarGeo = new THREE.TorusGeometry(0.072, 0.008, 14, 36);

  /* ================================================================ */
  /* RING 01: GOVERNANCE — CROWN POLICY BEZEL RING                    */
  /* ================================================================ */
  const tier0 = new THREE.Group();
  const crownOuterRing = new THREE.Mesh(
    createMachinedRingGeo(0.82, 1.06, 0.125, 0.04, 0.025),
    tierHighlightMats[0]
  );
  tier0.add(crownOuterRing);

  // Counter-rotating golden bezel track seated on the upper shoulder of Ring 01
  const crownInnerRotor = new THREE.Group();
  const crownInnerBezel = new THREE.Mesh(
    new THREE.TorusGeometry(0.94, 0.014, 20, 110),
    goldMat
  );
  crownInnerBezel.rotation.x = Math.PI / 2;
  crownInnerBezel.position.y = 0.056;
  crownInnerRotor.add(crownInnerBezel);

  // 12 precision degree ticks along the upper rim
  const tickGeo = new THREE.BoxGeometry(0.055, 0.018, 0.014);
  for (let i = 0; i < 12; i++) {
    const a = (i / 12) * Math.PI * 2;
    const tick = new THREE.Mesh(tickGeo, i % 3 === 0 ? goldMat : silverMat);
    tick.position.set(Math.cos(a) * 0.94, 0.064, Math.sin(a) * 0.94);
    tick.rotation.y = -a;
    crownInnerRotor.add(tick);
  }
  tier0.add(crownInnerRotor);

  // 4 outer perimeter policy calipers
  const crownCalipers: Array<{ mesh: THREE.Group; angle: number }> = [];
  const caliperBodyGeo = new THREE.BoxGeometry(0.12, 0.038, 0.058);
  const caliperTipGeo = new THREE.CylinderGeometry(0.018, 0.018, 0.055, 16);
  for (let i = 0; i < 4; i++) {
    const a = (i / 4) * Math.PI * 2 + Math.PI / 4;
    const calGrp = new THREE.Group();
    const body = new THREE.Mesh(caliperBodyGeo, silverMat);
    const tip = new THREE.Mesh(caliperTipGeo, goldMat);
    tip.position.set(0.04, 0.015, 0);
    calGrp.add(body, tip);
    calGrp.rotation.y = -a;
    tier0.add(calGrp);
    crownCalipers.push({ mesh: calGrp, angle: a });
  }

  /* ================================================================ */
  /* RING 02: RISK — ORBITAL TELEMETRY RING                           */
  /* ================================================================ */
  const tier1 = new THREE.Group();
  const riskChassis = new THREE.Mesh(
    createMachinedRingGeo(0.88, 1.15, 0.13, 0.045, 0.026),
    tierHighlightMats[1]
  );
  tier1.add(riskChassis);

  // Luminous cobalt telemetry channel inlaid on the ring face
  const riskTrack = new THREE.Mesh(
    new THREE.TorusGeometry(1.02, 0.013, 18, 120),
    cobaltGlowMat
  );
  riskTrack.rotation.x = Math.PI / 2;
  riskTrack.position.y = 0.052;
  tier1.add(riskTrack);

  // 16 perimeter radiator fins along the outer edge
  const finGeo = new THREE.BoxGeometry(0.055, 0.044, 0.02);
  for (let i = 0; i < 16; i++) {
    const a = (i / 16) * Math.PI * 2;
    const fin = new THREE.Mesh(finGeo, i % 2 === 0 ? goldMat : silverMat);
    fin.position.set(Math.cos(a) * 1.14, 0, Math.sin(a) * 1.14);
    fin.rotation.y = -a;
    tier1.add(fin);
  }

  // 3 Active Orbital Nodes riding smoothly along the ring's telemetry track
  const riskSatellitesGroup = new THREE.Group();
  const satCoreGeo = new THREE.SphereGeometry(0.04, 20, 20);
  const satGimbalGeo = new THREE.TorusGeometry(0.072, 0.008, 14, 36);
  const satGimbals: THREE.Mesh[] = [];
  for (let i = 0; i < 3; i++) {
    const a = (i / 3) * Math.PI * 2;
    const satHolder = new THREE.Group();
    satHolder.position.set(Math.cos(a) * 1.02, 0.058, Math.sin(a) * 1.02);
    const satCore = new THREE.Mesh(satCoreGeo, pulseGoldMat);
    const satGimbal = new THREE.Mesh(satGimbalGeo, silverMat);
    satHolder.add(satCore, satGimbal);
    riskSatellitesGroup.add(satHolder);
    satGimbals.push(satGimbal);
  }
  tier1.add(riskSatellitesGroup);

  /* ================================================================ */
  /* RING 03: COMPLIANCE — MASTER TWIN-TRACK ASSURANCE RING           */
  /*          (Clean open center — zero central clutter)              */
  /* ================================================================ */
  const tier2 = new THREE.Group();

  // Primary sculpted Champagne-Gold Master Ring
  const masterGoldRing = new THREE.Mesh(
    createMachinedRingGeo(0.92, 1.15, 0.145, 0.042, 0.028),
    tierHighlightMats[2]
  );
  tier2.add(masterGoldRing);

  // Counter-rotating Brushed-Silver Outer Verification Collar
  const complianceOuterCollar = new THREE.Group();
  const outerCollarMesh = new THREE.Mesh(
    createMachinedRingGeo(1.155, 1.23, 0.095, 0.02, 0.018),
    silverMat
  );
  complianceOuterCollar.add(outerCollarMesh);

  // 24 precision index notches around the outer verification collar
  const notchGeo = new THREE.BoxGeometry(0.04, 0.032, 0.016);
  for (let i = 0; i < 24; i++) {
    const a = (i / 24) * Math.PI * 2;
    const notch = new THREE.Mesh(notchGeo, i % 3 === 0 ? goldMat : silverMat);
    notch.position.set(Math.cos(a) * 1.225, 0, Math.sin(a) * 1.225);
    notch.rotation.y = -a;
    complianceOuterCollar.add(notch);
  }
  tier2.add(complianceOuterCollar);

  // Twin golden & cobalt inlay tracks on the master ring
  const masterUpperWire = new THREE.Mesh(
    new THREE.TorusGeometry(1.04, 0.012, 18, 120),
    cobaltGlowMat
  );
  masterUpperWire.rotation.x = Math.PI / 2;
  masterUpperWire.position.y = 0.064;
  tier2.add(masterUpperWire);

  const masterLowerWire = new THREE.Mesh(
    new THREE.TorusGeometry(1.04, 0.012, 18, 120),
    goldMat
  );
  masterLowerWire.rotation.x = Math.PI / 2;
  masterLowerWire.position.y = -0.064;
  tier2.add(masterLowerWire);

  /* ================================================================ */
  /* RING 04: SECURITY — 6-SEGMENT ARTICULATED SHIELD RING            */
  /* ================================================================ */
  const tier3 = new THREE.Group();

  // Inner brushed-silver structural track ring (open center r = 0.88)
  const secInnerHoop = new THREE.Mesh(
    new THREE.TorusGeometry(0.90, 0.022, 20, 110),
    silverMat
  );
  secInnerHoop.rotation.x = Math.PI / 2;
  tier3.add(secInnerHoop);

  // 6 Articulated Curved Armor Shield Segments that iris-open radially
  const shieldArcGeo = createCurvedShieldSegmentGeo(0.91, 1.16, 0.145, Math.PI / 3.35);
  const shieldStrutGeo = new THREE.CylinderGeometry(0.016, 0.016, 0.165, 14);
  const securityShields: Array<{ group: THREE.Group; angle: number }> = [];

  for (let i = 0; i < 6; i++) {
    const a = (i / 6) * Math.PI * 2;
    const shGrp = new THREE.Group();
    shGrp.rotation.y = -a;

    const plate = new THREE.Mesh(shieldArcGeo, tierHighlightMats[3]);
    plate.rotation.y = Math.PI / 2;

    const strut = new THREE.Mesh(shieldStrutGeo, goldMat);
    strut.position.set(1.04, 0.015, 0);

    shGrp.add(plate, strut);
    tier3.add(shGrp);
    securityShields.push({ group: shGrp, angle: a });
  }

  /* ================================================================ */
  /* RING 05: PRIVACY — CRYPTOGRAPHIC BASE SEAL RING                  */
  /*          (Clean open center — no inner gyro clutter)             */
  /* ================================================================ */
  const tier4 = new THREE.Group();
  const privVaultRing = new THREE.Mesh(
    createMachinedRingGeo(0.82, 1.06, 0.13, 0.04, 0.026),
    tierHighlightMats[4]
  );
  tier4.add(privVaultRing);

  // Counter-rotating dual-channel seal tracks on the Privacy Base Ring
  const privSealRotor = new THREE.Group();
  const privGoldRingOuter = new THREE.Mesh(
    new THREE.TorusGeometry(0.98, 0.013, 18, 110),
    goldMat
  );
  privGoldRingOuter.rotation.x = Math.PI / 2;
  privGoldRingOuter.position.y = 0.056;
  privSealRotor.add(privGoldRingOuter);

  const privCobaltRingInner = new THREE.Mesh(
    new THREE.TorusGeometry(0.88, 0.011, 18, 100),
    cobaltGlowMat
  );
  privCobaltRingInner.rotation.x = Math.PI / 2;
  privCobaltRingInner.position.y = -0.056;
  privSealRotor.add(privCobaltRingInner);

  // 6 flush cryptographic lock lugs along the outer rim of Ring 05
  const lugGeo = new THREE.BoxGeometry(0.075, 0.045, 0.036);
  for (let i = 0; i < 6; i++) {
    const a = (i / 6) * Math.PI * 2;
    const lug = new THREE.Mesh(lugGeo, goldMat);
    lug.position.set(Math.cos(a) * 1.045, 0, Math.sin(a) * 1.045);
    lug.rotation.y = -a;
    privSealRotor.add(lug);
  }
  tier4.add(privSealRotor);

  /* ================================================================ */
  /* Attach Rim Callout Pins & Register All 5 Rings                   */
  /* ================================================================ */
  const rawTiers = [tier0, tier1, tier2, tier3, tier4];

  rawTiers.forEach((tGrp, idx) => {
    const pinHolder = new THREE.Group();
    pinHolder.position.set(TIERS[idx].anchorX, 0, 0);
    const dot = new THREE.Mesh(pinGeo, pulseGoldMat);
    const collar = new THREE.Mesh(pinCollarGeo, silverMat);
    pinHolder.add(dot, collar);
    tGrp.add(pinHolder);

    tagTierMeshes(tGrp, idx, raycastMeshes);
    tiltGroup.add(tGrp);
    tierGroups.push(tGrp);
    tierAnchors.push(pinHolder);
  });

  /* Keep empty placeholders for interface compatibility (no center rods or diagonal loops) */
  const guideRailsGroup = new THREE.Group();
  const guideRailMat = new THREE.MeshBasicMaterial({
    visible: false,
    transparent: true,
    opacity: 0,
  });
  const triadLoopsGroup = new THREE.Group();
  const triadLoopMats: THREE.MeshPhysicalMaterial[] = [];

  /* ================================================================ */
  /* Continuous Per-Frame Kinetic Ring Update                         */
  /* ================================================================ */
  const update = (
    t: number,
    _dt: number,
    openAmounts: number[],
    _closeWeight: number
  ) => {
    // 1. Ring 01 (Governance): Smooth counter-rotation of compass bezel + subtle caliper breathing
    const open0 = openAmounts[0];
    crownOuterRing.rotation.y = t * 0.2;
    crownInnerRotor.rotation.y = -t * 0.42;
    for (let i = 0; i < crownCalipers.length; i++) {
      const cal = crownCalipers[i];
      const r = 1.05 + open0 * 0.08 + Math.sin(t * 1.6 + i) * 0.015;
      cal.mesh.position.set(
        Math.cos(cal.angle) * r,
        0.01,
        Math.sin(cal.angle) * r
      );
    }

    // 2. Ring 02 (Risk): Continuous orbital sweep of the 3 Risk-Scanner Nodes along the ring track
    riskChassis.rotation.y = -t * 0.24;
    riskSatellitesGroup.rotation.y = t * 0.78;
    for (let i = 0; i < satGimbals.length; i++) {
      satGimbals[i].rotation.x = t * 2.0 + i;
      satGimbals[i].rotation.y = t * 1.4;
    }

    // 3. Ring 03 (Compliance): Counter-rotating Master Gold Ring & Brushed-Silver Verification Collar
    const open2 = openAmounts[2];
    masterGoldRing.rotation.y = t * 0.28;
    complianceOuterCollar.rotation.y = -t * 0.46;
    const collarScale = 1 + open2 * 0.06;
    complianceOuterCollar.scale.set(collarScale, 1, collarScale);

    // 4. Ring 04 (Security): 6-Segment Shield Ring — breathes in Hero, iris-expands radially on scroll
    const open3 = openAmounts[3];
    secInnerHoop.rotation.z = -t * 0.25;
    for (let i = 0; i < securityShields.length; i++) {
      const sh = securityShields[i];
      const wave = Math.sin(t * 1.4 + i * (Math.PI / 3)) * 0.016;
      const radialOut = open3 * 0.14 + wave;
      sh.group.position.set(
        Math.cos(sh.angle) * radialOut,
        0,
        Math.sin(sh.angle) * radialOut
      );
    }

    // 5. Ring 05 (Privacy): Smooth counter-rotation of base ring and dual-channel seal rotor
    privVaultRing.rotation.y = t * 0.18;
    privSealRotor.rotation.y = -t * 0.36;
  };

  return {
    root,
    tiltGroup,
    tierGroups,
    tierAnchors,
    raycastMeshes,
    tierHighlightMats,
    guideRailsGroup,
    guideRailMat,
    triadLoopsGroup,
    triadLoopMats,
    update,
  };
}
