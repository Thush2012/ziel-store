'use client';

import React, { useRef, useState, useEffect } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Float } from '@react-three/drei';
import * as THREE from 'three';

// 1. Realistic Ceylon King Coconut (Thambili)
function RealisticKingCoconut({ position, scale = 1, rotationSpeed = 0.4 }: { position: [number, number, number]; scale?: number; rotationSpeed?: number }) {
  const groupRef = useRef<THREE.Group>(null);

  useFrame((_, delta) => {
    if (groupRef.current) {
      groupRef.current.rotation.y += delta * rotationSpeed;
      groupRef.current.rotation.x += delta * (rotationSpeed * 0.5);
    }
  });

  return (
    <Float speed={2} rotationIntensity={1.3} floatIntensity={1.8}>
      <group ref={groupRef} position={position} scale={scale}>
        {/* Upper rounded body */}
        <mesh position={[0, 0.2, 0]} scale={[1.1, 1.25, 1.05]}>
          <sphereGeometry args={[0.85, 32, 32]} />
          <meshStandardMaterial color="#F28518" roughness={0.42} metalness={0.02} />
        </mesh>

        {/* Lower tapered conical base characteristic of King Coconuts */}
        <mesh position={[0, -0.65, 0]} rotation={[Math.PI, 0, 0]} scale={[1.05, 1.15, 1.02]}>
          <coneGeometry args={[0.85, 1.1, 32]} />
          <meshStandardMaterial color="#E8760C" roughness={0.48} metalness={0.02} />
        </mesh>

        {/* Calyx Crown / Stem petals */}
        <mesh position={[0, 1.22, 0]}>
          <cylinderGeometry args={[0.3, 0.4, 0.15, 6]} />
          <meshStandardMaterial color="#8C733E" roughness={0.8} />
        </mesh>

        {/* Hard Woody Stalk Node */}
        <mesh position={[0.04, 1.38, 0]} rotation={[0.15, 0, 0.2]}>
          <cylinderGeometry args={[0.07, 0.1, 0.3, 12]} />
          <meshStandardMaterial color="#6E5528" roughness={0.9} />
        </mesh>
      </group>
    </Float>
  );
}

// 2. Realistic Ziel King Coconut Wine Bottle (Glass + Gold Label + Liquid + Foil Cap)
function RealisticWineBottle({ position, scale = 1, rotationSpeed = 0.35 }: { position: [number, number, number]; scale?: number; rotationSpeed?: number }) {
  const groupRef = useRef<THREE.Group>(null);

  useFrame((_, delta) => {
    if (groupRef.current) {
      groupRef.current.rotation.y += delta * rotationSpeed;
      groupRef.current.rotation.z += delta * (rotationSpeed * 0.3);
    }
  });

  return (
    <Float speed={1.8} rotationIntensity={1} floatIntensity={1.5}>
      <group ref={groupRef} position={position} scale={scale}>
        {/* Outer Clear / Amber Tint Glass Body */}
        <mesh position={[0, -0.2, 0]}>
          <cylinderGeometry args={[0.55, 0.55, 1.7, 32]} />
          <meshPhysicalMaterial
            color="#FFF4DE"
            transmission={0.9}
            transparent
            roughness={0.08}
            ior={1.52}
            reflectivity={0.7}
            clearcoat={1}
            clearcoatRoughness={0.05}
          />
        </mesh>

        {/* Golden Fermented Coconut Wine Liquid Inside */}
        <mesh position={[0, -0.22, 0]}>
          <cylinderGeometry args={[0.5, 0.5, 1.6, 32]} />
          <meshStandardMaterial
            color="#E5A638"
            roughness={0.2}
            metalness={0.1}
          />
        </mesh>

        {/* Realistic Label Wrap */}
        <mesh position={[0, -0.2, 0]}>
          <cylinderGeometry args={[0.555, 0.555, 0.9, 32, 1, true, 0, Math.PI * 1.5]} />
          <meshStandardMaterial
            color="#FAF7F0"
            roughness={0.7}
          />
        </mesh>

        {/* Bottle Shoulder Taper */}
        <mesh position={[0, 0.9, 0]}>
          <cylinderGeometry args={[0.2, 0.55, 0.55, 32]} />
          <meshPhysicalMaterial
            color="#FFF4DE"
            transmission={0.9}
            transparent
            roughness={0.08}
            ior={1.52}
            clearcoat={1}
          />
        </mesh>

        {/* Bottle Neck */}
        <mesh position={[0, 1.45, 0]}>
          <cylinderGeometry args={[0.18, 0.18, 0.6, 32]} />
          <meshPhysicalMaterial
            color="#FFF4DE"
            transmission={0.9}
            transparent
            roughness={0.08}
            ior={1.52}
          />
        </mesh>

        {/* Gold Metallic Neck Capsule & Cork Seal */}
        <mesh position={[0, 1.68, 0]}>
          <cylinderGeometry args={[0.19, 0.19, 0.35, 32]} />
          <meshStandardMaterial
            color="#D4AF37"
            metalness={0.85}
            roughness={0.25}
          />
        </mesh>
      </group>
    </Float>
  );
}

// 3. Realistic Ziel Grit Mechanics Soap (Charcoal/Volcanic Pumice with Kraft Sleeve)
function RealisticGritSoap({ position, scale = 1, rotationSpeed = 0.35 }: { position: [number, number, number]; scale?: number; rotationSpeed?: number }) {
  const groupRef = useRef<THREE.Group>(null);

  useFrame((_, delta) => {
    if (groupRef.current) {
      groupRef.current.rotation.x += delta * rotationSpeed;
      groupRef.current.rotation.y += delta * (rotationSpeed * 0.8);
    }
  });

  return (
    <Float speed={1.7} rotationIntensity={1.4} floatIntensity={1.6}>
      <group ref={groupRef} position={position} scale={scale}>
        {/* Dark Charcoal / Pumice Cold-Process Soap Bar */}
        <mesh>
          <boxGeometry args={[1.5, 0.95, 0.6]} />
          <meshStandardMaterial
            color="#32312E" // Deep volcanic charcoal tone
            roughness={0.88}
            metalness={0.05}
          />
        </mesh>

        {/* Kraft Paperboard Sleeve Band Wrapped Around Midsection */}
        <mesh position={[0, 0, 0]}>
          <boxGeometry args={[0.85, 0.98, 0.63]} />
          <meshStandardMaterial
            color="#C8AD7F" // Warm earthy craft paperboard
            roughness={0.8}
            metalness={0.02}
          />
        </mesh>

        {/* Ziel Brand Stamp Plate on Kraft Paper */}
        <mesh position={[0, 0, 0.32]}>
          <planeGeometry args={[0.7, 0.45]} />
          <meshStandardMaterial
            color="#1C1B1A"
            roughness={0.9}
          />
        </mesh>
      </group>
    </Float>
  );
}

// 4. Botanical Ivory Cold-Process Soap (Virgin Coconut Oils & Lipids)
function RealisticBotanicalSoap({ position, scale = 1, rotationSpeed = 0.3 }: { position: [number, number, number]; scale?: number; rotationSpeed?: number }) {
  const groupRef = useRef<THREE.Group>(null);

  useFrame((_, delta) => {
    if (groupRef.current) {
      groupRef.current.rotation.y -= delta * rotationSpeed;
      groupRef.current.rotation.z += delta * (rotationSpeed * 0.6);
    }
  });

  return (
    <Float speed={1.9} rotationIntensity={1.2} floatIntensity={1.7}>
      <group ref={groupRef} position={position} scale={scale}>
        {/* Creamy Raw Coconut Soap Slab */}
        <mesh>
          <boxGeometry args={[1.4, 0.9, 0.55]} />
          <meshStandardMaterial
            color="#EDE6D4" // Warm unbleached coconut nectar & lye cure
            roughness={0.65}
            metalness={0.02}
          />
        </mesh>
        {/* Debossed Stamped Monogram Center */}
        <mesh position={[0, 0, 0.28]}>
          <planeGeometry args={[0.9, 0.4]} />
          <meshStandardMaterial
            color="#DDD3BC"
            roughness={0.75}
          />
        </mesh>
      </group>
    </Float>
  );
}

// 5. Realistic Stemmed Crystal Wine Glass with Wine Inside
function RealisticWineGlass({ position, scale = 1, rotationSpeed = 0.3 }: { position: [number, number, number]; scale?: number; rotationSpeed?: number }) {
  const groupRef = useRef<THREE.Group>(null);

  useFrame((_, delta) => {
    if (groupRef.current) {
      groupRef.current.rotation.y -= delta * rotationSpeed;
      groupRef.current.rotation.x += delta * (rotationSpeed * 0.4);
    }
  });

  return (
    <Float speed={2.1} rotationIntensity={1.2} floatIntensity={1.9}>
      <group ref={groupRef} position={position} scale={scale}>
        {/* Base Plate Foot */}
        <mesh position={[0, -1.2, 0]}>
          <cylinderGeometry args={[0.52, 0.52, 0.04, 32]} />
          <meshPhysicalMaterial
            color="#FFFFFF"
            transmission={0.92}
            transparent
            roughness={0.06}
            ior={1.52}
            clearcoat={1}
          />
        </mesh>

        {/* Elegant Slender Stem */}
        <mesh position={[0, -0.55, 0]}>
          <cylinderGeometry args={[0.04, 0.04, 1.25, 16]} />
          <meshPhysicalMaterial
            color="#FFFFFF"
            transmission={0.92}
            transparent
            roughness={0.06}
            ior={1.52}
          />
        </mesh>

        {/* Crystal Bowl */}
        <mesh position={[0, 0.35, 0]} scale={[1, 1.3, 1]}>
          <sphereGeometry args={[0.62, 32, 32, 0, Math.PI * 2, 0, Math.PI * 0.65]} />
          <meshPhysicalMaterial
            color="#FFFFFF"
            transmission={0.94}
            transparent
            roughness={0.04}
            ior={1.52}
            reflectivity={0.8}
            clearcoat={1}
            side={THREE.DoubleSide}
          />
        </mesh>

        {/* Coconut Wine Poured Inside Bowl */}
        <mesh position={[0, 0.25, 0]} scale={[0.88, 0.85, 0.88]}>
          <sphereGeometry args={[0.55, 32, 16, 0, Math.PI * 2, Math.PI * 0.3, Math.PI * 0.35]} />
          <meshStandardMaterial
            color="#E5A638"
            roughness={0.15}
          />
        </mesh>
      </group>
    </Float>
  );
}

// 3D Scene Controller
function FloatingProductStage({ scrollProgress }: { scrollProgress: number }) {
  const groupRef = useRef<THREE.Group>(null);

  useFrame((state) => {
    if (!groupRef.current) return;
    groupRef.current.position.z = scrollProgress * 11.5;
    groupRef.current.rotation.y = state.pointer.x * 0.12;
    groupRef.current.rotation.x = -state.pointer.y * 0.12;
  });

  return (
    <group ref={groupRef}>
      {/* Chapter 1: The Raw King Coconut & Charcoal Grit Soap */}
      <RealisticKingCoconut position={[-2.3, 0.6, -1]} scale={1.2} />
      <RealisticGritSoap position={[2.4, -0.7, -2.5]} scale={1.25} />

      {/* Chapter 2: The Fermented Wine Bottle & Crystal Glass */}
      <RealisticWineBottle position={[-2.0, -1.0, -6]} scale={1.15} />
      <RealisticWineGlass position={[2.2, 0.9, -7.5]} scale={1.25} />

      {/* Chapter 3: Climax Product Showcase (Wine, Botanical Bar, Golden Coconut) */}
      <RealisticBotanicalSoap position={[-2.1, 1.2, -10.5]} scale={1.1} />
      <RealisticWineBottle position={[0, 0.1, -11.5]} scale={1.3} />
      <RealisticKingCoconut position={[2.2, -1.1, -12]} scale={1.05} />
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
          <ambientLight intensity={2.6} />
          <directionalLight position={[10, 15, 10]} intensity={3.0} color="#FFFBF0" />
          <directionalLight position={[-10, 10, -5]} intensity={1.8} color="#FFE6B0" />
          <pointLight position={[0, -2, 2]} intensity={1.5} color="#FFF8E7" />
          <FloatingProductStage scrollProgress={scrollProgress} />
        </Canvas>
      </div>

      {/* Soft Vignette Overlay */}
      <div className="absolute inset-0 pointer-events-none bg-gradient-to-b from-[#FAF9F5]/30 via-transparent to-[#FAF9F5] z-10" />

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