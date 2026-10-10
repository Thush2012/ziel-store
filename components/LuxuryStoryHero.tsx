'use client';

import React, { useRef, useState, useEffect } from 'react';

interface LuxuryStoryHeroProps {
  onExplore: () => void;
}

export default function LuxuryStoryHero({ onExplore }: LuxuryStoryHeroProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [scrollProgress, setScrollProgress] = useState(0);
  const [activeProduct, setActiveProduct] = useState<1 | 2>(1);

  // Track scroll inside the hero container for buttery-smooth zoom physics
  useEffect(() => {
    const handleScroll = () => {
      if (!containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      const windowHeight = window.innerHeight;
      
      // Calculate progress from 0 (top) to 1 (scrolled through hero)
      const totalScrollable = rect.height - windowHeight;
      if (totalScrollable <= 0) return;
      
      const current = Math.min(Math.max(-rect.top / totalScrollable, 0), 1);
      setScrollProgress(current);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Calculate dynamic 3D transform values based on scroll progress
  // 1. Initial scale: 0.85 -> Zooms up to 1.4x as you scroll
  const zoomScale = 0.85 + scrollProgress * 0.55;
  // 2. Center divergence: starts centered, glides slightly as you zoom
  const p1TranslateX = (1 - scrollProgress) * -40 + scrollProgress * -80;
  const p2TranslateX = (1 - scrollProgress) * 40 + scrollProgress * 80;
  // 3. Dynamic 3D tilt perspective
  const rotateX = 8 - scrollProgress * 8;
  const opacityFade = scrollProgress > 0.85 ? 1 - (scrollProgress - 0.85) * 6 : 1;

  return (
    <section 
      ref={containerRef}
      className="relative w-full h-[180vh] bg-gradient-to-b from-[#FAF9F5] via-[#F4F1EA] to-[#FAF9F5] dark:from-[#141413] dark:via-[#191817] dark:to-[#141413] transition-colors duration-500"
    >
      {/* Sticky viewport frame that pins while scrolling */}
      <div className="sticky top-0 h-screen w-full flex flex-col justify-between overflow-hidden px-6 sm:px-12 py-8 select-none">
        
        {/* Subtle Luxury Technical Grid */}
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
              Interactive 3D Motion Showcase • 2 Product Preview
            </span>
            <h1 className="text-2xl sm:text-4xl font-light tracking-tight text-[#1C1B1A] dark:text-[#F0EFEA]">
              Pure Nectar. <span className="italic font-serif text-[#C4883A]">Cinematic Formulations.</span>
            </h1>
          </div>

          {/* Active Product Switcher Buttons */}
          <div className="flex items-center space-x-2 bg-stone-200/50 dark:bg-stone-800/60 backdrop-blur-md p-1 rounded-full border border-stone-300 dark:border-stone-700">
            <button
              onClick={() => setActiveProduct(1)}
              className={`px-3 py-1 rounded-full text-[10px] uppercase font-mono tracking-wider transition-all ${
                activeProduct === 1
                  ? 'bg-[#1C1B1A] text-[#FAF9F5] dark:bg-stone-100 dark:text-stone-900 font-bold shadow-sm'
                  : 'text-stone-600 dark:text-stone-400 hover:text-current'
              }`}
            >
              Bottle 01
            </button>
            <button
              onClick={() => setActiveProduct(2)}
              className={`px-3 py-1 rounded-full text-[10px] uppercase font-mono tracking-wider transition-all ${
                activeProduct === 2
                  ? 'bg-[#1C1B1A] text-[#FAF9F5] dark:bg-stone-100 dark:text-stone-900 font-bold shadow-sm'
                  : 'text-stone-600 dark:text-stone-400 hover:text-current'
              }`}
            >
              Bottle 02
            </button>
          </div>
        </div>

        {/* Center 3D Video Zoom Stage */}
        <div 
          className="absolute inset-0 flex items-center justify-center pointer-events-none"
          style={{ perspective: '1200px' }}
        >
          <div 
            className="relative w-full max-w-4xl h-[480px] sm:h-[600px] flex items-center justify-center transition-transform duration-75 will-change-transform"
            style={{
              transform: `scale(${zoomScale}) rotateX(${rotateX}deg)`,
              opacity: Math.max(0, opacityFade),
            }}
          >
            {/* Ambient Center Glow */}
            <div className="absolute w-72 h-72 sm:w-96 sm:h-96 rounded-full bg-amber-500/10 dark:bg-amber-400/10 blur-3xl pointer-events-none" />

            {/* PRODUCT VIDEO 1 */}
            <div 
              className={`absolute transition-all duration-500 ease-out flex flex-col items-center pointer-events-auto cursor-pointer ${
                activeProduct === 1 ? 'z-20' : 'z-10 opacity-70 hover:opacity-100'
              }`}
              style={{
                transform: `translateX(${p1TranslateX}px) scale(${activeProduct === 1 ? 1.08 : 0.88})`,
              }}
              onClick={() => setActiveProduct(1)}
            >
              {/* 
                BACKGROUND REMOVAL INSTRUCTION:
                If video background is black -> mix-blend-screen
                If video background is white -> mix-blend-multiply
                If video is transparent webm -> standard transparent
              */}
              <video
                src="/hero-videos/product-1.mp4"
                autoPlay
                loop
                muted
                playsInline
                className="w-[260px] sm:w-[340px] h-auto object-contain drop-shadow-2xl mix-blend-screen dark:mix-blend-screen"
                style={{
                  filter: 'contrast(1.05) brightness(1.02)',
                }}
              />
              
              <div className="text-center mt-2 font-mono">
                <span className="text-[11px] uppercase tracking-widest text-[#1C1B1A] dark:text-stone-200 font-bold block">
                  King Coconut Wine
                </span>
                <span className="text-[9px] text-[#C4883A] uppercase tracking-wider">
                  Batch No. 04 Reserve
                </span>
              </div>
            </div>

            {/* PRODUCT VIDEO 2 */}
            <div 
              className={`absolute transition-all duration-500 ease-out flex flex-col items-center pointer-events-auto cursor-pointer ${
                activeProduct === 2 ? 'z-20' : 'z-10 opacity-70 hover:opacity-100'
              }`}
              style={{
                transform: `translateX(${p2TranslateX}px) scale(${activeProduct === 2 ? 1.08 : 0.88})`,
              }}
              onClick={() => setActiveProduct(2)}
            >
              <video
                src="/hero-videos/product-2.mp4"
                autoPlay
                loop
                muted
                playsInline
                className="w-[260px] sm:w-[340px] h-auto object-contain drop-shadow-2xl mix-blend-screen dark:mix-blend-screen"
                style={{
                  filter: 'contrast(1.05) brightness(1.02)',
                }}
              />

              <div className="text-center mt-2 font-mono">
                <span className="text-[11px] uppercase tracking-widest text-[#1C1B1A] dark:text-stone-200 font-bold block">
                  Spiced Coconut Liqueur
                </span>
                <span className="text-[9px] text-[#C4883A] uppercase tracking-wider">
                  Cask Aged Edition
                </span>
              </div>
            </div>

          </div>
        </div>

        {/* Bottom Interactive Scroll Indicator */}
        <div className="relative z-20 max-w-7xl mx-auto w-full flex flex-col sm:flex-row justify-between items-center gap-4">
          <div className="flex items-center space-x-3 text-xs font-mono text-[#78716A] dark:text-stone-400">
            <span className="w-2 h-2 rounded-full bg-amber-500 animate-ping" />
            <span>Scroll down to zoom 3D details • Click bottle to focus</span>
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