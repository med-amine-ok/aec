'use client';

import { useEffect, useRef, useState, Suspense } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { Sparkles } from '@react-three/drei';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import MaqamModel from './MaqamModel';
import PartnersRing from './PartnersRing';
import Slider from './swiper';
import Link from 'next/link';
import * as THREE from 'three';

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
      <hemisphereLight args={['#cecece', '#f3e9e9', 0.3]} />

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
      <directionalLight position={[-8, 14, -8]} intensity={0.3} color="#ed963a" />

      {/* RIM: Back gold edge light */}
      <pointLight position={[-4, 18, -10]} intensity={0.5} color="#FF8C00" distance={40} decay={2} />
      {/* ACCENT: Warm glow wrapping around monument */}
      <pointLight position={[5, 10, -5]} intensity={0.5} color="#FFC200" distance={30} decay={2} />
      {/* GROUND BOUNCE: Purple reflected light from below */}
      <pointLight position={[0, -3, 5]} intensity={0.15} color="#8e681d" distance={20} decay={2} />
      {/* CROWN: Top-down gold kiss */}
      <pointLight position={[0, 28, 0]} intensity={0.25} color="#FFD700" distance={45} decay={2} />
      {/* KICKER: Amber from back-left for volume */}
      <pointLight position={[-6, 8, 6]} intensity={0.3} color="#FF6600" distance={25} decay={2} />
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
  exitMode: React.MutableRefObject<'none' | 'sink' | 'fogonly'>;
  exitProgress: React.MutableRefObject<number>;
}) {
  const { scene } = useThree();
  const fogRef = useRef<THREE.FogExp2 | null>(null);

  useEffect(() => {
    const fog = new THREE.FogExp2('#0D002B', 0.09);
    fogRef.current = fog;
    scene.fog = fog;
    return () => {
      scene.fog = null;
      fogRef.current = null;
    };
  }, [scene]);

  useFrame(() => {
    if (fogRef.current) {
      if (exitMode.current !== 'none') {
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
      color="#FFC200"
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
  exitMode: React.MutableRefObject<'none' | 'sink' | 'fogonly'>;
  exitProgress: React.MutableRefObject<number>;
}) {
  useFrame((_, delta) => {
    if (exitMode.current !== 'none') {
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

    if (p < 0.1) {
      // PHASE 1 — HERO: Tight on the crown, slow upward drift
      // Camera starts extremely close, slightly orbiting
      const s = p / 0.15;
      const e = easeInOutCubic(s);
      const angle = THREE.MathUtils.lerp(0, 0.3, e);
      const r = THREE.MathUtils.lerp(2.8, 3.5, e);
      cx = Math.sin(angle) * r;
      cy = THREE.MathUtils.lerp(4.5, 3.8, e);
      cz = Math.cos(angle) * r;
      lx = 0;
      ly = THREE.MathUtils.lerp(3.5, 2.8, e);
      lz = 0;
    } else if (p < 0.35) {
      // PHASE 2 — CAROUSEL: Spiral orbit right + descend + zoom out
      const s = (p - 0.15) / 0.2;
      const e = easeInOutCubic(s);
      const angle = THREE.MathUtils.lerp(0.3, 1.2, e);
      const r = THREE.MathUtils.lerp(3.5, 8, e);
      cx = Math.sin(angle) * r;
      cy = THREE.MathUtils.lerp(3.8, 2.8, e);
      cz = Math.cos(angle) * r;
      lx = THREE.MathUtils.lerp(0, -1.5, e);
      ly = THREE.MathUtils.lerp(2.8, 1.8, e);
      lz = 0;
    } else if (p < 0.55) {
      // PHASE 3 — ABOUT: Continue orbit to opposite side + widen
      const s = (p - 0.35) / 0.2;
      const e = easeInOutCubic(s);
      const angle = THREE.MathUtils.lerp(1.2, Math.PI + 0.5, e);
      const r = THREE.MathUtils.lerp(8, 11, e);
      cx = Math.sin(angle) * r;
      cy = THREE.MathUtils.lerp(2.8, 2.5, e);
      cz = Math.cos(angle) * r;
      lx = THREE.MathUtils.lerp(-1.5, 1.5, e);
      ly = THREE.MathUtils.lerp(1.8, 1.5, e);
      lz = 0;
    } else if (p < 0.75) {
      // PHASE 4 — PARTNERS: Swing back to center, pull way back
      const s = (p - 0.55) / 0.2;
      const e = easeInOutCubic(s);
      const angle = THREE.MathUtils.lerp(Math.PI + 0.5, Math.PI * 2, e);
      const r = THREE.MathUtils.lerp(11, 17, e);
      cx = Math.sin(angle) * r;
      cy = THREE.MathUtils.lerp(2.5, 3.8, e);
      cz = Math.cos(angle) * r;
      lx = THREE.MathUtils.lerp(1.5, 0, e);
      ly = 1.5;
      lz = 0;
    } else {
      // PHASE 5 — REVEAL: Dramatic crane up + zoom out, full monument
      const s = (p - 0.75) / 0.25;
      const e = easeOutQuart(s);
      cx = THREE.MathUtils.lerp(0, 0, e);
      cy = THREE.MathUtils.lerp(3.8, 8, e);
      cz = THREE.MathUtils.lerp(17, 48, e);
      lx = 0;
      ly = THREE.MathUtils.lerp(1.5, 3.5, e);
      lz = 0;
    }

    // Drag rotation — slow spring-back when not dragging
    if (!isDraggingRef.current) {
      dragAngleRef.current = THREE.MathUtils.damp(dragAngleRef.current, 0, 0.35, delta);
    }
    if (Math.abs(dragAngleRef.current) > 0.0001) {
      const cosD = Math.cos(dragAngleRef.current);
      const sinD = Math.sin(dragAngleRef.current);
      const newCX = cx * cosD + cz * sinD;
      const newCZ = -cx * sinD + cz * cosD;
      const newLX = lx * cosD + lz * sinD;
      const newLZ = -lx * sinD + lz * cosD;
      cx = newCX; cz = newCZ;
      lx = newLX; lz = newLZ;
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
    camera.position.x = THREE.MathUtils.damp(camera.position.x, cx + breathX + sx, smooth, delta);
    camera.position.y = THREE.MathUtils.damp(camera.position.y, cy + breathY + sy, smooth, delta);
    camera.position.z = THREE.MathUtils.damp(camera.position.z, cz + sz, smooth, delta);

    lookTarget.current.x = THREE.MathUtils.damp(lookTarget.current.x, lx, smooth, delta);
    lookTarget.current.y = THREE.MathUtils.damp(lookTarget.current.y, ly, smooth, delta);
    lookTarget.current.z = THREE.MathUtils.damp(lookTarget.current.z, lz, smooth, delta);
    camera.lookAt(lookTarget.current);
  });

  return null;
}

// ========================
// Main Component
// ========================

export default function MaqamScene() {
  const scrollProgress = useRef(0);
  const visibleRef = useRef(false);
  const entryProgress = useRef(0);
  const exitMode = useRef<'none' | 'sink' | 'fogonly'>('none');
  const exitProgress = useRef(0);
  const exitTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const dragAngleRef = useRef(0);
  const isDraggingRef = useRef(false);
  const lastXRef = useRef(0);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const isActiveRef = useRef(false);
  const [visible, setVisible] = useState(false);
  const [phase, setPhase] = useState(0);
  const [isDragging, setIsDragging] = useState(false);

  useEffect(() => {
    const trigger = ScrollTrigger.create({
      trigger: '#aec-experience',
      start: 'top top%',
      end: 'bottom bottom',
      onUpdate: (self) => {
        const p = self.progress;
        scrollProgress.current = p;

        if (p < 0.4) setPhase(1);
        else if (p < 0.45) setPhase(2);
        else if (p < 0.55) setPhase(3);
        else if (p < 0.75) setPhase(4);
        else setPhase(5);

        // Write opacity directly to DOM — zero React re-renders, silky smooth
        if (isActiveRef.current && wrapperRef.current) {
          const pOp = p < 0.28 ? p / 0.28 : 1;
          wrapperRef.current.style.opacity = String(pOp);
        }
      },
      onEnter: () => {
        if (exitTimerRef.current) { clearTimeout(exitTimerRef.current); exitTimerRef.current = null; }
        exitMode.current = 'none'; exitProgress.current = 0;
        isActiveRef.current = true;
        setVisible(true); visibleRef.current = true; entryProgress.current = 0;
        if (wrapperRef.current) wrapperRef.current.style.opacity = '0';
      },
      onEnterBack: () => {
        if (exitTimerRef.current) { clearTimeout(exitTimerRef.current); exitTimerRef.current = null; }
        exitMode.current = 'none'; exitProgress.current = 0;
        isActiveRef.current = true;
        setVisible(true); visibleRef.current = true; entryProgress.current = 0;
        if (wrapperRef.current) wrapperRef.current.style.opacity = '1';
      },
      onLeave: () => {
        isActiveRef.current = false;
        exitMode.current = 'fogonly';
        exitProgress.current = 0;
        visibleRef.current = false;
        // Smooth GSAP fade-out — overwrite ensures onUpdate can't race against this
        gsap.to(wrapperRef.current, {
          opacity: 0, duration: 0.7, ease: 'power2.in', overwrite: true,
          onComplete: () => { setVisible(false); setPhase(0); },
        });
      },
      onLeaveBack: () => {
        isActiveRef.current = false;
        exitMode.current = 'sink';
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
        pointerEvents: 'none',
      }}
    >
      <Canvas
        camera={{ position: [0, 4.5, 2.8], fov: 50 }}
        gl={{ alpha: true, antialias: true, premultipliedAlpha: false }}
        dpr={[1, 1.5]}
        shadows
        style={{ background: 'none' }}
        onCreated={(state) => {
          state.gl.setClearColor(0x000000, 0);
          state.gl.setClearAlpha(0);
          state.scene.background = null;
          state.gl.shadowMap.enabled = true;
          state.gl.shadowMap.type = THREE.PCFSoftShadowMap;
        }}
      >
        <AnimationController visibleRef={visibleRef} entryProgress={entryProgress} exitMode={exitMode} exitProgress={exitProgress} />
        <SceneFog entryProgress={entryProgress} exitMode={exitMode} exitProgress={exitProgress} />
        <CinematicLighting />
        <Suspense fallback={null}>
          <MaqamModel scale={0.105} rotationSpeed={0.08} entryProgress={entryProgress} exitMode={exitMode} exitProgress={exitProgress} />
          <PartnersRing scrollProgress={scrollProgress} />
          <GoldenDust />
          <CameraController scrollProgress={scrollProgress} dragAngleRef={dragAngleRef} isDraggingRef={isDraggingRef} />
        </Suspense>
      </Canvas>

      {/* Content Overlays */}
      {/* Drag capture layer — below content overlays, above canvas.
          touchAction:pan-y lets vertical scroll pass through on mobile.
          pointer-events:auto overrides parent's none. */}
      <div
        className="absolute inset-0"
        style={{
          pointerEvents: visible ? 'auto' : 'none',
          touchAction: 'pan-y',
          cursor: isDragging ? 'grabbing' : 'grab',
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
        onPointerUp={() => { isDraggingRef.current = false; setIsDragging(false); }}
        onPointerCancel={() => { isDraggingRef.current = false; setIsDragging(false); }}
      />
      <div className="absolute inset-0 overflow-hidden">
        {/* Phase 1 — Cinematic Hero Title */}
        <div
          className="aec-overlay absolute inset-0 flex items-center justify-center"
          style={{
            opacity: phase === 1 ? 1 : 0,
            transform: `translateY(${phase === 1 ? 0 : -40}px) scale(${phase === 1 ? 1 : 0.99})`,
          }}
        >
          <div className="text-center">
            <h1 className="aec text-7xl md:text-[10rem] text-[#FFC200] drop-shadow-[0_0_80px_rgba(255,194,0,0.35)] leading-none">
              AEC
            </h1>
            <div className="w-32 h-[1px] bg-gradient-to-r from-transparent via-[#FFC200]/60 to-transparent mx-auto my-5" />
            <p className="text-white/50 text-sm md:text-xl tracking-[0.4em] font-light uppercase">
              Algerian Engineering Competition
            </p>
            
          </div>
        </div>

        {/* Phase 2 — Carousel */}
        <div
          className="aec-overlay absolute top-[50%] left-4 md:left-8 w-[90%] md:w-[52%] max-w-3xl"
          style={{
            opacity: phase === 2 ? 1 : 0,
            transform: `translateY(-50%) translateX(${phase === 2 ? 0 : 100}px) scale(${phase === 2 ? 1 : 1})`,
            pointerEvents: phase === 2 ? 'auto' : 'none',
          }}
        >
          <div className="aec-glass rounded-3xl p-4 md:p-6 relative overflow-hidden">
            {/* Subtle gold accent line at top */}
            <div className="absolute top-0 left-8 right-8 h-[1px] bg-gradient-to-r from-transparent via-[#FFC200]/30 to-transparent" />
            <h2 className="aec text-2xl md:text-4xl text-[#FFC200] mb-1 drop-shadow-[0_0_20px_rgba(255,194,0,0.15)]">
              Relive AEC Moments
            </h2>
            <div className="h-[50vh] md:h-[60vh]">
              <Slider />
            </div>
          </div>
        </div>

        {/* Phase 3 — About AEC */}
        <div
          className="aec-overlay absolute top-[50%] left-4 md:left-8 w-[90%] md:w-[38%] max-w-xl"
          style={{
            opacity: phase === 3 ? 1 : 0,
            transform: `translateY(-50%) translateX(${phase === 3 ? 0 : -100}px) scale(${phase === 3 ? 1 : 0.96})`,
            pointerEvents: phase === 3 ? 'auto' : 'none',
          }}
        >
          <div className="aec-glass rounded-3xl p-6 md:p-10 relative overflow-hidden">
            <div className="absolute top-0 left-8 right-8 h-[1px] bg-gradient-to-r from-transparent via-[#FFC200]/30 to-transparent" />
            <h2 className="aec text-2xl md:text-5xl text-[#FFC200] mb-6 drop-shadow-[0_0_20px_rgba(255,194,0,0.15)]">
              WHAT IS AEC
            </h2>
            <p className="text-lg md:text-2xl text-white/80 leading-relaxed">
              The Algerian Engineering Competition (AEC) is a national event
              that brings together engineering students, recent graduates, and
              industry experts to solve real-world problems through innovation
              and teamwork.
            </p>
            <Link
              href="/register"
              className="group inline-flex items-center gap-2 bg-[#FFC200] text-[#110038] py-2.5 px-7 mt-8 rounded-lg font-bold text-lg md:text-xl hover:bg-[#FFD54F] hover:shadow-[0_0_35px_rgba(255,194,0,0.25)] transition-all duration-300"
            >
              REGISTER NOW
              <svg className="w-5 h-5 group-hover:translate-x-1 transition-transform duration-200" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 7l5 5m0 0l-5 5m5-5H6" /></svg>
            </Link>
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
            <h2 className="aec text-3xl md:text-5xl text-[#FFC200] drop-shadow-[0_0_40px_rgba(255,194,0,0.25)] mb-3">
              OUR PARTNERS
            </h2>
            <div className="w-20 h-[1px] bg-gradient-to-r from-transparent via-[#FFC200]/40 to-transparent mx-auto mb-3" />
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
            pointerEvents: phase === 5 ? 'auto' : 'none',
          }}
        >
          <div className="text-center">
            <p className="text-white/35 text-xs md:text-sm tracking-[0.5em] mb-3 uppercase">
              Built on Heritage · Driven by Innovation
            </p>
            <h2 className="aec text-4xl md:text-6xl text-[#FFC200] drop-shadow-[0_0_60px_rgba(255,194,0,0.3)] leading-none mb-2">
              AEC 2026
            </h2>
            <div className="w-24 h-[1px] bg-gradient-to-r from-transparent via-[#FFC200]/40 to-transparent mx-auto mb-3" />
            <p className="text-white/45 text-sm md:text-base tracking-[0.35em] font-light uppercase mb-6">
              Algerian Engineering Competition
            </p>
            <Link
              href="/register"
              className="inline-flex items-center gap-2 border border-[#FFC200]/40 text-[#FFC200]/80 hover:border-[#FFC200] hover:text-[#FFC200] hover:bg-[#FFC200]/10 py-2 px-6 rounded-lg text-sm tracking-[0.2em] uppercase font-medium transition-all duration-300"
            >
              Join the Competition
            </Link>
          </div>
        </div>

        {/* Top + Bottom vignette gradients */}
        <div
          className="absolute top-0 left-0 right-0 h-40 pointer-events-none"
          style={{
            background: 'linear-gradient(to top, transparent, rgba(13,0,43,0.4))',
            opacity: visible ? 1 : 0,
            transition: 'opacity 1s ease',
          }}
        />
        <div
          className="absolute bottom-0 left-0 right-0 h-44 pointer-events-none"
          style={{
            background: 'linear-gradient(to bottom, transparent, #0D002B)',
            opacity: phase === 5 ? 1 : 0,
            transition: 'opacity 1.5s ease',
          }}
        />
      </div>
    </div>
  );
}
