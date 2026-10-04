'use client';

import React, { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { Canvas, useFrame } from '@react-three/fiber';
import { Float, MeshTransmissionMaterial } from '@react-three/drei';
import * as THREE from 'three';
import { Play, Pause } from 'lucide-react';

function InteractiveScene({ scrollProgress }: { scrollProgress: number }) {
  const meshRef = useRef<THREE.Mesh>(null);
  const particlesRef = useRef<THREE.Points>(null);

  const [particlePositions] = useState(() => {
    const coords = new Float32Array(150 * 3);
    for (let i = 0; i < 150 * 3; i += 3) {
      coords[i] = (Math.random() - 0.5) * 12;
      coords[i + 1] = (Math.random() - 0.5) * 12;
      coords[i + 2] = (Math.random() - 0.5) * 8;
    }
    return coords;
  });

  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.rotation.x = scrollProgress * Math.PI * 2 + state.clock.elapsedTime * 0.15;
      meshRef.current.rotation.y = scrollProgress * Math.PI * 3 + state.clock.elapsedTime * 0.2;
      meshRef.current.position.y = Math.sin(state.clock.elapsedTime * 0.8) * 0.2;

      const targetScale = 1.2 + Math.sin(scrollProgress * Math.PI) * 0.5;
      meshRef.current.scale.lerp(new THREE.Vector3(targetScale, targetScale, targetScale), 0.1);
    }

    if (particlesRef.current) {
      particlesRef.current.rotation.y = scrollProgress * 2 + state.clock.elapsedTime * 0.05;
    }
  });

  return (
    <>
      <ambientLight intensity={0.7} />
      <directionalLight position={[5, 8, 5]} intensity={2.5} color="#FBBF24" />
      <pointLight position={[-5, -3, -2]} intensity={1.5} color="#D97706" />

      <Float speed={2} rotationIntensity={1} floatIntensity={1.5}>
        <mesh ref={meshRef} position={[0, 0, 0]}>
          <octahedronGeometry args={[1.5, 2]} />
          <MeshTransmissionMaterial
            backside
            samples={6}
            thickness={1.2}
            roughness={0.15}
            chromaticAberration={0.08}
            anisotropy={0.3}
            distortion={0.4}
            distortionScale={0.5}
            temporalDistortion={0.2}
            color="#D97706"
          />
        </mesh>
      </Float>

      <points ref={particlesRef}>
        <bufferGeometry>
          <bufferAttribute
            attach="attributes-position"
            args={[particlePositions, 3]}
          />
        </bufferGeometry>
        <pointsMaterial
          size={0.06}
          color="#F59E0B"
          transparent
          opacity={0.75}
          sizeAttenuation
        />
      </points>
    </>
  );
}

const CHAPTERS = [
  {
    tag: 'ORIGIN & HARVEST',
    title: 'Pure King Coconut Nectar',
    desc: 'Harvested at peak sunrise in Katunayake. Botanical sugars, bio-active electrolytes, and unrefined natural clarity.',
    accent: '#F59E0B',
  },
  {
    tag: 'ARTISANAL CELLAR',
    title: 'Slow Controlled Fermentation',
    desc: 'Temperature-stabilized biochemistry transforming wild coconut sap into golden aromatic vintage wines.',
    accent: '#D97706',
  },
  {
    tag: 'WORKSHOP LABORATORY',
    title: 'Ziel Grit & Cold-Process Soap',
    desc: 'Engineered for mechanics and artisans. High-density saponified coconut lipids paired with real volcanic pumice.',
    accent: '#A8A29E',
  },
  {
    tag: 'THE APOTHECARY',
    title: 'Waterless Botanical Restoratives',
    desc: 'Deep barrier repair salves, activated charcoal detox bars, and custom luxury gift reserve sets.',
    accent: '#E5E5E5',
  },
];

export default function ScrollyHero() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [scrollProgress, setScrollProgress] = useState(0);
  const [isAutoScrolling, setIsAutoScrolling] = useState(false);
  const [activeChapter, setActiveChapter] = useState(0);
  const autoScrollRaf = useRef<number | null>(null);

  useEffect(() => {
    const handleScroll = () => {
      if (!containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      const totalHeight = containerRef.current.scrollHeight - window.innerHeight;
      const currentScroll = -rect.top;
      const progress = Math.min(Math.max(currentScroll / totalHeight, 0), 1);
      
      setScrollProgress(progress);
      setActiveChapter(Math.min(Math.floor(progress * CHAPTERS.length), CHAPTERS.length - 1));
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    if (!isAutoScrolling) {
      if (autoScrollRaf.current) cancelAnimationFrame(autoScrollRaf.current);
      return;
    }

    const scrollStep = () => {
      if (!containerRef.current) return;
      const containerBottom = containerRef.current.offsetTop + containerRef.current.scrollHeight;
      
      if (window.scrollY + window.innerHeight >= containerBottom - 50) {
        setIsAutoScrolling(false);
        return;
      }

      window.scrollBy({ top: 1.8, behavior: 'auto' });
      autoScrollRaf.current = requestAnimationFrame(scrollStep);
    };

    autoScrollRaf.current = requestAnimationFrame(scrollStep);

    return () => {
      if (autoScrollRaf.current) cancelAnimationFrame(autoScrollRaf.current);
    };
  }, [isAutoScrolling]);

  const scrollToChapter = (index: number) => {
    if (!containerRef.current) return;
    const totalHeight = containerRef.current.scrollHeight - window.innerHeight;
    const targetY = containerRef.current.offsetTop + (totalHeight * (index / (CHAPTERS.length - 1)));
    window.scrollTo({ top: targetY, behavior: 'smooth' });
  };

  return (
    <section ref={containerRef} className="relative h-[400vh] bg-[#0E0E0D] text-[#F3F2EE]">
      <div className="sticky top-0 h-screen w-full overflow-hidden">
        <div className="absolute inset-0 z-0">
          <Canvas camera={{ position: [0, 0, 5], fov: 45 }}>
            <InteractiveScene scrollProgress={scrollProgress} />
          </Canvas>
        </div>

        <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-[#0E0E0D] via-transparent to-[#0E0E0D]/60" />
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_0%,#0E0E0D_90%)] opacity-70" />

        <div className="relative z-10 flex h-full max-w-7xl mx-auto flex-col justify-center px-6 sm:px-12 pointer-events-none">
          <div className="max-w-xl">
            <span
              className="inline-block text-[11px] font-mono uppercase tracking-[0.3em] font-semibold mb-3 transition-colors duration-500"
              style={{ color: CHAPTERS[activeChapter].accent }}
            >
              {CHAPTERS[activeChapter].tag}
            </span>

            <h2 className="text-3xl sm:text-6xl font-light tracking-[-0.03em] leading-tight text-white mb-4 transition-all duration-700">
              {CHAPTERS[activeChapter].title}
            </h2>

            <p className="text-xs sm:text-sm text-stone-400 font-sans leading-relaxed tracking-wide transition-opacity duration-500">
              {CHAPTERS[activeChapter].desc}
            </p>

            <div className="mt-8 flex items-center space-x-3 pointer-events-auto">
              <a
                href="#works"
                className="px-6 py-3 rounded-full text-xs font-mono uppercase tracking-widest bg-amber-500 text-stone-950 font-bold hover:bg-amber-400 transition-colors shadow-lg shadow-amber-500/10"
              >
                Explore Collection
              </a>
              <Link
                href="/verify"
                className="px-6 py-3 rounded-full text-xs font-mono uppercase tracking-widest border border-stone-700 text-stone-300 hover:border-amber-500 hover:text-white transition-colors"
              >
                Inspect Batches
              </Link>
            </div>
          </div>
        </div>

        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-20 flex items-center gap-3 bg-[#1A1918]/90 border border-stone-800 backdrop-blur-xl px-5 py-2.5 rounded-full shadow-2xl">
          <button
            onClick={() => setIsAutoScrolling(!isAutoScrolling)}
            className="flex items-center space-x-1.5 text-[11px] font-mono uppercase tracking-wider text-amber-400 hover:text-amber-300 transition-colors pr-2 border-r border-stone-800"
          >
            {isAutoScrolling ? (
              <>
                <Pause className="w-3.5 h-3.5 fill-current" />
                <span>Pause</span>
              </>
            ) : (
              <>
                <Play className="w-3.5 h-3.5 fill-current" />
                <span>Auto Play</span>
              </>
            )}
          </button>

          <div className="flex items-center space-x-2">
            {CHAPTERS.map((ch, idx) => (
              <button
                key={idx}
                onClick={() => scrollToChapter(idx)}
                title={ch.title}
                className={`transition-all duration-300 rounded-full ${
                  activeChapter === idx
                    ? 'w-6 h-1.5 bg-amber-400'
                    : 'w-1.5 h-1.5 bg-stone-700 hover:bg-stone-500'
                }`}
              />
            ))}
          </div>

          <span className="text-[10px] font-mono text-stone-400 pl-2 border-l border-stone-800 min-w-[35px] text-right">
            {Math.round(scrollProgress * 100)}%
          </span>
        </div>
      </div>
    </section>
  );
}