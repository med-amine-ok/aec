'use client';
import { useState, useCallback, useRef, useEffect } from 'react';

/* ─── Gallery images ─── */
const images = Array.from({ length: 8 }, (_, i) => `/image${i + 1}.jpg`);
const TOTAL = images.length;

/* ─── Accent ─── */
const AC = '#e6f7ff';
const AG = 'rgba(180,230,255,'; // for building rgba strings

/* ═══════════════════════════════════════════════════════
   3-D CINEMATIC ARC CAROUSEL — SMOOTH SLIDE ANIMATION
   ═══════════════════════════════════════════════════════ */

/* Style for a given signed offset from center */
function styleForOffset(offset: number): React.CSSProperties {
  const abs = Math.abs(offset);
  const dir = offset > 0 ? 1 : -1;

  // Off-screen (but still in DOM for transition-in/out)
  if (abs > 2) {
    return {
      opacity: 0,
      transform: `translateX(${dir * 140}%) translateZ(-500px) rotateY(${dir * -48}deg) scale(0.3)`,
      zIndex: 0,
      pointerEvents: 'none',
      filter: 'brightness(0.2) saturate(0.3)',
    };
  }

  // Center (active)
  if (offset === 0) {
    return {
      opacity: 1,
      transform: 'translateX(0%) translateZ(0px) rotateY(0deg) scale(1)',
      zIndex: 10,
      pointerEvents: 'auto',
      filter: 'brightness(1.05) saturate(1.1)',
    };
  }

  // ±1 neighbours
  if (abs === 1) {
    return {
      opacity: 0.7,
      transform: `translateX(${dir * 58}%) translateZ(-130px) rotateY(${dir * -20}deg) scale(0.82)`,
      zIndex: 7,
      pointerEvents: 'auto',
      filter: 'brightness(0.5) saturate(0.65)',
    };
  }

  // ±2 far
  return {
    opacity: 0.3,
    transform: `translateX(${dir * 96}%) translateZ(-260px) rotateY(${dir * -35}deg) scale(0.64)`,
    zIndex: 4,
    pointerEvents: 'none',
    filter: 'brightness(0.3) saturate(0.45)',
  };
}

/* Compute shortest circular offset from `active` to `idx` */
function circularOffset(idx: number, active: number): number {
  let diff = idx - active;
  // wrap around for circular distance
  if (diff > TOTAL / 2) diff -= TOTAL;
  if (diff < -TOTAL / 2) diff += TOTAL;
  return diff;
}

export default function Slider() {
  const [active, setActive] = useState(0);
  const [isMoving, setIsMoving] = useState(false);
  const autoRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const dragStartX = useRef(0);
  const isDragging = useRef(false);
  const wheelLock = useRef(false);

  /* ── Navigate ── */
  const navigate = useCallback(
    (dir: number) => {
      if (isMoving) return;
      setIsMoving(true);
      setActive((p) => (p + dir + TOTAL) % TOTAL);
      setTimeout(() => setIsMoving(false), 720);
    },
    [isMoving],
  );

  const goTo = useCallback(
    (idx: number) => {
      if (isMoving || idx === active) return;
      setIsMoving(true);
      setActive(idx);
      setTimeout(() => setIsMoving(false), 720);
    },
    [isMoving, active],
  );

  /* ── Autoplay ── */
  const startAuto = useCallback(() => {
    if (autoRef.current) clearInterval(autoRef.current);
    autoRef.current = setInterval(() => navigate(1), 4200);
  }, [navigate]);
  const stopAuto = useCallback(() => {
    if (autoRef.current) { clearInterval(autoRef.current); autoRef.current = null; }
  }, []);
  useEffect(() => { startAuto(); return stopAuto; }, [startAuto, stopAuto]);

  /* ── Keyboard ── */
  useEffect(() => {
    const h = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight') { navigate(1); startAuto(); }
      if (e.key === 'ArrowLeft') { navigate(-1); startAuto(); }
    };
    window.addEventListener('keydown', h);
    return () => window.removeEventListener('keydown', h);
  }, [navigate, startAuto]);

  /* ── Wheel ── */
  const onWheel = useCallback(
    (e: React.WheelEvent) => {
      if (wheelLock.current) return;
      const d = Math.abs(e.deltaX) > Math.abs(e.deltaY) ? e.deltaX : e.deltaY;
      if (Math.abs(d) < 20) return;
      wheelLock.current = true;
      navigate(d > 0 ? 1 : -1);
      startAuto();
      setTimeout(() => { wheelLock.current = false; }, 800);
    },
    [navigate, startAuto],
  );

  /* ── Pointer drag ── */
  const onPointerDown = useCallback((e: React.PointerEvent) => {
    isDragging.current = true;
    dragStartX.current = e.clientX;
    (e.target as HTMLElement).setPointerCapture?.(e.pointerId);
  }, []);
  const onPointerUp = useCallback(
    (e: React.PointerEvent) => {
      if (!isDragging.current) return;
      isDragging.current = false;
      const dx = e.clientX - dragStartX.current;
      if (Math.abs(dx) > 45) { navigate(dx < 0 ? 1 : -1); startAuto(); }
    },
    [navigate, startAuto],
  );

  /* ─────────────────────────────────────────────
     Render a window of 7 cards around active,
     keyed by IMAGE INDEX so React keeps the same
     DOM node and CSS transitions animate smoothly
     ───────────────────────────────────────────── */
  const windowSize = 7; // -3 to +3
  const visibleIndices: number[] = [];
  for (let off = -3; off <= 3; off++) {
    visibleIndices.push((active + off + TOTAL) % TOTAL);
  }

  return (
    <div
      onWheel={onWheel}
      onPointerDown={onPointerDown}
      onPointerUp={onPointerUp}
      onPointerCancel={onPointerUp}
      onMouseEnter={stopAuto}
      onMouseLeave={startAuto}
      style={{
        position: 'relative',
        width: '100%',
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        userSelect: 'none',
        touchAction: 'pan-y',
        overflow: 'visible',
      }}
    >
      {/* ── 3D Stage ── */}
      <div
        style={{
          position: 'relative',
          width: '62%',
          minWidth: '280px',
          maxWidth: '580px',
          aspectRatio: '16 / 10',
          perspective: '1100px',
          perspectiveOrigin: '50% 48%',
          transformStyle: 'preserve-3d',
        }}
      >
        {visibleIndices.map((imgIdx) => {
          const offset = circularOffset(imgIdx, active);
          const s = styleForOffset(offset);

          return (
            <div
              /* ⬇ KEY BY IMAGE INDEX — this is what makes it smooth! ⬇ */
              key={imgIdx}
              onClick={() => {
                if (offset === -1) { navigate(-1); startAuto(); }
                if (offset === 1) { navigate(1); startAuto(); }
              }}
              style={{
                position: 'absolute',
                inset: 0,
                borderRadius: '14px',
                overflow: 'hidden',
                cursor: Math.abs(offset) === 1 ? 'pointer' : 'default',
                transformStyle: 'preserve-3d',
                willChange: 'transform, opacity, filter',
                /* ── Smooth 0.7s transition on EVERY property ── */
                transition: [
                  'transform 0.7s cubic-bezier(.25,.1,.25,1)',
                  'opacity 0.7s cubic-bezier(.25,.1,.25,1)',
                  'filter 0.7s cubic-bezier(.25,.1,.25,1)',
                  'box-shadow 0.7s ease',
                ].join(', '),
                ...s,
                boxShadow:
                  offset === 0
                    ? `0 22px 65px rgba(0,0,0,0.55), 0 0 50px ${AG}0.09), inset 0 0 0 1px ${AG}0.1)`
                    : `0 10px 30px rgba(0,0,0,${0.3 + Math.abs(offset) * 0.1})`,
              }}
            >
              <img
                src={images[imgIdx]}
                alt={`AEC Moment ${imgIdx + 1}`}
                draggable={false}
                style={{
                  width: '100%',
                  height: '100%',
                  objectFit: 'cover',
                  display: 'block',
                }}
              />
              {/* Dark vignette on non-active */}
              {offset !== 0 && (
                <div
                  style={{
                    position: 'absolute',
                    inset: 0,
                    background: `linear-gradient(135deg, rgba(13,0,43,${0.12 + Math.abs(offset) * 0.1}), rgba(0,0,0,${0.2 + Math.abs(offset) * 0.1}))`,
                    pointerEvents: 'none',
                    transition: 'opacity 0.7s ease',
                  }}
                />
              )}
              {/* Shine on active */}
              {offset === 0 && (
                <div
                  style={{
                    position: 'absolute',
                    inset: 0,
                    background: `linear-gradient(160deg, rgba(255,255,255,0.06) 0%, transparent 35%, transparent 65%, ${AG}0.03) 100%)`,
                    pointerEvents: 'none',
                  }}
                />
              )}
            </div>
          );
        })}

        {/* ── Reflection ── */}
        <div
          style={{
            position: 'absolute',
            left: '10%',
            right: '10%',
            bottom: '-45%',
            height: '40%',
            borderRadius: '14px',
            overflow: 'hidden',
            transform: 'scaleY(-1)',
            opacity: 0.08,
            maskImage: 'linear-gradient(to bottom, rgba(0,0,0,0.4) 0%, transparent 50%)',
            WebkitMaskImage: 'linear-gradient(to bottom, rgba(0,0,0,0.4) 0%, transparent 50%)',
            pointerEvents: 'none',
            filter: 'blur(4px) brightness(0.5)',
          }}
        >
          <img src={images[active]} alt="" aria-hidden style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
        </div>

        {/* ── Arrow Left ── */}
        <button
          aria-label="Previous"
          onClick={() => { navigate(-1); startAuto(); }}
          style={{
            position: 'absolute', left: '-16%', top: '50%', transform: 'translateY(-50%)',
            width: '42px', height: '42px', borderRadius: '50%',
            border: `1px solid ${AG}0.2)`, background: 'rgba(13,0,43,0.5)',
            backdropFilter: 'blur(14px)', WebkitBackdropFilter: 'blur(14px)',
            color: AC, display: 'flex', alignItems: 'center', justifyContent: 'center',
            cursor: 'pointer', zIndex: 30, transition: 'all 0.3s ease',
          }}
          onMouseEnter={(e) => {
            const el = e.currentTarget;
            el.style.background = `${AG}0.1)`; el.style.borderColor = `${AG}0.5)`;
            el.style.boxShadow = `0 0 20px ${AG}0.15)`; el.style.transform = 'translateY(-50%) scale(1.1)';
          }}
          onMouseLeave={(e) => {
            const el = e.currentTarget;
            el.style.background = 'rgba(13,0,43,0.5)'; el.style.borderColor = `${AG}0.2)`;
            el.style.boxShadow = 'none'; el.style.transform = 'translateY(-50%)';
          }}
        >
          <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 18 9 12 15 6" /></svg>
        </button>

        {/* ── Arrow Right ── */}
        <button
          aria-label="Next"
          onClick={() => { navigate(1); startAuto(); }}
          style={{
            position: 'absolute', right: '-16%', top: '50%', transform: 'translateY(-50%)',
            width: '42px', height: '42px', borderRadius: '50%',
            border: `1px solid ${AG}0.2)`, background: 'rgba(13,0,43,0.5)',
            backdropFilter: 'blur(14px)', WebkitBackdropFilter: 'blur(14px)',
            color: AC, display: 'flex', alignItems: 'center', justifyContent: 'center',
            cursor: 'pointer', zIndex: 30, transition: 'all 0.3s ease',
          }}
          onMouseEnter={(e) => {
            const el = e.currentTarget;
            el.style.background = `${AG}0.1)`; el.style.borderColor = `${AG}0.5)`;
            el.style.boxShadow = `0 0 20px ${AG}0.15)`; el.style.transform = 'translateY(-50%) scale(1.1)';
          }}
          onMouseLeave={(e) => {
            const el = e.currentTarget;
            el.style.background = 'rgba(13,0,43,0.5)'; el.style.borderColor = `${AG}0.2)`;
            el.style.boxShadow = 'none'; el.style.transform = 'translateY(-50%)';
          }}
        >
          <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 6 15 12 9 18" /></svg>
        </button>
      </div>

      {/* ── Counter + Dots ── */}
      <div style={{ marginTop: '28px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px', zIndex: 20 }}>
        <div style={{ fontSize: '12px', letterSpacing: '0.22em', color: `${AG}0.5)`, fontWeight: 500 }}>
          {String(active + 1).padStart(2, '0')}
          <span style={{ color: 'rgba(255,255,255,0.15)', margin: '0 5px' }}>/</span>
          {String(TOTAL).padStart(2, '0')}
        </div>
        <div style={{ display: 'flex', gap: '5px', alignItems: 'center' }}>
          {images.map((_, i) => (
            <button
              key={i}
              aria-label={`Go to slide ${i + 1}`}
              onClick={() => { goTo(i); startAuto(); }}
              style={{
                width: i === active ? '24px' : '6px',
                height: '6px',
                borderRadius: '999px',
                border: 'none',
                padding: 0,
                cursor: 'pointer',
                background: i === active ? AC : `${AG}0.18)`,
                boxShadow: i === active ? `0 0 12px ${AG}0.4)` : 'none',
                transition: 'all 0.4s cubic-bezier(.4,0,.2,1)',
              }}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
