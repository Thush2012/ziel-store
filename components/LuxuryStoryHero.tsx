'use client';

import React, { useRef, useState, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Float, Center } from '@react-three/drei';
import * as THREE from 'three';

// ---------------------------------------------------------------------------
// 1. Procedural Stipple & Ink Pen-Hatching GLSL Shader
// Matches the hand-drawn copperplate / lithograph engraving illustration style
// ---------------------------------------------------------------------------
const PencilArtShaderMaterial = {
  uniforms: {
    uLightPos: { value: new THREE.Vector3(3.0, 5.0, 4.0) },
    uInkColor: { value: new THREE.Color('#1F1B18') },
    uPaperColor: { value: new THREE.Color('#FAF7F0') },
    uHatchDensity: { value: 36.0 },
  },
  vertexShader: `
    varying vec3 vNormal;
    varying vec3 vWorldPosition;
    varying vec2 vUv;

    void main() {
      vUv = uv;
      vNormal = normalize(normalMatrix * normal);
      vec4 worldPos = modelMatrix * vec4(position, 1.0);
      vWorldPosition = worldPos.xyz;
      gl_Position = projectionMatrix * viewMatrix * worldPos;
    }
  `,
  fragmentShader: `
    uniform vec3 uLightPos;
    uniform vec3 uInkColor;
    uniform vec3 uPaperColor;
    uniform float uHatchDensity;

    varying vec3 vNormal;
    varying vec3 vWorldPosition;
    varying vec2 vUv;

    void main() {
      vec3 lightDir = normalize(uLightPos - vWorldPosition);
      float nDotL = dot(vNormal, lightDir);
      float intensity = clamp(nDotL, 0.0, 1.0);

      // Procedural cross-hatch screen coordinates
      vec2 hatchCoord = (vUv * uHatchDensity);
      float line1 = abs(fract(hatchCoord.x + hatchCoord.y) - 0.5);
      float line2 = abs(fract(hatchCoord.x - hatchCoord.y) - 0.5);
      float line3 = abs(fract(hatchCoord.y * 1.5) - 0.5);

      float ink = 0.0;

      // Deep shadow: triple dense cross-hatch & stippling
      if (intensity < 0.22) {
        if (line1 < 0.22 || line2 < 0.22 || line3 < 0.22) ink = 1.0;
      }
      // Mid tones: double cross-hatch
      else if (intensity < 0.55) {
        if (line1 < 0.16 || line2 < 0.16) ink = 1.0;
      }
      // Light shadow: single hatch line
      else if (intensity < 0.85) {
        if (line1 < 0.12) ink = 1.0;
      }

      // Paper tone with pencil graphite stroke color
      vec3 finalColor = mix(uPaperColor, uInkColor, ink);

      // Fine contour edge rim darkening
      float rim = 1.0 - max(dot(normalize(-vWorldPosition), vNormal), 0.0);
      if (rim > 0.78) {
        finalColor = mix(finalColor, uInkColor, 0.85);
      }

      gl_FragColor = vec4(finalColor, 1.0);
    }
  `,
};

// ---------------------------------------------------------------------------
// 2. Exact 3D Models Matching the Sketch Silhouettes
// ---------------------------------------------------------------------------

// A. Product 1: Oak Cask Aged Vinegar (Apothecary Flask)
function VinegarFlaskModel({ material }: { material: THREE.ShaderMaterial }) {
  return (
    <group position={[0, -0.4, 0]}>
      {/* Flattened flask body */}
      <mesh material={material} position={[0, 0, 0]} castShadow>
        <boxGeometry args={[1.5, 2.0, 0.75]} />
      </mesh>
      {/* Tapered shoulder transition */}
      <mesh material={material} position={[0, 1.15, 0]}>
        <cylinderGeometry args={[0.35, 0.75, 0.35, 32]} />
      </mesh>
      {/* Neck */}
      <mesh material={material} position={[0, 1.5, 0]}>
        <cylinderGeometry args={[0.26, 0.28, 0.55, 32]} />
      </mesh>
      {/* Cork cap collar */}
      <mesh material={material} position={[0, 1.85, 0]}>
        <cylinderGeometry args={[0.3, 0.3, 0.2, 32]} />
      </mesh>
    </group>
  );
}

// B. Product 2: Spiced King Coconut Liqueur (Heavy Base + Neck Seal Tag)
function SpicedLiqueurModel({ material }: { material: THREE.ShaderMaterial }) {
  return (
    <group position={[0, -0.5, 0]}>
      {/* Stout cylindrical body */}
      <mesh material={material} position={[0, 0.1, 0]}>
        <cylinderGeometry args={[0.85, 0.85, 2.0, 32]} />
      </mesh>
      {/* Rounded shoulder */}
      <mesh material={material} position={[0, 1.25, 0]}>
        <sphereGeometry args={[0.85, 32, 16, 0, Math.PI * 2, 0, Math.PI / 3]} />
      </mesh>
      {/* Neck */}
      <mesh material={material} position={[0, 1.6, 0]}>
        <cylinderGeometry args={[0.36, 0.36, 0.8, 32]} />
      </mesh>
      {/* Wrapped cord seal collar */}
      <mesh material={material} position={[0, 1.7, 0]}>
        <torusGeometry args={[0.38, 0.06, 16, 32]} />
      </mesh>
      {/* Wax seal emblem */}
      <mesh material={material} position={[0, 1.85, 0.36]} rotation={[0, 0, 0]}>
        <cylinderGeometry args={[0.18, 0.18, 0.05, 24]} />
      </mesh>
      {/* Hanging reserve tag */}
      <mesh material={material} position={[0.42, 1.45, 0.2]} rotation={[0.2, 0.3, -0.4]}>
        <boxGeometry args={[0.45, 0.22, 0.02]} />
      </mesh>
    </group>
  );
}

// C. Product 3: Dry Sparkling Wine (Champagne Silhouette + Wire Cork Cage)
function SparklingWineModel({ material }: { material: THREE.ShaderMaterial }) {
  return (
    <group position={[0, -0.6, 0]}>
      {/* Lower tapered body */}
      <mesh material={material} position={[0, 0.1, 0]}>
        <cylinderGeometry args={[0.8, 0.72, 1.9, 32]} />
      </mesh>
      {/* Sloping champagne shoulders */}
      <mesh material={material} position={[0, 1.35, 0]}>
        <cylinderGeometry args={[0.28, 0.8, 1.0, 32]} />
      </mesh>
      {/* Slender neck */}
      <mesh material={material} position={[0, 2.05, 0]}>
        <cylinderGeometry args={[0.24, 0.26, 0.75, 32]} />
      </mesh>
      {/* Champagne bulge cork & foil cage */}
      <mesh material={material} position={[0, 2.5, 0]}>
        <cylinderGeometry args={[0.28, 0.25, 0.35, 32]} />
      </mesh>
      <mesh material={material} position={[0, 2.7, 0]}>
        <sphereGeometry args={[0.26, 32, 16]} />
      </mesh>
    </group>
  );
}

// D. Product 4: Botanical Soap Box (Angular Cutout Reveal)
function SoapBoxModel({ material }: { material: THREE.ShaderMaterial }) {
  return (
    <group position={[0, 0, 0]}>
      {/* Main outer carton */}
      <mesh material={material} position={[0, 0, 0]}>
        <boxGeometry args={[2.4, 1.5, 0.85]} />
      </mesh>
      {/* Angled top cutout exposing soap texture bar */}
      <mesh material={material} position={[0.65, 0.45, 0.05]} rotation={[0, 0, 0.08]}>
        <boxGeometry args={[0.9, 0.5, 0.76]} />
      </mesh>
    </group>
  );
}

// E. Product 5: Reserve King Coconut Wine (Tall Slender Bordeaux Silhouette)
function ClassicWineModel({ material }: { material: THREE.ShaderMaterial }) {
  return (
    <group position={[0, -0.7, 0]}>
      {/* Base & main cylinder */}
      <mesh material={material} position={[0, 0.2, 0]}>
        <cylinderGeometry args={[0.68, 0.68, 2.3, 32]} />
      </mesh>
      {/* High curved Bordeaux shoulder */}
      <mesh material={material} position={[0, 1.6, 0]}>
        <cylinderGeometry args={[0.25, 0.68, 0.7, 32]} />
      </mesh>
      {/* Long neck */}
      <mesh material={material} position={[0, 2.3, 0]}>
        <cylinderGeometry args={[0.22, 0.24, 1.0, 32]} />
      </mesh>
      {/* Capsule top finish */}
      <mesh material={material} position={[0, 2.85, 0]}>
        <cylinderGeometry args={[0.25, 0.23, 0.2, 32]} />
      </mesh>
    </group>
  );
}

// ---------------------------------------------------------------------------
// 3. Rotating 3D Scene Controller
// ---------------------------------------------------------------------------
function SceneDisplay({ activeIndex }: { activeIndex: number }) {
  const groupRef = useRef<THREE.Group>(null);

  const shaderMaterial = useMemo(() => {
    return new THREE.ShaderMaterial({
      uniforms: THREE.UniformsUtils.clone(PencilArtShaderMaterial.uniforms),
      vertexShader: PencilArtShaderMaterial.vertexShader,
      fragmentShader: PencilArtShaderMaterial.fragmentShader,
    });
  }, []);

  useFrame((state, delta) => {
    if (groupRef.current) {
      // Gentle turntable rotation + organic breathing float
      groupRef.current.rotation.y += delta * 0.45;
      groupRef.current.position.y = Math.sin(state.clock.elapsedTime * 1.5) * 0.08;
    }
  });

  return (
    <group ref={groupRef}>
      <Center>
        {activeIndex === 0 && <VinegarFlaskModel material={shaderMaterial} />}
        {activeIndex === 1 && <SpicedLiqueurModel material={shaderMaterial} />}
        {activeIndex === 2 && <SparklingWineModel material={shaderMaterial} />}
        {activeIndex === 3 && <SoapBoxModel material={shaderMaterial} />}
        {activeIndex === 4 && <ClassicWineModel material={shaderMaterial} />}
      </Center>
    </group>
  );
}

// ---------------------------------------------------------------------------
// 4. Main Export Hero Component
// ---------------------------------------------------------------------------
interface LuxuryStoryHeroProps {
  onExplore: () => void;
}

const PRODUCT_STORIES = [
  {
    title: 'Oak Cask Aged King Coconut Vinegar',
    subtitle: 'Culinary Edition • Double-Fermented • Aged 12 Months',
    abv: '5.2% Acidity',
    desc: 'Slow fermented naturally from pure king coconut nectar and aged in toasted oak barrels for rich, mellow acidity and savory complexity.',
  },
  {
    title: 'Spiced King Coconut Liqueur Reserve',
    subtitle: 'Batch No. 04 • Single Estate Ceylon Spices',
    abv: '15.0% ABV',
    desc: 'Artisanal nectar infused with whole Ceylon cinnamon, pods of wild vanilla, and warm botanicals. Finished with hand-knotted neck twine and wax stamp.',
  },
  {
    title: 'Dry Sparkling King Coconut Wine',
    subtitle: 'Brut Edition • Naturally Effervescent',
    abv: '11.1% ABV',
    desc: 'Crafted with zero added sugars. Lively, champagne-grade bubbles paired with crisp tropical floral notes harvested fresh from coastal groves.',
  },
  {
    title: 'Ziel Facial Bars & Botanical Boxes',
    subtitle: 'Cold-Process Formulation • Natural Clays & Lipids',
    abv: '115g Net Bar',
    desc: 'Activated charcoal, pink volcanic clay, and coconut milk crafted into dense exfoliating bars, housed in custom tear-away paper packaging.',
  },
  {
    title: 'Ziel King Coconut Wine (Original)',
    subtitle: 'Signature Vintage • Slow Fermentation',
    abv: '12.5% ABV',
    desc: 'Our original flagship vintage. Smooth notes of toasted caramel, balanced fruit tannins, and a clean, refreshing golden finish.',
  },
];

export default function LuxuryStoryHero({ onExplore }: LuxuryStoryHeroProps) {
  const [activeIdx, setActiveIdx] = useState(0);

  return (
    <section className="relative w-full min-h-[90vh] flex flex-col lg:flex-row items-center justify-between px-6 sm:px-14 py-12 bg-[#FAF7F0] dark:bg-[#141413] border-b border-[#E8E4DC] dark:border-stone-800 transition-colors duration-500 overflow-hidden">
      {/* Background Lithograph Watermark Effect */}
      <div className="absolute inset-0 pointer-events-none opacity-[0.03] dark:opacity-[0.02] bg-[radial-gradient(#1c1b1a_1px,transparent_1px)] [background-size:16px_16px]" />

      {/* Left: Interactive Story Context */}
      <div className="w-full lg:w-1/2 z-10 flex flex-col justify-center pr-0 lg:pr-10 mb-8 lg:mb-0">
        <div className="flex items-center space-x-2 mb-3">
          <span className="h-[1px] w-8 bg-[#C4883A]" />
          <span className="text-[11px] uppercase tracking-[0.25em] font-mono font-semibold text-[#C4883A]">
            Pen Art & 3D Hatching Engine
          </span>
        </div>

        <h1 className="text-3xl sm:text-5xl lg:text-6xl font-light tracking-tight text-[#1C1B1A] dark:text-[#F3F2EE] leading-[1.1] transition-all">
          {PRODUCT_STORIES[activeIdx].title}
        </h1>

        <p className="mt-2 text-xs sm:text-sm font-mono text-[#8C827A] dark:text-stone-400">
          {PRODUCT_STORIES[activeIdx].subtitle} •{' '}
          <span className="text-[#C4883A] font-bold">{PRODUCT_STORIES[activeIdx].abv}</span>
        </p>

        <p className="mt-5 text-xs sm:text-sm leading-relaxed text-[#524B45] dark:text-stone-300 max-w-lg">
          {PRODUCT_STORIES[activeIdx].desc}
        </p>

        {/* Product Silhouette Selector Carousel */}
        <div className="mt-8 pt-6 border-t border-[#E8E4DC] dark:border-stone-800">
          <div className="text-[10px] font-mono uppercase tracking-wider text-[#8C827A] mb-3">
            Select 3D Botanical Shape:
          </div>
          <div className="flex flex-wrap gap-2">
            {[
              '1. Oak Vinegar Flask',
              '2. Spiced Liqueur',
              '3. Brut Sparkling',
              '4. Soap Reveal Box',
              '5. Signature Wine',
            ].map((name, idx) => (
              <button
                key={idx}
                onClick={() => setActiveIdx(idx)}
                className={`text-[11px] font-mono px-3.5 py-1.5 rounded-full border transition-all ${
                  activeIdx === idx
                    ? 'bg-[#1C1B1A] text-[#FAF9F5] border-[#1C1B1A] dark:bg-stone-100 dark:text-stone-900 font-bold scale-105 shadow-sm'
                    : 'bg-[#EFECE6] dark:bg-stone-800/80 text-[#524B45] dark:text-stone-300 border-[#D9D4C7] dark:border-stone-700 hover:border-[#1C1B1A]'
                }`}
              >
                {name}
              </button>
            ))}
          </div>
        </div>

        <div className="mt-8 flex items-center space-x-4">
          <button
            onClick={onExplore}
            className="px-6 py-3 rounded-xl bg-[#1C1B1A] hover:bg-[#C4883A] text-[#FAF9F5] dark:bg-stone-100 dark:text-stone-900 dark:hover:bg-amber-400 text-xs uppercase font-mono tracking-widest font-semibold transition-all shadow-md"
          >
            Explore Full Catalog ↓
          </button>
          <span className="text-[10px] font-mono text-[#8C827A]">
            Drag 3D model to inspect • Auto-rotating
          </span>
        </div>
      </div>

      {/* Right: 3D Pencil Art Hatching Canvas */}
      <div className="w-full lg:w-1/2 h-[380px] sm:h-[480px] lg:h-[560px] relative flex items-center justify-center">
        <div className="absolute inset-0 rounded-3xl border border-[#E8E4DC] dark:border-stone-800 bg-[#F4F1EA]/60 dark:bg-stone-900/40 backdrop-blur-sm overflow-hidden shadow-xl">
          {/* Subtle watermark stamp */}
          <div className="absolute top-4 right-4 text-[9px] font-mono uppercase tracking-widest text-[#8C827A] border border-[#D9D4C7] dark:border-stone-800 px-2.5 py-1 rounded-md z-10 bg-white/40 dark:bg-stone-900/40">
            Artisanal Pen Shader • 3D WebGL
          </div>

          <Canvas
            shadows
            camera={{ position: [0, 0, 5.0], fov: 42 }}
            className="cursor-grab active:cursor-grabbing w-full h-full"
          >
            <ambientLight intensity={0.4} />
            <directionalLight position={[3, 5, 4]} intensity={1.5} castShadow />

            <Float speed={2} rotationIntensity={0.3} floatIntensity={0.4}>
              <SceneDisplay activeIndex={activeIdx} />
            </Float>

            <OrbitControls
              enableZoom={false}
              enablePan={false}
              minPolarAngle={Math.PI / 3}
              maxPolarAngle={Math.PI / 1.7}
            />
          </Canvas>
        </div>
      </div>
    </section>
  );
}