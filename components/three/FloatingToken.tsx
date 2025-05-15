"use client"

import { useRef } from "react"
import { useFrame } from "@react-three/fiber"
import { Float, Html } from "@react-three/drei"
import * as THREE from "three"

export default function FloatingToken(props: JSX.IntrinsicElements["group"]) {
  const tokenRef = useRef<THREE.Group>(null)

  // Create a simple token shape
  const tokenGeometry = new THREE.CylinderGeometry(0.8, 0.8, 0.1, 32)
  const tokenMaterial = new THREE.MeshStandardMaterial({
    color: new THREE.Color("#FFD700"),
    roughness: 0.1,
    metalness: 0.9,
    emissive: new THREE.Color("#FFD700"),
    emissiveIntensity: 0.2,
  })

  // Create a simple token edge
  const tokenEdgeGeometry = new THREE.TorusGeometry(0.8, 0.05, 16, 100)
  const tokenEdgeMaterial = new THREE.MeshStandardMaterial({
    color: new THREE.Color("#FFA500"),
    roughness: 0.1,
    metalness: 0.9,
  })

  useFrame((state) => {
    if (tokenRef.current) {
      // Gentle rotation
      tokenRef.current.rotation.y += 0.01
    }
  })

  return (
    <Float
      speed={2} // Animation speed
      rotationIntensity={0.3} // Rotation intensity
      floatIntensity={0.7} // Float intensity
    >
      <group ref={tokenRef} {...props} dispose={null}>
        {/* Token body */}
        <mesh geometry={tokenGeometry} material={tokenMaterial} position={[0, 0, 0]} />

        {/* Token edge */}
        <mesh geometry={tokenEdgeGeometry} material={tokenEdgeMaterial} rotation={[Math.PI / 2, 0, 0]} />

        {/* Token text */}
        <Html position={[0, 0, 0.06]} transform occlude>
          <div className="flex items-center justify-center w-16 h-16 text-black font-bold text-xl">G</div>
        </Html>
      </group>
    </Float>
  )
}
