"use client"

import { useRef } from "react"
import { Canvas, useFrame } from "@react-three/fiber"
import { Sphere, MeshDistortMaterial, Float, Environment, Sparkles, Trail } from "@react-three/drei"
import type * as THREE from "three"

function GoldenSphere({ position = [0, 0, 0], size = 1 }) {
  const sphereRef = useRef<THREE.Mesh>(null)

  useFrame(({ clock }) => {
    if (sphereRef.current) {
      sphereRef.current.rotation.x = clock.getElapsedTime() * 0.2
      sphereRef.current.rotation.y = clock.getElapsedTime() * 0.3
    }
  })

  return (
    <Float speed={1.5} rotationIntensity={0.2} floatIntensity={0.5}>
      <Trail width={1} color="#FFD700" length={5} decay={1} local={false} attenuation={(width) => width}>
        <Sphere ref={sphereRef} args={[size, 32, 32]} position={position}>
          <meshStandardMaterial color="#FFD700" metalness={1} roughness={0.1} envMapIntensity={1} />
        </Sphere>
      </Trail>
    </Float>
  )
}

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
      {[1, 2, 3, 4, 5].map((i) => (
        <mesh key={i} position={[0, 0, 0]} rotation={[Math.PI / 2, 0, 0]}>
          <torusGeometry args={[i * 1.5, 0.05, 16, 100]} />
          <meshStandardMaterial
            color={i % 2 === 0 ? "#FFD700" : "#FFA500"}
            metalness={0.8}
            roughness={0.2}
            opacity={0.7}
            transparent
          />
        </mesh>
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
    <Sphere ref={sphereRef} args={[15, 32, 32]} position={[0, 0, -20]}>
      <MeshDistortMaterial
        color="#111111"
        attach="material"
        distort={0.3}
        speed={1}
        roughness={0.8}
        metalness={0.2}
        opacity={0.7}
        transparent
      />
    </Sphere>
  )
}

export default function CTABackground() {
  return (
    <div className="absolute inset-0 -z-10">
      <Canvas camera={{ position: [0, 0, 15], fov: 75 }}>
        <ambientLight intensity={0.2} />
        <pointLight position={[10, 10, 10]} intensity={0.8} color="#FFD700" />
        <pointLight position={[-10, -10, -10]} intensity={0.5} color="#FFA500" />

        <BackgroundSphere />
        <GoldenRings />

        <GoldenSphere position={[3, 2, 0]} size={1.2} />
        <GoldenSphere position={[-4, -2, 2]} size={0.8} />
        <GoldenSphere position={[0, -3, 1]} size={1} />

        <Sparkles count={100} scale={20} size={1} speed={0.3} opacity={0.5} color="#FFD700" />

        <Environment preset="night" />
      </Canvas>
    </div>
  )
}
