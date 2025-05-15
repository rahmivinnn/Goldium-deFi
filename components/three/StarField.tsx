"use client"

import { useRef, useMemo } from "react"
import { useFrame } from "@react-three/fiber"
import * as THREE from "three"

export default function StarField({ count = 1000 }) {
  const mesh = useRef<THREE.Points>(null)

  // Create a random star field
  const particlesPosition = useMemo(() => {
    const positions = new Float32Array(count * 3)

    for (let i = 0; i < count; i++) {
      const i3 = i * 3
      positions[i3] = (Math.random() - 0.5) * 50
      positions[i3 + 1] = (Math.random() - 0.5) * 50
      positions[i3 + 2] = (Math.random() - 0.5) * 50
    }

    return positions
  }, [count])

  // Create a random star size
  const particlesSizes = useMemo(() => {
    const sizes = new Float32Array(count)

    for (let i = 0; i < count; i++) {
      sizes[i] = Math.random() * 0.5 + 0.1
    }

    return sizes
  }, [count])

  useFrame((state) => {
    if (mesh.current) {
      mesh.current.rotation.x += 0.0001
      mesh.current.rotation.y += 0.0001
    }
  })

  return (
    <points ref={mesh}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          count={particlesPosition.length / 3}
          array={particlesPosition}
          itemSize={3}
        />
        <bufferAttribute attach="attributes-size" count={particlesSizes.length} array={particlesSizes} itemSize={1} />
      </bufferGeometry>
      <pointsMaterial size={0.1} sizeAttenuation transparent color="#ffffff" blending={THREE.AdditiveBlending} />
    </points>
  )
}
