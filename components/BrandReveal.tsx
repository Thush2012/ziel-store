'use client';

import React, { useState, useEffect } from 'react';

interface BrandRevealProps {
  onComplete?: () => void;
  accentColor?: string;
  bgColor?: string;
}

export default function BrandReveal({
  onComplete,
  accentColor = '#C4883A', // Warm golden-amber accent
  bgColor = '#141413',
}: BrandRevealProps) {
  const [phase, setPhase] = useState<'line' | 'monogram' | 'name' | 'done'>('line');
  const [dismiss, setDismiss] = useState(false);

  useEffect(() => {
    // Stage 1: Line shoots from left (0ms -> 600ms)
    const t1 = setTimeout(() => setPhase('monogram'), 650);

    // Stage 2: Curls and folds into ZIEL geometric emblem (650ms -> 1400ms)
    const t2 = setTimeout(() => setPhase('name'), 1450);

    // Stage 3: Letters wipe/stagger out cleanly (1450ms -> 2500ms)
    const t3 = setTimeout(() => {
      setPhase('done');
      if (onComplete) onComplete();
    }, 2800);

    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
    };
  }, [onComplete]);

  if (dismiss) return null;

  return (
    <div
      className={`fixed inset-0 z-50 flex items-center justify-center transition-opacity duration-700 ${
        phase === 'done' ? 'opacity-0 pointer-events-none' : 'opacity-100'
      }`}
      style={{ backgroundColor: bgColor }}
      onTransitionEnd={() => setDismiss(true)}
    >
      <div className="relative flex items-center select-none">
        
        {/* --- GEOMETRIC MONOGRAM ICON --- */}
        <div className="relative w-16 h-16 sm:w-20 sm:h-20 flex items-center justify-center">
          {/* Incoming Line */}
          <div
            className={`absolute left-0 top-1/2 -translate-y-1/2 h-2.5 sm:h-3 rounded-full transition-all duration-500 ease-out ${
              phase === 'line'
                ? 'w-24 sm:w-32 -translate-x-12 opacity-100'
                : 'w-0 translate-x-4 opacity-0'
            }`}
            style={{ backgroundColor: accentColor }}
          />

          {/* Precision SVG ZIEL Origami Emblem */}
          <svg
            viewBox="0 0 100 100"
            className={`w-full h-full transition-all duration-700 ease-out ${
              phase === 'line'
                ? 'scale-0 opacity-0 rotate-[-90deg]'
                : 'scale-100 opacity-100 rotate-0'
            }`}
          >
            {/* Upper Leaf / Crown Hook */}
            <path
              d="M 22 28 Q 78 28 78 48 C 78 68 52 74 34 74"
              fill="none"
              stroke={accentColor}
              strokeWidth="12"
              strokeLinecap="round"
              className="transition-all duration-700"
              style={{
                strokeDasharray: 200,
                strokeDashoffset: phase === 'line' ? 200 : 0,
              }}
            />

            {/* Inner Angular Nectar Seed / Fold Anchor */}
            <path
              d="M 44 48 L 62 48 L 44 76 Z"
              fill={accentColor}
              className={`transition-all duration-500 delay-300 ${
                phase === 'line' ? 'opacity-0 scale-50' : 'opacity-100 scale-100'
              }`}
            />
          </svg>
        </div>

        {/* --- BRAND NAME STAGGER WIPE --- */}
        <div className="overflow-hidden ml-4 sm:ml-5">
          <div
            className={`flex items-baseline transition-transform duration-700 ease-out ${
              phase === 'name' || phase === 'done'
                ? 'translate-x-0 opacity-100'
                : '-translate-x-12 opacity-0'
            }`}
          >
            <span className="text-3xl sm:text-5xl font-black tracking-tight text-[#FAF9F5] font-sans">
              ZIEL
            </span>
            <span className="text-xs sm:text-sm font-mono tracking-[0.25em] text-[#C4883A] ml-2 font-semibold uppercase">
              STORE
            </span>
          </div>

          <div
            className={`text-[9px] sm:text-[10px] font-mono uppercase tracking-[0.3em] text-stone-400 transition-opacity duration-500 delay-300 ${
              phase === 'name' || phase === 'done' ? 'opacity-100' : 'opacity-0'
            }`}
          >
            CEYLON BOTANICAL ARCHIVE
          </div>
        </div>

      </div>

      {/* Skip Button */}
      <button
        onClick={() => setDismiss(true)}
        className="absolute bottom-8 right-8 text-[10px] font-mono tracking-widest uppercase text-stone-500 hover:text-stone-300 transition-colors"
      >
        Skip [ESC] →
      </button>
    </div>
  );
}