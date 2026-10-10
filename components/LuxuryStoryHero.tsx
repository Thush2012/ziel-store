'use client';

import React, { useRef, useState, useEffect } from 'react';

interface LuxuryStoryHeroProps {
  onExplore: () => void;
}

export default function LuxuryStoryHero({ onExplore }: LuxuryStoryHeroProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [scrollProgress, setScrollProgress] = useState(0);
  const [activeFocus, setActiveFocus] = useState<1 | 2 | null>(null);

  // Fast scroll tracking with aggressive acceleration curve
  useEffect(() => {
    const handleScroll = () => {
      if (!containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      const windowHeight = window.innerHeight;
      const totalScrollable = rect.height - windowHeight;

      if (totalScrollable <= 0) return;

      // Raw 0 to 1 progress through the hero container
      const raw = Math.min(Math.max(-rect.top / totalScrollable, 0), 1);
      // Ease-in exponential curve so scrolling moves them rapidly to corners
      const accelerated = Math.pow(raw, 0.75);
      setScrollProgress(accelerated);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Responsive positions:
  // At scroll = 0: centered together (±35px offset)
  // At scroll = 1: pushed far outward to corners (±340px to ±480px on desktop)
  const spreadFactor = scrollProgress * 380; 
  const p1X = -35 - spreadFactor; // Moves to far Left
  const p2X = 35 + spreadFactor;  // Moves to far Right

  // Vertical drift: slightly drifts down/up to corners
  const p1Y = scrollProgress * 40;
  const p2Y = scrollProgress * -40;

  // 3D rotation: tilts outward away from each other as they fly to corners
  const p1RotZ = -scrollProgress * 14; 
  const p2RotZ = scrollProgress * 14;
  const p1RotY = scrollProgress * 18; 
  const p2RotY = -scrollProgress * 18;

  // Dynamic Scale: grows larger as it zooms into the corners
  const scale = 1.0 + scrollProgress * 0.28;

  return (
    <section
      ref={containerRef}
      className="relative w-full h-[200vh] bg-gradient-to-b from-[#FAF9F5] via-[#F4F1EA] to-[#FAF9F5] dark:from-[#141413] dark:via-[#191817] dark:to-[#141413] transition-colors duration-500"
    >
      {/* Sticky Fullscreen Frame */}
      <div className="sticky top-0 h-screen w-full flex flex-col justify-between overflow-hidden px-6 sm:px-12 py-8 select-none">
        
        {/* Subtle Luxury Technical Dot Grid */}
        <div
          className="absolute inset-0 pointer-events-none opacity-[0.035] dark:opacity-[0.05]"
          style={{
            backgroundImage: `radial-gradient(circle, #000 1px, transparent 1px)`,
            backgroundSize: '24px 24px',
          }}
        />

        {/* Top Header Information */}
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
          style={{ perspective: '1100px' }}
        >
          {/* Ambient Center Glow */}
          <div 
            className="absolute w-80 h-80 sm:w-[480px] sm:h-[480px] rounded-full bg-amber-500/10 dark:bg-amber-400/10 blur-3xl pointer-events-none transition-opacity duration-300"
            style={{ opacity: 1 - scrollProgress * 0.8 }}
          />

          {/* ============================================================== */}
          {/* PRODUCT 01: KING COCONUT WINE (Moves to Left Corner) */}
          {/* ============================================================== */}
          <div
            onClick={() => setActiveFocus(1)}
            className="absolute pointer-events-auto cursor-pointer transition-all duration-150 will-change-transform flex flex-col items-center"
            style={{
              transform: `translate3d(${p1X}px, ${p1Y}px, 0) scale(${scale * (activeFocus === 1 ? 1.08 : 1)}) rotateZ(${p1RotZ}deg) rotateY(${p1RotY}deg)`,
              zIndex: activeFocus === 1 ? 30 : 20,
            }}
          >
            <div className="relative w-[180px] sm:w-[260px] h-[340px] sm:h-[460px] flex items-center justify-center group">
              {/* Primary Video Player */}
              <video
                src="/hero-videos/product-1.mp4"
                autoPlay
                loop
                muted
                playsInline
                onError={(e) => {
                  // Fallback: If video is missing/erroring, hide video and show image
                  e.currentTarget.style.display = 'none';
                }}
                className="w-full h-full object-contain filter drop-shadow-[0_15px_30px_rgba(0,0,0,0.18)] dark:drop-shadow-[0_20px_35px_rgba(0,0,0,0.45)] transition-transform duration-300 group-hover:scale-105"
              />

              {/* Instant Image Fallback (Shown if video isn't loaded or transparent) */}
              <img
                src="/hero-art/wine.png"
                alt="King Coconut Wine"
                className="absolute inset-0 w-full h-full object-contain drop-shadow-xl transition-transform duration-300 group-hover:scale-105 pointer-events-none"
                onError={(e) => {
                  // If hero-art/wine.png not found, tries general wine.jpg
                  e.currentTarget.src = '/images/wine.jpg';
                }}
                style={{
                  // Automatically hides behind the video once video renders
                  zIndex: -1,
                }}
              />
            </div>

            {/* Label Plaque */}
            <div 
              className="text-center mt-3 font-mono transition-opacity duration-300"
              style={{ opacity: Math.max(0.2, 1 - scrollProgress * 0.4) }}
            >
              <span className="text-[11px] uppercase tracking-widest font-bold text-[#1C1B1A] dark:text-stone-200 block">
                King Coconut Wine
              </span>
              <span className="text-[9px] text-[#C4883A] uppercase tracking-wider">
                Batch No. 04 Reserve
              </span>
            </div>
          </div>

          {/* ============================================================== */}
          {/* PRODUCT 02: SPICED LIQUEUR (Moves to Right Corner) */}
          {/* ============================================================== */}
          <div
            onClick={() => setActiveFocus(2)}
            className="absolute pointer-events-auto cursor-pointer transition-all duration-150 will-change-transform flex flex-col items-center"
            style={{
              transform: `translate3d(${p2X}px, ${p2Y}px, 0) scale(${scale * (activeFocus === 2 ? 1.08 : 1)}) rotateZ(${p2RotZ}deg) rotateY(${p2RotY}deg)`,
              zIndex: activeFocus === 2 ? 30 : 20,
            }}
          >
            <div className="relative w-[180px] sm:w-[260px] h-[340px] sm:h-[460px] flex items-center justify-center group">
              {/* Primary Video Player */}
              <video
                src="/hero-videos/product-2.mp4"
                autoPlay
                loop
                muted
                playsInline
                onError={(e) => {
                  e.currentTarget.style.display = 'none';
                }}
                className="w-full h-full object-contain filter drop-shadow-[0_15px_30px_rgba(0,0,0,0.18)] dark:drop-shadow-[0_20px_35px_rgba(0,0,0,0.45)] transition-transform duration-300 group-hover:scale-105"
              />

              {/* Instant Image Fallback */}
              <img
                src="/hero-art/liqueur.png"
                alt="Spiced Liqueur Reserve"
                className="absolute inset-0 w-full h-full object-contain drop-shadow-xl transition-transform duration-300 group-hover:scale-105 pointer-events-none"
                onError={(e) => {
                  e.currentTarget.src = '/hero-art/vinegar.png';
                }}
                style={{
                  zIndex: -1,
                }}
              />
            </div>

            {/* Label Plaque */}
            <div 
              className="text-center mt-3 font-mono transition-opacity duration-300"
              style={{ opacity: Math.max(0.2, 1 - scrollProgress * 0.4) }}
            >
              <span className="text-[11px] uppercase tracking-widest font-bold text-[#1C1B1A] dark:text-stone-200 block">
                Spiced Coconut Liqueur
              </span>
              <span className="text-[9px] text-[#C4883A] uppercase tracking-wider">
                Cask Aged Edition
              </span>
            </div>
          </div>

        </div>

        {/* Bottom Interactive Scroll Controls */}
        <div className="relative z-20 max-w-7xl mx-auto w-full flex flex-col sm:flex-row justify-between items-center gap-4">
          <div className="flex items-center space-x-3 text-xs font-mono text-[#78716A] dark:text-stone-400">
            <span className="w-2 h-2 rounded-full bg-amber-500 animate-ping" />
            <span>Scroll down to separate bottles to corners • Click bottle to inspect</span>
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