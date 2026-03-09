'use client';

import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { useTexture } from '@react-three/drei';
import * as THREE from 'three';

const PARTNER_LOGOS = [
  '/seg.png',
  '/pathos.png',
  '/petro.png',
  '/dev.png',
  '/tta.png',
  '/tala.png',
  '/cmc.png',
  '/caat.png',
];

export default function PartnersRing({
  scrollProgress,
}: {
  scrollProgress: React.MutableRefObject<number>;
}) {
  const ringRef = useRef<THREE.Group>(null);
  const textures = useTexture(PARTNER_LOGOS);
  const count = PARTNER_LOGOS.length;
  const radius = 8;

  useFrame((state, delta) => {
    if (!ringRef.current) return;
    const p = scrollProgress.current;
    const t = state.clock.getElapsedTime();

    // Fade in/out around phase 4 (0.55–0.75)
    let ringOpacity = 0;
    if (p >= 0.50 && p < 0.58) {
      ringOpacity = (p - 0.50) / 0.08;
    } else if (p >= 0.58 && p < 0.73) {
      ringOpacity = 1;
    } else if (p >= 0.73 && p < 0.80) {
      ringOpacity = 1 - (p - 0.73) / 0.07;
    }

    // Slow orbit
    ringRef.current.rotation.y += delta * 0.1;

    // Animate each logo: billboard, float, scale, glow
    ringRef.current.children.forEach((group, i) => {
      group.lookAt(state.camera.position);

      // Individual vertical float
      const floatOffset = Math.sin(t * 0.4 + i * 0.9) * 0.1;
      group.position.y = floatOffset;

      // Gentle breathing scale
      const s = 1 + Math.sin(t * 0.7 + i * 1.3) * 0.04;
      group.scale.setScalar(s);

      const target = Math.max(0, Math.min(1, ringOpacity));

      group.traverse((c) => {
        if ((c as THREE.Mesh).isMesh) {
          const mat = (c as THREE.Mesh).material as THREE.MeshBasicMaterial;
          mat.transparent = true;
          if (mat.blending === THREE.AdditiveBlending) {
            // Glow: pulsing additive
            const glowPulse = 0.15 + Math.sin(t * 1.0 + i * 0.7) * 0.08;
            mat.opacity = THREE.MathUtils.damp(mat.opacity, target * glowPulse, 5, delta);
          } else {
            // Logo: standard fade
            mat.opacity = THREE.MathUtils.damp(mat.opacity, target, 5, delta);
          }
        }
      });
    });
  });

  return (
    <group ref={ringRef} position={[0, 2, 0]}>
      {textures.map((tex, i) => {
        const angle = (i / count) * Math.PI * 2;
        const x = Math.cos(angle) * radius;
        const z = Math.sin(angle) * radius;
        return (
          <group key={i} position={[x, 0, z]}>
            {/* Golden glow halo */}
            <mesh position={[0, 0, -600]}>
              <planeGeometry args={[5, 5]} />
              <meshBasicMaterial
                color="#ffc400e3"
                transparent
                opacity={0}
                
                blending={THREE.AdditiveBlending}
                depthWrite={false}
              />
            </mesh>
            {/* Logo */}
            <mesh>
              <planeGeometry args={[1.5, 1.5]} />
              <meshBasicMaterial
                map={tex}
                transparent
                side={THREE.DoubleSide}
                opacity={0}
              />
            </mesh>
          </group>
        );
      })}
    </group>
  );
}
