'use client';

import React, { useRef, useState, useEffect } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Image, Float, Center, Text } from '@react-three/drei';
import * as THREE from 'three';

interface LuxuryStoryHeroProps {
  onExplore: () => void;
}

interface ProductItemProps {
  url: string;
  position: [number, number, number];
  scale: [number, number];
  rotationSpeed?: number;
  floatIntensity?: number;
  label?: string;
  subLabel?: string;
}

// Interactive Pen-Art Product Floating Component in 3D
function PenArtProductItem({
  url,
  position,
  scale,
  rotationSpeed = 0.6,
  floatIntensity = 1.0,
  label,
  subLabel,
}: ProductItemProps) {
  const groupRef = useRef<THREE.Group>(null);
  const [hovered, setHovered] = useState(false);

  useFrame((state) => {
    if (!groupRef.current) return;
    const t = state.clock.getElapsedTime();

    // Mouse cursor parallax effect
    const targetX = position[0] + state.pointer.x * 0.45;
    const targetY = position[1] + state.pointer.y * 0.35;

    groupRef.current.position.x = THREE.MathUtils.lerp(groupRef.current.position.x, targetX, 0.08);
    groupRef.current.position.y = THREE.MathUtils.lerp(groupRef.current.position.y, targetY, 0.08);

    // Subtle 3D tilt & sway
    const targetRotY = Math.sin(t * rotationSpeed) * 0.07 + (hovered ? 0.18 : 0);
    const targetRotX = Math.cos(t * rotationSpeed * 0.8) * 0.04 - (hovered ? 0.08 : 0);

    groupRef.current.rotation.y = THREE.MathUtils.lerp(groupRef.current.rotation.y, targetRotY, 0.06);
    groupRef.current.rotation.x = THREE.MathUtils.lerp(groupRef.current.rotation.x, targetRotX, 0.06);
  });

  return (
    <group ref={groupRef} position={position}>
      <Float
        speed={1.6}
        rotationIntensity={0.2}
        floatIntensity={floatIntensity}
        floatingRange={[-0.08, 0.08]}
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
          scale={hovered ? 1.05 : 1}
        >
          {/* Transparent Pen-Art Etching Image mapped onto 3D Plane */}
          <Image
            url={url}
            transparent
            scale={scale}
            toneMapped={false}
          />

          {/* Charcoal Ink Ambient Shadow under the base */}
          <mesh position={[0, -scale[1] / 2 - 0.12, -0.05]} rotation={[-Math.PI / 2, 0, 0]}>
            <circleGeometry args={[scale[0] * 0.34, 32]} />
            <meshBasicMaterial
              color="#1C1B1A"
              transparent
              opacity={hovered ? 0.32 : 0.16}
            />
          </mesh>

          {/* Micro Typography Badges */}
          {label && (
            <group position={[0, -scale[1] / 2 - 0.45, 0.1]}>
              <Text
                fontSize={0.15}
                color="#78716A"
                anchorX="center"
                anchorY="middle"
                letterSpacing={0.06}
              >
                {label.toUpperCase()}
              </Text>
              {subLabel && (
                <Text
                  position={[0, -0.22, 0]}
                  fontSize={0.12}
                  color="#C4883A"
                  anchorX="center"
                  anchorY="middle"
                >
                  {subLabel}
                </Text>
              )}
            </group>
          )}
        </group>
      </Float>
    </group>
  );
}

// Showcase Scene: Arranges the pen-drawn line-up in 3D
function ShowcaseScene({ isSeparateAssets }: { isSeparateAssets: boolean }) {
  if (!isSeparateAssets) {
    // Single wide illustration display
    return (
      <group position={[0, 0, 0]}>
        <PenArtProductItem
          url="/hero-art/pen-art-showcase.png"
          position={[0, 0, 0]}
          scale={[8.6, 4.8]}
          floatIntensity={1.0}
        />
      </group>
    );
  }

  // Multi-layered individual product line-up
  return (
    <group position={[0, 0, 0]}>
      {/* 1. Oak Cask Aged Vinegar (Left) */}
      <PenArtProductItem
        url="/hero-art/vinegar.png"
        position={[-4.2, 0.1, 0.1]}
        scale={[1.7, 3.4]}
        floatIntensity={1.0}
        label="Cask Aged Vinegar"
        subLabel="Culinary Edition"
      />

      {/* 2. Spiced Liqueur Reserve Flask */}
      <PenArtProductItem
        url="/hero-art/liqueur.png"
        position={[-2.1, 0.15, 0.3]}
        scale={[1.8, 3.6]}
        floatIntensity={1.2}
        label="Spiced Liqueur"
        subLabel="Batch No. 04 Reserve"
      />

      {/* 3. Brut Sparkling King Coconut Wine (Center Flagship) */}
      <PenArtProductItem
        url="/hero-art/sparkling.png"
        position={[0, 0.3, 0.6]}
        scale={[1.65, 4.2]}
        floatIntensity={1.5}
        label="Dry Sparkling Wine"
        subLabel="Naturally Effervescent"
      />

      {/* 4. Dual Cut-Corner Soap Cleanser Bars (Right-Center) */}
      <group position={[2.2, 0.2, 0.2]}>
        <PenArtProductItem
          url="/hero-art/soap-top.png"
          position={[0, 1.1, 0]}
          scale={[2.4, 1.5]}
          floatIntensity={0.9}
          label="Revitalize Facial Bar"
        />
        <PenArtProductItem
          url="/hero-art/soap-bottom.png"
          position={[0, -0.9, 0]}
          scale={[2.4, 1.5]}
          floatIntensity={1.1}
          label="Radiance Repair Bar"
        />
      </group>

      {/* 5. Tall King Coconut Wine Bottle (Far Right) */}
      <PenArtProductItem
        url="/hero-art/wine.png"
        position={[4.4, 0.2, 0.2]}
        scale={[1.5, 4.3]}
        floatIntensity={1.2}
        label="King Coconut Wine"
        subLabel="Vintage Edition"
      />
    </group>
  );
}

export default function LuxuryStoryHero({ onExplore }: LuxuryStoryHeroProps) {
  // Checks if individual transparent crops exist, otherwise uses the combined showcase image
  const [useSeparateCrops, setUseSeparateCrops] = useState(false);

  useEffect(() => {
    // Quick probe to check if the individual file is present
    fetch('/hero-art/vinegar.png', { method: 'HEAD' })
      .then((res) => {
        if (res.ok) setUseSeparateCrops(true);
      })
      .catch(() => setUseSeparateCrops(false));
  }, []);

  return (
    <section className="relative w-full h-[90vh] min-h-[620px] max-h-[920px] flex flex-col justify-between overflow-hidden bg-gradient-to-b from-[#FAF9F5] via-[#F4F1EA] to-[#FAF9F5] dark:from-[#141413] dark:via-[#181716] dark:to-[#141413] transition-colors duration-500">
      {/* Hand-drawn grid texture overlay */}
      <div
        className="absolute inset-0 pointer-events-none opacity-[0.035] dark:opacity-[0.05]"
        style={{
          backgroundImage: `radial-gradient(circle, #000 1px, transparent 1px)`,
          backgroundSize: '24px 24px',
        }}
      />

      {/* Top Banner Header */}
      <div className="relative z-10 pt-10 px-6 sm:px-12 max-w-7xl mx-auto w-full flex justify-between items-start">
        <div>
          <span className="text-[10px] sm:text-xs font-mono uppercase tracking-[0.3em] font-semibold text-[#8C827A] dark:text-stone-400 block mb-1">
            Ceylon Botanical Artisans • Est. 2026
          </span>
          <h1 className="text-2xl sm:text-4xl font-light tracking-tight text-[#1C1B1A] dark:text-[#F0EFEA]">
            Pure Nectar. <span className="italic font-serif text-[#C4883A]">Hand-Drawn Authenticity.</span>
          </h1>
        </div>

        <div className="hidden sm:block text-right font-mono text-[10px] text-[#8C827A] dark:text-stone-500">
          <div>KATUNAYAKE, SRI LANKA</div>
          <div>INTERACTIVE 3D ETCHINGS</div>
        </div>
      </div>

      {/* Three.js Canvas Container */}
      <div className="absolute inset-0 z-0 flex items-center justify-center">
        <Canvas
          camera={{ position: [0, 0, 7.8], fov: 42 }}
          gl={{ antialias: true, alpha: true }}
          dpr={[1, 2]}
        >
          <ambientLight intensity={1.3} />
          <directionalLight position={[4, 8, 4]} intensity={0.8} />
          <Center>
            <ShowcaseScene isSeparateAssets={useSeparateCrops} />
          </Center>
        </Canvas>
      </div>

      {/* Bottom Footer Controls */}
      <div className="relative z-10 pb-8 px-6 sm:px-12 max-w-7xl mx-auto w-full flex flex-col sm:flex-row justify-between items-center gap-4">
        <p className="text-xs text-[#78716A] dark:text-stone-400 font-mono text-center sm:text-left">
          Hover over products to examine pen-drawn details • Direct cold-process formulations
        </p>

        <button
          onClick={onExplore}
          className="group flex items-center space-x-3 text-xs uppercase font-mono tracking-widest px-6 py-3.5 rounded-full bg-[#1C1B1A] text-[#FAF9F5] dark:bg-stone-100 dark:text-stone-900 hover:bg-[#C4883A] dark:hover:bg-amber-400 transition-all shadow-lg hover:shadow-xl"
        >
          <span>Explore Catalog & Reserves</span>
          <span className="transform transition-transform group-hover:translate-y-0.5">↓</span>
        </button>
      </div>
    </section>
  );
}