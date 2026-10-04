'use client';

import { useRef, useState, useEffect } from 'react';
import { motion, useScroll, useTransform, useSpring } from 'framer-motion';

export default function ZielHeroExperience() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isAutoScrolling, setIsAutoScrolling] = useState(false);

  // Track scroll position within this 300vh canvas section
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ['start start', 'end end'],
  });

  // Smooth out scroll physics
  const smoothProgress = useSpring(scrollYProgress, {
    stiffness: 80,
    damping: 20,
    restDelta: 0.001,
  });

  // Stage 1: Golden Wine & Nectar
  const opacityStage1 = useTransform(smoothProgress, [0, 0.25, 0.35], [1, 1, 0]);
  const scaleStage1 = useTransform(smoothProgress, [0, 0.3], [1, 1.15]);
  const yStage1 = useTransform(smoothProgress, [0, 0.3], [0, -60]);

  // Stage 2: Heavy-Duty Charcoal & Workshop Grit
  const opacityStage2 = useTransform(smoothProgress, [0.32, 0.48, 0.65], [0, 1, 0]);
  const scaleStage2 = useTransform(smoothProgress, [0.32, 0.5, 0.65], [0.9, 1, 1.1]);
  const rotateStage2 = useTransform(smoothProgress, [0.32, 0.65], [-8, 8]);

  // Stage 3: The Final Fusion -> ZIEL Emblem Reveal
  const opacityStage3 = useTransform(smoothProgress, [0.65, 0.8, 1], [0, 1, 1]);
  const scaleStage3 = useTransform(smoothProgress, [0.65, 0.85, 1], [0.8, 1, 1]);
  const glowStage3 = useTransform(
    smoothProgress,
    [0.7, 1],
    ['0 0 20px rgba(217, 119, 6, 0.2)', '0 0 80px rgba(217, 119, 6, 0.7)']
  );

  // Auto-scroll mechanism
  const triggerAutoScroll = () => {
    if (!containerRef.current) return;
    setIsAutoScrolling(true);

    const startPosition = window.scrollY;
    const targetPosition = containerRef.current.offsetTop + containerRef.current.offsetHeight;
    const distance = targetPosition - startPosition;
    const duration = 4500; // 4.5 seconds for complete luxury cinematic journey
    let startTime: number | null = null;

    function step(currentTime: number) {
      if (!startTime) startTime = currentTime;
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);

      // Smooth Ease-in-out curve
      const ease =
        progress < 0.5
          ? 2 * progress * progress
          : -1 + (4 - 2 * progress) * progress;

      window.scrollTo(0, startPosition + distance * ease);

      if (progress < 1) {
        window.requestAnimationFrame(step);
      } else {
        setIsAutoScrolling(false);
      }
    }

    window.requestAnimationFrame(step);
  };

  return (
    <div ref={containerRef} className="relative h-[300vh] bg-[#0c0a09] text-stone-100">
      {/* Sticky Fullscreen Viewport Window */}
      <div className="sticky top-0 h-screen w-full overflow-hidden flex items-center justify-center">
        {/* Animated Background Mesh & Atmosphere */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(217,119,6,0.18),rgba(12,10,9,0.95))]" />

        {/* Ambient Grid Lines for Technical Precision */}
        <div className="absolute inset-0 opacity-[0.03] bg-[linear-gradient(to_right,#fff_1px,transparent_1px),linear-gradient(to_bottom,#fff_1px,transparent_1px)] bg-[size:4rem_4rem]" />

        {/* ================= STAGE 1: NECTAR & CELLAR ================= */}
        <motion.div
          style={{ opacity: opacityStage1, scale: scaleStage1, y: yStage1 }}
          className="absolute inset-0 flex flex-col items-center justify-center text-center px-6 pointer-events-none"
        >
          <div className="w-24 h-24 rounded-full bg-amber-500/20 blur-2xl absolute animate-pulse" />
          <span className="text-[11px] uppercase tracking-[0.3em] font-mono text-amber-500 mb-4 block">
            Natural Fermentation • Phase I
          </span>
          <h2 className="text-4xl sm:text-7xl font-light tracking-tight text-stone-200 max-w-3xl leading-[1.08]">
            Born from the living nectar of the <span className="italic font-serif text-amber-400">king coconut.</span>
          </h2>
          <p className="mt-6 text-xs sm:text-sm font-mono text-stone-400 max-w-md">
            Native coastal harvest slowly matured in charred oak casks.
          </p>
        </motion.div>

        {/* ================= STAGE 2: WORKSHOP & FORMULATION ================= */}
        <motion.div
          style={{
            opacity: opacityStage2,
            scale: scaleStage2,
            rotate: rotateStage2,
          }}
          className="absolute inset-0 flex flex-col items-center justify-center text-center px-6 pointer-events-none"
        >
          <div className="w-32 h-32 rounded-full bg-stone-700/30 blur-3xl absolute" />
          <span className="text-[11px] uppercase tracking-[0.3em] font-mono text-stone-400 mb-4 block">
            Physical Chemistry • Phase II
          </span>
          <h2 className="text-4xl sm:text-7xl font-light tracking-tight text-stone-100 max-w-3xl leading-[1.08]">
            Engineered for hands that <span className="font-semibold text-stone-300">build & master.</span>
          </h2>
          <p className="mt-6 text-xs sm:text-sm font-mono text-stone-400 max-w-md">
            Volcanic pumice and pure botanical lipids formulated to strip industrial grease.
          </p>
        </motion.div>

        {/* ================= STAGE 3: THE EMBLEM REVEAL ================= */}
        <motion.div
          style={{
            opacity: opacityStage3,
            scale: scaleStage3,
          }}
          className="absolute inset-0 flex flex-col items-center justify-center text-center px-6 z-10"
        >
          {/* Animated Radial Energy Field */}
          <motion.div
            style={{ boxShadow: glowStage3 }}
            className="w-48 h-48 sm:w-64 sm:h-64 rounded-full border border-amber-500/40 bg-gradient-to-b from-amber-500/10 to-transparent flex items-center justify-center backdrop-blur-md relative mb-8"
          >
            <div className="absolute inset-2 rounded-full border border-amber-500/20 border-dashed animate-[spin_20s_linear_infinite]" />
            <span className="text-5xl sm:text-7xl font-serif tracking-[0.18em] text-white pl-3 select-none">
              ZIEL
            </span>
          </motion.div>

          <h3 className="text-lg sm:text-2xl font-light tracking-wide text-stone-200">
            Artisanal Fermentations & Handcrafted Formulations
          </h3>
          <p className="text-xs font-mono text-amber-500/80 mt-2 uppercase tracking-widest">
            Katunayake, Sri Lanka • Worldwide Export
          </p>

          <a
            href="#works"
            className="mt-8 px-8 py-3.5 rounded-full text-xs font-mono font-bold uppercase tracking-widest bg-stone-100 text-stone-950 hover:bg-amber-400 hover:text-stone-950 transition-all duration-300 shadow-2xl hover:scale-105"
          >
            Explore The Works ↓
          </a>
        </motion.div>

        {/* ================= FLOATING AUTO-SCROLL PILL (WEAREBRAND STYLE) ================= */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-20">
          <button
            onClick={triggerAutoScroll}
            disabled={isAutoScrolling}
            className="group flex items-center space-x-2.5 px-5 py-2.5 rounded-full bg-stone-900/80 border border-stone-800 text-stone-300 text-xs font-mono backdrop-blur-md hover:border-amber-500/60 hover:text-white transition-all shadow-xl"
          >
            <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping" />
            <span className="tracking-wider uppercase text-[10px]">
              {isAutoScrolling ? 'Touring Collection...' : 'Auto Cinematic Tour ↓'}
            </span>
          </button>
        </div>
      </div>
    </div>
  );
}