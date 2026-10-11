'use client';

import React, { useState, useEffect } from 'react';

// The pen-art assets located inside your public/hero-art/ folder
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
  // Brand name typing animation controls
  const [revealedLetters, setRevealedLetters] = useState<number>(0);
  const brandLetters = 'ZIEL STORE'.split('');

  // Background 3D rotating product slideshow index
  const [currentIndex, setCurrentIndex] = useState(0);

  // Typewriter effect on mount
  useEffect(() => {
    brandLetters.forEach((_, idx) => {
      setTimeout(() => {
        setRevealedLetters(idx + 1);
      }, 350 + idx * 80);
    });
  }, []);

  // Continuous infinite product loop: cycles every 4.8 seconds
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % HERO_ART_PRODUCTS.length);
    }, 4800);
    return () => clearInterval(timer);
  }, []);

  return (
    <section className="relative w-full h-screen min-h-[640px] flex flex-col justify-between items-center bg-[#141413] text-[#FAF9F5] overflow-hidden select-none">
      
      {/* ============================================================== */}
      {/* 1. BACKGROUND 3D 360° ROTATION & DESCENDING PRODUCT SLIDESHOW */}
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
              {/* Semi-transparent ethereal pen-art illustration */}
              <img
                src={prod.src}
                alt={prod.name}
                className="max-h-[380px] sm:max-h-[500px] w-auto object-contain opacity-25 filter blur-[0.4px] contrast-125 drop-shadow-[0_25px_40px_rgba(196,136,58,0.18)]"
                onError={(e) => {
                  e.currentTarget.style.display = 'none';
                }}
              />
            </div>
          );
        })}

        {/* Ambient warm glow in the center */}
        <div className="absolute w-96 h-96 rounded-full bg-[#C4883A]/10 blur-[110px] pointer-events-none" />
      </div>

      {/* Top subtle rule / counter */}
      <div className="relative z-10 w-full max-w-7xl px-6 sm:px-12 pt-8 flex justify-between items-center text-[10px] font-mono uppercase tracking-[0.3em] text-stone-500">
        <span>ARCHIVE PRODUCT EXHIBIT</span>
        <span>
          [{currentIndex + 1} / {HERO_ART_PRODUCTS.length}] {HERO_ART_PRODUCTS[currentIndex].name.toUpperCase()}
        </span>
      </div>

      {/* ============================================================== */}
      {/* 2. FOREGROUND LOCKED VECTOR LOGO & TYPOGRAPHY                 */}
      {/* ============================================================== */}
      <div className="relative z-10 flex items-center justify-center -translate-y-2">
        {/* Monogram Icon */}
        <div className="relative flex items-center justify-center mr-3 sm:mr-4">
          <svg
            className="w-14 h-14 sm:w-16 sm:h-16"
            viewBox="0 0 100 100"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M20 28 H75 L30 72 H82 M50 20 L50 80"
              stroke="#C4883A"
              strokeWidth="8"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <circle
              cx="55"
              cy="48"
              r="5"
              fill="#FAF9F5"
            />
          </svg>
        </div>

        {/* Typewritten Letters */}
        <div className="flex items-center overflow-hidden">
          {brandLetters.map((char, index) => {
            const isVisible = index < revealedLetters;
            const isStoreWord = index >= 4;

            return (
              <span
                key={index}
                className={`inline-block text-3xl sm:text-5xl font-black tracking-wider transition-all duration-300 ${
                  isStoreWord
                    ? 'font-light text-stone-400 text-2xl sm:text-4xl ml-1'
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
      {/* 3. BOTTOM FOOTER & SMOOTH SCROLL EXPLORE BUTTON               */}
      {/* ============================================================== */}
      <div className="relative z-10 w-full max-w-7xl px-6 sm:px-12 pb-8 flex flex-col sm:flex-row justify-between items-center gap-4">
        <span className="font-mono text-[10px] uppercase tracking-[0.3em] text-stone-500">
          CEYLON BOTANICAL ARCHIVE • EST. 2026
        </span>

        {onExplore && (
          <button
            onClick={onExplore}
            className="group flex items-center space-x-2 text-xs uppercase font-mono tracking-widest px-6 py-3 rounded-full border border-stone-700 bg-stone-900/60 hover:bg-[#C4883A] hover:text-[#141413] hover:border-[#C4883A] transition-all shadow-md"
          >
            <span>Explore Collection</span>
            <span className="transform transition-transform group-hover:translate-y-0.5">↓</span>
          </button>
        )}
      </div>

      {/* Keyframe 3D Spin & Drift Motion */}
      <style jsx>{`
        @keyframes floatSpinDown {
          0% {
            opacity: 0;
            transform: translateY(-90px) rotateY(0deg) scale(0.85);
          }
          20% {
            opacity: 0.28;
            transform: translateY(-25px) rotateY(90deg) scale(0.96);
          }
          50% {
            opacity: 0.32;
            transform: translateY(0px) rotateY(180deg) scale(1.02);
          }
          80% {
            opacity: 0.28;
            transform: translateY(35px) rotateY(270deg) scale(0.98);
          }
          100% {
            opacity: 0;
            transform: translateY(110px) rotateY(360deg) scale(0.88);
          }
        }
      `}</style>
    </section>
  );
}