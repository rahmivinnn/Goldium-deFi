"use client"

import { useRef } from "react"
import { Canvas, useFrame } from "@react-three/fiber"
import { Sphere, MeshDistortMaterial, MeshWobbleMaterial, Float, Environment } from "@react-three/drei"
import type * as THREE from "three"

function FloatingOrbs() {
  const orbsRef = useRef<THREE.Group>(null)

  useFrame(({ clock }) => {
    if (orbsRef.current) {
      orbsRef.current.rotation.y = clock.getElapsedTime() * 0.05
    }
  })

  // Generate random positions for orbs
  const orbPositions = Array(8)
    .fill(0)
    .map(() => [(Math.random() - 0.5) * 10, (Math.random() - 0.5) * 10, (Math.random() - 0.5) * 5])

  return (
    <group ref={orbsRef}>
      {orbPositions.map((position, index) => (
        <Float key={index} speed={1 + Math.random()} rotationIntensity={0.2} floatIntensity={0.5}>
          <Sphere position={position} args={[0.4 + Math.random() * 0.5, 32, 32]}>
            <MeshWobbleMaterial
              color={index % 2 === 0 ? "#FFD700" : "#FFA500"}
              factor={0.2}
              speed={0.5}
              metalness={0.8}
              roughness={0.2}
              envMapIntensity={0.5}
            />
          </Sphere>
        </Float>
      ))}
    </group>
  )
}

function BackgroundSphere() {
  const sphereRef = useRef<THREE.Mesh>(null)

  useFrame(({ clock }) => {
    if (sphereRef.current) {
      sphereRef.current.rotation.z = clock.getElapsedTime() * 0.05
      sphereRef.current.rotation.y = clock.getElapsedTime() * 0.08
    }
  })

  return (
    <Sphere ref={sphereRef} args={[12, 32, 32]} position={[0, 0, -15]}>
      <MeshDistortMaterial
        color="#111111"
        attach="material"
        distort={0.4}
        speed={1.5}
        roughness={0.8}
        metalness={0.2}
        opacity={0.8}
        transparent
      />
    </Sphere>
  )
}

export default function FeaturesBackground() {
  return (
    <div className="absolute inset-0 -z-10">
      <Canvas camera={{ position: [0, 0, 10], fov: 75 }}>
        <ambientLight intensity={0.2} />
        <pointLight position={[10, 10, 10]} intensity={0.5} color="#FFD700" />
        <pointLight position={[-10, -10, -10]} intensity={0.3} color="#FFA500" />

        <BackgroundSphere />
        <FloatingOrbs />

        <Environment preset="night" />
      </Canvas>
    </div>
  )
}
