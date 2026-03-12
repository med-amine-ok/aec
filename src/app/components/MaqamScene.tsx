"use client";

import { useEffect, useRef, useState, useCallback, Suspense } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { Sparkles } from "@react-three/drei";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import MaqamModel from "./MaqamModel";
import PartnersRing from "./PartnersRing";
import Slider from "./slider";
import Link from "next/link";
import * as THREE from "three";
import Image from "next/image";
import { Cpu, Wrench, Lightbulb, Rocket } from "lucide-react";
gsap.registerPlugin(ScrollTrigger);

// ========================
// Easing & Noise Utilities
// ========================

function easeInOutCubic(t: number) {
  return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
}

function easeOutQuart(t: number) {
  return 1 - Math.pow(1 - t, 4);
}

// Multi-frequency organic noise — feels like handheld camera
function fbmNoise(t: number): number {
  return (
    Math.sin(t * 1.0) * 0.4 +
    Math.sin(t * 2.3 + 1.4) * 0.3 +
    Math.sin(t * 4.7 + 2.8) * 0.2 +
    Math.cos(t * 3.1 + 0.6) * 0.1
  );
}

// ========================
// 3D Scene Components
// ========================

function CinematicLighting() {
  return (
    <>
      {/* Ambient base — very low to allow dramatic shadows */}
      <ambientLight intensity={0.08} color="#cfcdd3" />
      {/* Sky/ground hemisphere for natural fill */}
      <hemisphereLight args={["#cecece", "#f3e9e9", 0.3]} />

      {/* KEY: Golden hour directional — warm, dramatic shadows */}
      <directionalLight
        position={[8, 22, 10]}
        intensity={1.8}
        color="#FFB040"
        castShadow
        shadow-mapSize-width={1024}
        shadow-mapSize-height={1024}
        shadow-camera-far={60}
        shadow-camera-left={-12}
        shadow-camera-right={12}
        shadow-camera-top={18}
        shadow-camera-bottom={-6}
        shadow-bias={-0.0001}
      />

      {/* FILL: Cool purple side for depth separation */}
      <directionalLight
        position={[-8, 14, -8]}
        intensity={0.3}
        color="#ed963a"
      />

      {/* RIM: Back gold edge light */}
      <pointLight
        position={[-4, 18, -10]}
        intensity={0.5}
        color="#FF8C00"
        distance={40}
        decay={2}
      />
      {/* ACCENT: Warm glow wrapping around monument */}
      <pointLight
        position={[5, 10, -5]}
        intensity={0.5}
        color="#e6f7ff"
        distance={30}
        decay={2}
      />
      {/* GROUND BOUNCE: Purple reflected light from below */}
      <pointLight
        position={[0, -3, 5]}
        intensity={0.15}
        color="#8e681d"
        distance={20}
        decay={2}
      />
      {/* CROWN: Top-down gold kiss */}
      <pointLight
        position={[0, 28, 0]}
        intensity={0.25}
        color="#FFD700"
        distance={45}
        decay={2}
      />
      {/* KICKER: Amber from back-left for volume */}
      <pointLight
        position={[-6, 8, 6]}
        intensity={0.3}
        color="#FF6600"
        distance={25}
        decay={2}
      />
    </>
  );
}

// Exponential fog — thick on entry (sea mist), dissipates to reveal; thickens again on exit
function SceneFog({
  entryProgress,
  exitMode,
  exitProgress,
}: {
  entryProgress: React.MutableRefObject<number>;
  exitMode: React.MutableRefObject<"none" | "sink" | "fogonly">;
  exitProgress: React.MutableRefObject<number>;
}) {
  const { scene } = useThree();
  const fogRef = useRef<THREE.FogExp2 | null>(null);

  useEffect(() => {
    const fog = new THREE.FogExp2("#0D002B", 0.09);
    fogRef.current = fog;
    scene.fog = fog;
    return () => {
      scene.fog = null;
      fogRef.current = null;
    };
  }, [scene]);

  useFrame(() => {
    if (fogRef.current) {
      if (exitMode.current !== "none") {
        // Exit: fog rolls back in
        const ep = Math.min(1, exitProgress.current);
        fogRef.current.density = THREE.MathUtils.lerp(0.012, 0.09, ep);
      } else {
        // Entry: fog dissipates
        const ep = Math.min(1, entryProgress.current);
        fogRef.current.density = THREE.MathUtils.lerp(0.09, 0.012, ep);
      }
    }
  });

  return null;
}

// Golden atmospheric dust motes
function GoldenDust() {
  return (
    <Sparkles
      count={60}
      scale={[25, 25, 25]}
      size={1.2}
      speed={0.2}
      opacity={0.25}
      color="#e6f7ff"
    />
  );
}

// Drives entry (0→1) and exit (0→1) animation progress
function AnimationController({
  visibleRef,
  entryProgress,
  exitMode,
  exitProgress,
}: {
  visibleRef: React.MutableRefObject<boolean>;
  entryProgress: React.MutableRefObject<number>;
  exitMode: React.MutableRefObject<"none" | "sink" | "fogonly">;
  exitProgress: React.MutableRefObject<number>;
}) {
  useFrame((_, delta) => {
    if (exitMode.current !== "none") {
      // 1.5s exit animation
      exitProgress.current = Math.min(1, exitProgress.current + delta / 1.5);
    } else if (visibleRef.current) {
      // 2s entry reveal
      entryProgress.current = Math.min(1, entryProgress.current + delta / 2.0);
    }
  });
  return null;
}

// ========================
// Cinematic Camera Controller
// ========================

function CameraController({
  scrollProgress,
  dragAngleRef,
  isDraggingRef,
}: {
  scrollProgress: React.MutableRefObject<number>;
  dragAngleRef: React.MutableRefObject<number>;
  isDraggingRef: React.MutableRefObject<boolean>;
}) {
  const { camera } = useThree();
  const lookTarget = useRef(new THREE.Vector3(0, 3, 0));
  const elapsed = useRef(0);

  useFrame((_, delta) => {
    const p = scrollProgress.current;
    elapsed.current += delta;
    const t = elapsed.current;

    let cx: number, cy: number, cz: number;
    let lx: number, ly: number, lz: number;

    if (p < 0.40) {
      // PHASE 1 — HERO: Tight on the crown, slow upward drift
      const s = Math.min(1, p / 0.40);
      const e = easeInOutCubic(s);
      const angle = THREE.MathUtils.lerp(0, 0.3, e);
      const r = THREE.MathUtils.lerp(2.8, 5, e);
      cx = Math.sin(angle) * r;
      cy = THREE.MathUtils.lerp(4.5, 3.5, e);
      cz = Math.cos(angle) * r;
      lx = 0;
      ly = THREE.MathUtils.lerp(3.5, 2.5, e);
      lz = 0;
    } else if (p < 0.73) {
      // PHASE 2 — DESCRIPTIONS: Orbit right + descend + zoom out
      const s = (p - 0.40) / 0.33;
      const e = easeInOutCubic(s);
      const angle = THREE.MathUtils.lerp(0.3, 1.2, e);
      const r = THREE.MathUtils.lerp(5, 9, e);
      cx = Math.sin(angle) * r;
      cy = THREE.MathUtils.lerp(3.5, 2.8, e);
      cz = Math.cos(angle) * r;
      lx = THREE.MathUtils.lerp(0, -1.0, e);
      ly = THREE.MathUtils.lerp(2.5, 1.8, e);
      lz = 0;
    } else if (p < 0.81) {
      // PHASE 3 — CAROUSEL: Continue orbit to opposite side
      const s = (p - 0.73) / 0.08;
      const e = easeInOutCubic(s);
      const angle = THREE.MathUtils.lerp(1.2, Math.PI + 0.5, e);
      const r = THREE.MathUtils.lerp(9, 11, e);
      cx = Math.sin(angle) * r;
      cy = THREE.MathUtils.lerp(2.8, 2.5, e);
      cz = Math.cos(angle) * r;
      lx = THREE.MathUtils.lerp(-1.0, 1.0, e);
      ly = THREE.MathUtils.lerp(1.8, 1.5, e);
      lz = 0;
    } else if (p < 0.91) {
      // PHASE 4 — PARTNERS: Swing to front, pull back to see ring
      const s = (p - 0.81) / 0.10;
      const e = easeInOutCubic(s);
      const angle = THREE.MathUtils.lerp(Math.PI + 0.5, Math.PI * 2, e);
      const r = THREE.MathUtils.lerp(11, 14, e);
      cx = Math.sin(angle) * r;
      cy = THREE.MathUtils.lerp(2.5, 4.0, e);
      cz = Math.cos(angle) * r;
      lx = THREE.MathUtils.lerp(1.0, 0, e);
      ly = THREE.MathUtils.lerp(1.5, 2.0, e);
      lz = 0;
    } else {
      // PHASE 5 — REVEAL: Dramatic crane up + zoom out, full monument
      const s = (p - 0.91) / 0.09;
      const e = easeOutQuart(Math.min(1, s));
      cx = 0;
      cy = THREE.MathUtils.lerp(4.0, 8, e);
      cz = THREE.MathUtils.lerp(14, 40, e);
      lx = 0;
      ly = THREE.MathUtils.lerp(2.0, 3.5, e);
      lz = 0;
    }

    // Drag rotation — slow spring-back when not dragging
    if (!isDraggingRef.current) {
      dragAngleRef.current = THREE.MathUtils.damp(
        dragAngleRef.current,
        0,
        0.35,
        delta,
      );
    }
    if (Math.abs(dragAngleRef.current) > 0.0001) {
      const cosD = Math.cos(dragAngleRef.current);
      const sinD = Math.sin(dragAngleRef.current);
      const newCX = cx * cosD + cz * sinD;
      const newCZ = -cx * sinD + cz * cosD;
      const newLX = lx * cosD + lz * sinD;
      const newLZ = -lx * sinD + lz * cosD;
      cx = newCX;
      cz = newCZ;
      lx = newLX;
      lz = newLZ;
    }

    // Organic handheld shake (multi-frequency noise)
    const shake = 0.01;
    const sx = fbmNoise(t * 0.8) * shake;
    const sy = fbmNoise(t * 0.6 + 40) * shake;
    const sz = fbmNoise(t * 0.5 + 80) * shake * 0.5;

    // Slow cinematic breathing — feels alive
    const breathX = Math.cos(t * 0.22) * 0.02;
    const breathY = Math.sin(t * 0.28) * 0.035;

    const smooth = 3.0;
    camera.position.x = THREE.MathUtils.damp(
      camera.position.x,
      cx + breathX + sx,
      smooth,
      delta,
    );
    camera.position.y = THREE.MathUtils.damp(
      camera.position.y,
      cy + breathY + sy,
      smooth,
      delta,
    );
    camera.position.z = THREE.MathUtils.damp(
      camera.position.z,
      cz + sz,
      smooth,
      delta,
    );

    lookTarget.current.x = THREE.MathUtils.damp(
      lookTarget.current.x,
      lx,
      smooth,
      delta,
    );
    lookTarget.current.y = THREE.MathUtils.damp(
      lookTarget.current.y,
      ly,
      smooth,
      delta,
    );
    lookTarget.current.z = THREE.MathUtils.damp(
      lookTarget.current.z,
      lz,
      smooth,
      delta,
    );
    camera.lookAt(lookTarget.current);
  });

  return null;
}

// ========================
// About Parallax Panel
// ========================

function AboutParallaxPanel({
  phase,
  scrollProgress,
}: {
  phase: number;
  scrollProgress: React.MutableRefObject<number>;
}) {
  const panelRef = useRef<HTMLDivElement>(null);
  const glassRef = useRef<HTMLDivElement>(null);
  const titleRef = useRef<HTMLHeadingElement>(null);
  const textRef = useRef<HTMLParagraphElement>(null);
  const ctaRef = useRef<HTMLAnchorElement>(null);
  const glowRef = useRef<HTMLDivElement>(null);
  const iconsRef = useRef<HTMLDivElement>(null);

  // Smooth interpolated values (current → target)
  const mouse = useRef({ x: 0, y: 0 });
  const smoothMouse = useRef({ x: 0, y: 0 });
  const rafId = useRef<number>(0);
  const isTouchDevice = useRef(false);
  const touchOrigin = useRef({ x: 0, y: 0 });

  // Parallax intensity config per element
  const PARALLAX = {
    panel:  { moveX: 8,  moveY: 6,  rotX: 4,  rotY: 5,  z: 20,  scale: 0.03 },
    icons:  { moveX: 25, moveY: 20, rotX: 3,  rotY: 4,  z: 60 },
    title:  { moveX: 18, moveY: 14, rotX: 2,  rotY: 3,  z: 40 },
    text:   { moveX: 10, moveY: 8,  rotX: 1,  rotY: 1.5, z: 20 },
    cta:    { moveX: 5,  moveY: 4,  rotX: 0.5, rotY: 0.8, z: 30 },
  };

  const DAMPING = 0.08; // Lower = smoother/slower follow

  // Normalize mouse/touch to -1…1 range from center of viewport
  const updateMouse = useCallback((clientX: number, clientY: number) => {
    if (typeof window === "undefined") return;
    mouse.current.x = (clientX / window.innerWidth) * 2 - 1;
    mouse.current.y = (clientY / window.innerHeight) * 2 - 1;
  }, []);

  // Mouse listener (desktop)
  useEffect(() => {
    if (typeof window === "undefined") return;
    isTouchDevice.current = "ontouchstart" in window || navigator.maxTouchPoints > 0;

    const onMouseMove = (e: MouseEvent) => {
      if (!isTouchDevice.current) updateMouse(e.clientX, e.clientY);
    };

    window.addEventListener("mousemove", onMouseMove, { passive: true });
    return () => window.removeEventListener("mousemove", onMouseMove);
  }, [updateMouse]);

  // Touch listener (mobile)
  useEffect(() => {
    if (typeof window === "undefined") return;
    const panel = panelRef.current;
    if (!panel) return;

    const onTouchStart = (e: TouchEvent) => {
      const t = e.touches[0];
      touchOrigin.current = { x: t.clientX, y: t.clientY };
    };
    const onTouchMove = (e: TouchEvent) => {
      const t = e.touches[0];
      const dx = (t.clientX - touchOrigin.current.x) / (window.innerWidth * 0.5);
      const dy = (t.clientY - touchOrigin.current.y) / (window.innerHeight * 0.5);
      mouse.current.x = Math.max(-1, Math.min(1, dx));
      mouse.current.y = Math.max(-1, Math.min(1, dy));
    };
    const onTouchEnd = () => {
      mouse.current.x = 0;
      mouse.current.y = 0;
    };

    panel.addEventListener("touchstart", onTouchStart, { passive: true });
    panel.addEventListener("touchmove", onTouchMove, { passive: true });
    panel.addEventListener("touchend", onTouchEnd, { passive: true });
    return () => {
      panel.removeEventListener("touchstart", onTouchStart);
      panel.removeEventListener("touchmove", onTouchMove);
      panel.removeEventListener("touchend", onTouchEnd);
    };
  }, []);

  // rAF animation loop — smooth damped parallax
  useEffect(() => {
    const animate = () => {
      // Damp towards target
      smoothMouse.current.x += (mouse.current.x - smoothMouse.current.x) * DAMPING;
      smoothMouse.current.y += (mouse.current.y - smoothMouse.current.y) * DAMPING;

      const mx = smoothMouse.current.x;
      const my = smoothMouse.current.y;

      // Scroll-driven Z-depth: map scroll around the about phase (0.35–0.55)
      const sp = scrollProgress.current;
      const aboutCenter = 0.45;
      const scrollDelta = Math.max(-1, Math.min(1, (sp - aboutCenter) * 5));
      const scrollZ = (1 - Math.abs(scrollDelta)) * 1; // peaks at center of phase

      // Active state — only apply transforms when phase is active
      const isActive = phase === 2 || phase === 3;

      if (panelRef.current) {
        const p = PARALLAX.panel;
        const tx = isActive ? mx * p.moveX : 0;
        const ty = isActive ? my * p.moveY : 0;
        const rx = isActive ? -my * p.rotX : 0;
        const ry = isActive ? mx * p.rotY : 0;
        const tz = isActive ? scrollZ * p.z : 0;
        const sc = isActive ? 1 + scrollZ * p.scale : 0.96;
        panelRef.current.style.transform =
          `translate(-50%, -50%) translate3d(${tx}px, ${ty}px, ${tz}px) rotateX(${rx}deg) rotateY(${ry}deg) scale(${sc})`;
      }

      if (iconsRef.current) {
        const p = PARALLAX.icons;
        const tx = isActive ? mx * p.moveX : 0;
        const ty = isActive ? my * p.moveY : 0;
        const tz = isActive ? scrollZ * p.z : 0;
        iconsRef.current.style.transform =
          `translate3d(${tx}px, ${ty}px, ${tz}px)`;
      }

      if (titleRef.current) {
        const p = PARALLAX.title;
        const tx = isActive ? mx * p.moveX : 0;
        const ty = isActive ? my * p.moveY : 0;
        const rx = isActive ? -my * p.rotX : 0;
        const ry = isActive ? mx * p.rotY : 0;
        const tz = isActive ? scrollZ * p.z : 0;
        titleRef.current.style.transform =
          `translate3d(${tx}px, ${ty}px, ${tz}px) rotateX(${rx}deg) rotateY(${ry}deg)`;
      }

      if (textRef.current) {
        const p = PARALLAX.text;
        const tx = isActive ? mx * p.moveX : 0;
        const ty = isActive ? my * p.moveY : 0;
        const tz = isActive ? scrollZ * p.z : 0;
        textRef.current.style.transform =
          `translate3d(${tx}px, ${ty}px, ${tz}px)`;
      }

      if (ctaRef.current) {
        const p = PARALLAX.cta;
        const tx = isActive ? mx * p.moveX : 0;
        const ty = isActive ? my * p.moveY : 0;
        const tz = isActive ? scrollZ * p.z : 0;
        ctaRef.current.style.transform =
          `translate3d(${tx}px, ${ty}px, ${tz}px)`;
      }

      // Change box background color from morning sky to night sky based on scroll
      if (glassRef.current) {
        // interpolate scroll progress to map morning (0) to night (1)
        const tBg = Math.min(1, Math.max(0, scrollProgress.current * 1.6));
        // Interpolate RGBA directly for the glass background:
        // Morning: rgba(101, 140, 176, 0.45) | Night: rgba(13, 0, 43, 0.45)
        const colorStr = gsap.utils.interpolate("rgba(101, 140, 176, 0.45)", "rgba(13, 0, 43, 0.45)")(tBg);
        glassRef.current.style.backgroundColor = colorStr as string;
      }

      // Glow follows mouse position via CSS custom properties
      if (glowRef.current && isActive) {
        const gx = 50 + mx * 30;
        const gy = 50 + my * 30;
        glowRef.current.style.setProperty("--glow-x", `${gx}%`);
        glowRef.current.style.setProperty("--glow-y", `${gy}%`);
      }

      rafId.current = requestAnimationFrame(animate);
    };

    rafId.current = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(rafId.current);
  }, [phase, scrollProgress]);

  const isVisible = phase === 2 || phase === 3;

  return (
    <div
      ref={panelRef}
      className="aec-overlay absolute top-[50%] left-[50%] w-[90%] md:w-[70%] lg:w-[50%] max-w-4xl"
      style={{
        opacity: isVisible ? 1 : 0,
        transform: "translate(-50%, -50%)",
        pointerEvents: phase === 3 ? "auto" : "none",
        perspective: "1200px",
        transformStyle: "preserve-3d" as const,
        willChange: "transform, opacity",
      }}
    >
      <div
        ref={glassRef}
        className="aec-glass rounded-3xl p-6 md:p-12 relative overflow-hidden flex flex-col items-center text-center transition-colors duration-200"
        style={{
          transformStyle: "preserve-3d" as const,
          borderImage: isVisible
            ? "linear-gradient(135deg, rgba(230,247,255,0.25), rgba(255,194,0,0.15), rgba(230,247,255,0.08)) 1"
            : undefined,
          boxShadow: isVisible
            ? "0 12px 48px rgba(0,0,0,0.4), 0 0 80px rgba(230,247,255,0.06), 0 0 120px rgba(255,194,0,0.03), inset 0 1px 0 rgba(255,255,255,0.08)"
            : undefined,
        }}
      >
        {/* Animated glow overlay that follows mouse */}
        <div
          ref={glowRef}
          className="about-glow-overlay absolute inset-0 pointer-events-none rounded-3xl"
        />

        {/* Top shimmer line */}
        <div
          className={`absolute top-0 left-6 right-6 h-[1px] about-shimmer-top ${
            isVisible ? "about-shimmer-active" : ""
          }`}
        />

        {/* Bottom shimmer line */}
        <div
          className={`absolute bottom-0 left-8 right-8 h-[1px] about-shimmer-bottom ${
            isVisible ? "about-shimmer-active" : ""
          }`}
        />

        {/* Left glow edge */}
        <div
          className={`absolute top-8 bottom-8 left-0 w-[1px] about-glow-edge ${
            isVisible ? "about-glow-edge-active" : ""
          }`}
        />

        {/* Floating Engineering Icons — maximum parallax */}
        <div
          ref={iconsRef}
          className="flex gap-6 md:gap-10 mb-8"
          style={{
            transformStyle: "preserve-3d" as const,
            willChange: "transform",
          }}
        >
          <Cpu className="w-8 h-8 md:w-10 md:h-10 text-[#FFD54F] drop-shadow-[0_0_15px_rgba(255,213,79,0.5)] animate-pulse" style={{ animationDuration: "3s" }} />
          <Wrench className="w-8 h-8 md:w-10 md:h-10 text-[#e6f7ff] drop-shadow-[0_0_15px_rgba(230,247,255,0.5)] animate-bounce" style={{ animationDuration: "4s" }} />
          <Lightbulb className="w-8 h-8 md:w-10 md:h-10 text-[#FFD54F] drop-shadow-[0_0_15px_rgba(255,213,79,0.5)] animate-pulse" style={{ animationDuration: "3.5s" }} />
          <Rocket className="w-8 h-8 md:w-10 md:h-10 text-[#e6f7ff] drop-shadow-[0_0_15px_rgba(230,247,255,0.5)] animate-bounce" style={{ animationDuration: "5s" }} />
        </div>

        {/* Title — high parallax intensity */}
        <h2
          ref={titleRef}
          className="aec text-2xl md:text-5xl text-[#e6f7ff] mb-6 drop-shadow-[0_0_20px_rgba(255,194,0,0.15)]"
          style={{
            transformStyle: "preserve-3d" as const,
            willChange: "transform",
            transition: "text-shadow 0.3s ease",
            textShadow: isVisible
              ? "0 0 30px rgba(230,247,255,0.15), 0 0 60px rgba(255,194,0,0.08)"
              : "none",
          }}
        >
          WHAT IS AEC
        </h2>

        {/* Body text — moderate parallax */}
        <p
          ref={textRef}
          className="text-lg md:text-2xl text-white/80 leading-relaxed"
          style={{
            transformStyle: "preserve-3d" as const,
            willChange: "transform",
          }}
        >
          The Algerian Engineering Competition (AEC) is a national event
          that brings together engineering students, recent graduates, and
          industry experts to solve real-world problems through innovation
          and teamwork.
        </p>

        {/* CTA — lowest parallax, pops forward in Z */}
        <Link
          ref={ctaRef}
          href="/register"
          className="group inline-flex items-center gap-2 bg-[#e6f7ff] text-[#110038] py-2.5 px-7 mt-8 rounded-lg font-bold text-lg md:text-xl hover:bg-[#FFD54F] hover:shadow-[0_0_35px_rgba(255,194,0,0.25)] transition-all duration-300"
          style={{
            transformStyle: "preserve-3d" as const,
            willChange: "transform",
          }}
        >
          REGISTER NOW
          <svg
            className="w-5 h-5 group-hover:translate-x-1 transition-transform duration-200"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2.5}
              d="M13 7l5 5m0 0l-5 5m5-5H6"
            />
          </svg>
        </Link>
      </div>
    </div>
  );
}

// ========================
// Cinematic Phrases — AEC description revealed phrase by phrase as the user scrolls.
// Each phrase emerges from deep Z-space behind the monument, with staggered words.
// ========================

// Decomposed from: "The Algerian Engineering Competition is a national event that
// brings together engineering students, recent graduates, and industry experts
// to solve real-world problems through innovation and teamwork."
const CINEMATIC_PHRASES: { words: string[]; sub: string; start: number; end: number }[] = [
  {
    words: ["THE ALGERIAN", "ENGINEERING", "COMPETITION"],
    sub: "AEC 2026",
    start: 0.40,
    end: 0.467,
  },
  {
    words: ["A NATIONAL", "EVENT"],
    sub: "Uniting Algeria's brightest minds",
    start: 0.473,
    end: 0.533,
  },
  {
    words: ["STUDENTS.", "GRADUATES.", "EXPERTS."],
    sub: "All under one roof",
    start: 0.538,
    end: 0.595,
  },
  {
    words: ["SOLVING", "REAL-WORLD", "PROBLEMS"],
    sub: "Through innovation and teamwork",
    start: 0.600,
    end: 0.655,
  },
  {
    words: ["THE FUTURE", "IS IN YOUR HANDS"],
    sub: "Register · Compete · Inspire",
    start: 0.660,
    end: 0.730,
  },
];

function CinematicPhrases({ scrollProgress }: { scrollProgress: React.MutableRefObject<number> }) {
  // One container ref per phrase, plus word/sub refs inside
  const containerRefs = useRef<(HTMLDivElement | null)[]>([]);
  const wordRefs = useRef<(HTMLSpanElement | null)[][]>(
    CINEMATIC_PHRASES.map((p) => p.words.map(() => null))
  );
  const subRefs = useRef<(HTMLSpanElement | null)[]>([]);
  const lineRef = useRef<(HTMLDivElement | null)[]>([]);

  useEffect(() => {
    let rafId: number;

    const easeOut3 = (t: number) => 1 - Math.pow(1 - t, 3);
    const easeIn2 = (t: number) => t * t;

    const animate = () => {
      const p = scrollProgress.current;

      CINEMATIC_PHRASES.forEach((phrase, idx) => {
        const { start, end, words } = phrase;
        const container = containerRefs.current[idx];
        if (!container) return;

        // Fast path — fully outside window
        if (p < start - 0.06 || p > end + 0.06) {
          container.style.opacity = "0";
          container.style.transform = "translate(-50%, -50%) translate3d(0, 60px, -200px) scale(0.85)";
          container.style.filter = "blur(14px)";
          return;
        }

        const dur = end - start;
        const lp = Math.max(0, Math.min(1, (p - start) / dur));

        let opacity = 0;
        let y = 0;
        let z = 0;
        let blur = 0;
        let scale = 1;

        if (lp < 0.18) {
          // ENTRY — rises up from deep depth, unblurs
          const t = easeOut3(lp / 0.18);
          opacity = t;
          blur = (1 - t) * 16;
          y = (1 - t) * 60;
          z = (1 - t) * -220;
          scale = 0.85 + t * 0.15;
        } else if (lp < 0.78) {
          // HOLD — gently drifts closer
          const t = (lp - 0.18) / 0.6;
          opacity = 1;
          blur = 0;
          y = 0;
          z = t * 70;
          scale = 1 + t * 0.04;
        } else {
          // EXIT — blows past camera
          const t = easeIn2((lp - 0.78) / 0.22);
          opacity = Math.max(0, 1 - t * 1.6);
          blur = t * 18;
          y = -t * 30;
          z = 70 + t * 180;
          scale = 1.04 + t * 0.14;
        }

        container.style.opacity = String(opacity);
        container.style.transform = `translate(-50%, -50%) translate3d(0, ${y}px, ${z}px) scale(${scale})`;
        container.style.filter = blur > 0.3 ? `blur(${blur}px)` : "";

        // Staggered word reveal — each word slightly delayed inside the entry window
        words.forEach((_, wi) => {
          const el = wordRefs.current[idx]?.[wi];
          if (!el) return;
          const staggerStart = (wi / words.length) * 0.12;
          const wt = Math.max(0, Math.min(1, (lp - staggerStart) / 0.15));
          const wEase = easeOut3(wt);
          el.style.opacity = String(wEase);
          el.style.transform = `translateY(${(1 - wEase) * 22}px)`;
        });

        // Sub-label fades in later
        const sub = subRefs.current[idx];
        if (sub) {
          const st = Math.max(0, Math.min(1, (lp - 0.15) / 0.12));
          sub.style.opacity = String(easeOut3(st) * 0.55);
        }

        // Gold line scales in
        const line = lineRef.current[idx];
        if (line) {
          const lt = Math.max(0, Math.min(1, (lp - 0.1) / 0.12));
          line.style.transform = `scaleX(${easeOut3(lt)})`;
          line.style.opacity = String(easeOut3(lt) * 0.6);
        }
      });

      rafId = requestAnimationFrame(animate);
    };

    rafId = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(rafId);
  }, [scrollProgress]);

  return (
    // Perspective container — sits at absolute center of the overlay
    <div
      className="absolute inset-0 pointer-events-none z-30"
      style={{ perspective: "900px", perspectiveOrigin: "50% 55%" }}
    >
      {CINEMATIC_PHRASES.map((phrase, idx) => (
        <div
          key={idx}
          ref={(el) => { containerRefs.current[idx] = el; }}
          className="absolute top-[58%] left-1/2 text-center"
          style={{
            transformStyle: "preserve-3d",
            willChange: "transform, opacity, filter",
            opacity: 0,
            transform: "translate(-50%, -50%) translate3d(0, 60px, -200px) scale(0.85)",
          }}
        >
          {/* Gold horizontal rule — scales in from center */}
          <div
            ref={(el) => { lineRef.current[idx] = el; }}
            style={{
              height: 1,
              background: "linear-gradient(to right, transparent, #FFC200, transparent)",
              transformOrigin: "50% 50%",
              transform: "scaleX(0)",
              opacity: 0,
              marginBottom: "1.1rem",
            }}
          />

          {/* Main words — staggered reveal */}
          <div className="flex flex-col items-center gap-1 md:gap-2">
            {phrase.words.map((word, wi) => (
              <span
                key={wi}
                ref={(el) => {
                  if (!wordRefs.current[idx]) wordRefs.current[idx] = [];
                  wordRefs.current[idx][wi] = el;
                }}
                className="block text-[#e6f7ff] font-light uppercase"
                style={{
                  fontSize: "clamp(1.05rem, 3.8vw, 2.8rem)",
                  letterSpacing: "0.28em",
                  lineHeight: 1.15,
                  textShadow: "0 2px 30px rgba(0,0,0,0.9), 0 0 18px rgba(255,194,0,0.18)",
                  opacity: 0,
                  willChange: "transform, opacity",
                }}
              >
                {word}
              </span>
            ))}
          </div>

          {/* Sub-label */}
          <span
            ref={(el) => { subRefs.current[idx] = el; }}
            className="block mt-3 text-[#FFC200] text-[9px] sm:text-[10px] md:text-xs uppercase tracking-[0.55em] font-light"
            style={{
              opacity: 0,
              textShadow: "0 2px 12px rgba(0,0,0,0.7)",
              willChange: "opacity",
            }}
          >
            {phrase.sub}
          </span>

          {/* Bottom gold rule */}
          <div
            style={{
              height: 1,
              background: "linear-gradient(to right, transparent, #FFC200, transparent)",
              opacity: 0.15,
              marginTop: "1.1rem",
            }}
          />
        </div>
      ))}
    </div>
  );
}

// ========================
// Main Component
// ========================

export default function MaqamScene() {
  const scrollProgress = useRef(0);
  const visibleRef = useRef(false);
  const entryProgress = useRef(0);
  const exitMode = useRef<"none" | "sink" | "fogonly">("none");
  const exitProgress = useRef(0);
  const exitTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const dragAngleRef = useRef(0);
  const isDraggingRef = useRef(false);
  const lastXRef = useRef(0);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const skyBgRef = useRef<HTMLDivElement>(null);
  const isActiveRef = useRef(false);
  // Phase 1 element refs — updated directly in onUpdate, no re-renders
  const p1BadgeRef = useRef<HTMLDivElement>(null);
  const p1TitleRef = useRef<HTMLHeadingElement>(null);
  const p1DividerRef = useRef<HTMLDivElement>(null);
  const p1SubtitleRef = useRef<HTMLParagraphElement>(null);
  const p1SloganRef = useRef<HTMLParagraphElement>(null);
  const p1Stat0Ref = useRef<HTMLDivElement>(null);
  const p1Stat1Ref = useRef<HTMLDivElement>(null);
  const p1Stat2Ref = useRef<HTMLDivElement>(null);
  const p1CtaWrapRef = useRef<HTMLDivElement>(null);
  const p1HintRef = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);
  const [phase, setPhase] = useState(0);
  const [isDragging, setIsDragging] = useState(false);

  useEffect(() => {
    const trigger = ScrollTrigger.create({
      trigger: "#aec-experience",
      start: "top top%",
      end: "bottom bottom",
      onUpdate: (self) => {
        // Remap raw progress so the phrase/description phase gets 200vh of scroll:
        // raw 0–0.333  (200vh) → custom 0–0.40   (phase 1)
        // raw 0.333–0.667 (200vh) → custom 0.40–0.73 (phrase phase)
        // raw 0.667–1.0  (200vh) → custom 0.73–1.0  (phases 3-5)
        const raw = self.progress;
        const R1 = 200 / 600; // 0.3333
        const R2 = 400 / 600; // 0.6667
        let p: number;
        if (raw < R1) {
          p = (raw / R1) * 0.40;
        } else if (raw < R2) {
          p = 0.40 + ((raw - R1) / (R2 - R1)) * 0.33;
        } else {
          p = 0.73 + ((raw - R2) / (1 - R2)) * 0.27;
        }
        scrollProgress.current = p;

        // Phase 1 element animations — direct DOM, zero re-renders
        const rng = (start: number, dur: number) =>
          Math.max(0, Math.min(1, (p - start) / dur));
        const sd = (el: HTMLElement | null, o: number, tr: string) => {
          if (el) {
            el.style.opacity = String(o);
            el.style.transform = tr;
          }
        };
        const tBadge = rng(0.04, 0.06);
        sd(p1BadgeRef.current, tBadge, `translateY(${(1 - tBadge) * -24}px)`);
        const tTitle = rng(0.07, 0.08);
        sd(p1TitleRef.current, tTitle, `scale(${0.88 + 0.12 * tTitle})`);
        const tDiv = rng(0.12, 0.05);
        sd(p1DividerRef.current, tDiv, `scaleX(${tDiv})`);
        const tSub = rng(0.14, 0.06);
        sd(p1SubtitleRef.current, tSub, `translateX(${(1 - tSub) * 36}px)`);
        const tSlog = rng(0.18, 0.07);
        sd(p1SloganRef.current, tSlog, `translateX(${(1 - tSlog) * -36}px)`);
        [
          [p1Stat0Ref, 0],
          [p1Stat1Ref, 0.03],
          [p1Stat2Ref, 0.06],
        ].forEach(([ref, d]) => {
          const t = rng(0.22 + (d as number), 0.07);
          sd(
            (ref as React.RefObject<HTMLDivElement>).current,
            t,
            `translateY(${(1 - t) * 22}px)`,
          );
        });
        const tCta = rng(0.31, 0.07);
        sd(p1CtaWrapRef.current, tCta, `translateY(${(1 - tCta) * 22}px)`);
        sd(p1HintRef.current, rng(0.04, 0.05) * 0.4, "");

        if (p < 0.40) setPhase(1);
        else if (p < 0.73) setPhase(2);
        else if (p < 0.81) setPhase(3);
        else if (p < 0.91) setPhase(4);
        else setPhase(5);

        // Write opacity directly to DOM — zero React re-renders, silky smooth
        if (isActiveRef.current && wrapperRef.current) {
          const pOp = p < 0.28 ? p / 0.28 : 1;
          wrapperRef.current.style.opacity = String(pOp);
        }
      },
      onEnter: () => {
        if (exitTimerRef.current) {
          clearTimeout(exitTimerRef.current);
          exitTimerRef.current = null;
        }
        exitMode.current = "none";
        exitProgress.current = 0;
        isActiveRef.current = true;
        setVisible(true);
        visibleRef.current = true;
        entryProgress.current = 0;
        if (wrapperRef.current) wrapperRef.current.style.opacity = "0";
      },
      onEnterBack: () => {
        if (exitTimerRef.current) {
          clearTimeout(exitTimerRef.current);
          exitTimerRef.current = null;
        }
        exitMode.current = "none";
        exitProgress.current = 0;
        isActiveRef.current = true;
        setVisible(true);
        visibleRef.current = true;
        entryProgress.current = 0;
        if (wrapperRef.current) wrapperRef.current.style.opacity = "1";
      },
      onLeave: () => {
        isActiveRef.current = false;
        exitMode.current = "fogonly";
        exitProgress.current = 0;
        visibleRef.current = false;
        // Smooth GSAP fade-out — overwrite ensures onUpdate can't race against this
        gsap.to(wrapperRef.current, {
          opacity: 0,
          duration: 0.7,
          ease: "power2.in",
          overwrite: true,
          onComplete: () => {
            setVisible(false);
            setPhase(0);
          },
        });
      },
      onLeaveBack: () => {
        isActiveRef.current = false;
        exitMode.current = "sink";
        exitProgress.current = 0;
        visibleRef.current = false;
        setPhase(0);
        exitTimerRef.current = setTimeout(() => {
          setVisible(false);
          exitTimerRef.current = null;
        }, 1800);
      },
    });

    return () => {
      trigger.kill();
      if (exitTimerRef.current) clearTimeout(exitTimerRef.current);
    };
  }, []);

  return (
    <div
      ref={wrapperRef}
      className="fixed inset-0"
      style={{
        // Phase 1: sit behind the page content layer (z-10) so the sea renders on top.
        // Phases 2-5: come in front of everything.
        zIndex: phase === 1 ? 8 : 20,
        opacity: 0,
        pointerEvents: "none",
      }}
    >
      {/* Stamp background — only in AEC section, not fixed */}
      {/* <img
        src="/timbire.jpg"
        alt=""
        aria-hidden="true"
        style={{
          position: "absolute",
          top: "5%",
          left: "5%",
          width: "90%",
          height: "90%",
          objectFit: "contain",
          objectPosition: "center",
          opacity: 8.18,
          zIndex: -10,
          pointerEvents: "none",
          userSelect: "none",
        }}
      /> */}
      <Canvas
        camera={{ position: [0, 4.5, 2.8], fov: 50 }}
        gl={{ alpha: true, antialias: true, premultipliedAlpha: false }}
        dpr={[1, 1.5]}
        shadows
        style={{ background: "none" }}
        onCreated={(state) => {
          state.gl.setClearColor(0x000000, 0);
          state.gl.setClearAlpha(0);
          state.scene.background = null;
          state.gl.shadowMap.enabled = true;
          state.gl.shadowMap.type = THREE.PCFSoftShadowMap;
        }}
      >
        <AnimationController
          visibleRef={visibleRef}
          entryProgress={entryProgress}
          exitMode={exitMode}
          exitProgress={exitProgress}
        />
        <SceneFog
          entryProgress={entryProgress}
          exitMode={exitMode}
          exitProgress={exitProgress}
        />
        <CinematicLighting />
        <Suspense fallback={null}>
          <MaqamModel
            scale={0.105}
            rotationSpeed={0.08}
            entryProgress={entryProgress}
            exitMode={exitMode}
            exitProgress={exitProgress}
          />
          <PartnersRing scrollProgress={scrollProgress} />
          <GoldenDust />
          <CameraController
            scrollProgress={scrollProgress}
            dragAngleRef={dragAngleRef}
            isDraggingRef={isDraggingRef}
          />
        </Suspense>
      </Canvas>

      {/* Content Overlays */}
      {/* Drag capture layer — below content overlays, above canvas.
          touchAction:pan-y lets vertical scroll pass through on mobile.
          pointer-events:auto overrides parent's none. */}
      <div
        className="absolute inset-0"
        style={{
          pointerEvents: visible ? "auto" : "none",
          touchAction: "pan-y",
          cursor: isDragging ? "grabbing" : "grab",
        }}
        onPointerDown={(e) => {
          e.currentTarget.setPointerCapture(e.pointerId);
          isDraggingRef.current = true;
          lastXRef.current = e.clientX;
          setIsDragging(true);
        }}
        onPointerMove={(e) => {
          if (!isDraggingRef.current) return;
          const dx = e.clientX - lastXRef.current;
          dragAngleRef.current += dx * 0.006;
          lastXRef.current = e.clientX;
        }}
        onPointerUp={() => {
          isDraggingRef.current = false;
          setIsDragging(false);
        }}
        onPointerCancel={() => {
          isDraggingRef.current = false;
          setIsDragging(false);
        }}
      />
      <div className="absolute inset-0 overflow-hidden">
        {/* Phase 1 — Cinematic Hero Title */}
        <div
          className="aec-overlay absolute inset-0 flex flex-col items-center justify-center px-4"
          style={{
            opacity: phase === 1 ? 1 : 0,
            pointerEvents: phase === 1 ? "auto" : "none",
          }}
        >
          {/* Main title — scales up */}
          <h1
            ref={p1TitleRef}
            className="aec text-4xl xs:text-5xl sm:text-6xl md:text-7xl lg:text-[10rem] text-[#e6f7ff] drop-shadow-[0_0_80px_rgba(255,194,0,0.35)] leading-none text-center break-words mt-9 md:mt-5"
            style={{ opacity: 0, transform: "scale(0.88)" }}
          >
            AEC
          </h1>

          {/* Divider */}
          <div
            ref={p1DividerRef}
            className="w-32 h-[1px] bg-gradient-to-r from-transparent via-[#e6f7ff]/60 to-transparent mx-auto my-4"
            style={{ opacity: 0, transform: "scaleX(0)" }}
          />

          {/* Subtitle — slides from right */}
          <p
            ref={p1SubtitleRef}
            className="text-white/50 text-sm md:text-xl tracking-[0.4em] font-light uppercase mb-6"
            style={{ opacity: 0, transform: "translateX(36px)" }}
          >
            Algerian Engineering Competition
          </p>

          {/* Slogan — slides from left */}
          <div
            ref={p1SloganRef}
            id="hero-section"
            className="relative w-full min-h-[320px] h-[60vw] max-h-[90vh] flex flex-col justify-center items-center overflow-hidden"
            style={{ opacity: 0, transform: "translateX(-36px)" }}
          >
            <div className="relative flex flex-col items-center text-white text-center gap-2 w-full">
              <Image
                src="/bottom.png"
                alt="top-decoration"
                width={200}
                height={200}
                priority
                className="absolute -top-6 left-1/2 -translate-x-1/2 rotate-180 w-[90px] xs:w-[120px] sm:w-[180px] md:w-[250px] lg:w-[350px] object-contain"
              />
              <div className="text-lg xs:text-xl sm:text-2xl md:text-4xl flex flex-col items-center w-full">
                <div className="slogan font-semibold flex flex-wrap justify-center w-full text-base xs:text-lg sm:text-xl md:text-2xl lg:text-3xl">
                  <span className="mr-1 xs:mr-2 md:mr-5">THINK</span>
                  <span className="text-[#e6f7ff] mr-1 xs:mr-2 md:mr-5">
                    BOLD
                  </span>
                  <span className="mr-1 xs:mr-2 md:mr-5">. BUILD</span>
                  <span className="text-[#e6f7ff] mr-1 xs:mr-2 md:mr-5">
                    SMART
                  </span>
                  <span className="mr-1 xs:mr-2 md:mr-5">.</span>
                </div>
                <div className="slogan font-semibold flex flex-wrap justify-center w-full text-base xs:text-lg sm:text-xl md:text-2xl lg:text-3xl">
                  <span className="mr-1 xs:mr-2 md:mr-5">COMPETE</span>
                  <span className="text-[#e6f7ff] mr-1 xs:mr-2 md:mr-5">
                    HARD
                  </span>
                  <span className="mr-1 xs:mr-2 md:mr-5">.</span>
                </div>
              </div>
              <Image
                src="/bottom.png"
                alt="bottom-decoration"
                width={200}
                height={200}
                priority
                className="absolute -bottom-6 left-1/2 -translate-x-1/2 w-[90px] xs:w-[120px] sm:w-[180px] md:w-[250px] lg:w-[350px] object-contain"
              />
            </div>
          </div>

          {/* Stats — staggered from bottom */}
          <div className="flex items-center gap-6 md:gap-12 mb-8">
            <div
              ref={p1Stat0Ref}
              className="text-center min-w-[70px] xs:min-w-[90px]"
              style={{ opacity: 0, transform: "translateY(22px)" }}
            >
              <div className="aec text-lg xs:text-xl sm:text-2xl md:text-4xl text-[#e6f7ff] leading-none">
                100+
              </div>
              <div className="text-white/35 text-[10px] xs:text-xs tracking-[0.18em] xs:tracking-[0.25em] uppercase mt-1">
                Teams
              </div>
            </div>
            <div
              ref={p1Stat2Ref}
              className="text-center min-w-[70px] xs:min-w-[90px]"
              style={{ opacity: 0, transform: "translateY(22px)" }}
            >
              <div className="aec text-lg xs:text-xl sm:text-2xl md:text-4xl text-[#e6f7ff] leading-none">
                400+
              </div>
              <div className="text-white/35 text-[10px] xs:text-xs tracking-[0.18em] xs:tracking-[0.25em] uppercase mt-1">
                Participants
              </div>
            </div>
            <div
              ref={p1Stat1Ref}
              className="text-center min-w-[70px] xs:min-w-[90px]"
              style={{ opacity: 0, transform: "translateY(22px)" }}
            >
              <div className="aec text-lg xs:text-xl sm:text-2xl md:text-4xl text-[#e6f7ff] leading-none">
                48
              </div>
              <div className="text-white/35 text-[10px] xs:text-xs tracking-[0.18em] xs:tracking-[0.25em] uppercase mt-1">
                Wilayas
              </div>
            </div>
            
          </div>

          {/* Scroll hint */}
          {/* <div
            ref={p1HintRef}
            className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-1"
            style={{ opacity: 0 }}
          >
            <span className="text-white text-xs tracking-[0.3em] uppercase">Scroll to explore</span>
            <div className="w-[1px] h-8 bg-gradient-to-b from-white/60 to-transparent animate-pulse" />
          </div> */}
        </div>

        {/* Phase 2 — Description: fixed title + cinematic phrases */}
        <div
          className="absolute top-[14%] left-1/2 z-40 text-center pointer-events-none"
          style={{
            transform: "translateX(-50%)",
            opacity: phase === 2 ? 1 : 0,
            transition: "opacity 0.5s ease",
          }}
        >
          <p className="text-white/40 text-[10px] sm:text-xs tracking-[0.5em] uppercase mb-2 font-light">
            About
          </p>
          <h2
            className="aec text-2xl sm:text-3xl md:text-5xl text-[#e6f7ff]"
            style={{
              textShadow: "0 0 40px rgba(255,194,0,0.2), 0 2px 20px rgba(0,0,0,0.8)",
              letterSpacing: "0.15em",
            }}
          >
            WHAT IS AEC
          </h2>
          <div className="w-16 h-[1px] bg-gradient-to-r from-transparent via-[#FFC200]/50 to-transparent mx-auto mt-3" />
        </div>

        {/* Phase 3 — Carousel */}
        <div
          className="aec-overlay absolute inset-0 flex flex-col items-center justify-center"
          style={{
            opacity: phase === 3 ? 1 : 0,
            transform: `translateY(${phase === 2 ? 0 : 40}px) scale(${phase === 2 ? 1 : 0.96})`,
            pointerEvents: phase === 2 ? "auto" : "none",
            transition: "opacity 0.6s ease, transform 0.6s ease",
          }}
        >
          <h2 className="aec text-2xl md:text-4xl text-[#e6f7ff] mb-4 md:mb-6 drop-shadow-[0_0_30px_rgba(255,194,0,0.2)] text-center">
            Relive AEC Moments
          </h2>
          <div className="w-[92%] md:w-[80%] lg:w-[70%] max-w-5xl" style={{ height: '60vh' }}>
            <Slider />
          </div>
        </div>

        {/* Phase 4 — Partners */}
        <div
          className="aec-overlay absolute bottom-14 md:bottom-20 left-[50%]"
          style={{
            opacity: phase === 4 ? 1 : 0,
            transform: `translateX(-50%) translateY(${phase === 4 ? 0 : 50}px) scale(${phase === 4 ? 1 : 0.9})`,
          }}
        >
          <div className="text-center">
            <h2 className="aec text-3xl md:text-5xl text-[#e6f7ff] drop-shadow-[0_0_40px_rgba(255,194,0,0.25)] mb-3">
              OUR PARTNERS
            </h2>
            <div className="w-20 h-[1px] bg-gradient-to-r from-transparent via-[#e6f7ff]/40 to-transparent mx-auto mb-3" />
            <p className="text-white/35 text-sm md:text-lg tracking-[0.3em]">
              BUILDING THE FUTURE TOGETHER
            </p>
          </div>
        </div>

        {/* Phase 5 — Monument Reveal */}
        <div
          className="aec-overlay absolute inset-0 flex items-end justify-center pb-14 md:pb-20"
          style={{
            opacity: phase === 5 ? 1 : 0,
            transform: `translateY(${phase === 5 ? 0 : 30}px)`,
            pointerEvents: phase === 5 ? "auto" : "none",
          }}
        >
          <div className="text-center">
            <p className="text-white/35 text-xs md:text-sm tracking-[0.5em] mb-3 uppercase">
              Built on Heritage · Driven by Innovation
            </p>
            <h2 className="aec text-4xl md:text-6xl text-[#e6f7ff] drop-shadow-[0_0_60px_rgba(255,194,0,0.3)] leading-none mb-2">
              AEC 2026
            </h2>
            <div className="w-24 h-[1px] bg-gradient-to-r from-transparent via-[#e6f7ff]/40 to-transparent mx-auto mb-3" />
            <p className="text-white/45 text-sm md:text-base tracking-[0.35em] font-light uppercase mb-6">
              Algerian Engineering Competition
            </p>
            <Link
              href="/register"
              className="inline-flex items-center gap-2 border border-[#e6f7ff]/40 text-[#e6f7ff]/80 hover:border-[#e6f7ff] hover:text-[#e6f7ff] hover:bg-[#e6f7ff]/10 py-2 px-6 rounded-lg text-sm tracking-[0.2em] uppercase font-medium transition-all duration-300"
            >
              Join the Competition
            </Link>
          </div>
        </div>

        {/* Global floating scrolling phrases */}
        <CinematicPhrases scrollProgress={scrollProgress} />

        {/* Top + Bottom vignette gradients */}
        <div
          className="absolute top-0 left-0 right-0 h-40 pointer-events-none"
          style={{
            background:
              "linear-gradient(to top, transparent, rgba(13,0,43,0.4))",
            opacity: visible ? 1 : 0,
            transition: "opacity 1s ease",
          }}
        />
        <div
          className="absolute bottom-0 left-0 right-0 h-44 pointer-events-none"
          style={{
            background: "linear-gradient(to bottom, transparent, #0D002B)",
            opacity: phase === 5 ? 1 : 0,
            transition: "opacity 1.5s ease",
          }}
        />
      </div>
    </div>
  );
}
