'use client';

import React, { useRef, useState, useEffect } from 'react';

interface LuxuryStoryHeroProps {
  onExplore: () => void;
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
      // Accelerated curve: gentle movement when idle, fast drift to corners on scroll
      setScrollProgress(Math.pow(raw, 0.75));
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Distance: Starts centered (±50px), glides outwards to corners (up to ±420px)
  const spread = scrollProgress * 370;
  const p1X = -50 - spread;
  const p2X = 50 + spread;

  // Vertical drift to opposite corners
  const p1Y = scrollProgress * 35;
  const p2Y = -scrollProgress * 35;

  // Subtle 3D tilt outward
  const p1Rot = -scrollProgress * 14;
  const p2Rot = scrollProgress * 14;

  const scale = 1.0 + scrollProgress * 0.22;

  return (
    <section
      ref={containerRef}
      className="relative w-full h-[190vh] bg-[#FAF9F5] dark:bg-[#141413] transition-colors duration-500"
    >
      {/* Pinned Viewport */}
      <div className="sticky top-0 h-screen w-full flex flex-col justify-between overflow-hidden px-6 sm:px-12 py-8 select-none">
        
        {/* Subtle Luxury Technical Dot Grid */}
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
              Artisanal King Coconut Formulations • Ceylon Reserve
            </span>
            <h1 className="text-2xl sm:text-4xl font-light tracking-tight text-[#1C1B1A] dark:text-[#F0EFEA]">
              Pure Nectar. <span className="italic font-serif text-[#C4883A]">Cinematic Formulations.</span>
            </h1>
          </div>

          <div className="hidden sm:block text-right font-mono text-[10px] text-[#8C827A] dark:text-stone-500">
            <div>KATUNAYAKE, SRI LANKA</div>
            <div>DYNAMIC 3D CORNER DISPERSION</div>
          </div>
        </div>

        {/* 3D Motion Stage in Center */}
        <div 
          className="absolute inset-0 flex items-center justify-center pointer-events-none"
          style={{ perspective: '1200px' }}
        >
          {/* Ambient Center Glow */}
          <div 
            className="absolute w-72 h-72 sm:w-96 sm:h-96 rounded-full bg-amber-500/10 dark:bg-amber-400/10 blur-3xl pointer-events-none"
            style={{ opacity: Math.max(0.15, 1 - scrollProgress * 0.7) }}
          />

          {/* ============================================================== */}
          {/* PRODUCT 01: KING COCONUT WINE (Center -> Left Corner) */}
          {/* ============================================================== */}
          <div
            className="absolute pointer-events-auto flex flex-col items-center will-change-transform transition-transform duration-75"
            style={{
              transform: `translate3d(${p1X}px, ${p1Y}px, 0) scale(${scale}) rotateZ(${p1Rot}deg)`,
              width: '260px',
            }}
          >
            <div className="w-full h-[320px] sm:h-[420px] flex items-center justify-center relative">
              <video
                src="/hero-videos/product-1.mp4"
                autoPlay
                loop
                muted
                playsInline
                onError={(e) => { e.currentTarget.style.display = 'none'; }}
                className="w-full h-full object-contain filter drop-shadow-2xl"
              />
              <img
                src="/hero-art/wine.png"
                alt="King Coconut Wine"
                className="absolute inset-0 w-full h-full object-contain drop-shadow-xl"
                onError={(e) => { e.currentTarget.src = '/images/wine.jpg'; }}
                style={{ zIndex: -1 }}
              />
            </div>

            <div className="text-center mt-3 font-mono">
              <span className="text-xs uppercase tracking-widest font-bold text-[#1C1B1A] dark:text-stone-200 block">
                King Coconut Wine
              </span>
              <span className="text-[10px] text-[#C4883A] uppercase tracking-wider">
                Batch No. 04 Reserve
              </span>
            </div>
          </div>

          {/* ============================================================== */}
          {/* PRODUCT 02: SPICED LIQUEUR (Center -> Right Corner) */}
          {/* ============================================================== */}
          <div
            className="absolute pointer-events-auto flex flex-col items-center will-change-transform transition-transform duration-75"
            style={{
              transform: `translate3d(${p2X}px, ${p2Y}px, 0) scale(${scale}) rotateZ(${p2Rot}deg)`,
              width: '260px',
            }}
          >
            <div className="w-full h-[320px] sm:h-[420px] flex items-center justify-center relative">
              <video
                src="/hero-videos/product-2.mp4"
                autoPlay
                loop
                muted
                playsInline
                onError={(e) => { e.currentTarget.style.display = 'none'; }}
                className="w-full h-full object-contain filter drop-shadow-2xl"
              />
              <img
                src="/hero-art/liqueur.png"
                alt="Spiced Liqueur Reserve"
                className="absolute inset-0 w-full h-full object-contain drop-shadow-xl"
                onError={(e) => { e.currentTarget.src = '/hero-art/vinegar.png'; }}
                style={{ zIndex: -1 }}
              />
            </div>

            <div className="text-center mt-3 font-mono">
              <span className="text-xs uppercase tracking-widest font-bold text-[#1C1B1A] dark:text-stone-200 block">
                Spiced Coconut Liqueur
              </span>
              <span className="text-[10px] text-[#C4883A] uppercase tracking-wider">
                Cask Aged Edition
              </span>
            </div>
          </div>

        </div>

        {/* Bottom Footer Controls */}
        <div className="relative z-20 max-w-7xl mx-auto w-full flex flex-col sm:flex-row justify-between items-center gap-4">
          <div className="flex items-center space-x-3 text-xs font-mono text-[#78716A] dark:text-stone-400">
            <span className="w-2 h-2 rounded-full bg-amber-500 animate-ping" />
            <span>Scroll down to disperse bottles to corners</span>
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