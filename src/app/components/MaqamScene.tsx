"use client";

import { useEffect, useRef, useState, Suspense } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import * as THREE from "three";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import MaqamModel from "./MaqamModel";
import Slider from "./slider";
import Link from "next/link";
import Image from "next/image";

gsap.registerPlugin(ScrollTrigger);

/* ════════════════════════════════════════════
   3D Maqam Controller — drives position/rotation
   from scroll progress refs via useFrame
   ════════════════════════════════════════════ */

function MaqamController({
  scrollProgress,
}: {
  scrollProgress: React.MutableRefObject<number>;
}) {
  const groupRef = useRef<THREE.Group>(null);

  // Smooth damped state
  const state = useRef({
    x: 0, y: -8, z: 0,
    rotY: 0,
    scale: 0.105,
    targetX: 0, targetY: 0, targetZ: 0,
    targetRotY: 0,
    targetScale: 0.105,
  });

  useFrame((_, delta) => {
    const p = scrollProgress.current;
    const s = state.current;
    const DAMP = 3.0; // damping speed for lerping

    // ── Compute targets based on scroll phase ──
    if (p < 0.25) {
      // Phase 1: Center, large and heroic
      const local = p / 0.25;
      s.targetX = 0;
      s.targetY = THREE.MathUtils.lerp(-4, -1, Math.min(1, local * 2));
      s.targetZ = 0;
      s.targetRotY = local * Math.PI * 0.2;
      s.targetScale = 0.14;
    } else if (p < 0.5) {
      // Phase 2: Move left to make space for text
      s.targetX = -2.5;
      s.targetY = -0.5;
      s.targetZ = -1;
      const local = (p - 0.25) / 0.25;
      s.targetRotY = Math.PI * 0.2 + local * Math.PI * 0.4;
      s.targetScale = 0.09;
    } else if (p < 0.75) {
      // Phase 3: Move right for locations
      s.targetX = 2.5;
      s.targetY = -0.5;
      s.targetZ = -1;
      const local = (p - 0.5) / 0.25;
      s.targetRotY = Math.PI * 0.6 + local * Math.PI * 0.4;
      s.targetScale = 0.09;
    } else {
      // Phase 4: Center back for gallery
      s.targetX = 0;
      s.targetY = -0.5;
      s.targetZ = -3;
      const local = (p - 0.75) / 0.25;
      s.targetRotY = Math.PI * 1.0 + local * Math.PI * 0.4;
      s.targetScale = 0.08;
    }

    // Smooth idle rotation always
    s.targetRotY += delta * 0.08;

    // Damp towards targets
    s.x = THREE.MathUtils.damp(s.x, s.targetX, DAMP, delta);
    s.y = THREE.MathUtils.damp(s.y, s.targetY, DAMP, delta);
    s.z = THREE.MathUtils.damp(s.z, s.targetZ, DAMP, delta);
    s.rotY += (s.targetRotY - s.rotY) * Math.min(1, delta * DAMP);
    s.scale = THREE.MathUtils.damp(s.scale, s.targetScale, DAMP, delta);

    if (groupRef.current) {
      groupRef.current.position.set(s.x, s.y, s.z);
      groupRef.current.rotation.y = s.rotY;
      groupRef.current.scale.setScalar(s.scale);
    }
  });

  return (
    <group ref={groupRef}>
      <MaqamModel scale={1} rotationSpeed={0} />
    </group>
  );
}

/* ════════════════════════════════════════════
   Cinematic Lighting for the 3D scene
   ════════════════════════════════════════════ */

function CinematicLighting() {
  return (
    <>
      <ambientLight intensity={0.15} color="#BAD7E9" />
      <hemisphereLight args={["#F4F6FF", "#10375C", 0.4]} />
      <directionalLight
        position={[8, 22, 10]}
        intensity={1.8}
        color="#F3C623"
        castShadow
        shadow-mapSize-width={1024}
        shadow-mapSize-height={1024}
      />
      <directionalLight
        position={[-8, 14, -8]}
        intensity={0.3}
        color="#EB8317"
      />
      <pointLight
        position={[-4, 18, -10]}
        intensity={0.5}
        color="#EB8317"
        distance={40}
        decay={2}
      />
      <pointLight
        position={[5, 10, -5]}
        intensity={0.5}
        color="#F4F6FF"
        distance={30}
        decay={2}
      />
      <pointLight
        position={[0, 28, 0]}
        intensity={0.25}
        color="#F3C623"
        distance={45}
        decay={2}
      />
    </>
  );
}

/* ════════════════════════════════════════
   Blueprint Background (SVG-based)
   ════════════════════════════════════════ */

function BlueprintBackground({ progress }: { progress: number }) {
  const opacity = Math.min(1, progress * 2) * 0.18;

  return (
    <div
      className="absolute inset-0 pointer-events-none overflow-hidden"
      style={{ opacity, transition: "opacity 0.4s ease" }}
    >
      <svg
        width="100%"
        height="100%"
        className="absolute inset-0"
        xmlns="http://www.w3.org/2000/svg"
        preserveAspectRatio="none"
      >
        <defs>
          <pattern
            id="bp-grid-sm"
            width="30"
            height="30"
            patternUnits="userSpaceOnUse"
          >
            <path
              d="M 30 0 L 0 0 0 30"
              fill="none"
              stroke="rgba(244,246,255,0.07)"
              strokeWidth="0.4"
            />
          </pattern>
          <pattern
            id="bp-grid-lg"
            width="150"
            height="150"
            patternUnits="userSpaceOnUse"
          >
            <rect width="150" height="150" fill="url(#bp-grid-sm)" />
            <path
              d="M 150 0 L 0 0 0 150"
              fill="none"
              stroke="rgba(244,246,255,0.12)"
              strokeWidth="0.6"
            />
          </pattern>
        </defs>

        {/* Grid fill */}
        <rect width="100%" height="100%" fill="url(#bp-grid-lg)" />

        {/* Geometric construction circles */}
        <circle
          cx="15%"
          cy="25%"
          r="80"
          fill="none"
          stroke="rgba(244,246,255,0.05)"
          strokeWidth="0.4"
          strokeDasharray="4 6"
        />
        <circle
          cx="85%"
          cy="70%"
          r="120"
          fill="none"
          stroke="rgba(244,246,255,0.04)"
          strokeWidth="0.4"
          strokeDasharray="4 6"
        />
        <circle
          cx="50%"
          cy="50%"
          r="200"
          fill="none"
          stroke="rgba(244,246,255,0.03)"
          strokeWidth="0.4"
          strokeDasharray="8 12"
        />

        {/* Technical dashed lines */}
        <line
          x1="0"
          y1="30%"
          x2="100%"
          y2="30%"
          stroke="rgba(244,246,255,0.035)"
          strokeWidth="0.4"
          strokeDasharray="12 20"
        />
        <line
          x1="0"
          y1="70%"
          x2="100%"
          y2="70%"
          stroke="rgba(244,246,255,0.035)"
          strokeWidth="0.4"
          strokeDasharray="12 20"
        />
        <line
          x1="25%"
          y1="0"
          x2="25%"
          y2="100%"
          stroke="rgba(244,246,255,0.035)"
          strokeWidth="0.4"
          strokeDasharray="12 20"
        />
        <line
          x1="75%"
          y1="0"
          x2="75%"
          y2="100%"
          stroke="rgba(244,246,255,0.035)"
          strokeWidth="0.4"
          strokeDasharray="12 20"
        />

        {/* Diagonal construction lines */}
        <line
          x1="0"
          y1="0"
          x2="40%"
          y2="100%"
          stroke="rgba(244,246,255,0.025)"
          strokeWidth="0.3"
          strokeDasharray="6 14"
        />
        <line
          x1="100%"
          y1="0"
          x2="60%"
          y2="100%"
          stroke="rgba(244,246,255,0.025)"
          strokeWidth="0.3"
          strokeDasharray="6 14"
        />

        {/* Coordinate markers */}
        <g
          opacity="0.1"
          fill="rgba(244,246,255,0.25)"
          fontSize="7"
          fontFamily="monospace"
        >
          <text x="26%" y="31%">
            A1
          </text>
          <text x="76%" y="31%">
            B1
          </text>
          <text x="26%" y="71%">
            A2
          </text>
          <text x="76%" y="71%">
            B2
          </text>
          <text x="48%" y="5%">
            REF-0
          </text>
          <text x="2%" y="50%">
            Y:0.50
          </text>
          <text x="92%" y="50%">
            Y:0.50
          </text>
        </g>

        {/* Dimension line at bottom */}
        <g opacity="0.07">
          <line
            x1="10%"
            y1="95%"
            x2="90%"
            y2="95%"
            stroke="rgba(244,246,255,0.25)"
            strokeWidth="0.4"
          />
          <line
            x1="10%"
            y1="93%"
            x2="10%"
            y2="97%"
            stroke="rgba(244,246,255,0.25)"
            strokeWidth="0.4"
          />
          <line
            x1="50%"
            y1="93%"
            x2="50%"
            y2="97%"
            stroke="rgba(244,246,255,0.25)"
            strokeWidth="0.4"
          />
          <line
            x1="90%"
            y1="93%"
            x2="90%"
            y2="97%"
            stroke="rgba(244,246,255,0.25)"
            strokeWidth="0.4"
          />
        </g>

        {/* Technical arcs */}
        <path
          d="M 30% 20% A 60 60 0 0 1 45% 15%"
          fill="none"
          stroke="rgba(244,246,255,0.035)"
          strokeWidth="0.3"
        />
        <path
          d="M 70% 80% A 80 80 0 0 0 55% 85%"
          fill="none"
          stroke="rgba(244,246,255,0.035)"
          strokeWidth="0.3"
        />
      </svg>

      {/* Animated "drawing" lines that reveal with scroll */}
      <svg
        className="absolute inset-0 w-full h-full"
        xmlns="http://www.w3.org/2000/svg"
        preserveAspectRatio="none"
      >
        <line
          x1="5%"
          y1="20%"
          x2="95%"
          y2="20%"
          stroke="rgba(244,246,255,0.05)"
          strokeWidth="0.4"
          strokeDasharray="1200"
          strokeDashoffset={1200 - progress * 1200}
          style={{ transition: "stroke-dashoffset 0.5s ease-out" }}
        />
        <line
          x1="5%"
          y1="80%"
          x2="95%"
          y2="80%"
          stroke="rgba(244,246,255,0.05)"
          strokeWidth="0.4"
          strokeDasharray="1200"
          strokeDashoffset={1200 - progress * 1200}
          style={{ transition: "stroke-dashoffset 0.5s ease-out" }}
        />
        <circle
          cx="50%"
          cy="50%"
          r="180"
          fill="none"
          stroke="rgba(244,246,255,0.025)"
          strokeWidth="0.3"
          strokeDasharray="1200"
          strokeDashoffset={1200 - progress * 1200}
          style={{ transition: "stroke-dashoffset 0.5s ease-out" }}
        />
      </svg>
    </div>
  );
}

/* ════════════════════════════════════════
   Partner/Location data
   ════════════════════════════════════════ */

const LOCATIONS = [
  { logo: "/tta.png", city: "Algiers", delay: 0 },
  { logo: "/seg.png", city: "Oran", delay: 0.1 },
  { logo: "/cmc.png", city: "Constantine", delay: 0.2 },
  { logo: "/quanta.png", city: "Ouargla", delay: 0.3 },
];

/* ════════════════════════════════════════
   Main MaqamScene Component
   ════════════════════════════════════════ */

export default function MaqamScene() {
  const wrapperRef = useRef<HTMLDivElement>(null);

  const [blueprintProgress, setBlueprintProgress] = useState(0);
  const [phase, setPhase] = useState(0);
  const [visible, setVisible] = useState(false);

  // Phase content refs
  const titleRef = useRef<HTMLDivElement>(null);
  const aboutRef = useRef<HTMLDivElement>(null);
  const locationsRef = useRef<HTMLDivElement>(null);
  const galleryRef = useRef<HTMLDivElement>(null);
  const locationItemRefs = useRef<(HTMLDivElement | null)[]>([]);

  // Scroll progress ref — shared with MaqamController inside the Canvas
  const scrollProgressRef = useRef(0);

  useEffect(() => {

    // ── ScrollTrigger on #aec-experience ──
    const trigger = ScrollTrigger.create({
      trigger: "#aec-experience",
      start: "top bottom",
      end: "bottom bottom",
      onUpdate: (self) => {
        const p = self.progress;
        setBlueprintProgress(p);
        scrollProgressRef.current = p;

        // ── Phase 1: 0–0.25 — Title + monument appears centred ──
        if (p < 0.25) {
          const local = p / 0.25;
          setPhase(1);

          // Hide other sections when scrolling backwards
          if (aboutRef.current) aboutRef.current.style.opacity = "0";
          if (locationsRef.current) locationsRef.current.style.opacity = "0";
          if (galleryRef.current) galleryRef.current.style.opacity = "0";

          // Title
          if (titleRef.current) {
            const fadeIn = Math.min(1, local * 3); // quick fade in
            const fadeOut = local > 0.75 ? (local - 0.75) / 0.25 : 0;
            titleRef.current.style.opacity = String(
              Math.max(0, fadeIn - fadeOut)
            );
            titleRef.current.style.transform = `translateY(${(1 - fadeIn) * 50 + fadeOut * -40}px) scale(${0.95 + fadeIn * 0.05})`;
          }
        }
        // ── Phase 2: 0.25–0.5 — About AEC, monument → left ──
        else if (p < 0.5) {
          const local = (p - 0.25) / 0.25;
          setPhase(2);

          // Hide other sections
          if (titleRef.current) titleRef.current.style.opacity = "0";
          if (locationsRef.current) locationsRef.current.style.opacity = "0";
          if (galleryRef.current) galleryRef.current.style.opacity = "0";

          // About panel
          if (aboutRef.current) {
            const fadeIn = Math.min(1, local * 2.5);
            const fadeOut = local > 0.8 ? (local - 0.8) / 0.2 : 0;
            aboutRef.current.style.opacity = String(
              Math.max(0, fadeIn - fadeOut)
            );
            aboutRef.current.style.transform = `translateX(${(1 - fadeIn) * 80 - fadeOut * 40}px)`;
          }
        }
        // ── Phase 3: 0.5–0.75 — Locations, monument → right ──
        else if (p < 0.75) {
          const local = (p - 0.5) / 0.25;
          setPhase(3);

          // Hide other sections
          if (titleRef.current) titleRef.current.style.opacity = "0";
          if (aboutRef.current) aboutRef.current.style.opacity = "0";
          if (galleryRef.current) galleryRef.current.style.opacity = "0";

          // Locations container
          if (locationsRef.current) {
            const fadeIn = Math.min(1, local * 2);
            const fadeOut = local > 0.85 ? (local - 0.85) / 0.15 : 0;
            locationsRef.current.style.opacity = String(
              Math.max(0, fadeIn - fadeOut)
            );
          }

          // Staggered location items
          locationItemRefs.current.forEach((el, i) => {
            if (!el) return;
            const stagger = i * 0.06;
            const itemProgress = Math.max(
              0,
              Math.min(1, (local - stagger) * 3)
            );
            const exitProgress =
              local > 0.85 ? (local - 0.85) / 0.15 : 0;
            el.style.opacity = String(
              Math.max(0, itemProgress - exitProgress)
            );
            el.style.transform = `translateY(${(1 - itemProgress) * 40}px) scale(${0.92 + itemProgress * 0.08})`;
          });
        }
        // ── Phase 4: 0.75–1.0 — Gallery, monument → center bg ──
        else {
          const local = (p - 0.75) / 0.25;
          setPhase(4);

          // Hide other sections
          if (titleRef.current) titleRef.current.style.opacity = "0";
          if (aboutRef.current) aboutRef.current.style.opacity = "0";
          if (locationsRef.current) locationsRef.current.style.opacity = "0";

          // Gallery
          if (galleryRef.current) {
            const fadeIn = Math.min(1, local * 2);
            galleryRef.current.style.opacity = String(fadeIn);
            galleryRef.current.style.transform = `translateY(${(1 - fadeIn) * 60}px) scale(${0.95 + fadeIn * 0.05})`;
          }
        }
      },
      onEnter: () => setVisible(true),
      onEnterBack: () => setVisible(true),
      onLeave: () => {
        setVisible(false);
        setPhase(0);
      },
      onLeaveBack: () => {
        setVisible(false);
        setPhase(0);
      },
    });

    return () => {
      trigger.kill();
    };
  }, []);

  return (
    <div
      ref={wrapperRef}
      className="fixed inset-0"
      style={{
        zIndex: visible ? 20 : 8,
        opacity: visible ? 1 : 0,
        pointerEvents: "none",
        transition: "opacity 0.7s ease",
      }}
    >
      {/* ── Blueprint background ── */}
      <BlueprintBackground progress={blueprintProgress} />

      {/* ── 3D Maqam Model ── */}
      <div className="absolute inset-0 pointer-events-none">
        <Canvas
          camera={{ position: [0, 1.5, 6], fov: 45 }}
          gl={{ alpha: true, antialias: true, premultipliedAlpha: false }}
          dpr={[1, 1.5]}
          shadows
          style={{ background: "transparent" }}
          onCreated={(glState) => {
            glState.gl.setClearColor(0x000000, 0);
            glState.gl.setClearAlpha(0);
            glState.scene.background = null;
          }}
        >
          <CinematicLighting />
          <Suspense fallback={null}>
            <MaqamController scrollProgress={scrollProgressRef} />
          </Suspense>
        </Canvas>
      </div>

      {/* ═══════════════════════════════════════════════
          PHASE 1: Intro / Title Reveal
          ═══════════════════════════════════════════════ */}
      <div
        ref={titleRef}
        className="absolute inset-0 flex flex-col items-center justify-center px-4"
        style={{ opacity: 0, pointerEvents: phase === 1 ? "auto" : "none" }}
      >
        <div className="text-center">
          {/* Badge */}
          <div
            className="inline-block mb-6 px-5 py-1.5 rounded-full"
            style={{
              border: "1px solid rgba(244,246,255,0.12)",
              background: "rgba(244,246,255,0.03)",
            }}
          >
            <span
              className="text-xs tracking-[0.4em] uppercase"
              style={{ color: "rgba(244,246,255,0.5)" }}
            >
              National Competition
            </span>
          </div>

          {/* Main title */}
          <h1
            className="aec leading-tight mb-4 bg-clip-text text-transparent bg-gradient-to-br from-[#F4F6FF] via-[#BAD7E9] to-[#1B4D80] drop-shadow-lg"
            style={{
              fontSize: "clamp(2rem, 6vw, 5rem)",
              letterSpacing: "0.08em",
            }}
          >
            AEC
          </h1>

          {/* Divider */}
          <div
            className="w-20 h-[1px] mx-auto mb-4"
            style={{
              background:
                "linear-gradient(to right, transparent, rgba(244,246,255,0.35), transparent)",
            }}
          />

          {/* Subtitle */}
          <p
            className="slogan tracking-[0.3em] uppercase mb-10 drop-shadow-lg"
            style={{
              color: "rgba(255,255,255,0.35)",
              fontSize: "clamp(0.65rem, 1.5vw, 1.1rem)",
            }}
          >
            Algerian Engineering Competition
          </p>

          {/* Stats */}
          <div className="flex items-center justify-center gap-8 md:gap-14 mb-12">
            {[
              { value: "100+", label: "Teams" },
              { value: "400+", label: "Participants" },
              { value: "48", label: "Wilayas" },
            ].map((stat, i) => (
              <div key={i} className="text-center">
                <div
                  className="aec leading-none mb-1 drop-shadow-lg"
                  style={{
                    fontSize: "clamp(1.2rem, 3vw, 2.5rem)",
                    color: "#F4F6FF",
                  }}
                >
                  {stat.value}
                </div>
                <div
                  className="uppercase tracking-[0.2em] drop-shadow-lg"
                  style={{
                    color: "rgba(255,255,255,0.25)",
                    fontSize: "clamp(0.5rem, 0.9vw, 0.7rem)",
                  }}
                >
                  {stat.label}
                </div>
              </div>
            ))}
          </div>

          {/* Scroll hint */}
          <div className="flex flex-col items-center gap-2">
            <span
              className="text-xs tracking-[0.3em] uppercase drop-shadow-lg"
              style={{ color: "rgba(255,255,255,0.2)" }}
            >
              Scroll to explore
            </span>
            <div
              className="w-[1px] h-8 animate-pulse"
              style={{
                background:
                  "linear-gradient(to bottom, rgba(244,246,255,0.35), transparent)",
              }}
            />
          </div>
        </div>
      </div>

      {/* ═══════════════════════════════════════════════
          PHASE 2: About AEC (right side)
          ═══════════════════════════════════════════════ */}
      <div
        ref={aboutRef}
        className="absolute inset-0 flex items-center justify-end px-6 md:px-16 lg:px-24"
        style={{ opacity: 0, pointerEvents: phase === 2 ? "auto" : "none" }}
      >
        <div
          className="max-w-xl w-full md:w-[50%] lg:w-[45%]"
          style={{
            background: "rgba(27, 77, 128, 0.45)",
            backdropFilter: "blur(28px)",
            WebkitBackdropFilter: "blur(28px)",
            border: "1px solid rgba(244,246,255,0.08)",
            borderRadius: "20px",
            padding: "clamp(1.5rem, 4vw, 3rem)",
            boxShadow:
              "0 20px 60px rgba(0,0,0,0.4), 0 0 80px rgba(244,246,255,0.03)",
          }}
        >
          <p
            className="text-xs tracking-[0.5em] uppercase mb-4 font-light drop-shadow-lg"
            style={{ color: "rgba(244,246,255,0.4)" }}
          >
            About
          </p>

          <h2
            className="aec mb-5 bg-clip-text text-transparent bg-gradient-to-br from-[#F4F6FF] via-[#BAD7E9] to-[#1B4D80] drop-shadow-lg"
            style={{
              fontSize: "clamp(1.4rem, 3vw, 2.8rem)",
              letterSpacing: "0.1em",
            }}
          >
            WHAT IS AEC
          </h2>

          <div
            className="w-14 h-[1px] mb-5"
            style={{
              background:
                "linear-gradient(to right, rgba(244,246,255,0.3), transparent)",
            }}
          />

          <p
            className="leading-relaxed mb-6 drop-shadow-lg"
            style={{
              color: "rgba(255,255,255,0.65)",
              fontSize: "clamp(0.82rem, 1.3vw, 1.05rem)",
              lineHeight: 1.8,
            }}
          >
            The Algerian Engineering Competition (AEC) is a national event that
            brings together engineering students, recent graduates, and industry
            experts to solve real-world problems through innovation and
            teamwork. Participants from all over Algeria showcase their skills
            and creativity in a competitive environment that fosters
            collaboration and engineering excellence.
          </p>

          {/* Tags */}
          <div className="flex flex-wrap gap-2.5 mb-7">
            {["Innovation", "Teamwork", "National Impact", "Real Problems"].map(
              (tag) => (
                <span
                  key={tag}
                  className="px-3 py-1 rounded-full text-xs tracking-widest uppercase"
                  style={{
                    border: "1px solid rgba(244,246,255,0.1)",
                    color: "rgba(244,246,255,0.45)",
                    background: "rgba(244,246,255,0.03)",
                  }}
                >
                  {tag}
                </span>
              )
            )}
          </div>

          {/* CTA */}
          <Link
            href="/register"
            className="group inline-flex items-center gap-2 py-2.5 px-7 rounded-lg font-bold text-base transition-all duration-300 hover:shadow-[0_0_30px_rgba(244,246,255,0.15)]"
            style={{ background: "#F4F6FF", color: "#10375C" }}
          >
            REGISTER NOW
            <svg
              className="w-4 h-4 group-hover:translate-x-1 transition-transform duration-200"
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

      {/* ═══════════════════════════════════════════════
          PHASE 3: Competition Locations (left side)
          ═══════════════════════════════════════════════ */}
      <div
        ref={locationsRef}
        className="absolute inset-0 flex items-center justify-start px-6 md:px-16 lg:px-24"
        style={{ opacity: 0, pointerEvents: phase === 3 ? "auto" : "none" }}
      >
        <div className="max-w-lg w-full md:w-[50%] lg:w-[45%]">
          <p
            className="text-xs tracking-[0.5em] uppercase mb-3 font-light drop-shadow-lg"
            style={{ color: "rgba(244,246,255,0.4)" }}
          >
            Where We Compete
          </p>

          <h2
            className="aec mb-8 bg-clip-text text-transparent bg-gradient-to-br from-[#F4F6FF] via-[#BAD7E9] to-[#1B4D80] drop-shadow-lg"
            style={{
              fontSize: "clamp(1.2rem, 2.8vw, 2.4rem)",
              letterSpacing: "0.1em",
            }}
          >
            COMPETITION LOCATIONS
          </h2>

          {/* Location cards */}
          <div className="flex flex-col gap-3.5">
            {LOCATIONS.map((loc, i) => (
              <div
                key={loc.city}
                ref={(el) => {
                  locationItemRefs.current[i] = el;
                }}
                className="group flex items-center gap-4 p-3.5 rounded-xl cursor-default"
                style={{
                  opacity: 0,
                  background: "rgba(27, 77, 128, 0.4)",
                  backdropFilter: "blur(16px)",
                  WebkitBackdropFilter: "blur(16px)",
                  border: "1px solid rgba(244,246,255,0.06)",
                  transition: "all 0.35s cubic-bezier(0.4, 0, 0.2, 1)",
                }}
                onMouseEnter={(e) => {
                  const el = e.currentTarget;
                  el.style.borderColor = "rgba(244,246,255,0.18)";
                  el.style.background = "rgba(244,246,255,0.05)";
                  el.style.transform = "translateX(8px) translateY(0) scale(1)";
                  el.style.boxShadow =
                    "0 4px 24px rgba(244,246,255,0.06)";
                }}
                onMouseLeave={(e) => {
                  const el = e.currentTarget;
                  el.style.borderColor = "rgba(244,246,255,0.06)";
                  el.style.background = "rgba(27, 77, 128, 0.4)";
                  el.style.boxShadow = "none";
                }}
              >
                {/* Logo */}
                <div
                  className="flex-shrink-0 w-12 h-12 rounded-lg flex items-center justify-center overflow-hidden"
                  style={{
                    background: "rgba(255,255,255,0.04)",
                    border: "1px solid rgba(244,246,255,0.07)",
                  }}
                >
                  <Image
                    src={loc.logo}
                    alt={loc.city}
                    width={36}
                    height={36}
                    className="object-contain"
                    style={{ filter: "brightness(1.1)" }}
                  />
                </div>

                {/* City name */}
                <div>
                  <p
                    className="font-semibold tracking-wide uppercase drop-shadow-lg"
                    style={{
                      color: "#F4F6FF",
                      fontSize: "clamp(0.8rem, 1.1vw, 0.95rem)",
                    }}
                  >
                    {loc.city}
                  </p>
                  <p
                    className="text-xs tracking-widest uppercase mt-0.5 drop-shadow-lg"
                    style={{ color: "rgba(255,255,255,0.25)" }}
                  >
                    Competition Hub
                  </p>
                </div>

                {/* Hover arrow */}
                <div className="ml-auto opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  <svg
                    width="14"
                    height="14"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="rgba(244,246,255,0.35)"
                    strokeWidth="2"
                    strokeLinecap="round"
                  >
                    <path d="M5 12h14M12 5l7 7-7 7" />
                  </svg>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ═══════════════════════════════════════════════
          PHASE 4: Gallery
          ═══════════════════════════════════════════════ */}
      <div
        ref={galleryRef}
        className="absolute inset-0 flex flex-col items-center justify-center"
        style={{ opacity: 0, pointerEvents: phase === 4 ? "auto" : "none" }}
      >
        <h2
          className="aec mb-4 md:mb-6 text-center bg-clip-text text-transparent bg-gradient-to-br from-[#F4F6FF] via-[#BAD7E9] to-[#1B4D80] drop-shadow-lg"
          style={{
            fontSize: "clamp(1.2rem, 2.8vw, 2.4rem)",
            letterSpacing: "0.1em",
          }}
        >
          Relive AEC Moments
        </h2>
        <div
          className="w-[92%] md:w-[80%] lg:w-[70%] max-w-5xl"
          style={{ height: "60vh" }}
        >
          <Slider />
        </div>
      </div>

      {/* ── Top + Bottom vignette gradients ── */}
      <div
        className="absolute top-0 left-0 right-0 h-32 pointer-events-none"
        style={{
          background: "linear-gradient(to bottom, #10375C, transparent)",
          opacity: visible ? 0.6 : 0,
          transition: "opacity 1s ease",
        }}
      />
      <div
        className="absolute bottom-0 left-0 right-0 h-32 pointer-events-none"
        style={{
          background: "linear-gradient(to top, #10375C, transparent)",
          opacity: visible ? 0.6 : 0,
          transition: "opacity 1s ease",
        }}
      />
    </div>
  );
}
