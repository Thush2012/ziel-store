'use client';

import React, { useState, useEffect } from 'react';

interface BrandLogoIntroProps {
  onComplete?: () => void;
}

export default function BrandLogoIntro({ onComplete }: BrandLogoIntroProps) {
  // Phase 0: Initial line entering from left
  // Phase 1: Icon loop draw & form (Z monogram)
  // Phase 2: Letter reveal typing ("ZIEL STORE")
  // Phase 3: Hold complete locked lockup
  // Phase 4: Curtain lift to storefront
  const [animationPhase, setAnimationPhase] = useState<number>(0);
  const [revealedLetters, setRevealedLetters] = useState<number>(0);
  const brandLetters = 'ZIEL STORE'.split('');

  useEffect(() => {
    // 0.2s: Draw vector stroke into center
    const t1 = setTimeout(() => setAnimationPhase(1), 250);

    // 0.9s: Settle monogram icon & trigger letter typing
    const t2 = setTimeout(() => {
      setAnimationPhase(2);
      
      // Stagger each character typing in
      brandLetters.forEach((_, idx) => {
        setTimeout(() => {
          setRevealedLetters(idx + 1);
        }, 120 + idx * 85);
      });
    }, 950);

    // 2.3s: Complete and hold locked logo
    const t3 = setTimeout(() => setAnimationPhase(3), 2300);

    // 2.9s: Smoothly slide/fade away into the main store
    const t4 = setTimeout(() => {
      setAnimationPhase(4);
      if (onComplete) onComplete();
    }, 2900);

    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
      clearTimeout(t4);
    };
  }, []);

  if (animationPhase >= 4) return null;

  return (
    <div
      className={`fixed inset-0 z-50 flex items-center justify-center bg-[#141413] transition-opacity duration-700 select-none ${
        animationPhase === 3 ? 'opacity-100' : ''
      }`}
      style={{
        transition: 'opacity 0.6s cubic-bezier(0.16, 1, 0.3, 1), transform 0.6s cubic-bezier(0.16, 1, 0.3, 1)',
      }}
    >
      <div className="relative flex items-center justify-center">
        
        {/* ============================================================== */}
        {/* 1. KINETIC STROKE & LOGO ICON (Geometric Vector Draw)          */}
        {/* ============================================================== */}
        <div
          className="relative transition-all duration-700 ease-out flex items-center justify-center"
          style={{
            transform: animationPhase >= 2 ? 'translateX(-12px)' : 'translateX(0)',
          }}
        >
          <svg
            className="w-16 h-16 sm:w-20 sm:h-20"
            viewBox="0 0 100 100"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            {/* The Horizontal Line Entering From Edge */}
            <line
              x1="-80"
              y1="50"
              x2="25"
              y2="50"
              stroke="#C4883A"
              strokeWidth="8"
              strokeLinecap="round"
              className={`transition-all duration-500 ease-out ${
                animationPhase === 0
                  ? 'opacity-100 translate-x-0'
                  : 'opacity-0 translate-x-12'
              }`}
            />

            {/* The Precision Z-Monogram Vector Path */}
            <path
              d="M20 28 H75 L30 72 H82 M50 20 L50 80"
              stroke="#C4883A"
              strokeWidth="8"
              strokeLinecap="round"
              strokeLinejoin="round"
              style={{
                strokeDasharray: 260,
                strokeDashoffset: animationPhase >= 1 ? 0 : 260,
                transition: 'stroke-dashoffset 0.85s cubic-bezier(0.65, 0, 0.35, 1)',
              }}
            />

            {/* Botanical Coconut Droplet Core Accent */}
            <circle
              cx="55"
              cy="48"
              r="6"
              fill="#FAF9F5"
              className={`transition-all duration-500 ${
                animationPhase >= 2
                  ? 'opacity-100 scale-100'
                  : 'opacity-0 scale-0'
              }`}
            />
          </svg>
        </div>

        {/* ============================================================== */}
        {/* 2. STAGGERED TYPOGRAPHY REVEAL ("ZIEL STORE")                   */}
        {/* ============================================================== */}
        <div className="flex items-center overflow-hidden pl-2">
          {brandLetters.map((char, index) => {
            const isVisible = index < revealedLetters;
            const isStoreWord = index >= 4;

            return (
              <span
                key={index}
                className={`font-black text-2xl sm:text-4xl tracking-wider inline-block transition-all duration-300 ${
                  isStoreWord
                    ? 'font-light text-stone-400 text-xl sm:text-3xl ml-1'
                    : 'text-[#FAF9F5]'
                }`}
                style={{
                  opacity: isVisible ? 1 : 0,
                  transform: isVisible
                    ? 'translateY(0) scale(1)'
                    : 'translateY(24px) scale(0.85)',
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

      {/* Micro-label Subtext Below */}
      <div
        className={`absolute bottom-12 font-mono text-[10px] uppercase tracking-[0.3em] text-stone-500 transition-opacity duration-500 ${
          animationPhase >= 2 ? 'opacity-100' : 'opacity-0'
        }`}
      >
        CEYLON BOTANICAL ARCHIVE • EST. 2026
      </div>
    </div>
  );
}