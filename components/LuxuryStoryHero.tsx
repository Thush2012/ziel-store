'use client';

import React, { useRef, useState, useEffect, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Float } from '@react-three/drei';
import * as THREE from 'three';

// --- Custom Pencil Drawing Hatching Shader ---
const PencilShader = {
  uniforms: {
    paperColor: { value: new THREE.Color('#FAF7F0') }, // Warm vintage sketch paper
    pencilColor: { value: new THREE.Color('#3A3734') }, // Fine graphite charcoal
    lightPos: { value: new THREE.Vector3(5, 10, 7) },
  },
  vertexShader: `
    varying vec3 vNormal;
    varying vec3 vWorldPosition;
    varying vec2 vUv;
    void main() {
      vNormal = normalize(normalMatrix * normal);
      vec4 worldPosition = modelMatrix * vec4(position, 1.0);
      vWorldPosition = worldPosition.xyz;
      vUv = uv;
      gl_Position = projectionMatrix * viewMatrix * worldPosition;
    }
  `,
  fragmentShader: `
    uniform vec3 paperColor;
    uniform vec3 pencilColor;
    uniform vec3 lightPos;
    varying vec3 vNormal;
    varying vec3 vWorldPosition;
    varying vec2 vUv;

    void main() {
      vec3 lightDir = normalize(lightPos - vWorldPosition);
      float diff = max(dot(vNormal, lightDir), 0.0);
      
      // Pencil Cross-hatch screen lines simulation
      vec2 coord = gl_FragCoord.xy * 0.35;
      float hatch1 = mod(coord.x + coord.y, 4.0);
      float hatch2 = mod(coord.x - coord.y, 4.0);
      
      float shade = 1.0;
      
      // Shadow tone hatching thresholds
      if (diff < 0.75) {
        if (hatch1 < 1.3) shade -= 0.28;
      }
      if (diff < 0.45) {
        if (hatch2 < 1.3) shade -= 0.32;
      }
      if (diff < 0.2) {
        if (hatch1 < 2.0 || hatch2 < 2.0) shade -= 0.35;
      }
      
      // Rim outline sketch edge
      vec3 viewDir = normalize(-vWorldPosition);
      float rim = 1.0 - max(dot(viewDir, vNormal), 0.0);
      if (rim > 0.78) {
        shade -= 0.6;
      }
      
      vec3 finalColor = mix(pencilColor, paperColor, clamp(shade, 0.0, 1.0));
      gl_FragColor = vec4(finalColor, 1.0);
    }
  `,
};

function usePencilMaterial() {
  return useMemo(() => {
    return new THREE.ShaderMaterial({
      uniforms: THREE.UniformsUtils.clone(PencilShader.uniforms),
      vertexShader: PencilShader.vertexShader,
      fragmentShader: PencilShader.fragmentShader,
    });
  }, []);
}

// 1. Handcrafted Ceylon King Coconut (Thambili triangular silhouette + stem calyx)
function DrawnKingCoconut({ position, scale = 1 }: { position: [number, number, number]; scale?: number }) {
  const groupRef = useRef<THREE.Group>(null);
  const pencilMat = usePencilMaterial();

  useFrame((_, delta) => {
    if (groupRef.current) {
      groupRef.current.rotation.y += delta * 0.35;
      groupRef.current.rotation.x += delta * 0.15;
    }
  });

  return (
    <Float speed={1.8} rotationIntensity={1.2} floatIntensity={1.5}>
      <group ref={groupRef} position={position} scale={scale}>
        {/* Tapered triangular husk body */}
        <mesh position={[0, -0.1, 0]} material={pencilMat} scale={[1, 1.38, 1]}>
          <coneGeometry args={[0.9, 1.9, 18]} />
        </mesh>
        <mesh position={[0, -1.05, 0]} material={pencilMat} scale={[1, 0.65, 1]}>
          <sphereGeometry args={[0.9, 20, 20]} />
        </mesh>
        {/* Husk Crown / Calyx */}
        <mesh position={[0, 0.9, 0]} material={pencilMat}>
          <cylinderGeometry args={[0.35, 0.15, 0.25, 12]} />
        </mesh>
        {/* Cut Organic Stem */}
        <mesh position={[0, 1.12, 0]} rotation={[0.2, 0, 0.1]} material={pencilMat}>
          <cylinderGeometry args={[0.07, 0.09, 0.35, 8]} />
        </mesh>
      </group>
    </Float>
  );
}

// 2. Realistic 750ml Wine Bottle (Bordeaux shape: punt base, cylindrical body, curve shoulder, capsule)
function DrawnWineBottle({ position, scale = 1 }: { position: [number, number, number]; scale?: number }) {
  const groupRef = useRef<THREE.Group>(null);
  const pencilMat = usePencilMaterial();

  useFrame((_, delta) => {
    if (groupRef.current) {
      groupRef.current.rotation.y += delta * 0.3;
      groupRef.current.rotation.z += delta * 0.12;
    }
  });

  return (
    <Float speed={1.6} rotationIntensity={0.9} floatIntensity={1.4}>
      <group ref={groupRef} position={position} scale={scale}>
        {/* Main Bottle Cylinder */}
        <mesh position={[0, -0.2, 0]} material={pencilMat}>
          <cylinderGeometry args={[0.55, 0.55, 1.9, 28]} />
        </mesh>
        {/* Inset Label Ring (Shading accent) */}
        <mesh position={[0, -0.2, 0]} material={pencilMat} scale={[1.01, 0.9, 1.01]}>
          <cylinderGeometry args={[0.55, 0.55, 1.2, 28]} />
        </mesh>
        {/* Tapered Shoulder */}
        <mesh position={[0, 1.05, 0]} material={pencilMat}>
          <cylinderGeometry args={[0.22, 0.55, 0.6, 28]} />
        </mesh>
        {/* Neck */}
        <mesh position={[0, 1.6, 0]} material={pencilMat}>
          <cylinderGeometry args={[0.18, 0.2, 0.55, 24]} />
        </mesh>
        {/* Neck Flange Lip & Foil Capsule */}
        <mesh position={[0, 1.9, 0]} material={pencilMat}>
          <cylinderGeometry args={[0.22, 0.22, 0.15, 24]} />
        </mesh>
      </group>
    </Float>
  );
}

// 3. Tulip Crystal Wine Glass
function DrawnWineGlass({ position, scale = 1 }: { position: [number, number, number]; scale?: number }) {
  const groupRef = useRef<THREE.Group>(null);
  const pencilMat = usePencilMaterial();

  useFrame((_, delta) => {
    if (groupRef.current) {
      groupRef.current.rotation.y -= delta * 0.28;
      groupRef.current.rotation.x += delta * 0.12;
    }
  });

  return (
    <Float speed={2.0} rotationIntensity={1.2} floatIntensity={1.7}>
      <group ref={groupRef} position={position} scale={scale}>
        {/* Flat Glass Foot */}
        <mesh position={[0, -1.25, 0]} material={pencilMat}>
          <cylinderGeometry args={[0.52, 0.52, 0.04, 24]} />
        </mesh>
        {/* Drawn Stem */}
        <mesh position={[0, -0.6, 0]} material={pencilMat}>
          <cylinderGeometry args={[0.045, 0.045, 1.3, 16]} />
        </mesh>
        {/* Tulip Bowl Base */}
        <mesh position={[0, 0.25, 0]} material={pencilMat} scale={[1, 1.2, 1]}>
          <sphereGeometry args={[0.62, 24, 24, 0, Math.PI * 2, 0, Math.PI * 0.62]} />
        </mesh>
        {/* Rim */}
        <mesh position={[0, 0.72, 0]} material={pencilMat}>
          <torusGeometry args={[0.42, 0.02, 12, 28]} />
        </mesh>
      </group>
    </Float>
  );
}

// 4. Ziel Grit Handcrafted Soap Bar
function DrawnSoapBar({ position, scale = 1 }: { position: [number, number, number]; scale?: number }) {
  const groupRef = useRef<THREE.Group>(null);
  const pencilMat = usePencilMaterial();

  useFrame((_, delta) => {
    if (groupRef.current) {
      groupRef.current.rotation.x += delta * 0.25;
      groupRef.current.rotation.y += delta * 0.32;
    }
  });

  return (
    <Float speed={1.5} rotationIntensity={1.1} floatIntensity={1.5}>
      <group ref={groupRef} position={position} scale={scale}>
        {/* Beveled Soap Block */}
        <mesh material={pencilMat}>
          <boxGeometry args={[1.5, 0.95, 0.58]} />
        </mesh>
        {/* Top Debossed Stamp Inset */}
        <mesh position={[0, 0, 0.3]} material={pencilMat}>
          <boxGeometry args={[1.1, 0.6, 0.04]} />
        </mesh>
      </group>
    </Float>
  );
}

// Main 3D Pencil Scene
function PencilArtifactScene({ scrollProgress }: { scrollProgress: number }) {
  const masterGroup = useRef<THREE.Group>(null);

  useFrame((state) => {
    if (!masterGroup.current) return;
    masterGroup.current.position.z = scrollProgress * 11;
    masterGroup.current.rotation.y = state.pointer.x * 0.12;
    masterGroup.current.rotation.x = -state.pointer.y * 0.12;
  });

  return (
    <group ref={masterGroup}>
      {/* Chapter 1: The Raw Coconut & Crafted Soap */}
      <DrawnKingCoconut position={[-2.3, 0.6, -1]} scale={1.2} />
      <DrawnSoapBar position={[2.3, -0.6, -2.4]} scale={1.25} />

      {/* Chapter 2: The Cellar Wine Bottle & Stemware */}
      <DrawnWineBottle position={[-1.9, -1.1, -6]} scale={1.15} />
      <DrawnWineGlass position={[2.1, 1.0, -7.5]} scale={1.25} />

      {/* Chapter 3: Climax Product Showcase */}
      <DrawnKingCoconut position={[2.4, -0.9, -10.5]} scale={0.95} />
      <DrawnWineBottle position={[0, 0.2, -11.5]} scale={1.3} />
      <DrawnSoapBar position={[-2.3, 1.3, -12]} scale={1.05} />
    </group>
  );
}

export default function LuxuryStoryHero({ onExplore }: { onExplore: () => void }) {
  const [scrollProgress, setScrollProgress] = useState(0);
  const [isAutoScrolling, setIsAutoScrolling] = useState(true);

  useEffect(() => {
    let animationFrameId: number;
    let lastTime = performance.now();
    const scrollSpeed = 0.00035;

    const tick = (currentTime: number) => {
      const delta = currentTime - lastTime;
      lastTime = currentTime;

      if (isAutoScrolling) {
        setScrollProgress((prev) => {
          const next = prev + scrollSpeed * (delta / 16);
          if (next >= 1) {
            setIsAutoScrolling(false);
            return 1;
          }
          return next;
        });
      }

      animationFrameId = requestAnimationFrame(tick);
    };

    animationFrameId = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(animationFrameId);
  }, [isAutoScrolling]);

  const handleWheel = (e: React.WheelEvent) => {
    setIsAutoScrolling(false);
    setScrollProgress((prev) => Math.min(1, Math.max(0, prev + e.deltaY * 0.0008)));
  };

  const activeChapter = scrollProgress < 0.33 ? 1 : scrollProgress < 0.66 ? 2 : 3;

  return (
    <div
      onWheel={handleWheel}
      className="relative w-full h-screen overflow-hidden bg-[#FAF7F0] select-none text-[#23201D]"
    >
      {/* 3D WebGL Canvas Layer */}
      <div className="absolute inset-0 z-0">
        <Canvas camera={{ position: [0, 0, 5], fov: 45 }}>
          <ambientLight intensity={1.5} />
          <directionalLight position={[6, 12, 8]} intensity={2.0} />
          <PencilArtifactScene scrollProgress={scrollProgress} />
        </Canvas>
      </div>

      {/* Subtle Fine Paper Texture Grain Vignette */}
      <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(#2b2723_0.5px,transparent_0.5px)] [background-size:24px_24px] opacity-[0.06] z-10" />

      {/* Narrative Typography */}
      <div className="absolute inset-0 z-20 flex flex-col items-center justify-center pointer-events-none px-6 text-center">
        {activeChapter === 1 && (
          <div className="max-w-3xl transition-all duration-700 ease-out transform translate-y-0 opacity-100">
            <h1 className="text-4xl sm:text-7xl font-light tracking-tight text-[#23201D] leading-[1.08]">
              Born from the earth, <br />
              <span className="italic font-serif text-[#B87B2E]">sculpted by hand.</span>
            </h1>
            <p className="mt-5 text-xs sm:text-sm font-sans text-[#7A736B] max-w-lg mx-auto leading-relaxed">
              Every creation begins with pure King Coconut nectar and volcanic stone extracts sourced exclusively from Sri Lanka.
            </p>
          </div>
        )}

        {activeChapter === 2 && (
          <div className="max-w-3xl transition-all duration-700 ease-out transform translate-y-0 opacity-100">
            <h1 className="text-4xl sm:text-7xl font-light tracking-tight text-[#23201D] leading-[1.08]">
              Where organic chemistry <br />
              <span className="italic font-serif text-[#B87B2E]">meets quiet patience.</span>
            </h1>
            <p className="mt-5 text-xs sm:text-sm font-sans text-[#7A736B] max-w-lg mx-auto leading-relaxed">
              Zero synthetic speed-ups. Cold-process cures and oak-cask maturation running at their own unhurried pace.
            </p>
          </div>
        )}

        {activeChapter === 3 && (
          <div className="max-w-3xl transition-all duration-700 ease-out transform translate-y-0 opacity-100">
            <h1 className="text-4xl sm:text-7xl font-light tracking-tight text-[#23201D] leading-[1.08]">
              Distinctive works, <br />
              <span className="italic font-serif text-[#B87B2E]">ready for your hands.</span>
            </h1>
            <div className="mt-8 pointer-events-auto">
              <button
                onClick={onExplore}
                className="px-8 py-4 rounded-full bg-[#23201D] text-[#FAF7F0] text-xs uppercase tracking-widest font-bold hover:bg-[#B87B2E] transition-all duration-300 shadow-xl"
              >
                Enter Official Store →
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Floating Bottom Controller Pill */}
      <div className="absolute bottom-8 inset-x-0 z-30 flex justify-center pointer-events-auto px-4">
        <div className="bg-[#FFFFFF]/90 backdrop-blur-md border border-[#E5E0D5] px-5 py-2.5 rounded-full shadow-md flex items-center space-x-5 font-mono text-[10px] tracking-wider text-[#4A453F]">
          <button
            onClick={() => setIsAutoScrolling(!isAutoScrolling)}
            className="flex items-center space-x-1.5 font-bold uppercase hover:text-[#B87B2E] transition-colors"
          >
            <span>{isAutoScrolling ? '❚❚' : '▶'}</span>
            <span>{isAutoScrolling ? 'Pause' : 'Auto Play'}</span>
          </button>

          <div className="w-28 sm:w-44 h-1.5 bg-[#EAE5D9] rounded-full overflow-hidden">
            <div
              className="h-full bg-[#B87B2E] transition-all duration-150 rounded-full"
              style={{ width: `${Math.round(scrollProgress * 100)}%` }}
            />
          </div>

          <span className="text-[#877F76] w-8 text-right font-medium">
            {Math.round(scrollProgress * 100)}%
          </span>

          <button
            onClick={onExplore}
            className="font-bold text-[#23201D] uppercase hover:underline ml-2 hidden sm:inline"
          >
            Skip to Works ↓
          </button>
        </div>
      </div>
    </div>
  );
}