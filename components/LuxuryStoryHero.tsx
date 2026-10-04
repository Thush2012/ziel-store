'use client';

import React, { useRef, useState, useEffect, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Float } from '@react-three/drei';
import * as THREE from 'three';

// 1. Procedural Artisanal King Coconut (Thambili teardrop shape + stem cap)
function KingCoconut({ position, scale = 1 }: { position: [number, number, number]; scale?: number }) {
  const meshRef = useRef<THREE.Group>(null);

  useFrame((_, delta) => {
    if (meshRef.current) {
      meshRef.current.rotation.y += delta * 0.4;
      meshRef.current.rotation.x += delta * 0.2;
    }
  });

  return (
    <Float speed={2} rotationIntensity={1.2} floatIntensity={1.8}>
      <group ref={meshRef} position={position} scale={scale}>
        {/* Main Tapered Fruit Body */}
        <mesh position={[0, 0, 0]} scale={[1, 1.35, 1]}>
          <sphereGeometry args={[0.9, 32, 32]} />
          <meshStandardMaterial
            color="#E88C28" // Vibrant Ceylon King Coconut Golden Orange
            roughness={0.45}
            metalness={0.05}
          />
        </mesh>
        {/* Calyx & Stem at Top */}
        <mesh position={[0, 1.25, 0]}>
          <coneGeometry args={[0.28, 0.35, 12]} />
          <meshStandardMaterial color="#8B6932" roughness={0.7} />
        </mesh>
        <mesh position={[0, 1.45, 0]} rotation={[0.2, 0, 0.1]}>
          <cylinderGeometry args={[0.06, 0.08, 0.35, 8]} />
          <meshStandardMaterial color="#6B5024" roughness={0.9} />
        </mesh>
      </group>
    </Float>
  );
}

// 2. Procedural Luxury Wine Bottle (750ml profile: punt base, body, shoulder, neck, foil cap)
function WineBottle({ position, scale = 1 }: { position: [number, number, number]; scale?: number }) {
  const meshRef = useRef<THREE.Group>(null);

  useFrame((_, delta) => {
    if (meshRef.current) {
      meshRef.current.rotation.y += delta * 0.35;
      meshRef.current.rotation.z += delta * 0.15;
    }
  });

  return (
    <Float speed={1.8} rotationIntensity={1} floatIntensity={1.5}>
      <group ref={meshRef} position={position} scale={scale}>
        {/* Cylindrical Main Bottle Body */}
        <mesh position={[0, 0, 0]}>
          <cylinderGeometry args={[0.55, 0.55, 1.8, 32]} />
          <meshPhysicalMaterial
            color="#EAC06C" // Warm golden fermented king coconut nectar glow
            transmission={0.88}
            opacity={1}
            transparent
            roughness={0.12}
            ior={1.48}
            reflectivity={0.6}
            clearcoat={1}
            clearcoatRoughness={0.1}
          />
        </mesh>
        {/* Shoulder Taper */}
        <mesh position={[0, 1.15, 0]}>
          <cylinderGeometry args={[0.2, 0.55, 0.5, 32]} />
          <meshPhysicalMaterial
            color="#EAC06C"
            transmission={0.88}
            opacity={1}
            transparent
            roughness={0.12}
            ior={1.48}
            reflectivity={0.6}
            clearcoat={1}
          />
        </mesh>
        {/* Neck */}
        <mesh position={[0, 1.6, 0]}>
          <cylinderGeometry args={[0.18, 0.18, 0.5, 32]} />
          <meshPhysicalMaterial
            color="#EAC06C"
            transmission={0.88}
            transparent
            roughness={0.12}
            ior={1.48}
          />
        </mesh>
        {/* Foil Seal / Cork Cap */}
        <mesh position={[0, 1.85, 0]}>
          <cylinderGeometry args={[0.2, 0.2, 0.18, 32]} />
          <meshStandardMaterial color="#C4883A" metalness={0.7} roughness={0.3} />
        </mesh>
      </group>
    </Float>
  );
}

// 3. Procedural Stemmed Crystal Wine Glass
function WineGlass({ position, scale = 1 }: { position: [number, number, number]; scale?: number }) {
  const meshRef = useRef<THREE.Group>(null);

  useFrame((_, delta) => {
    if (meshRef.current) {
      meshRef.current.rotation.y -= delta * 0.3;
      meshRef.current.rotation.x += delta * 0.15;
    }
  });

  return (
    <Float speed={2.2} rotationIntensity={1.4} floatIntensity={2}>
      <group ref={meshRef} position={position} scale={scale}>
        {/* Base Foot */}
        <mesh position={[0, -1.2, 0]}>
          <cylinderGeometry args={[0.55, 0.55, 0.05, 32]} />
          <meshPhysicalMaterial
            color="#FFFFFF"
            transmission={0.92}
            transparent
            roughness={0.08}
            ior={1.5}
            clearcoat={1}
          />
        </mesh>
        {/* Thin Stem */}
        <mesh position={[0, -0.55, 0]}>
          <cylinderGeometry args={[0.05, 0.05, 1.25, 16]} />
          <meshPhysicalMaterial
            color="#FFFFFF"
            transmission={0.92}
            transparent
            roughness={0.08}
            ior={1.5}
          />
        </mesh>
        {/* Bowl */}
        <mesh position={[0, 0.45, 0]} scale={[1, 1.3, 1]}>
          <sphereGeometry args={[0.65, 32, 32, 0, Math.PI * 2, 0, Math.PI * 0.65]} />
          <meshPhysicalMaterial
            color="#FFF4DE"
            transmission={0.94}
            transparent
            roughness={0.05}
            ior={1.52}
            reflectivity={0.8}
            clearcoat={1}
            side={THREE.DoubleSide}
          />
        </mesh>
      </group>
    </Float>
  );
}

// 4. Procedural Cold-Process Handcrafted Soap Bar (Ziel Grit & Botanical Bars)
function SoapBar({ position, scale = 1 }: { position: [number, number, number]; scale?: number }) {
  const meshRef = useRef<THREE.Group>(null);

  useFrame((_, delta) => {
    if (meshRef.current) {
      meshRef.current.rotation.x += delta * 0.25;
      meshRef.current.rotation.y += delta * 0.35;
    }
  });

  return (
    <Float speed={1.6} rotationIntensity={1.3} floatIntensity={1.7}>
      <group ref={meshRef} position={position} scale={scale}>
        {/* Main Soap Block */}
        <mesh>
          <boxGeometry args={[1.5, 0.95, 0.6]} />
          <meshStandardMaterial
            color="#E5DCB8" // Raw cold-process coconut oil & oat ivory tone
            roughness={0.65}
            metalness={0.02}
          />
        </mesh>
        {/* Embossed Brand Texture Plate */}
        <mesh position={[0, 0, 0.31]}>
          <planeGeometry args={[1.1, 0.55]} />
          <meshStandardMaterial
            color="#D8CEAA"
            roughness={0.8}
          />
        </mesh>
      </group>
    </Float>
  );
}

// Main 3D Floating Showcase
function FloatingProductStage({ scrollProgress }: { scrollProgress: number }) {
  const groupRef = useRef<THREE.Group>(null);

  useFrame((state) => {
    if (!groupRef.current) return;
    // Moves forward through the camera path as the user scrolls
    groupRef.current.position.z = scrollProgress * 11;
    groupRef.current.rotation.y = state.pointer.x * 0.12;
    groupRef.current.rotation.x = -state.pointer.y * 0.12;
  });

  return (
    <group ref={groupRef}>
      {/* Chapter 1: The Raw Coconut & Soap Foundation */}
      <KingCoconut position={[-2.4, 0.7, -1]} scale={1.15} />
      <SoapBar position={[2.4, -0.6, -2.5]} scale={1.2} />

      {/* Chapter 2: The Artisanal Cellar Glass & Reserve Bottle */}
      <WineBottle position={[-1.9, -1.2, -6]} scale={1.1} />
      <WineGlass position={[2.1, 1.1, -7.5]} scale={1.25} />

      {/* Chapter 3: Climax Product Symphony */}
      <KingCoconut position={[2.3, -1.0, -10.5]} scale={0.9} />
      <WineBottle position={[0, 0.2, -11.5]} scale={1.25} />
      <SoapBar position={[-2.2, 1.4, -12]} scale={1.0} />
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
      {/* 3D WebGL Canvas with High Ambient Brightness */}
      <div className="absolute inset-0 z-0">
        <Canvas camera={{ position: [0, 0, 5], fov: 45 }}>
          <ambientLight intensity={2.4} />
          <directionalLight position={[10, 15, 10]} intensity={2.8} color="#FFFBF0" />
          <directionalLight position={[-10, 10, -5]} intensity={1.5} color="#FFE6B0" />
          <pointLight position={[0, -2, 2]} intensity={1.2} color="#FFF8E7" />
          <FloatingProductStage scrollProgress={scrollProgress} />
        </Canvas>
      </div>

      {/* Soft Ambient Vignette */}
      <div className="absolute inset-0 pointer-events-none bg-gradient-to-b from-[#FAF9F5]/30 via-transparent to-[#FAF9F5] z-10" />

      {/* Main Luxury Typography (Phase subtitles removed) */}
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