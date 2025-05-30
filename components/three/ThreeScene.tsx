"use client"

import { useRef, useEffect, useState } from "react"
import dynamic from "next/dynamic"
import { isBrowser } from "@/utils/dom-safe"

// Dynamically import Three.js components to prevent multiple instances
const DynamicCanvas = dynamic(() => import("@react-three/fiber").then((mod) => mod.Canvas), { ssr: false })
const DynamicOrbitControls = dynamic(() => import("@react-three/drei").then((mod) => mod.OrbitControls), { ssr: false })
const DynamicStars = dynamic(() => import("@react-three/drei").then((mod) => mod.Stars), { ssr: false })
const DynamicText = dynamic(() => import("@react-three/drei").then((mod) => mod.Text), { ssr: false })
const DynamicSparkles = dynamic(() => import("@react-three/drei").then((mod) => mod.Sparkles), { ssr: false })
const DynamicCloud = dynamic(() => import("@react-three/drei").then((mod) => mod.Cloud), { ssr: false })

// Import THREE only once
import * as THREE from "three"

// Use React's useFrame hook directly to prevent multiple imports
import { useFrame } from "@react-three/fiber"

// Main Scene Component
export default function ThreeScene({ scrollY = 0 }) {
  // Add state to track if component is mounted (client-side)
  const [isMounted, setIsMounted] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Only run on client-side
  useEffect(() => {
    if (!isBrowser) {
      return
    }

    try {
      // Check if WebGL is supported
      const canvas = document.createElement("canvas")
      const gl = canvas.getContext("webgl") || canvas.getContext("experimental-webgl")

      if (!gl) {
        throw new Error("WebGL not supported")
      }

      setIsMounted(true)
      setIsLoading(false)
    } catch (err) {
      console.error("ThreeScene: Error during initialization", err)
      setError(err instanceof Error ? err.message : "Unknown error")
      setIsLoading(false)
    }

    return () => {
      setIsMounted(false)
    }
  }, [])

  // Show loading state
  if (isLoading) {
    return (
      <div className="w-full h-screen bg-black flex items-center justify-center text-white">Loading 3D scene...</div>
    )
  }

  // Show error state
  if (error) {
    return (
      <div className="w-full h-screen bg-black flex items-center justify-center text-white">
        <div className="text-center">
          <h3 className="text-xl mb-2">3D Rendering Error</h3>
          <p className="text-red-400">{error}</p>
          <p className="mt-4 text-sm">Try using a different browser or device</p>
        </div>
      </div>
    )
  }

  // Don't render anything on server-side
  if (!isMounted) {
    return <div className="w-full h-screen bg-black" />
  }

  return (
    <div className="w-full h-screen">
      <DynamicCanvas shadows camera={{ position: [0, 5, 15], fov: 60 }}>
        <color attach="background" args={["#000000"]} />
        <fog attach="fog" args={["#000000", 10, 30]} />

        {/* Lighting */}
        <ambientLight intensity={0.2} />
        <directionalLight
          position={[5, 10, 5]}
          intensity={1}
          castShadow
          shadow-mapSize-width={1024}
          shadow-mapSize-height={1024}
        />
        <pointLight position={[0, 8, 0]} intensity={0.8} color="#FFA500" />
        <pointLight position={[8, 3, 8]} intensity={0.6} color="#00BFFF" />
        <pointLight position={[-8, 3, -8]} intensity={0.6} color="#FF4500" />

        {/* Environment */}
        <DynamicStars radius={100} depth={50} count={5000} factor={4} saturation={0} fade speed={1} />

        {/* Scene Elements */}
        <FloatingIsland position={[0, -2, 0]} />
        <FloatingToken position={[0, 4, 0]} scale={1.2} />
        <Characters position={[0, 0, 0]} />

        {/* Background Sparkles */}
        <DynamicSparkles count={100} scale={[20, 10, 20]} size={1} speed={0.2} opacity={0.5} />

        {/* Controls */}
        <DynamicOrbitControls
          enableZoom={false}
          enablePan={false}
          rotateSpeed={0.3}
          autoRotate
          autoRotateSpeed={0.3}
          minPolarAngle={Math.PI / 4}
          maxPolarAngle={Math.PI / 2}
        />
      </DynamicCanvas>
    </div>
  )
}

// Floating Island Component
function FloatingIsland(props) {
  const meshRef = useRef()
  const [hovered, setHovered] = useState(false)

  useFrame(({ clock }) => {
    if (meshRef.current) {
      const t = clock.getElapsedTime()
      meshRef.current.rotation.y = t * 0.1
      meshRef.current.position.y = Math.sin(t * 0.4) * 0.3

      // Add subtle wobble when hovered
      if (hovered) {
        meshRef.current.rotation.z = Math.sin(t * 2) * 0.02
        meshRef.current.rotation.x = Math.cos(t * 2) * 0.02
      }
    }
  })

  return (
    <group {...props}>
      {/* Main island base */}
      <mesh
        ref={meshRef}
        castShadow
        receiveShadow
        onPointerOver={() => setHovered(true)}
        onPointerOut={() => setHovered(false)}
      >
        <cylinderGeometry args={[5, 7, 2, 32]} />
        <meshStandardMaterial color="#654321" roughness={0.8} metalness={0.2} />
      </mesh>

      {/* Island top (grass) */}
      <mesh position={[0, 1, 0]} castShadow receiveShadow>
        <cylinderGeometry args={[5, 5, 0.5, 32]} />
        <meshStandardMaterial color="#228b22" roughness={0.9} metalness={0.1} />
      </mesh>

      {/* Trees */}
      <TreeGroup position={[0, 1.25, 0]} />

      {/* Rocks */}
      <RockGroup position={[0, 1.25, 0]} />

      {/* Water around the island */}
      <mesh position={[0, -1.5, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <circleGeometry args={[15, 32]} />
        <meshStandardMaterial color="#0077be" transparent opacity={0.8} metalness={0.3} roughness={0.2} />
      </mesh>

      {/* Clouds around the island */}
      <DynamicCloud position={[-5, 5, -5]} speed={0.2} opacity={0.5} />
      <DynamicCloud position={[5, 4, 5]} speed={0.1} opacity={0.5} />
      <DynamicCloud position={[0, 6, -8]} speed={0.15} opacity={0.5} />
    </group>
  )
}

// Tree Group Component
function TreeGroup({ position = [0, 0, 0] }) {
  const treePositions = [
    [2, 0, 2],
    [-2, 0, 2],
    [2, 0, -2],
    [-2, 0, -2],
    [0, 0, 3],
    [3, 0, 0],
    [-3, 0, 0],
    [0, 0, -3],
  ]

  return (
    <group position={position}>
      {treePositions.map((pos, index) => (
        <Tree key={index} position={pos} scale={0.5 + Math.random() * 0.3} />
      ))}
    </group>
  )
}

// Tree Component
function Tree({ position, scale = 1 }) {
  const trunkRef = useRef()
  const leavesRef = useRef()

  useFrame(({ clock }) => {
    const t = clock.getElapsedTime()
    if (trunkRef.current && leavesRef.current) {
      // Gentle swaying motion
      trunkRef.current.rotation.x = Math.sin(t + position[0]) * 0.02
      trunkRef.current.rotation.z = Math.cos(t + position[2]) * 0.02

      leavesRef.current.rotation.x = Math.sin(t + position[0]) * 0.03
      leavesRef.current.rotation.z = Math.cos(t + position[2]) * 0.03
    }
  })

  return (
    <group position={position} scale={scale}>
      {/* Trunk */}
      <mesh ref={trunkRef} castShadow>
        <cylinderGeometry args={[0.2, 0.3, 1.5, 8]} />
        <meshStandardMaterial color="#8b4513" roughness={0.8} metalness={0.2} />
      </mesh>

      {/* Leaves */}
      <mesh ref={leavesRef} position={[0, 1.5, 0]} castShadow>
        <coneGeometry args={[1, 2, 8]} />
        <meshStandardMaterial color="#006400" roughness={0.8} metalness={0.1} />
      </mesh>
    </group>
  )
}

// Rock Group Component
function RockGroup({ position = [0, 0, 0] }) {
  const rockPositions = Array(12)
    .fill()
    .map(() => [(Math.random() - 0.5) * 9, 0, (Math.random() - 0.5) * 9])

  return (
    <group position={position}>
      {rockPositions.map((pos, index) => (
        <Rock key={index} position={pos} scale={0.2 + Math.random() * 0.3} />
      ))}
    </group>
  )
}

// Rock Component
function Rock({ position, scale = 1 }) {
  return (
    <mesh
      position={position}
      scale={scale}
      rotation={[Math.random() * Math.PI, Math.random() * Math.PI, Math.random() * Math.PI]}
      castShadow
      receiveShadow
    >
      <dodecahedronGeometry args={[1, 0]} />
      <meshStandardMaterial color="#808080" roughness={0.9} metalness={0.2} />
    </mesh>
  )
}

// Floating Token Component
function FloatingToken(props) {
  const groupRef = useRef()
  const glowRef = useRef()
  const [hovered, setHovered] = useState(false)

  useFrame(({ clock }) => {
    if (groupRef.current) {
      const t = clock.getElapsedTime()

      // Floating animation
      groupRef.current.position.y = Math.sin(t * 0.8) * 0.3 + 0.5

      // Rotation animation
      groupRef.current.rotation.y = t * 0.5

      // Hover effect
      if (hovered) {
        groupRef.current.rotation.z = Math.sin(t * 2) * 0.1
      } else {
        groupRef.current.rotation.z = Math.sin(t * 0.5) * 0.05
      }

      // Glow pulse
      if (glowRef.current) {
        glowRef.current.material.opacity = 0.3 + Math.sin(t * 2) * 0.1
        glowRef.current.scale.set(1 + Math.sin(t * 2) * 0.05, 1 + Math.sin(t * 2) * 0.05, 1 + Math.sin(t * 2) * 0.05)
      }
    }
  })

  return (
    <group {...props} ref={groupRef} onPointerOver={() => setHovered(true)} onPointerOut={() => setHovered(false)}>
      {/* Token body */}
      <mesh castShadow>
        <cylinderGeometry args={[1, 1, 0.2, 32]} />
        <meshStandardMaterial
          color="#FFD700"
          metalness={1}
          roughness={0.1}
          emissive="#FFA500"
          emissiveIntensity={0.5}
        />
      </mesh>

      {/* Token glow */}
      <mesh ref={glowRef}>
        <cylinderGeometry args={[1.2, 1.2, 0.2, 32]} />
        <meshBasicMaterial color="#FFA500" transparent opacity={0.3} side={THREE.BackSide} />
      </mesh>

      {/* Token letter */}
      <mesh position={[0, 0.11, 0]}>
        <DynamicText fontSize={0.5} color="#000000" font="/fonts/Inter-Bold.ttf" anchorX="center" anchorY="middle">
          G
        </DynamicText>
      </mesh>

      {/* Sparkles around the token */}
      <DynamicSparkles count={50} scale={[3, 3, 3]} size={0.4} speed={0.3} color="#FFD700" />
    </group>
  )
}

// Animated Characters
function Characters(props) {
  const groupRef = useRef()

  useFrame(({ clock }) => {
    if (groupRef.current) {
      const t = clock.getElapsedTime()
      groupRef.current.rotation.y = Math.sin(t * 0.2) * 0.5
    }
  })

  return (
    <group ref={groupRef} {...props}>
      <Cat position={[3, 0, 0]} />
      <Wolf position={[-3, 0, 0]} />
    </group>
  )
}

// Cat Character
function Cat({ position }) {
  const catRef = useRef()

  useFrame(({ clock }) => {
    if (catRef.current) {
      const t = clock.getElapsedTime()

      // Bobbing motion
      catRef.current.position.y = Math.sin(t * 1.5) * 0.2

      // Slight rotation
      catRef.current.rotation.y = Math.sin(t * 0.5) * 0.3
      catRef.current.rotation.z = Math.sin(t * 0.7) * 0.05
    }
  })

  return (
    <group position={position} ref={catRef}>
      {/* Body */}
      <mesh castShadow>
        <sphereGeometry args={[0.5, 32, 32]} />
        <meshStandardMaterial color="#FFA500" roughness={0.7} metalness={0.3} />
      </mesh>

      {/* Head */}
      <mesh position={[0, 0.2, 0.4]} castShadow>
        <sphereGeometry args={[0.3, 32, 32]} />
        <meshStandardMaterial color="#FFA500" roughness={0.7} metalness={0.3} />
      </mesh>

      {/* Ears */}
      <mesh position={[-0.15, 0.5, 0.4]} rotation={[0, 0, Math.PI / 4]} castShadow>
        <coneGeometry args={[0.1, 0.2, 32]} />
        <meshStandardMaterial color="#FFA500" roughness={0.7} metalness={0.3} />
      </mesh>

      <mesh position={[0.15, 0.5, 0.4]} rotation={[0, 0, -Math.PI / 4]} castShadow>
        <coneGeometry args={[0.1, 0.2, 32]} />
        <meshStandardMaterial color="#FFA500" roughness={0.7} metalness={0.3} />
      </mesh>

      {/* Eyes */}
      <mesh position={[-0.1, 0.25, 0.65]} castShadow>
        <sphereGeometry args={[0.05, 16, 16]} />
        <meshBasicMaterial color="#000000" />
      </mesh>

      <mesh position={[0.1, 0.25, 0.65]} castShadow>
        <sphereGeometry args={[0.05, 16, 16]} />
        <meshBasicMaterial color="#000000" />
      </mesh>

      {/* Tail */}
      <mesh position={[0, 0, -0.5]} rotation={[Math.PI / 2, 0, 0]} castShadow>
        <cylinderGeometry args={[0.05, 0.05, 0.6, 8]} />
        <meshStandardMaterial color="#FFA500" roughness={0.7} metalness={0.3} />
      </mesh>
    </group>
  )
}

// Wolf Character
function Wolf({ position }) {
  const wolfRef = useRef()

  useFrame(({ clock }) => {
    if (wolfRef.current) {
      const t = clock.getElapsedTime()

      // Bobbing motion
      wolfRef.current.position.y = Math.sin(t * 1.2 + 1) * 0.2

      // Slight rotation
      wolfRef.current.rotation.y = Math.sin(t * 0.5 + 2) * 0.3
      wolfRef.current.rotation.x = Math.sin(t * 0.6) * 0.05
    }
  })

  return (
    <group position={position} ref={wolfRef}>
      {/* Body */}
      <mesh castShadow>
        <sphereGeometry args={[0.6, 32, 32]} />
        <meshStandardMaterial color="#808080" roughness={0.8} metalness={0.2} />
      </mesh>

      {/* Head */}
      <mesh position={[0, 0.2, 0.5]} castShadow>
        <sphereGeometry args={[0.4, 32, 32]} />
        <meshStandardMaterial color="#808080" roughness={0.8} metalness={0.2} />
      </mesh>

      {/* Ears */}
      <mesh position={[-0.2, 0.6, 0.5]} rotation={[0, 0, Math.PI / 4]} castShadow>
        <coneGeometry args={[0.1, 0.3, 32]} />
        <meshStandardMaterial color="#808080" roughness={0.8} metalness={0.2} />
      </mesh>

      <mesh position={[0.2, 0.6, 0.5]} rotation={[0, 0, -Math.PI / 4]} castShadow>
        <coneGeometry args={[0.1, 0.3, 32]} />
        <meshStandardMaterial color="#808080" roughness={0.8} metalness={0.2} />
      </mesh>

      {/* Eyes */}
      <mesh position={[-0.15, 0.25, 0.85]} castShadow>
        <sphereGeometry args={[0.06, 16, 16]} />
        <meshBasicMaterial color="#FFFF00" />
      </mesh>

      <mesh position={[0.15, 0.25, 0.85]} castShadow>
        <sphereGeometry args={[0.06, 16, 16]} />
        <meshBasicMaterial color="#FFFF00" />
      </mesh>

      {/* Snout */}
      <mesh position={[0, 0.1, 0.9]} rotation={[-Math.PI / 2, 0, 0]} castShadow>
        <coneGeometry args={[0.2, 0.4, 32]} />
        <meshStandardMaterial color="#808080" roughness={0.8} metalness={0.2} />
      </mesh>

      {/* Tail */}
      <mesh position={[0, 0.2, -0.6]} rotation={[Math.PI / 2, 0, 0]} castShadow>
        <cylinderGeometry args={[0.1, 0.05, 0.8, 8]} />
        <meshStandardMaterial color="#808080" roughness={0.8} metalness={0.2} />
      </mesh>
    </group>
  )
}
