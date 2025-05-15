"use client"

import { useRef } from "react"
import { useFrame } from "@react-three/fiber"
import { useGLTF, Float } from "@react-three/drei"
import * as THREE from "three"
import type { GLTF } from "three-stdlib"

type GLTFResult = GLTF & {
  nodes: {
    Island: THREE.Mesh
  }
  materials: {
    IslandMaterial: THREE.MeshStandardMaterial
  }
}

export default function FloatingIsland(props: JSX.IntrinsicElements["group"]) {
  const islandRef = useRef<THREE.Group>(null)
  const { nodes, materials } = useGLTF("/models/floating-island.glb") as GLTFResult

  // Simulate loading a model when we don't have one
  const geometry = new THREE.SphereGeometry(1, 32, 32)
  const material = new THREE.MeshStandardMaterial({
    color: new THREE.Color("#8B4513"),
    roughness: 0.8,
    metalness: 0.2,
  })

  // Create a simple island shape
  const islandGeometry = new THREE.CylinderGeometry(2, 1.5, 0.5, 8)
  const islandMaterial = new THREE.MeshStandardMaterial({
    color: new THREE.Color("#8B4513"),
    roughness: 0.8,
    metalness: 0.2,
  })

  // Create grass on top
  const grassGeometry = new THREE.CylinderGeometry(1.9, 1.9, 0.1, 8)
  const grassMaterial = new THREE.MeshStandardMaterial({
    color: new THREE.Color("#228B22"),
    roughness: 0.9,
    metalness: 0.1,
  })

  // Create rocks
  const rockGeometry = new THREE.DodecahedronGeometry(0.3, 0)
  const rockMaterial = new THREE.MeshStandardMaterial({
    color: new THREE.Color("#696969"),
    roughness: 0.9,
    metalness: 0.2,
  })

  useFrame((state) => {
    if (islandRef.current) {
      // Gentle rotation
      islandRef.current.rotation.y += 0.001
    }
  })

  return (
    <Float
      speed={1.5} // Animation speed
      rotationIntensity={0.2} // Rotation intensity
      floatIntensity={0.5} // Float intensity
    >
      <group ref={islandRef} {...props} dispose={null}>
        {/* Island base */}
        <mesh geometry={islandGeometry} material={islandMaterial} position={[0, 0, 0]} />

        {/* Grass top */}
        <mesh geometry={grassGeometry} material={grassMaterial} position={[0, 0.3, 0]} />

        {/* Rocks */}
        <mesh geometry={rockGeometry} material={rockMaterial} position={[1.2, 0.4, 0.5]} />
        <mesh geometry={rockGeometry} material={rockMaterial} position={[-0.8, 0.4, 0.7]} scale={0.7} />
        <mesh geometry={rockGeometry} material={rockMaterial} position={[0.5, 0.4, -1.1]} scale={0.9} />

        {/* Tree trunk */}
        <mesh position={[0, 0.8, 0]}>
          <cylinderGeometry args={[0.1, 0.15, 0.8, 8]} />
          <meshStandardMaterial color="#8B4513" roughness={0.9} />
        </mesh>

        {/* Tree top */}
        <mesh position={[0, 1.5, 0]}>
          <coneGeometry args={[0.5, 1, 8]} />
          <meshStandardMaterial color="#006400" roughness={0.8} />
        </mesh>
      </group>
    </Float>
  )
}
