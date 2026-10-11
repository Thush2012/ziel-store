'use client';

import React, { useState, useEffect } from 'react';

const HERO_ART_PRODUCTS = [
  { id: 'sparkling', src: '/hero-art/sparkling.png', name: 'Dry Sparkling King Coconut Wine' },
  { id: 'vinegar', src: '/hero-art/vinegar.png', name: 'Cask Aged Coconut Vinegar' },
  { id: 'liqueur', src: '/hero-art/liqueur.png', name: 'Spiced Coconut Liqueur Reserve' },
  { id: 'soap-top', src: '/hero-art/soap-top.png', name: 'Revitalize Facial Bar' },
  { id: 'soap-bottom', src: '/hero-art/soap-bottom.png', name: 'Radiance Repair Bar' },
  { id: 'wine', src: '/hero-art/wine.png', name: 'King Coconut Wine Vintage' },
];

interface BrandLogoIntroProps {
  onExplore?: () => void;
}

export default function BrandLogoIntro({ onExplore }: BrandLogoIntroProps) {
  const [revealedLetters, setRevealedLetters] = useState<number>(0);
  const brandLetters = 'ZIEL STORE'.split('');
  const [currentIndex, setCurrentIndex] = useState(0);

  // Typewriter effect on mount
  useEffect(() => {
    brandLetters.forEach((_, idx) => {
      setTimeout(() => {
        setRevealedLetters(idx + 1);
      }, 300 + idx * 75);
    });
  }, []);

  // Continuous product rotation loop
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % HERO_ART_PRODUCTS.length);
    }, 4800);
    return () => clearInterval(timer);
  }, []);

  return (
    <section className="relative w-full h-screen min-h-[640px] flex flex-col justify-between items-center bg-gradient-to-b from-[#262421] via-[#1E1C1A] to-[#171615] text-[#FAF9F5] overflow-hidden select-none">
      
      {/* ============================================================== */}
      {/* 1. 3D BACKGROUND SLIDESHOW (Horizontally Flipped & Lighter)    */}
      {/* ============================================================== */}
      <div 
        className="absolute inset-0 z-0 flex items-center justify-center pointer-events-none"
        style={{ perspective: '1200px' }}
      >
        {HERO_ART_PRODUCTS.map((prod, idx) => {
          const isActive = idx === currentIndex;
          if (!isActive) return null;

          return (
            <div
              key={prod.id}
              className="absolute flex flex-col items-center justify-center"
              style={{
                animation: 'floatSpinDown 4.8s cubic-bezier(0.25, 1, 0.5, 1) infinite',
              }}
            >
              {/* Horizontally flipped pen-art image with improved clarity */}
              <img
                src={prod.src}
                alt={prod.name}
                className="max-h-[400px] sm:max-h-[520px] w-auto object-contain opacity-35 filter contrast-125 brightness-110 drop-shadow-[0_20px_45px_rgba(0,0,0,0.5)] -scale-x-100"
                onError={(e) => {
                  e.currentTarget.style.display = 'none';
                }}
              />
            </div>
          );
        })}

        {/* Ambient warm light accent */}
        <div className="absolute w-[500px] h-[500px] rounded-full bg-[#C4883A]/15 blur-[120px] pointer-events-none" />
      </div>

      {/* Top spacing placeholder */}
      <div className="relative z-10 w-full pt-8" />

      {/* ============================================================== */}
      {/* 2. FOREGROUND CLEAN TYPOGRAPHY (Monogram Removed)              */}
      {/* ============================================================== */}
      <div className="relative z-10 flex items-center justify-center -translate-y-2">
        <div className="flex items-center overflow-hidden">
          {brandLetters.map((char, index) => {
            const isVisible = index < revealedLetters;
            const isStoreWord = index >= 4;

            return (
              <span
                key={index}
                className={`inline-block text-3xl sm:text-5xl font-black tracking-wider transition-all duration-300 ${
                  isStoreWord
                    ? 'font-light text-stone-300 text-2xl sm:text-4xl ml-1'
                    : 'text-[#FAF9F5]'
                }`}
                style={{
                  opacity: isVisible ? 1 : 0,
                  transform: isVisible
                    ? 'translateY(0) scale(1)'
                    : 'translateY(20px) scale(0.9)',
                  filter: isVisible ? 'blur(0px)' : 'blur(4px)',
                  display: char === ' ' ? 'inline' : 'inline-block',
                  marginRight: char === ' ' ? '8px' : '1px',
                }}
              >
                {char === ' ' ? '\u00A0' : char}
              </span>
            );
          })}
        </div>
      </div>

      {/* ============================================================== */}
      {/* 3. BOTTOM ACTION BAR (Bottom-left text removed)               */}
      {/* ============================================================== */}
      <div className="relative z-10 w-full max-w-7xl px-6 sm:px-12 pb-8 flex justify-end items-center">
        {onExplore && (
          <button
            onClick={onExplore}
            className="group flex items-center space-x-2 text-xs uppercase font-mono tracking-widest px-6 py-3 rounded-full border border-stone-600/80 bg-stone-900/60 hover:bg-[#C4883A] hover:text-[#141413] hover:border-[#C4883A] transition-all shadow-md backdrop-blur-sm"
          >
            <span>Explore Collection</span>
            <span className="transform transition-transform group-hover:translate-y-0.5">↓</span>
          </button>
        )}
      </div>

      {/* Keyframe 3D Spin, Descend & Horizontal Flip */}
      <style jsx>{`
        @keyframes floatSpinDown {
          0% {
            opacity: 0;
            transform: translateY(-90px) rotateY(0deg) scale(0.88);
          }
          20% {
            opacity: 0.35;
            transform: translateY(-20px) rotateY(90deg) scale(0.96);
          }
          50% {
            opacity: 0.42;
            transform: translateY(0px) rotateY(180deg) scale(1.02);
          }
          80% {
            opacity: 0.35;
            transform: translateY(25px) rotateY(270deg) scale(0.98);
          }
          100% {
            opacity: 0;
            transform: translateY(100px) rotateY(360deg) scale(0.9);
          }
        }
      `}</style>
    </section>
  );
}