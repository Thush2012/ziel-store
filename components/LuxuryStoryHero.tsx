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
      // Easing curve for rapid corner dispersion on scroll
      setScrollProgress(Math.pow(raw, 0.7));
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Spatial translation: starts centered (±35px), moves wide to corners (±380px)
  const spreadDistance = scrollProgress * 380;
  const p1X = -35 - spreadDistance; 
  const p2X = 35 + spreadDistance;

  // Vertical drift and tilt angles
  const p1Y = scrollProgress * 30;
  const p2Y = scrollProgress * -30;
  const p1Rot = -scrollProgress * 12;
  const p2Rot = scrollProgress * 12;

  // Zoom scale as user scrolls
  const scale = 1.0 + scrollProgress * 0.25;

  return (
    <section
      ref={containerRef}
      className="relative w-full h-[190vh] bg-[#FAF9F5] dark:bg-[#141413] transition-colors duration-500"
    >
      {/* Sticky Fullscreen Frame */}
      <div className="sticky top-0 h-screen w-full flex flex-col justify-between overflow-hidden px-6 sm:px-12 py-8 select-none">
        
        {/* Subtle Background Pattern */}
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

        {/* Center 3D Stage */}
        <div 
          className="absolute inset-0 flex items-center justify-center pointer-events-none"
          style={{ perspective: '1200px' }}
        >
          {/* Ambient Glow */}
          <div 
            className="absolute w-80 h-80 sm:w-[480px] sm:h-[480px] rounded-full bg-amber-500/10 dark:bg-amber-400/10 blur-3xl pointer-events-none"
            style={{ opacity: Math.max(0.1, 1 - scrollProgress * 0.7) }}
          />

          {/* ============================================================== */}
          {/* PRODUCT 01: KING COCONUT WINE (Moves toward Left Corner) */}
          {/* ============================================================== */}
          <div
            className="absolute pointer-events-auto flex flex-col items-center will-change-transform transition-transform duration-100 ease-out"
            style={{
              transform: `translate3d(${p1X}px, ${p1Y}px, 0) scale(${scale}) rotateZ(${p1Rot}deg)`,
              width: '260px',
            }}
          >
            <div className="relative w-full h-[360px] sm:h-[460px] flex items-center justify-center">
              {/* Video Player */}
              <video
                src="/hero-videos/product-1.mp4"
                autoPlay
                loop
                muted
                playsInline
                onError={(e) => {
                  e.currentTarget.style.display = 'none';
                }}
                className="w-full h-full object-contain filter drop-shadow-2xl"
              />

              {/* Automatic Fallback to Pen-Art Image */}
              <img
                src="/hero-art/wine.png"
                alt="Ziel King Coconut Wine"
                className="absolute inset-0 w-full h-full object-contain drop-shadow-xl"
                onError={(e) => {
                  e.currentTarget.src = '/images/wine.jpg';
                }}
                style={{ zIndex: -1 }}
              />
            </div>

            <div 
              className="text-center mt-3 font-mono transition-opacity duration-300"
              style={{ opacity: Math.max(0.3, 1 - scrollProgress * 0.5) }}
            >
              <span className="text-xs uppercase tracking-widest font-bold text-[#1C1B1A] dark:text-stone-200 block">
                King Coconut Wine
              </span>
              <span className="text-[10px] text-[#C4883A] uppercase tracking-wider">
                Batch No. 04 Reserve
              </span>
            </div>
          </div>

          {/* ============================================================== */}
          {/* PRODUCT 02: SPICED LIQUEUR (Moves toward Right Corner) */}
          {/* ============================================================== */}
          <div
            className="absolute pointer-events-auto flex flex-col items-center will-change-transform transition-transform duration-100 ease-out"
            style={{
              transform: `translate3d(${p2X}px, ${p2Y}px, 0) scale(${scale}) rotateZ(${p2Rot}deg)`,
              width: '260px',
            }}
          >
            <div className="relative w-full h-[360px] sm:h-[460px] flex items-center justify-center">
              {/* Video Player */}
              <video
                src="/hero-videos/product-2.mp4"
                autoPlay
                loop
                muted
                playsInline
                onError={(e) => {
                  e.currentTarget.style.display = 'none';
                }}
                className="w-full h-full object-contain filter drop-shadow-2xl"
              />

              {/* Automatic Fallback to Pen-Art Image */}
              <img
                src="/hero-art/liqueur.png"
                alt="Ziel Spiced Coconut Liqueur"
                className="absolute inset-0 w-full h-full object-contain drop-shadow-xl"
                onError={(e) => {
                  e.currentTarget.src = '/hero-art/vinegar.png';
                }}
                style={{ zIndex: -1 }}
              />
            </div>

            <div 
              className="text-center mt-3 font-mono transition-opacity duration-300"
              style={{ opacity: Math.max(0.3, 1 - scrollProgress * 0.5) }}
            >
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
            <span>Scroll down to separate bottles to corners</span>
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