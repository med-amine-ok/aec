'use client';

import { useRef, useMemo } from 'react';
import { useGLTF } from '@react-three/drei';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

interface MaqamModelProps {
  scale?: number;
  position?: [number, number, number];
  rotation?: [number, number, number];
  rotationSpeed?: number;
  entryProgress?: { current: number };
  exitMode?: { current: 'none' | 'sink' | 'fogonly' };
  exitProgress?: { current: number };
}

export default function MaqamModel({ scale = 1, position = [0, 0, 0], rotation = [0, 0, 0], rotationSpeed = 0.3, entryProgress, exitMode, exitProgress }: MaqamModelProps) {
  const groupRef = useRef<THREE.Group>(null);
  const { nodes, materials } = useGLTF('/maqam/scene.gltf');

  // Center the geometry so rotation is around the true center
  const centeredGeometry = useMemo(() => {
    const geo = (nodes.Object_4 as THREE.Mesh).geometry.clone();
    geo.computeBoundingBox();
    const center = new THREE.Vector3();
    geo.boundingBox!.getCenter(center);
    geo.translate(-center.x, -center.y, -center.z);
    return geo;
  }, [nodes]);

  // Continuous rotation + entry rise + exit sink animations
  useFrame((_, delta) => {
    if (groupRef.current) {
      groupRef.current.rotation.y += delta * rotationSpeed;
      if (exitMode && exitMode.current === 'sink' && exitProgress) {
        // easeInCubic — starts slow, accelerates as it sinks
        const ep = Math.min(1, exitProgress.current);
        const eased = ep * ep * ep;
        groupRef.current.position.y = THREE.MathUtils.lerp(0, -8, eased);
      } else if (entryProgress) {
        // easeOutCubic — fast rise, gentle settle
        const ep = Math.min(1, entryProgress.current);
        const eased = 1 - Math.pow(1 - ep, 3);
        groupRef.current.position.y = THREE.MathUtils.lerp(-8, 0, eased);
      }
    }
  });

  return (
    <group ref={groupRef} position={position} rotation={rotation} scale={scale} dispose={null}>
      <mesh
        castShadow
        receiveShadow
        geometry={centeredGeometry}
        material={materials['Material.001']}
      />
    </group>
  );
}

useGLTF.preload('/maqam/scene.gltf');
