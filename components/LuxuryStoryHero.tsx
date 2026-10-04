'use client';

import React, { useRef, useState, useEffect, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Float } from '@react-three/drei';
import * as THREE from 'three';

// Graphite Pencil Material Setup
const graphiteTone = '#3A3834';
const paperHighlightTone = '#F4EFE6';
const graphiteHatch = '#5C5850';

// 1. Hand-Sketched King Coconut (Thambili) with husk ribs and calyx stem
function SketchedKingCoconut({ position, scale = 1 }: { position: [number, number, number]; scale?: number }) {
  const groupRef = useRef<THREE.Group>(null);

  useFrame((_, delta) => {
    if (groupRef.current) {
      groupRef.current.rotation.y += delta * 0.35;
      groupRef.current.rotation.x += delta * 0.18;
    }
  });

  return (
    <Float speed={1.9} rotationIntensity={1.2} floatIntensity={1.8}>
      <group ref={groupRef} position={position} scale={scale}>
        {/* Tapered teardrop coconut husk */}
        <mesh position={[0, 0, 0]} scale={[1, 1.4, 0.95]}>
          <sphereGeometry args={[0.9, 24, 24]} />
          <meshStandardMaterial
            color={paperHighlightTone}
            roughness={0.9}
            wireframe={false}
          />
        </mesh>

        {/* Hand-drawn graphite pencil wireframe overlay */}
        <mesh position={[0, 0, 0]} scale={[1.008, 1.408, 0.958]}>
          <sphereGeometry args={[0.9, 18, 14]} />
          <meshBasicMaterial
            color={graphiteTone}
            wireframe
            transparent
            opacity={0.38}
          />
        </mesh>

        {/* Calyx flower petal ring at top */}
        <mesh position={[0, 1.28, 0]}>
          <cylinderGeometry args={[0.3, 0.12, 0.15, 6]} />
          <meshBasicMaterial color={graphiteTone} wireframe />
        </mesh>

        {/* Clipped woody stem */}
        <mesh position={[0.04, 1.48, 0]} rotation={[0.2, 0, 0.15]}>
          <cylinderGeometry args={[0.05, 0.07, 0.32, 8]} />
          <meshStandardMaterial color="#686256" roughness={0.95} />
        </mesh>
      </group>
    </Float>
  );
}

// 2. Hand-Sketched Ziel King Coconut Wine Bottle with label & punt
function SketchedWineBottle({ position, scale = 1 }: { position: [number, number, number]; scale?: number }) {
  const groupRef = useRef<THREE.Group>(null);

  useFrame((_, delta) => {
    if (groupRef.current) {
      groupRef.current.rotation.y += delta * 0.32;
      groupRef.current.rotation.z += delta * 0.12;
    }
  });

  return (
    <Float speed={1.7} rotationIntensity={0.9} floatIntensity={1.4}>
      <group ref={groupRef} position={position} scale={scale}>
        {/* Main Bottle Body Cylinder */}
        <mesh position={[0, 0, 0]}>
          <cylinderGeometry args={[0.55, 0.55, 1.8, 28]} />
          <meshStandardMaterial color={paperHighlightTone} roughness={0.85} />
        </mesh>
        <mesh position={[0, 0, 0]} scale={[1.008, 1.002, 1.008]}>
          <cylinderGeometry args={[0.55, 0.55, 1.8, 16, 6]} />
          <meshBasicMaterial color={graphiteTone} wireframe transparent opacity={0.4} />
        </mesh>

        {/* Curved Wine Label Band */}
        <mesh position={[0, -0.05, 0]}>
          <cylinderGeometry args={[0.56, 0.56, 0.95, 28, 1, true, 0, Math.PI * 1.5]} />
          <meshStandardMaterial color="#EBE5D8" roughness={0.9} />
        </mesh>
        {/* Label Hatch Outline */}
        <mesh position={[0, -0.05, 0]}>
          <cylinderGeometry args={[0.565, 0.565, 0.95, 12, 3, true, 0, Math.PI * 1.5]} />
          <meshBasicMaterial color={graphiteHatch} wireframe transparent opacity={0.5} />
        </mesh>

        {/* Shoulder Taper */}
        <mesh position={[0, 1.15, 0]}>
          <cylinderGeometry args={[0.2, 0.55, 0.5, 28]} />
          <meshStandardMaterial color={paperHighlightTone} roughness={0.85} />
        </mesh>
        <mesh position={[0, 1.15, 0]} scale={[1.008, 1.008, 1.008]}>
          <cylinderGeometry args={[0.2, 0.55, 0.5, 14, 3]} />
          <meshBasicMaterial color={graphiteTone} wireframe transparent opacity={0.4} />
        </mesh>

        {/* Neck */}
        <mesh position={[0, 1.6, 0]}>
          <cylinderGeometry args={[0.18, 0.18, 0.5, 20]} />
          <meshStandardMaterial color={paperHighlightTone} roughness={0.85} />
        </mesh>
        <mesh position={[0, 1.6, 0]} scale={[1.01, 1.01, 1.01]}>
          <cylinderGeometry args={[0.18, 0.18, 0.5, 10, 3]} />
          <meshBasicMaterial color={graphiteTone} wireframe transparent opacity={0.45} />
        </mesh>

        {/* Cork Collar & Foil Lip */}
        <mesh position={[0, 1.88, 0]}>
          <cylinderGeometry args={[0.21, 0.21, 0.15, 18]} />
          <meshStandardMaterial color="#C8BC9F" roughness={0.7} />
        </mesh>
        <mesh position={[0, 1.88, 0]} scale={[1.02, 1.02, 1.02]}>
          <cylinderGeometry args={[0.21, 0.21, 0.15, 10]} />
          <meshBasicMaterial color={graphiteTone} wireframe transparent opacity={0.6} />
        </mesh>
      </group>
    </Float>
  );
}

// 3. Hand-Sketched Crystal Stemmed Wine Glass
function SketchedWineGlass({ position, scale = 1 }: { position: [number, number, number]; scale?: number }) {
  const groupRef = useRef<THREE.Group>(null);

  useFrame((_, delta) => {
    if (groupRef.current) {
      groupRef.current.rotation.y -= delta * 0.28;
      groupRef.current.rotation.x += delta * 0.14;
    }
  });

  return (
    <Float speed={2.1} rotationIntensity={1.3} floatIntensity={1.9}>
      <group ref={groupRef} position={position} scale={scale}>
        {/* Foot Plate */}
        <mesh position={[0, -1.2, 0]}>
          <cylinderGeometry args={[0.55, 0.55, 0.04, 24]} />
          <meshStandardMaterial color={paperHighlightTone} roughness={0.8} />
        </mesh>
        <mesh position={[0, -1.2, 0]} scale={[1.02, 1.02, 1.02]}>
          <cylinderGeometry args={[0.55, 0.55, 0.04, 14]} />
          <meshBasicMaterial color={graphiteTone} wireframe transparent opacity={0.5} />
        </mesh>

        {/* Long Drawn Stem */}
        <mesh position={[0, -0.55, 0]}>
          <cylinderGeometry args={[0.05, 0.05, 1.25, 12]} />
          <meshStandardMaterial color={paperHighlightTone} roughness={0.8} />
        </mesh>
        <mesh position={[0, -0.55, 0]} scale={[1.03, 1.01, 1.03]}>
          <cylinderGeometry args={[0.05, 0.05, 1.25, 8, 4]} />
          <meshBasicMaterial color={graphiteTone} wireframe transparent opacity={0.45} />
        </mesh>

        {/* Tapered Tasting Bowl */}
        <mesh position={[0, 0.45, 0]} scale={[1, 1.25, 1]}>
          <sphereGeometry args={[0.65, 24, 24, 0, Math.PI * 2, 0, Math.PI * 0.65]} />
          <meshStandardMaterial
            color={paperHighlightTone}
            roughness={0.7}
            side={THREE.DoubleSide}
          />
        </mesh>
        {/* Curvature Pencil Hatching Lines */}
        <mesh position={[0, 0.45, 0]} scale={[1.01, 1.26, 1.01]}>
          <sphereGeometry args={[0.65, 16, 12, 0, Math.PI * 2, 0, Math.PI * 0.65]} />
          <meshBasicMaterial color={graphiteTone} wireframe transparent opacity={0.42} side={THREE.DoubleSide} />
        </mesh>
      </group>
    </Float>
  );
}

// 4. Hand-Sketched Ziel Grit Workshop Soap Bar with stamped center deboss
function SketchedSoapBar({ position, scale = 1 }: { position: [number, number, number]; scale?: number }) {
  const groupRef = useRef<THREE.Group>(null);

  useFrame((_, delta) => {
    if (groupRef.current) {
      groupRef.current.rotation.x += delta * 0.22;
      groupRef.current.rotation.y += delta * 0.32;
    }
  });

  return (
    <Float speed={1.5} rotationIntensity={1.2} floatIntensity={1.6}>
      <group ref={groupRef} position={position} scale={scale}>
        {/* Main Beveled Soap Slab */}
        <mesh position={[0, 0, 0]}>
          <boxGeometry args={[1.5, 0.95, 0.6]} />
          <meshStandardMaterial
            color={paperHighlightTone}
            roughness={0.92}
          />
        </mesh>

        {/* Hand-Drawn Edge Cross-Hatching */}
        <mesh position={[0, 0, 0]} scale={[1.01, 1.01, 1.01]}>
          <boxGeometry args={[1.5, 0.95, 0.6, 6, 4, 3]} />
          <meshBasicMaterial
            color={graphiteTone}
            wireframe
            transparent
            opacity={0.35}
          />
        </mesh>

        {/* Debossed Center Stamped Plate */}
        <mesh position={[0, 0, 0.305]}>
          <planeGeometry args={[1.05, 0.52]} />
          <meshStandardMaterial color="#E3DDD0" roughness={0.95} />
        </mesh>
        <mesh position={[0, 0, 0.308]}>
          <planeGeometry args={[1.05, 0.52, 4, 2]} />
          <meshBasicMaterial color={graphiteTone} wireframe transparent opacity={0.48} />
        </mesh>
      </group>
    </Float>
  );
}

// Stage orchestrator connecting to scroll depth
function FloatingProductStage({ scrollProgress }: { scrollProgress: number }) {
  const groupRef = useRef<THREE.Group>(null);

  useFrame((state) => {
    if (!groupRef.current) return;
    groupRef.current.position.z = scrollProgress * 11;
    groupRef.current.rotation.y = state.pointer.x * 0.1;
    groupRef.current.rotation.x = -state.pointer.y * 0.1;
  });

  return (
    <group ref={groupRef}>
      {/* Chapter 1: King Coconut & Handcrafted Soap Bar */}
      <SketchedKingCoconut position={[-2.4, 0.6, -1]} scale={1.2} />
      <SketchedSoapBar position={[2.4, -0.6, -2.5]} scale={1.25} />

      {/* Chapter 2: Ziel Wine Bottle & Stemmed Glass */}
      <SketchedWineBottle position={[-1.9, -1.1, -6]} scale={1.15} />
      <SketchedWineGlass position={[2.2, 1.0, -7.5]} scale={1.3} />

      {/* Chapter 3: Climax Product Collection */}
      <SketchedKingCoconut position={[2.3, -0.9, -10.5]} scale={0.95} />
      <SketchedWineBottle position={[0, 0.15, -11.5]} scale={1.3} />
      <SketchedSoapBar position={[-2.3, 1.3, -12]} scale={1.05} />
    </group>
  );
}

export default function LuxuryStoryHero({ onExplore }: { onExplore: () => void }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [scrollProgress, setScrollProgress] = useState(0);
  const [isAutoScrolling, setIsAutoScrolling] = useState(true);

  // Auto-scroll loop
  useEffect(() => {
    let animationFrameId: number;
    let lastTime = performance.now();
    const scrollSpeed = 0.00035;

    const tick = (currentTime: number) => {
      const delta = currentTime - lastTime;
      lastTime = currentTime;

      if (isAutoScrolling) {
        setScrollProgress((prev) => {
          const next = prev + scrollSpeed * (delta / 16);
          if (next >= 1) {
            setIsAutoScrolling(false);
            return 1;
          }
          return next;
        });
      }

      animationFrameId = requestAnimationFrame(tick);
    };

    animationFrameId = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(animationFrameId);
  }, [isAutoScrolling]);

  const handleWheel = (e: React.WheelEvent) => {
    setIsAutoScrolling(false);
    setScrollProgress((prev) => Math.min(1, Math.max(0, prev + e.deltaY * 0.0008)));
  };

  const activeChapter = scrollProgress < 0.33 ? 1 : scrollProgress < 0.66 ? 2 : 3;

  return (
    <div
      ref={containerRef}
      onWheel={handleWheel}
      className="relative w-full h-screen overflow-hidden bg-[#FAF9F5] select-none text-[#1C1B1A]"
    >
      {/* 3D WebGL Canvas Layer */}
      <div className="absolute inset-0 z-0">
        <Canvas camera={{ position: [0, 0, 5], fov: 45 }}>
          {/* Subtle directional daylight for pencil shading depth */}
          <ambientLight intensity={1.9} color="#FFFDF7" />
          <directionalLight position={[10, 15, 10]} intensity={1.8} color="#FFFFFF" />
          <directionalLight position={[-10, 10, -5]} intensity={0.9} color="#F2EDE2" />
          <FloatingProductStage scrollProgress={scrollProgress} />
        </Canvas>
      </div>

      {/* Paper Grain / Warm Parchment Vignette */}
      <div className="absolute inset-0 pointer-events-none bg-gradient-to-b from-[#FAF9F5]/40 via-transparent to-[#FAF9F5] z-10" />

      {/* Main Luxury Typography */}
      <div className="absolute inset-0 z-20 flex flex-col items-center justify-center pointer-events-none px-6 text-center">
        {activeChapter === 1 && (
          <div className="max-w-3xl transition-all duration-700 ease-out transform translate-y-0 opacity-100">
            <h1 className="text-4xl sm:text-7xl font-light tracking-tight text-[#1C1B1A] leading-[1.08]">
              Born from the earth, <br />
              <span className="italic font-serif text-[#C4883A]">sculpted by hand.</span>
            </h1>
            <p className="mt-5 text-xs sm:text-sm font-sans text-[#78716A] max-w-lg mx-auto leading-relaxed">
              Every creation begins with pure King Coconut nectar and volcanic stone extracts sourced exclusively from Sri Lanka.
            </p>
          </div>
        )}

        {activeChapter === 2 && (
          <div className="max-w-3xl transition-all duration-700 ease-out transform translate-y-0 opacity-100">
            <h1 className="text-4xl sm:text-7xl font-light tracking-tight text-[#1C1B1A] leading-[1.08]">
              Where organic chemistry <br />
              <span className="italic font-serif text-[#C4883A]">meets quiet patience.</span>
            </h1>
            <p className="mt-5 text-xs sm:text-sm font-sans text-[#78716A] max-w-lg mx-auto leading-relaxed">
              Zero synthetic speed-ups. Cold-process cures and oak-cask maturation running at their own unhurried pace.
            </p>
          </div>
        )}

        {activeChapter === 3 && (
          <div className="max-w-3xl transition-all duration-700 ease-out transform translate-y-0 opacity-100">
            <h1 className="text-4xl sm:text-7xl font-light tracking-tight text-[#1C1B1A] leading-[1.08]">
              Distinctive works, <br />
              <span className="italic font-serif text-[#C4883A]">ready for your hands.</span>
            </h1>
            <div className="mt-8 pointer-events-auto">
              <button
                onClick={onExplore}
                className="px-8 py-4 rounded-full bg-[#1C1B1A] text-[#FAF9F5] text-xs uppercase tracking-widest font-bold hover:bg-[#C4883A] transition-all duration-300 shadow-xl"
              >
                Enter Official Store →
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Floating Bottom Controller Pill */}
      <div className="absolute bottom-8 inset-x-0 z-30 flex justify-center pointer-events-auto px-4">
        <div className="bg-[#FFFFFF]/95 backdrop-blur-md border border-[#E7E2D8] px-5 py-2.5 rounded-full shadow-lg flex items-center space-x-5 font-mono text-[10px] tracking-wider text-[#524B45]">
          <button
            onClick={() => setIsAutoScrolling(!isAutoScrolling)}
            className="flex items-center space-x-1.5 font-bold uppercase hover:text-[#C4883A] transition-colors"
          >
            <span>{isAutoScrolling ? '❚❚' : '▶'}</span>
            <span>{isAutoScrolling ? 'Pause' : 'Auto Play'}</span>
          </button>

          <div className="w-28 sm:w-44 h-1.5 bg-[#EAE5DB] rounded-full overflow-hidden">
            <div
              className="h-full bg-[#C4883A] transition-all duration-150 rounded-full"
              style={{ width: `${Math.round(scrollProgress * 100)}%` }}
            />
          </div>

          <span className="text-[#8C827A] w-8 text-right font-medium">
            {Math.round(scrollProgress * 100)}%
          </span>

          <button
            onClick={onExplore}
            className="font-bold text-[#1C1B1A] uppercase hover:underline ml-2 hidden sm:inline"
          >
            Skip to Works ↓
          </button>
        </div>
      </div>
    </div>
  );
}