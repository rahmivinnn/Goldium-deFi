"use client"

import { useEffect, useRef } from "react"
import * as THREE from "three"
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls"

export default function HeroIsland() {
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!containerRef.current) return

    // Scene setup
    const scene = new THREE.Scene()

    // Camera setup
    const camera = new THREE.PerspectiveCamera(
      75,
      containerRef.current.clientWidth / containerRef.current.clientHeight,
      0.1,
      1000,
    )
    camera.position.set(0, 5, 10)

    // Renderer setup
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true })
    renderer.setSize(containerRef.current.clientWidth, containerRef.current.clientHeight)
    renderer.setPixelRatio(window.devicePixelRatio)
    renderer.outputColorSpace = THREE.SRGBColorSpace
    containerRef.current.appendChild(renderer.domElement)

    // Controls
    const controls = new OrbitControls(camera, renderer.domElement)
    controls.enableDamping = true
    controls.dampingFactor = 0.05
    controls.enableZoom = false
    controls.autoRotate = true
    controls.autoRotateSpeed = 0.5

    // Lighting
    const ambientLight = new THREE.AmbientLight(0x404040, 2)
    scene.add(ambientLight)

    const directionalLight = new THREE.DirectionalLight(0xffffff, 2)
    directionalLight.position.set(1, 1, 1)
    scene.add(directionalLight)

    const goldLight = new THREE.PointLight(0xffd700, 2, 10)
    goldLight.position.set(0, 2, 0)
    scene.add(goldLight)

    // Create floating island
    const islandGeometry = new THREE.CylinderGeometry(3, 4, 1, 32)
    const islandMaterial = new THREE.MeshStandardMaterial({
      color: 0x654321,
      roughness: 0.8,
      metalness: 0.2,
    })
    const island = new THREE.Mesh(islandGeometry, islandMaterial)
    scene.add(island)

    // Add grass on top
    const grassGeometry = new THREE.CylinderGeometry(3, 3, 0.2, 32)
    const grassMaterial = new THREE.MeshStandardMaterial({
      color: 0x228b22,
      roughness: 1,
      metalness: 0,
    })
    const grass = new THREE.Mesh(grassGeometry, grassMaterial)
    grass.position.y = 0.6
    island.add(grass)

    // Add rocks
    const createRock = (x: number, z: number, scale: number) => {
      const rockGeometry = new THREE.DodecahedronGeometry(scale, 0)
      const rockMaterial = new THREE.MeshStandardMaterial({
        color: 0x808080,
        roughness: 0.8,
        metalness: 0.2,
      })
      const rock = new THREE.Mesh(rockGeometry, rockMaterial)
      rock.position.set(x, 0.6, z)
      rock.rotation.set(Math.random(), Math.random(), Math.random())
      island.add(rock)
    }

    createRock(2, 1, 0.4)
    createRock(-1.5, 1.5, 0.3)
    createRock(1, -2, 0.5)

    // Add GOLD token
    const tokenGeometry = new THREE.OctahedronGeometry(1, 0)
    const tokenMaterial = new THREE.MeshStandardMaterial({
      color: 0xffd700,
      roughness: 0.1,
      metalness: 1,
      emissive: 0xffa500,
      emissiveIntensity: 0.2,
    })
    const token = new THREE.Mesh(tokenGeometry, tokenMaterial)
    token.position.y = 3
    scene.add(token)

    // Animation loop
    let time = 0
    const animate = () => {
      requestAnimationFrame(animate)

      time += 0.01

      // Float the island
      island.position.y = Math.sin(time * 0.5) * 0.2

      // Rotate and float the token
      token.rotation.y += 0.01
      token.position.y = 3 + Math.sin(time) * 0.3

      // Pulse the gold light
      goldLight.intensity = 2 + Math.sin(time * 2) * 0.5

      controls.update()
      renderer.render(scene, camera)
    }

    animate()

    // Handle resize
    const handleResize = () => {
      if (!containerRef.current) return

      camera.aspect = containerRef.current.clientWidth / containerRef.current.clientHeight
      camera.updateProjectionMatrix()
      renderer.setSize(containerRef.current.clientWidth, containerRef.current.clientHeight)
    }

    window.addEventListener("resize", handleResize)

    // Cleanup
    return () => {
      window.removeEventListener("resize", handleResize)
      if (containerRef.current) {
        containerRef.current.removeChild(renderer.domElement)
      }
    }
  }, [])

  return <div ref={containerRef} className="w-full h-full" />
}
