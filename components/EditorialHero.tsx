'use client';

import React, { useState, useEffect } from 'react';

interface EditorialHeroProps {
  onExplore: () => void;
}

const HIGHLIGHT_STORIES = [
  {
    tag: 'RESERVE 01',
    title: 'KING COCONUT WINE',
    sub: 'Batch No. 04 • Naturally Fermented',
    bg: 'bg-[#C4883A]',
    textColor: 'text-[#141413]',
    image: '/images/wine.jpg',
  },
  {
    tag: 'FORMULA 02',
    title: 'GRIT MECHANIC BAR',
    sub: 'Cold-Process • Volcanic Pumice',
    bg: 'bg-[#D4CEBF]',
    textColor: 'text-[#141413]',
    image: '/images/soap.jpg',
  },
  {
    tag: 'CASK AGED',
    title: 'SPICED LIQUEUR',
    sub: 'Limited Release • Oak Infused',
    bg: 'bg-[#1C1B1A]',
    textColor: 'text-[#FAF9F5]',
    image: '/hero-art/liqueur.png',
  },
];

export default function EditorialHero({ onExplore }: EditorialHeroProps) {
  const [activeSlide, setActiveSlide] = useState(0);
  const [isHovered, setIsHovered] = useState(false);

  // Auto-cycle through the kinetic editorial frames if user is idle
  useEffect(() => {
    if (isHovered) return;
    const interval = setInterval(() => {
      setActiveSlide((prev) => (prev + 1) % HIGHLIGHT_STORIES.length);
    }, 2800);
    return () => clearInterval(interval);
  }, [isHovered]);

  const current = HIGHLIGHT_STORIES[activeSlide];

  return (
    <section className="relative w-full min-h-[92vh] bg-[#141413] text-[#FAF9F5] flex flex-col justify-between overflow-hidden select-none">
      
      {/* Top Ticker Bar */}
      <div className="w-full border-b border-stone-800 px-6 sm:px-12 py-3 flex justify-between items-center text-[10px] sm:text-xs font-mono uppercase tracking-[0.25em] text-stone-400">
        <div className="flex items-center space-x-2">
          <span className="w-2 h-2 rounded-full bg-[#C4883A] animate-ping" />
          <span>EST. 2026 • CEYLON BOTANICAL ARCHIVE</span>
        </div>
        <div className="hidden sm:block">
          FRAME [{activeSlide + 1} / {HIGHLIGHT_STORIES.length}]
        </div>
      </div>

      {/* Main Kinetic Typography & Flash Imagery Stage */}
      <div 
        className="relative flex-1 flex flex-col justify-center items-center px-4 sm:px-10 py-12"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        {/* Kinetic Giant Backdrop Wordmark */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-10">
          <span className="text-[22vw] font-black tracking-tighter leading-none uppercase text-white scale-y-110">
            ZIEL
          </span>
        </div>

        {/* Center Editorial Showcase Deck */}
        <div className="relative z-10 w-full max-w-5xl grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
          
          {/* Left: Punchy Kinetic Typography */}
          <div className="md:col-span-7 flex flex-col justify-center space-y-4">
            <div className="inline-flex items-center space-x-2">
              <span className="px-2.5 py-0.5 rounded text-[10px] font-mono uppercase font-bold tracking-widest bg-[#C4883A] text-black">
                {current.tag}
              </span>
              <span className="text-xs font-mono tracking-widest text-stone-400">
                PHYSIOCHEMICAL SPEC
              </span>
            </div>

            <h1 className="text-4xl sm:text-7xl font-black uppercase tracking-tight leading-[0.95] text-stone-100">
              {current.title}
            </h1>

            <p className="text-sm sm:text-base font-mono text-stone-400 max-w-md pt-2">
              {current.sub}
            </p>

            {/* Quick-Step Slide Selector Pills */}
            <div className="flex items-center space-x-3 pt-6">
              {HIGHLIGHT_STORIES.map((story, idx) => (
                <button
                  key={idx}
                  onClick={() => setActiveSlide(idx)}
                  className={`h-2.5 rounded-full transition-all duration-300 ${
                    activeSlide === idx 
                      ? 'w-12 bg-[#C4883A]' 
                      : 'w-2.5 bg-stone-700 hover:bg-stone-500'
                  }`}
                  aria-label={`Jump to ${story.title}`}
                />
              ))}
            </div>
          </div>

          {/* Right: Bold Poster Product Card with Macro Framing */}
          <div className="md:col-span-5 flex justify-center">
            <div 
              className={`relative w-full max-w-[340px] aspect-[3/4] rounded-2xl overflow-hidden p-6 flex flex-col justify-between shadow-2xl transition-all duration-700 ${current.bg} ${current.textColor}`}
            >
              <div className="flex justify-between items-start font-mono text-[10px] tracking-widest uppercase font-bold">
                <span>ZIEL ARCHIVE</span>
                <span>LIMITED RUN</span>
              </div>

              {/* Product Artwork / Photography */}
              <div className="relative flex-1 my-4 flex items-center justify-center">
                <img
                  src={current.image}
                  alt={current.title}
                  className="max-h-[260px] w-auto object-contain drop-shadow-[0_20px_30px_rgba(0,0,0,0.35)] transition-transform duration-500 hover:scale-105"
                  onError={(e) => {
                    e.currentTarget.src = '/images/wine.jpg';
                  }}
                />
              </div>

              <div className="border-t border-current/20 pt-3 flex justify-between items-baseline font-mono">
                <span className="text-xs font-bold uppercase tracking-wider">{current.title}</span>
                <span className="text-[10px] underline cursor-pointer hover:opacity-75" onClick={onExplore}>
                  INSPECT →
                </span>
              </div>
            </div>
          </div>

        </div>
      </div>

      {/* Bottom Kinetic Marquee & Explore Trigger */}
      <div className="border-t border-stone-800 bg-[#0F0F0E] px-6 sm:px-12 py-4 flex flex-col sm:flex-row justify-between items-center gap-4 z-20">
        <div className="flex items-center space-x-6 text-xs font-mono uppercase tracking-widest text-stone-400">
          <span>COCONUT WINES</span>
          <span>•</span>
          <span>COLD-PROCESS SOAPS</span>
          <span>•</span>
          <span>CASK LIQUEURS</span>
        </div>

        <button
          onClick={onExplore}
          className="w-full sm:w-auto px-8 py-3.5 rounded-full bg-[#FAF9F5] text-[#141413] hover:bg-[#C4883A] transition-colors text-xs font-mono font-bold uppercase tracking-widest flex items-center justify-center space-x-2"
        >
          <span>ENTER FULL STORE</span>
          <span>↓</span>
        </button>
      </div>

    </section>
  );
}