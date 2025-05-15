"use client"

import { useRef, useEffect, useState } from "react"
import { Canvas, useFrame } from "@react-three/fiber"
import { 
  Sphere, 
  MeshDistortMaterial, 
  MeshWobbleMaterial, 
  Float, 
  Environment, 
  Sparkles,
  Cloud
} from "@react-three/drei"
import type * as THREE from "three"
import { isBrowser } from "@/utils/browser"

// Animated floating orbs
function FloatingOrbs() {
  const orbsRef = useRef<THREE.Group>(null)

  useFrame(({ clock }) => {
    if (orbsRef.current) {
      orbsRef.current.rotation.y = clock.getElapsedTime() * 0.05
    }
  })

  // Generate random positions for orbs
  const orbPositions = Array(10)
    .fill(0)
    .map(() => [(Math.random() - 0.5) * 15, (Math.random() - 0.5) * 15, (Math.random() - 0.5) * 8])

  return (
    <group ref={orbsRef}>
      {orbPositions.map((position, index) => (
        <Float key={index} speed={1 + Math.random() * 0.5} rotationIntensity={0.2} floatIntensity={0.5}>
          <Sphere position={position} args={[0.4 + Math.random() * 0.6, 32, 32]}>
            <MeshWobbleMaterial
              color={index % 3 === 0 ? "#FFD700" : index % 3 === 1 ? "#FFA500" : "#FFCC00"}
              factor={0.2}
              speed={0.5}
              metalness={0.8}
              roughness={0.2}
              envMapIntensity={0.5}
              transparent
              opacity={0.8}
            />
          </Sphere>
        </Float>
      ))}
    </group>
  )
}

// Background distorted sphere
function BackgroundSphere() {
  const sphereRef = useRef<THREE.Mesh>(null)

  useFrame(({ clock }) => {
    if (sphereRef.current) {
      sphereRef.current.rotation.z = clock.getElapsedTime() * 0.05
      sphereRef.current.rotation.y = clock.getElapsedTime() * 0.08
    }
  })

  return (
    <Sphere ref={sphereRef} args={[15, 32, 32]} position={[0, 0, -20]}>
      <MeshDistortMaterial
        color="#111111"
        attach="material"
        distort={0.4}
        speed={1.5}
        roughness={0.8}
        metalness={0.2}
        opacity={0.7}
        transparent
      />
    </Sphere>
  )
}

// Animated clouds
function CloudsGroup() {
  return (
    <group>
      <Cloud position={[-8, 5, -5]} speed={0.2} opacity={0.4} />
      <Cloud position={[8, 4, 5]} speed={0.1} opacity={0.3} />
      <Cloud position={[0, 8, -8]} speed={0.15} opacity={0.4} />
      <Cloud position={[-10, -5, -3]} speed={0.12} opacity={0.3} />
      <Cloud position={[10, -4, 3]} speed={0.08} opacity={0.2} />
    </group>
  )
}

// Animated rings
function GoldenRings() {
  const ringsRef = useRef<THREE.Group>(null)

  useFrame(({ clock }) => {
    if (ringsRef.current) {
      ringsRef.current.rotation.y = clock.getElapsedTime() * 0.1
      ringsRef.current.rotation.x = Math.sin(clock.getElapsedTime() * 0.2) * 0.2
    }
  })

  return (
    <group ref={ringsRef}>
      {[1, 2, 3].map((i) => (
        <mesh key={i} position={[0, 0, 0]} rotation={[Math.PI / 2, 0, 0]}>
          <torusGeometry args={[i * 2, 0.05, 16, 100]} />
          <meshStandardMaterial
            color={i % 2 === 0 ? "#FFD700" : "#FFA500"}
            metalness={0.8}
            roughness={0.2}
            opacity={0.5}
            transparent
          />
        </mesh>
      ))}
    </group>
  )
}

// Main component
export default function GlobalBackground({ intensity = 0.5 }) {
  // Add state to track if component is mounted (client-side)
  const [isMounted, setIsMounted] = useState(false)

  // Only run on client-side
  useEffect(() => {
    if (!isBrowser) return

    setIsMounted(true)
    return () => setIsMounted(false)
  }, [])

  // Don't render anything on server-side
  if (!isMounted) {
    return null
  }

  return (
    <div className="fixed inset-0 -z-10 pointer-events-none" style={{ opacity: intensity }}>
      <Canvas camera={{ position: [0, 0, 15], fov: 75 }}>
        <ambientLight intensity={0.2} />
        <pointLight position={[10, 10, 10]} intensity={0.5} color="#FFD700" />
        <pointLight position={[-10, -10, -10]} intensity={0.3} color="#FFA500" />

        <BackgroundSphere />
        <FloatingOrbs />
        <CloudsGroup />
        <GoldenRings />

        <Sparkles count={100} scale={20} size={1} speed={0.3} opacity={0.5} color="#FFD700" />

        <Environment preset="night" />
      </Canvas>
    </div>
  )
}
