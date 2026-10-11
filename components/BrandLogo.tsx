'use client';

import React, { useState } from 'react';

export default function BrandLogo({ isDark = false }: { isDark?: boolean }) {
  const [hovered, setHovered] = useState(false);

  return (
    <div
      className="flex items-center space-x-2.5 cursor-pointer group"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {/* Precision Geometric Monogram */}
      <div className="w-8 h-8 sm:w-9 sm:h-9 relative transition-transform duration-500 group-hover:scale-105">
        <svg viewBox="0 0 100 100" className="w-full h-full">
          <path
            d="M 22 28 Q 78 28 78 48 C 78 68 52 74 34 74"
            fill="none"
            stroke="#C4883A"
            strokeWidth="12"
            strokeLinecap="round"
            className="transition-all duration-300 group-hover:stroke-amber-400"
          />
          <path
            d="M 44 48 L 62 48 L 44 76 Z"
            fill="#C4883A"
            className="transition-all duration-300 group-hover:fill-amber-400"
          />
        </svg>
      </div>

      {/* Clean Brand Typography */}
      <div className="flex flex-col">
        <span className={`text-base sm:text-lg font-black tracking-tight leading-none ${
          isDark ? 'text-[#FAF9F5]' : 'text-[#1C1B1A]'
        }`}>
          ZIEL<span className="font-light text-[#C4883A] ml-0.5">.</span>
        </span>
        <span className="text-[8px] font-mono tracking-[0.2em] uppercase text-[#8C827A] leading-tight mt-0.5">
          BOTANICAL
        </span>
      </div>
    </div>
  );
}