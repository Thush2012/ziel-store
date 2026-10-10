'use client';

import React, { useRef, useState, useEffect } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Float, Center, Text } from '@react-three/drei';
import * as THREE from 'three';

interface LuxuryStoryHeroProps {
  onExplore: () => void;
}

// 1. Procedural 3D Bottle Shape (King Coconut Wine / Liqueur Flask)
function BottleMesh({ color = '#C4883A', hovered }: { color?: string; hovered: boolean }) {
  return (
    <group>
      {/* Lower Bottle Body */}
      <mesh position={[0, -0.4, 0]}>
        <cylinderGeometry args={[0.55, 0.58, 1.8, 48]} />
        <meshStandardMaterial
          color={color}
          roughness={0.25}
          metalness={0.15}
          wireframe={hovered}
        />
      </mesh>

      {/* Curved Shoulder */}
      <mesh position={[0, 0.65, 0]}>
        <cylinderGeometry args={[0.22, 0.55, 0.5, 48]} />
        <meshStandardMaterial color={color} roughness={0.3} metalness={0.1} />
      </mesh>

      {/* Slim Neck */}
      <mesh position={[0, 1.15, 0]}>
        <cylinderGeometry args={[0.2, 0.22, 0.6, 32]} />
        <meshStandardMaterial color={color} roughness={0.3} metalness={0.1} />
      </mesh>

      {/* Wood / Cork Stopper */}
      <mesh position={[0, 1.55, 0]}>
        <cylinderGeometry args={[0.22, 0.19, 0.25, 32]} />
        <meshStandardMaterial color="#8C6239" roughness={0.8} />
      </mesh>

      {/* Wireframe Outline Aura */}
      <mesh position={[0, -0.4, 0]} scale={1.03}>
        <cylinderGeometry args={[0.55, 0.58, 1.8, 24]} />
        <meshBasicMaterial color="#FAF9F5" wireframe transparent opacity={0.15} />
      </mesh>
    </group>
  );
}

// 2. Procedural 3D Soap Bar Shape (Artisanal Grit Bar with Beveled Cut)
function SoapMesh({ color = '#8C827A', hovered }: { color?: string; hovered: boolean }) {
  return (
    <group>
      {/* Rectangular Soap Block */}
      <mesh position={[0, 0, 0]}>
        <boxGeometry args={[1.5, 0.95, 0.65]} />
        <meshStandardMaterial
          color={color}
          roughness={0.7}
          metalness={0.05}
          wireframe={hovered}
        />
      </mesh>

      {/* Botanical Drop Inset Relief */}
      <mesh position={[0, 0, 0.34]} rotation={[0, 0, Math.PI / 4]}>
        <boxGeometry args={[0.25, 0.25, 0.05]} />
        <meshStandardMaterial color="#C4883A" roughness={0.5} />
      </mesh>

      {/* Subtle Contour Cage */}
      <mesh scale={1.04}>
        <boxGeometry args={[1.5, 0.95, 0.65]} />
        <meshBasicMaterial color="#1C1B1A" wireframe transparent opacity={0.1} />
      </mesh>
    </group>
  );
}

// 3. Interactive 3D Entity with Scroll Dispersion & Mouse Parallax
function FloatingEntity({
  type,
  basePosition,
  scrollProgress,
  targetCorner,
  color,
  label,
  subLabel,
}: {
  type: 'bottle' | 'soap';
  basePosition: [number, number, number];
  scrollProgress: number;
  targetCorner: 'left' | 'right';
  color: string;
  label: string;
  subLabel: string;
}) {
  const groupRef = useRef<THREE.Group>(null);
  const [hovered, setHovered] = useState(false);

  useFrame((state) => {
    if (!groupRef.current) return;
    const t = state.clock.getElapsedTime();

    // Mouse Parallax Influence
    const mouseX = state.pointer.x * 0.5;
    const mouseY = state.pointer.y * 0.35;

    // Corner dispersion offset driven by scroll
    const spreadX = (targetCorner === 'left' ? -3.4 : 3.4) * scrollProgress;
    const spreadY = (targetCorner === 'left' ? 0.8 : -0.8) * scrollProgress;
    const spreadZ = -scrollProgress * 1.5;

    // Smooth Lerp Position
    groupRef.current.position.x = THREE.MathUtils.lerp(
      groupRef.current.position.x,
      basePosition[0] + spreadX + mouseX * 0.4,
      0.08
    );
    groupRef.current.position.y = THREE.MathUtils.lerp(
      groupRef.current.position.y,
      basePosition[1] + spreadY + mouseY * 0.3,
      0.08
    );
    groupRef.current.position.z = THREE.MathUtils.lerp(
      groupRef.current.position.z,
      basePosition[2] + spreadZ,
      0.08
    );

    // Continuous 3D rotation & dynamic tilt
    const idleSpin = t * 0.35;
    const scrollTilt = (targetCorner === 'left' ? -0.4 : 0.4) * scrollProgress;

    groupRef.current.rotation.y = idleSpin + (hovered ? 0.3 : 0);
    groupRef.current.rotation.z = Math.sin(t * 0.8) * 0.05 + scrollTilt;
    groupRef.current.rotation.x = Math.cos(t * 0.6) * 0.05;
  });

  return (
    <group ref={groupRef} position={basePosition}>
      <Float
        speed={1.8}
        rotationIntensity={0.25}
        floatIntensity={1.2}
        floatingRange={[-0.1, 0.1]}
      >
        <group
          onPointerOver={(e) => {
            e.stopPropagation();
            setHovered(true);
            document.body.style.cursor = 'pointer';
          }}
          onPointerOut={() => {
            setHovered(false);
            document.body.style.cursor = 'auto';
          }}
          scale={hovered ? 1.08 : 1}
        >
          {type === 'bottle' ? (
            <BottleMesh color={color} hovered={hovered} />
          ) : (
            <SoapMesh color={color} hovered={hovered} />
          )}

          {/* Contact Ink Shadow Below */}
          <mesh position={[0, -1.2, 0]} rotation={[-Math.PI / 2, 0, 0]}>
            <circleGeometry args={[0.7, 32]} />
            <meshBasicMaterial color="#1C1B1A" transparent opacity={hovered ? 0.25 : 0.12} />
          </mesh>

          {/* Micro Typography Plaque */}
          <group position={[0, -1.5, 0]}>
            <Text
              fontSize={0.16}
              color="#78716A"
              anchorX="center"
              anchorY="middle"
              letterSpacing={0.08}
            >
              {label.toUpperCase()}
            </Text>
            <Text
              position={[0, -0.22, 0]}
              fontSize={0.12}
              color="#C4883A"
              anchorX="center"
              anchorY="middle"
            >
              {subLabel}
            </Text>
          </group>
        </group>
      </Float>
    </group>
  );
}

export default function LuxuryStoryHero({ onExplore }: LuxuryStoryHeroProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [scrollProgress, setScrollProgress] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      if (!containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      const windowHeight = window.innerHeight;
      const scrollableDist = rect.height - windowHeight;

      if (scrollableDist <= 0) return;

      const raw = Math.min(Math.max(-rect.top / scrollableDist, 0), 1);
      // Accelerated curve for crisp corner dispersion
      setScrollProgress(Math.pow(raw, 0.75));
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <section
      ref={containerRef}
      className="relative w-full h-[190vh] bg-gradient-to-b from-[#FAF9F5] via-[#F4F1EA] to-[#FAF9F5] dark:from-[#141413] dark:via-[#181716] dark:to-[#141413] transition-colors duration-500"
    >
      {/* Pinned Sticky Stage */}
      <div className="sticky top-0 h-screen w-full flex flex-col justify-between overflow-hidden px-6 sm:px-12 py-8 select-none">
        
        {/* Subtle Technical Dot Grid */}
        <div
          className="absolute inset-0 pointer-events-none opacity-[0.035] dark:opacity-[0.05]"
          style={{
            backgroundImage: `radial-gradient(circle, #000 1px, transparent 1px)`,
            backgroundSize: '24px 24px',
          }}
        />

        {/* Top Header */}
        <div className="relative z-20 max-w-7xl mx-auto w-full flex justify-between items-start">
          <div>
            <span className="text-[10px] sm:text-xs font-mono uppercase tracking-[0.3em] font-semibold text-[#8C827A] dark:text-stone-400 block mb-1">
              Interactive 3D Procedural Meshes • Batch No. 04
            </span>
            <h1 className="text-2xl sm:text-4xl font-light tracking-tight text-[#1C1B1A] dark:text-[#F0EFEA]">
              Pure Nectar. <span className="italic font-serif text-[#C4883A]">Parametric Precision.</span>
            </h1>
          </div>

          <div className="hidden sm:block text-right font-mono text-[10px] text-[#8C827A] dark:text-stone-500">
            <div>KATUNAYAKE, SRI LANKA</div>
            <div>THREE.JS PROCEDURAL SCENE</div>
          </div>
        </div>

        {/* Three.js Canvas: 3D Shapes Float in Center, Disperse to Corners on Scroll */}
        <div className="absolute inset-0 z-0 flex items-center justify-center">
          <Canvas
            camera={{ position: [0, 0, 7.5], fov: 42 }}
            gl={{ antialias: true, alpha: true }}
            dpr={[1, 2]}
          >
            <ambientLight intensity={1.4} />
            <directionalLight position={[5, 10, 5]} intensity={1.2} />
            <directionalLight position={[-5, -5, -2]} intensity={0.5} color="#C4883A" />

            <Center>
              <group position={[0, 0, 0]}>
                {/* Product 1: Artisanal Wine Vessel (Drifts to Left Corner) */}
                <FloatingEntity
                  type="bottle"
                  basePosition={[-0.95, 0.1, 0.2]}
                  scrollProgress={scrollProgress}
                  targetCorner="left"
                  color="#C4883A"
                  label="King Coconut Wine"
                  subLabel="Batch No. 04 Reserve"
                />

                {/* Product 2: Handcrafted Soap Bar (Drifts to Right Corner) */}
                <FloatingEntity
                  type="soap"
                  basePosition={[0.95, -0.1, -0.2]}
                  scrollProgress={scrollProgress}
                  targetCorner="right"
                  color="#8C827A"
                  label="Ziel Grit Soap"
                  subLabel="Mechanics Cold-Process"
                />
              </group>
            </Center>
          </Canvas>
        </div>

        {/* Bottom Interactive Scroll Controls */}
        <div className="relative z-20 max-w-7xl mx-auto w-full flex flex-col sm:flex-row justify-between items-center gap-4">
          <div className="flex items-center space-x-3 text-xs font-mono text-[#78716A] dark:text-stone-400">
            <span className="w-2 h-2 rounded-full bg-amber-500 animate-ping" />
            <span>Scroll down to disperse 3D shapes to corners • Hover to inspect wireframes</span>
          </div>

          <button
            onClick={onExplore}
            className="group flex items-center space-x-3 text-xs uppercase font-mono tracking-widest px-6 py-3.5 rounded-full bg-[#1C1B1A] text-[#FAF9F5] dark:bg-stone-100 dark:text-stone-900 hover:bg-[#C4883A] dark:hover:bg-amber-400 transition-all shadow-lg hover:shadow-xl"
          >
            <span>Skip to Store Catalog</span>
            <span className="transform transition-transform group-hover:translate-y-0.5">↓</span>
          </button>
        </div>

      </div>
    </section>
  );
}