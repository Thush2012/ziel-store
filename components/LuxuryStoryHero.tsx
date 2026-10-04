'use client';

import React, { useRef, useState, useEffect } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Float, MeshTransmissionMaterial, Text } from '@react-three/drei';
import * as THREE from 'three';

// 3D Floating Elements
function FloatingArtifacts({ scrollProgress }: { scrollProgress: number }) {
  const groupRef = useRef<THREE.Group>(null);
  const dropletRef = useRef<THREE.Mesh>(null);
  const pumiceRef = useRef<THREE.Mesh>(null);
  const cylinderRef = useRef<THREE.Mesh>(null);

  useFrame((state, delta) => {
    if (!groupRef.current) return;

    // Camera move through Z-space based on scroll progress
    groupRef.current.position.z = scrollProgress * 12;
    groupRef.current.rotation.y = state.pointer.x * 0.15;
    groupRef.current.rotation.x = -state.pointer.y * 0.15;

    // Subtle individual tumble
    if (dropletRef.current) {
      dropletRef.current.rotation.x += delta * 0.4;
      dropletRef.current.rotation.y += delta * 0.6;
    }
    if (pumiceRef.current) {
      pumiceRef.current.rotation.y += delta * 0.3;
      pumiceRef.current.rotation.z += delta * 0.2;
    }
    if (cylinderRef.current) {
      cylinderRef.current.rotation.x += delta * 0.2;
    }
  });

  return (
    <group ref={groupRef}>
      {/* 1. Golden King Coconut Nectar Sphere */}
      <Float speed={2} rotationIntensity={1.5} floatIntensity={2}>
        <mesh ref={dropletRef} position={[-2.2, 0.8, -2]}>
          <sphereGeometry args={[0.9, 64, 64]} />
          <MeshTransmissionMaterial
            backside
            samples={8}
            thickness={1.2}
            roughness={0.05}
            chromaticAberration={0.08}
            anisotropy={0.2}
            distortion={0.3}
            distortionScale={0.4}
            temporalDistortion={0.2}
            color="#F7C873" // Pure warm king coconut nectar
          />
        </mesh>
      </Float>

      {/* 2. Artisanal Mineral & Pumice Geometry (Cold-process soap foundation) */}
      <Float speed={1.5} rotationIntensity={1.2} floatIntensity={1.8}>
        <mesh ref={pumiceRef} position={[2.4, -0.6, -4]}>
          <dodecahedronGeometry args={[1.1, 0]} />
          <meshStandardMaterial
            color="#D9D4C7"
            roughness={0.9}
            metalness={0.05}
            flatShading
          />
        </mesh>
      </Float>

      {/* 3. Cellar Glass Cylinder / Bottle Silhouette */}
      <Float speed={1.8} rotationIntensity={0.8} floatIntensity={1.5}>
        <mesh ref={cylinderRef} position={[-1.6, -1.8, -7]}>
          <cylinderGeometry args={[0.6, 0.6, 2.2, 32]} />
          <MeshTransmissionMaterial
            backside
            samples={6}
            thickness={1.5}
            roughness={0.1}
            chromaticAberration={0.04}
            color="#E8E2D5"
          />
        </mesh>
      </Float>

      {/* 4. Sculpted Botanical Lipid Tablet */}
      <Float speed={2.2} rotationIntensity={1.4} floatIntensity={2}>
        <mesh position={[2.0, 1.6, -9]}>
          <boxGeometry args={[1.4, 1.4, 0.5]} />
          <meshStandardMaterial
            color="#EAE3D2"
            roughness={0.4}
            metalness={0.1}
          />
        </mesh>
      </Float>
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

    const scrollSpeed = 0.00035; // Gentle pace

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

  // Handle user manual scroll interaction
  const handleWheel = (e: React.WheelEvent) => {
    setIsAutoScrolling(false);
    setScrollProgress((prev) => Math.min(1, Math.max(0, prev + e.deltaY * 0.0008)));
  };

  // Determine which phase headline to reveal based on scroll depth
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
          <ambientLight intensity={1.8} />
          <directionalLight position={[10, 15, 10]} intensity={2.2} color="#FFFBF0" />
          <directionalLight position={[-10, -5, -5]} intensity={0.8} color="#FFE8B8" />
          <pointLight position={[0, 0, 0]} intensity={1.5} color="#FAF5E8" />
          <FloatingArtifacts scrollProgress={scrollProgress} />
        </Canvas>
      </div>

      {/* Floating Ambient Atmosphere Shimmer */}
      <div className="absolute inset-0 pointer-events-none bg-gradient-to-b from-[#FAF9F5]/40 via-transparent to-[#FAF9F5] z-10" />

      {/* Narrative Story Typography Stages */}
      <div className="absolute inset-0 z-20 flex flex-col items-center justify-center pointer-events-none px-6 text-center">
        {activeChapter === 1 && (
          <div className="max-w-3xl transition-all duration-700 ease-out transform translate-y-0 opacity-100">
            <span className="text-[11px] font-mono uppercase tracking-[0.35em] text-[#8C827A] block mb-3 font-semibold">
              Phase 01 • Native Botanicals & Raw Minerals
            </span>
            <h1 className="text-4xl sm:text-7xl font-light tracking-tight text-[#1C1B1A] leading-[1.08]">
              Born from the earth, <br />
              <span className="italic font-serif text-[#C4883A]">sculpted by hand.</span>
            </h1>
            <p className="mt-4 text-xs sm:text-sm font-sans text-[#78716A] max-w-lg mx-auto leading-relaxed">
              Every creation begins with pure King Coconut nectar and volcanic stone extracts sourced exclusively from Sri Lanka.
            </p>
          </div>
        )}

        {activeChapter === 2 && (
          <div className="max-w-3xl transition-all duration-700 ease-out transform translate-y-0 opacity-100">
            <span className="text-[11px] font-mono uppercase tracking-[0.35em] text-[#8C827A] block mb-3 font-semibold">
              Phase 02 • Saponification & Fermentation
            </span>
            <h1 className="text-4xl sm:text-7xl font-light tracking-tight text-[#1C1B1A] leading-[1.08]">
              Where organic chemistry <br />
              <span className="italic font-serif text-[#C4883A]">meets quiet patience.</span>
            </h1>
            <p className="mt-4 text-xs sm:text-sm font-sans text-[#78716A] max-w-lg mx-auto leading-relaxed">
              Zero synthetic speed-ups. Cold-process cures and oak-cask maturation running at their own unhurried pace.
            </p>
          </div>
        )}

        {activeChapter === 3 && (
          <div className="max-w-3xl transition-all duration-700 ease-out transform translate-y-0 opacity-100">
            <span className="text-[11px] font-mono uppercase tracking-[0.35em] text-[#8C827A] block mb-3 font-semibold">
              Phase 03 • The Catalog
            </span>
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

      {/* Video-Style Bottom Controller Pill */}
      <div className="absolute bottom-8 inset-x-0 z-30 flex justify-center pointer-events-auto px-4">
        <div className="bg-[#FFFFFF]/90 backdrop-blur-md border border-[#E7E2D8] px-5 py-2.5 rounded-full shadow-lg flex items-center space-x-5 font-mono text-[10px] tracking-wider text-[#524B45]">
          <button
            onClick={() => setIsAutoScrolling(!isAutoScrolling)}
            className="flex items-center space-x-1.5 font-bold uppercase hover:text-[#C4883A] transition-colors"
          >
            <span>{isAutoScrolling ? '❚❚' : '▶'}</span>
            <span>{isAutoScrolling ? 'Pause Journey' : 'Auto Play'}</span>
          </button>

          {/* Progress Indicator Track */}
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