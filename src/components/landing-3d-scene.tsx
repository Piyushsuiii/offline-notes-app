"use client";

import { Canvas, useFrame } from "@react-three/fiber";
import { useRef } from "react";
import * as THREE from "three";

function AnimatedGeometry() {
  const meshRef = useRef<THREE.Mesh>(null);

  useFrame((state, delta) => {
    if (meshRef.current) {
      meshRef.current.rotation.x += delta * 0.2;
      meshRef.current.rotation.y += delta * 0.3;
    }
  });

  return (
    <mesh ref={meshRef}>
      <icosahedronGeometry args={[2.5, 1]} />
      <meshStandardMaterial 
        color="#818cf8" 
        wireframe 
        transparent 
        opacity={0.3} 
        emissive="#4f46e5" 
        emissiveIntensity={0.5} 
      />
      <mesh>
        <icosahedronGeometry args={[2.4, 0]} />
        <meshStandardMaterial 
          color="#312e81" 
          transparent 
          opacity={0.8}
        />
      </mesh>
    </mesh>
  );
}

export function Landing3DScene() {
  return (
    <div className="absolute inset-0 z-0 opacity-60 pointer-events-none">
      <Canvas camera={{ position: [0, 0, 8], fov: 45 }}>
        <ambientLight intensity={0.5} />
        <directionalLight position={[10, 10, 5]} intensity={1} />
        <AnimatedGeometry />
      </Canvas>
    </div>
  );
}
