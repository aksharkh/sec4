import { useEffect, useRef } from "react";
import * as THREE from "three";
import { RoomEnvironment } from "three/examples/jsm/environments/RoomEnvironment.js";
import { bus, breakdownMV, TIERS } from "../../lib/bus";
import { createKineticAstrolabeRig } from "./TrustCore";

const smooth = (t: number) => (t <= 0 ? 0 : t >= 1 ? 1 : t * t * (3 - 2 * t));
const win = (p: number, a: number, b: number) => smooth((p - a) / (b - a));

/**
 * Interactive 3D WebGL stage for the SecureKnots Kinetic Astrolabe & Torus-Knot Core.
 * Features:
 * - Continuous multi-axis mechanical & orbital motion (never static)
 * - Direct DOM scroll-progress tracking (expands the 5 tiers as you scroll)
 * - 3D Raycasting on pointer move & click (hovering/clicking any 3D ring highlights & expands it)
 * - Direct 3D drag-to-rotate with momentum inertia
 */
export default function SceneCanvas({ loaded }: { loaded: boolean }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const loadedRef = useRef(loaded);
  loadedRef.current = loaded;

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    let renderer: THREE.WebGLRenderer;
    try {
      renderer = new THREE.WebGLRenderer({
        antialias: true,
        alpha: true,
        powerPreference: "high-performance",
      });
    } catch {
      return;
    }

    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.85));
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.15;

    container.innerHTML = "";
    container.appendChild(renderer.domElement);

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(
      38,
      window.innerWidth / Math.max(window.innerHeight, 1),
      0.1,
      100
    );
    camera.position.set(0, 0, 7.8);

    /* Procedural studio reflections (RoomEnvironment IBL) */
    let envTarget: THREE.WebGLRenderTarget | null = null;
    let pmrem: THREE.PMREMGenerator | null = null;
    try {
      pmrem = new THREE.PMREMGenerator(renderer);
      const room = new RoomEnvironment();
      envTarget = pmrem.fromScene(room, 0.04);
      scene.environment = envTarget.texture;
      (scene as unknown as { environmentIntensity: number }).environmentIntensity = 0.9;
      room.dispose();
    } catch {
      // Fallback to direct studio lights
    }

    /* Studio lighting rig */
    const ambient = new THREE.AmbientLight("#f5f1e8", 0.78);
    const keyLight = new THREE.DirectionalLight("#fff5e4", 2.3);
    keyLight.position.set(4.5, 5.5, 6.5);
    const fillLight = new THREE.DirectionalLight("#b5ccff", 1.2);
    fillLight.position.set(-5.0, 2.0, 4.0);
    const rimLight = new THREE.DirectionalLight("#e7c27a", 1.45);
    rimLight.position.set(0.0, -4.5, -4.0);
    scene.add(ambient, keyLight, fillLight, rimLight);

    /* Build the 5-Tier Kinetic Astrolabe & Torus-Knot Core */
    const rig = createKineticAstrolabeRig();
    scene.add(rig.root);

    /* Interior point lights */
    const innerCobalt = new THREE.PointLight("#2a58d6", 6.5, 6.5, 2.0);
    const innerGold = new THREE.PointLight("#e7c27a", 4.0, 5.5, 2.0);
    innerGold.position.set(0, 0.5, 1.1);
    rig.tiltGroup.add(innerCobalt, innerGold);

    /* ================================================================ */
    /* 3D Raycasting, Hover, Click & Drag-to-Rotate                     */
    /* ================================================================ */
    const raycaster = new THREE.Raycaster();
    const pointerNDC = new THREE.Vector2();
    let isPointerDownOnModel = false;
    let dragMoved = false;
    let downX = 0;
    let downY = 0;
    let lastX = 0;
    let lastY = 0;
    let raycastHoveredTier = -1;

    const hitTestTier = (clientX: number, clientY: number): number => {
      const w = Math.max(window.innerWidth, 1);
      const h = Math.max(window.innerHeight, 1);
      pointerNDC.set((clientX / w) * 2 - 1, -(clientY / h) * 2 + 1);
      raycaster.setFromCamera(pointerNDC, camera);
      const hits = raycaster.intersectObjects(rig.raycastMeshes, false);
      if (hits.length > 0) {
        const idx = hits[0].object.userData.tierIndex;
        if (typeof idx === "number") return idx;
      }
      return -1;
    };

    const isInteractiveDOMTarget = (target: EventTarget | null): boolean => {
      if (!(target instanceof Element)) return false;
      return Boolean(
        target.closest("a, button, input, textarea, select, [data-ui-interactive]")
      );
    };

    const onPointerDown = (e: PointerEvent) => {
      if (isInteractiveDOMTarget(e.target)) return;
      const hitIdx = hitTestTier(e.clientX, e.clientY);
      if (hitIdx !== -1) {
        isPointerDownOnModel = true;
        bus.isDragging = true;
        dragMoved = false;
        downX = e.clientX;
        downY = e.clientY;
        lastX = e.clientX;
        lastY = e.clientY;
        document.body.style.cursor = "grabbing";
      }
    };

    const onPointerMove = (e: PointerEvent) => {
      const w = Math.max(window.innerWidth, 1);
      const h = Math.max(window.innerHeight, 1);
      bus.pointerX = (e.clientX / w) * 2 - 1;
      bus.pointerY = (e.clientY / h) * 2 - 1;

      if (isPointerDownOnModel) {
        const dx = e.clientX - lastX;
        const dy = e.clientY - lastY;
        lastX = e.clientX;
        lastY = e.clientY;

        if (Math.hypot(e.clientX - downX, e.clientY - downY) > 5) {
          dragMoved = true;
        }

        bus.dragYaw += dx * 0.0085;
        bus.dragPitch = THREE.MathUtils.clamp(
          bus.dragPitch + dy * 0.0065,
          -0.65,
          0.65
        );
        bus.velYaw = dx * 0.0085;
        bus.velPitch = dy * 0.0065;
        return;
      }

      if (isInteractiveDOMTarget(e.target)) {
        if (raycastHoveredTier !== -1) {
          raycastHoveredTier = -1;
          document.body.style.cursor = "";
        }
        return;
      }

      const hitIdx = hitTestTier(e.clientX, e.clientY);
      if (hitIdx !== raycastHoveredTier) {
        raycastHoveredTier = hitIdx;
        bus.hoveredTier = hitIdx;
        bus.onInteractionChange?.();
        document.body.style.cursor = hitIdx !== -1 ? "grab" : "";
      }
    };

    const onPointerUp = () => {
      if (!isPointerDownOnModel) return;
      const clickedTier = raycastHoveredTier;
      isPointerDownOnModel = false;
      bus.isDragging = false;
      document.body.style.cursor = clickedTier !== -1 ? "grab" : "";

      // If the user clicked a 3D ring without dragging, toggle/select that discipline & pulse!
      if (!dragMoved && clickedTier !== -1) {
        bus.pulseWave = 1.0;
        if (bus.selectedTier === clickedTier) {
          bus.selectedTier = -1;
        } else {
          bus.selectedTier = clickedTier;
          // If in Hero, also open the exploded preview so the clicked tier stands out clearly
          if (breakdownMV.get() < 0.05) {
            bus.manualExplode = 1;
          }
        }
        bus.onInteractionChange?.();
      }
    };

    const onResize = () => {
      const w = window.innerWidth;
      const h = Math.max(window.innerHeight, 1);
      bus.mobile = w < 768;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };

    onResize();
    window.addEventListener("resize", onResize);
    window.addEventListener("pointerdown", onPointerDown, { passive: true });
    window.addEventListener("pointermove", onPointerMove, { passive: true });
    window.addEventListener("pointerup", onPointerUp, { passive: true });
    window.addEventListener("pointercancel", onPointerUp, { passive: true });

    /* ================================================================ */
    /* 60fps Animation, Direct Scroll Sync & 3D-to-2D Projection        */
    /* ================================================================ */
    let disposed = false;
    let rafId = 0;
    let intro = 0;
    const smoothPtr = { x: 0, y: 0 };
    const smoothManual = { v: 0 };
    const smoothTierOpen = [0, 0, 0, 0, 0];
    const smoothTierHover = [1, 1, 1, 1, 1];
    const smoothTierEmissive = [0, 0, 0.22, 0, 0];
    const tmpVec = new THREE.Vector3();
    const clock = new THREE.Clock();

    const animate = () => {
      if (disposed) return;
      rafId = window.requestAnimationFrame(animate);

      const dt = Math.min(clock.getDelta(), 0.05);
      const t = clock.elapsedTime;
      const vh = Math.max(window.innerHeight, 1);

      /* -------------------------------------------------------------- */
      /* Direct DOM Scroll Progress Measurement (Zero-Lag, Rock-Solid)  */
      /* -------------------------------------------------------------- */
      const heroEl = document.getElementById("top");
      const approachEl = document.getElementById("approach");

      if (heroEl) {
        const hRect = heroEl.getBoundingClientRect();
        const hTotal = Math.max(hRect.height, 1);
        bus.hero = THREE.MathUtils.clamp(-hRect.top / hTotal, 0, 1);
      }

      let p = breakdownMV.get();
      if (approachEl) {
        const aRect = approachEl.getBoundingClientRect();
        const scrollable = Math.max(aRect.height - vh, 1);
        const rawP = THREE.MathUtils.clamp(-aRect.top / scrollable, 0, 1);
        if (Math.abs(rawP - p) > 0.0002) {
          breakdownMV.set(rawP);
          p = rawP;
        }
      }

      if (loadedRef.current && intro < 1.5) intro += dt;
      const e = 1 - Math.pow(1 - Math.min(intro / 1.35, 1), 3);

      /* Decay click shockwave pulse */
      if (bus.pulseWave > 0.001) {
        bus.pulseWave = Math.max(0, bus.pulseWave - dt * 1.8);
      }

      /* Inertia decay when user releases drag */
      if (!bus.isDragging) {
        bus.dragYaw += bus.velYaw;
        bus.dragPitch = THREE.MathUtils.clamp(
          bus.dragPitch + bus.velPitch,
          -0.65,
          0.65
        );
        bus.velYaw *= 0.93;
        bus.velPitch *= 0.93;
        // Gently ease drag offsets back toward neutral as user scrolls deep into Breakdown so callout pins align
        if (p > 0.08 && p < 0.72) {
          bus.dragYaw *= 0.96;
          bus.dragPitch *= 0.96;
        }
      }

      /* 1. Root position: Hero right-of-center → Breakdown center stage */
      const heroE = win(bus.hero, 0, 0.88);
      smoothManual.v = THREE.MathUtils.lerp(
        smoothManual.v,
        bus.manualExplode,
        0.08
      );
      // Center the model slightly in Hero when manually exploded so all 5 expanded tiers fit comfortably
      const heroXOffset = bus.mobile
        ? 0
        : THREE.MathUtils.lerp(1.42, 0.95, smoothManual.v);
      rig.root.position.x = THREE.MathUtils.lerp(heroXOffset, 0, heroE);
      rig.root.position.y = (1 - e) * -0.35 + Math.sin(t * 0.65) * 0.03;

      const pulseBump = Math.sin(bus.pulseWave * Math.PI) * 0.06;
      const baseScale = bus.mobile
        ? 0.68
        : THREE.MathUtils.lerp(1.04, 0.88, Math.max(win(p, 0.0, 0.18), smoothManual.v * 0.7));
      const exitScale = 1 - win(p, 0.93, 0.99);
      rig.root.scale.setScalar(
        Math.max((baseScale + pulseBump) * (0.85 + 0.15 * e) * exitScale, 0.0001)
      );
      rig.root.visible = p < 0.995;

      /* 2. Compute per-tier expansion from Scroll + Hero pre-expansion + Manual Explode + Selected Tier */
      const closeWeight = win(p, 0.70, 0.86);
      // Preliminary expansion starts as soon as user scrolls past 35% of the Hero!
      const heroPreExpand = win(bus.hero, 0.35, 1.0) * 0.32 * (1 - win(p, 0.0, 0.08));

      let totalOpen = 0;
      for (let i = 0; i < TIERS.length; i++) {
        const tier = TIERS[i];
        const scrollOpen = win(p, tier.openWin[0], tier.openWin[1]) * (1 - closeWeight);
        const manualOpen = smoothManual.v * (1 - closeWeight);
        const selectedBoost =
          bus.selectedTier === i ? 0.65 * (1 - closeWeight) : 0;

        const targetOpen = THREE.MathUtils.clamp(
          Math.max(scrollOpen, manualOpen, heroPreExpand, selectedBoost),
          0,
          1
        );
        smoothTierOpen[i] = THREE.MathUtils.lerp(
          smoothTierOpen[i],
          targetOpen,
          0.12
        );
        totalOpen += smoothTierOpen[i];
      }
      const avgOpen = totalOpen / TIERS.length;

      /* 3. Interactive Tilt + Continuous Gyroscopic Precession */
      smoothPtr.x = THREE.MathUtils.lerp(smoothPtr.x, bus.pointerX, 0.07);
      smoothPtr.y = THREE.MathUtils.lerp(smoothPtr.y, bus.pointerY, 0.07);

      const heroTurntable = (1 - avgOpen * 0.85) * Math.sin(t * 0.38) * 0.28;
      const basePitch = THREE.MathUtils.lerp(0.42, 0.30, avgOpen);

      rig.tiltGroup.rotation.x =
        basePitch -
        smoothPtr.y * 0.16 +
        bus.dragPitch +
        (1 - e) * 0.35;
      rig.tiltGroup.rotation.y =
        heroTurntable +
        smoothPtr.x * 0.25 +
        bus.dragYaw +
        closeWeight * Math.PI * 0.35 +
        (1 - e) * -0.8;
      rig.tiltGroup.rotation.z =
        THREE.MathUtils.lerp(-0.14, 0.0, avgOpen) - smoothPtr.x * 0.08;

      /* 4. Update continuous mechanical animations inside the 5 tiers */
      rig.update(t, dt, smoothTierOpen, closeWeight);

      /* 5. Position, Tilt & Highlight each of the 5 Tier Assemblies */
      rig.root.updateMatrixWorld();
      const w = window.innerWidth;
      const h = Math.max(window.innerHeight, 1);

      for (let i = 0; i < TIERS.length; i++) {
        const tier = TIERS[i];
        const grp = rig.tierGroups[i];
        const openAmt = smoothTierOpen[i];

        const isActive =
          bus.hoveredTier === i || bus.selectedTier === i;

        // Vertical & horizontal fan-out when expanded
        const targetY = THREE.MathUtils.lerp(tier.yAsm, tier.yExp, openAmt);
        const targetX = THREE.MathUtils.lerp(0, tier.xExp, openAmt);
        grp.position.set(targetX, targetY, 0);

        // Subtle inspection tilt toward the viewer when expanded or hovered
        const inspectTiltX =
          (i === 0 ? 0.18 : i === 4 ? -0.18 : 0.08) * openAmt +
          (isActive ? 0.1 : 0);
        const inspectTiltZ =
          (tier.side === "left" ? -0.08 : 0.08) * openAmt;
        grp.rotation.x = inspectTiltX;
        grp.rotation.z = inspectTiltZ;

        // Interactive hover / selection scale boost
        const targetHoverScale = isActive ? 1.085 : 1.0;
        smoothTierHover[i] = THREE.MathUtils.lerp(
          smoothTierHover[i],
          targetHoverScale,
          0.14
        );
        grp.scale.setScalar(smoothTierHover[i]);

        // Emissive highlight when hovered or selected
        const baseEmissive = i === 2 ? 0.22 : 0.04 * openAmt;
        const targetEmissive = isActive ? 0.65 : baseEmissive;
        smoothTierEmissive[i] = THREE.MathUtils.lerp(
          smoothTierEmissive[i],
          targetEmissive,
          0.14
        );
        const mat = rig.tierHighlightMats[i];
        if (isActive) {
          mat.emissive.set("#c99a50");
        } else if (i === 2) {
          mat.emissive.set("#5e4010");
        } else {
          mat.emissive.set("#1c3b82");
        }
        mat.emissiveIntensity = smoothTierEmissive[i];

        // Project 3D rim callout pin to 2D screen coordinates
        const anchor = rig.tierAnchors[i];
        anchor.getWorldPosition(tmpVec);
        tmpVec.project(camera);
        bus.nodes[i].x = (tmpVec.x * 0.5 + 0.5) * w;
        bus.nodes[i].y = (-tmpVec.y * 0.5 + 0.5) * h;
        bus.nodes[i].open = openAmt;
      }

      /* 6. Vertical CAD alignment rails */
      rig.guideRailMat.opacity = avgOpen * 0.34;
      rig.guideRailsGroup.visible = avgOpen > 0.02;

      renderer.render(scene, camera);

      if (bus.onFrame) {
        bus.onFrame();
      }
    };

    rafId = window.requestAnimationFrame(animate);

    return () => {
      disposed = true;
      window.cancelAnimationFrame(rafId);
      window.removeEventListener("resize", onResize);
      window.removeEventListener("pointerdown", onPointerDown);
      window.removeEventListener("pointermove", onPointerMove);
      window.removeEventListener("pointerup", onPointerUp);
      window.removeEventListener("pointercancel", onPointerUp);
      document.body.style.cursor = "";
      envTarget?.dispose();
      pmrem?.dispose();
      renderer.dispose();
      if (renderer.domElement.parentNode === container) {
        container.removeChild(renderer.domElement);
      }
    };
  }, []);

  return (
    <div
      ref={containerRef}
      className="pointer-events-none fixed inset-0 z-20"
      aria-hidden
    />
  );
}
