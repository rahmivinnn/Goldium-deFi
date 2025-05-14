"use client"

import { useEffect, useRef } from "react"
import dynamic from "next/dynamic"

// Dynamically import Three.js to avoid SSR issues
const THREE = dynamic(() => import("three"), { ssr: false })
const OrbitControls = dynamic(
  () => import("three/examples/jsm/controls/OrbitControls").then((mod) => mod.OrbitControls),
  { ssr: false },
)

interface ThreeSceneProps {
  scrollY: number
}

export default function ThreeScene({ scrollY }: ThreeSceneProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const sceneRef = useRef<any>(null)
  const cameraRef = useRef<any>(null)
  const rendererRef = useRef<any>(null)
  const controlsRef = useRef<any>(null)
  const islandRef = useRef<any>(null)
  const catRef = useRef<any>(null)
  const wolfRef = useRef<any>(null)
  const eggRef = useRef<any>(null)
  const animationFrameRef = useRef<number | null>(null)
  const threeLoadedRef = useRef(false)

  useEffect(() => {
    // Only run this effect on the client
    if (typeof window === "undefined") return

    // Dynamically import Three.js
    const initThree = async () => {
      try {
        if (!containerRef.current || threeLoadedRef.current) return
        threeLoadedRef.current = true

        // Import Three.js dynamically
        const THREE = await import("three")
        const { OrbitControls } = await import("three/examples/jsm/controls/OrbitControls")

        // Initialize scene
        const scene = new THREE.Scene()
        sceneRef.current = scene

        // Add fog
        scene.fog = new THREE.FogExp2(0x000000, 0.001)

        // Initialize camera
        const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000)
        camera.position.set(0, 5, 10)
        cameraRef.current = camera

        // Initialize renderer
        const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true })
        renderer.setSize(window.innerWidth, window.innerHeight)
        renderer.setPixelRatio(window.devicePixelRatio)
        renderer.shadowMap.enabled = true
        renderer.shadowMap.type = THREE.PCFSoftShadowMap

        // Updated from deprecated sRGBEncoding
        renderer.outputColorSpace = THREE.SRGBColorSpace

        // Updated from deprecated ACESFilmicToneMapping
        renderer.toneMapping = THREE.ACESFilmicToneMapping
        renderer.toneMappingExposure = 1.2

        containerRef.current.appendChild(renderer.domElement)
        rendererRef.current = renderer

        // Add orbit controls
        const controls = new OrbitControls(camera, renderer.domElement)
        controls.enableDamping = true
        controls.dampingFactor = 0.05
        controls.enableZoom = false
        controls.enablePan = false
        controls.autoRotate = true
        controls.autoRotateSpeed = 0.5
        controls.minPolarAngle = Math.PI / 4
        controls.maxPolarAngle = Math.PI / 2
        controlsRef.current = controls

        // Add ambient light
        const ambientLight = new THREE.AmbientLight(0x404040, 1)
        scene.add(ambientLight)

        // Add directional light (sun)
        const directionalLight = new THREE.DirectionalLight(0xffffff, 1)
        directionalLight.position.set(5, 10, 5)
        directionalLight.castShadow = true
        directionalLight.shadow.mapSize.width = 2048
        directionalLight.shadow.mapSize.height = 2048
        directionalLight.shadow.camera.near = 0.5
        directionalLight.shadow.camera.far = 50
        directionalLight.shadow.camera.left = -20
        directionalLight.shadow.camera.right = 20
        directionalLight.shadow.camera.top = 20
        directionalLight.shadow.camera.bottom = -20
        scene.add(directionalLight)

        // Add point lights
        const pointLight1 = new THREE.PointLight(0xffcc00, 1, 20)
        pointLight1.position.set(0, 5, 0)
        scene.add(pointLight1)

        const pointLight2 = new THREE.PointLight(0x00ccff, 1, 20)
        pointLight2.position.set(10, 5, 10)
        scene.add(pointLight2)

        const pointLight3 = new THREE.PointLight(0xff6600, 1, 15)
        pointLight3.position.set(-10, 3, -5)
        scene.add(pointLight3)

        // Add stars
        const starGeometry = new THREE.BufferGeometry()
        const starMaterial = new THREE.PointsMaterial({
          color: 0xffffff,
          size: 0.1,
        })

        const starVertices = []
        for (let i = 0; i < 10000; i++) {
          const x = (Math.random() - 0.5) * 2000
          const y = (Math.random() - 0.5) * 2000
          const z = (Math.random() - 0.5) * 2000
          starVertices.push(x, y, z)
        }

        starGeometry.setAttribute("position", new THREE.Float32BufferAttribute(starVertices, 3))
        const stars = new THREE.Points(starGeometry, starMaterial)
        scene.add(stars)

        // Create floating island
        const islandGroup = new THREE.Group()

        // Island base
        const islandGeometry = new THREE.CylinderGeometry(5, 7, 2, 32)
        const islandMaterial = new THREE.MeshStandardMaterial({
          color: 0x654321,
          roughness: 0.8,
          metalness: 0.2,
        })
        const islandMesh = new THREE.Mesh(islandGeometry, islandMaterial)
        islandMesh.position.y = -1
        islandMesh.castShadow = true
        islandMesh.receiveShadow = true
        islandGroup.add(islandMesh)

        // Island top (grass)
        const grassGeometry = new THREE.CylinderGeometry(5, 5, 0.5, 32)
        const grassMaterial = new THREE.MeshStandardMaterial({
          color: 0x228b22,
          roughness: 0.9,
          metalness: 0.1,
        })
        const grassMesh = new THREE.Mesh(grassGeometry, grassMaterial)
        grassMesh.position.y = 0
        grassMesh.castShadow = true
        grassMesh.receiveShadow = true
        islandGroup.add(grassMesh)

        // Add some trees
        for (let i = 0; i < 5; i++) {
          const treeGroup = new THREE.Group()

          // Tree trunk
          const trunkGeometry = new THREE.CylinderGeometry(0.2, 0.3, 1.5, 8)
          const trunkMaterial = new THREE.MeshStandardMaterial({
            color: 0x8b4513,
            roughness: 0.8,
            metalness: 0.2,
          })
          const trunkMesh = new THREE.Mesh(trunkGeometry, trunkMaterial)
          trunkMesh.position.y = 0.75
          trunkMesh.castShadow = true
          treeGroup.add(trunkMesh)

          // Tree leaves
          const leavesGeometry = new THREE.ConeGeometry(1, 2, 8)
          const leavesMaterial = new THREE.MeshStandardMaterial({
            color: 0x006400,
            roughness: 0.8,
            metalness: 0.1,
          })
          const leavesMesh = new THREE.Mesh(leavesGeometry, leavesMaterial)
          leavesMesh.position.y = 2
          leavesMesh.castShadow = true
          treeGroup.add(leavesMesh)

          // Position the tree
          const angle = (i / 5) * Math.PI * 2
          const radius = 3.5
          treeGroup.position.x = Math.cos(angle) * radius
          treeGroup.position.z = Math.sin(angle) * radius

          islandGroup.add(treeGroup)
        }

        // Add rocks
        for (let i = 0; i < 8; i++) {
          const rockGeometry = new THREE.DodecahedronGeometry(0.5 * Math.random() + 0.2, 0)
          const rockMaterial = new THREE.MeshStandardMaterial({
            color: 0x808080,
            roughness: 0.9,
            metalness: 0.2,
          })
          const rockMesh = new THREE.Mesh(rockGeometry, rockMaterial)

          // Position the rock
          const angle = (i / 8) * Math.PI * 2
          const radius = 4 * Math.random() + 1
          rockMesh.position.x = Math.cos(angle) * radius
          rockMesh.position.z = Math.sin(angle) * radius
          rockMesh.position.y = 0.2
          rockMesh.rotation.x = Math.random() * Math.PI
          rockMesh.rotation.z = Math.random() * Math.PI
          rockMesh.castShadow = true
          rockMesh.receiveShadow = true

          islandGroup.add(rockMesh)
        }

        scene.add(islandGroup)
        islandRef.current = islandGroup

        // Create cat character
        const catGroup = new THREE.Group()

        // Cat body
        const catBodyGeometry = new THREE.SphereGeometry(0.5, 32, 32)
        const catMaterial = new THREE.MeshStandardMaterial({
          color: 0xffa500,
          roughness: 0.7,
          metalness: 0.3,
        })
        const catBodyMesh = new THREE.Mesh(catBodyGeometry, catMaterial)
        catBodyMesh.castShadow = true
        catGroup.add(catBodyMesh)

        // Cat head
        const catHeadGeometry = new THREE.SphereGeometry(0.3, 32, 32)
        const catHeadMesh = new THREE.Mesh(catHeadGeometry, catMaterial)
        catHeadMesh.position.z = 0.4
        catHeadMesh.position.y = 0.2
        catHeadMesh.castShadow = true
        catGroup.add(catHeadMesh)

        // Cat ears
        const catEarGeometry = new THREE.ConeGeometry(0.15, 0.3, 32)
        const catEarMaterial = new THREE.MeshStandardMaterial({
          color: 0xffa500,
          roughness: 0.7,
          metalness: 0.3,
        })

        const catEarLeft = new THREE.Mesh(catEarGeometry, catEarMaterial)
        catEarLeft.position.z = 0.4
        catEarLeft.position.y = 0.5
        catEarLeft.position.x = -0.15
        catEarLeft.rotation.x = -Math.PI / 4
        catEarLeft.castShadow = true
        catGroup.add(catEarLeft)

        const catEarRight = new THREE.Mesh(catEarGeometry, catEarMaterial)
        catEarRight.position.z = 0.4
        catEarRight.position.y = 0.5
        catEarRight.position.x = 0.15
        catEarRight.rotation.x = -Math.PI / 4
        catEarRight.castShadow = true
        catGroup.add(catEarRight)

        // Cat eyes
        const catEyeGeometry = new THREE.SphereGeometry(0.05, 16, 16)
        const catEyeMaterial = new THREE.MeshStandardMaterial({ color: 0x000000 })

        const catEyeLeft = new THREE.Mesh(catEyeGeometry, catEyeMaterial)
        catEyeLeft.position.z = 0.65
        catEyeLeft.position.y = 0.25
        catEyeLeft.position.x = -0.1
        catGroup.add(catEyeLeft)

        const catEyeRight = new THREE.Mesh(catEyeGeometry, catEyeMaterial)
        catEyeRight.position.z = 0.65
        catEyeRight.position.y = 0.25
        catEyeRight.position.x = 0.1
        catGroup.add(catEyeRight)

        // Cat tail
        const catTailGeometry = new THREE.CylinderGeometry(0.05, 0.05, 0.8, 8)
        catTailGeometry.translate(0, -0.4, 0)
        catTailGeometry.rotateX(Math.PI / 2)
        const catTailMesh = new THREE.Mesh(catTailGeometry, catMaterial)
        catTailMesh.position.z = -0.5
        catTailMesh.position.y = 0.1
        catTailMesh.castShadow = true
        catGroup.add(catTailMesh)

        catGroup.position.set(2, 1, 2)
        scene.add(catGroup)
        catRef.current = catGroup

        // Create wolf character
        const wolfGroup = new THREE.Group()

        // Wolf body
        const wolfBodyGeometry = new THREE.SphereGeometry(0.6, 32, 32)
        const wolfMaterial = new THREE.MeshStandardMaterial({
          color: 0x808080,
          roughness: 0.8,
          metalness: 0.2,
        })
        const wolfBodyMesh = new THREE.Mesh(wolfBodyGeometry, wolfMaterial)
        wolfBodyMesh.castShadow = true
        wolfGroup.add(wolfBodyMesh)

        // Wolf head
        const wolfHeadGeometry = new THREE.SphereGeometry(0.4, 32, 32)
        const wolfHeadMesh = new THREE.Mesh(wolfHeadGeometry, wolfMaterial)
        wolfHeadMesh.position.z = 0.5
        wolfHeadMesh.position.y = 0.2
        wolfHeadMesh.castShadow = true
        wolfGroup.add(wolfHeadMesh)

        // Wolf ears
        const wolfEarGeometry = new THREE.ConeGeometry(0.15, 0.3, 32)

        const wolfEarLeft = new THREE.Mesh(wolfEarGeometry, wolfMaterial)
        wolfEarLeft.position.z = 0.5
        wolfEarLeft.position.y = 0.6
        wolfEarLeft.position.x = -0.2
        wolfEarLeft.rotation.x = -Math.PI / 4
        wolfEarLeft.castShadow = true
        wolfGroup.add(wolfEarLeft)

        const wolfEarRight = new THREE.Mesh(wolfEarGeometry, wolfMaterial)
        wolfEarRight.position.z = 0.5
        wolfEarRight.position.y = 0.6
        wolfEarRight.position.x = 0.2
        wolfEarRight.rotation.x = -Math.PI / 4
        wolfEarRight.castShadow = true
        wolfGroup.add(wolfEarRight)

        // Wolf eyes
        const wolfEyeGeometry = new THREE.SphereGeometry(0.06, 16, 16)
        const wolfEyeMaterial = new THREE.MeshStandardMaterial({ color: 0xffff00 })

        const wolfEyeLeft = new THREE.Mesh(wolfEyeGeometry, wolfEyeMaterial)
        wolfEyeLeft.position.z = 0.85
        wolfEyeLeft.position.y = 0.25
        wolfEyeLeft.position.x = -0.15
        wolfGroup.add(wolfEyeLeft)

        const wolfEyeRight = new THREE.Mesh(wolfEyeGeometry, wolfEyeMaterial)
        wolfEyeRight.position.z = 0.85
        wolfEyeRight.position.y = 0.25
        wolfEyeRight.position.x = 0.15
        wolfGroup.add(wolfEyeRight)

        // Wolf snout
        const wolfSnoutGeometry = new THREE.ConeGeometry(0.2, 0.4, 32)
        wolfSnoutGeometry.rotateX(-Math.PI / 2)
        const wolfSnoutMesh = new THREE.Mesh(wolfSnoutGeometry, wolfMaterial)
        wolfSnoutMesh.position.z = 0.9
        wolfSnoutMesh.position.y = 0.1
        wolfSnoutMesh.castShadow = true
        wolfGroup.add(wolfSnoutMesh)

        // Wolf tail
        const wolfTailGeometry = new THREE.CylinderGeometry(0.1, 0.05, 0.8, 8)
        wolfTailGeometry.translate(0, -0.4, 0)
        wolfTailGeometry.rotateX(Math.PI / 2)
        const wolfTailMesh = new THREE.Mesh(wolfTailGeometry, wolfMaterial)
        wolfTailMesh.position.z = -0.6
        wolfTailMesh.position.y = 0.2
        wolfTailMesh.castShadow = true
        wolfGroup.add(wolfTailMesh)

        wolfGroup.position.set(-2, 1, -2)
        scene.add(wolfGroup)
        wolfRef.current = wolfGroup

        // Create golden egg
        const eggGroup = new THREE.Group()

        // Egg body
        const eggGeometry = new THREE.SphereGeometry(0.8, 32, 32)
        eggGeometry.scale(1, 1.3, 1)
        const eggMaterial = new THREE.MeshStandardMaterial({
          color: 0xffd700,
          roughness: 0.1,
          metalness: 0.9,
        })
        const eggMesh = new THREE.Mesh(eggGeometry, eggMaterial)
        eggMesh.castShadow = true
        eggGroup.add(eggMesh)

        // Add glow effect
        const glowGeometry = new THREE.SphereGeometry(0.85, 32, 32)
        glowGeometry.scale(1, 1.35, 1)
        const glowMaterial = new THREE.MeshBasicMaterial({
          color: 0xffd700,
          transparent: true,
          opacity: 0.3,
        })
        const glowMesh = new THREE.Mesh(glowGeometry, glowMaterial)
        eggGroup.add(glowMesh)

        eggGroup.position.set(0, 2, 0)
        scene.add(eggGroup)
        eggRef.current = eggGroup

        // Animation loop
        const animate = () => {
          if (!sceneRef.current || !cameraRef.current || !rendererRef.current || !controlsRef.current) return

          // Update controls
          controlsRef.current.update()

          // Animate island floating
          if (islandRef.current) {
            islandRef.current.position.y = Math.sin(Date.now() * 0.0005) * 0.3
            islandRef.current.rotation.y = Date.now() * 0.0001
          }

          // Animate cat
          if (catRef.current) {
            catRef.current.position.y = 1 + Math.sin(Date.now() * 0.001 + 1) * 0.2
            catRef.current.rotation.y = Math.sin(Date.now() * 0.0005) * 0.8
            // Add slight bobbing motion
            catRef.current.rotation.z = Math.sin(Date.now() * 0.002) * 0.05
          }

          // Animate wolf
          if (wolfRef.current) {
            wolfRef.current.position.y = 1 + Math.sin(Date.now() * 0.001 + 2) * 0.2
            wolfRef.current.rotation.y = Math.sin(Date.now() * 0.0005 + 2) * 0.8
            // Add slight bobbing motion
            wolfRef.current.rotation.x = Math.sin(Date.now() * 0.003) * 0.05
          }

          // Animate egg
          if (eggRef.current) {
            eggRef.current.position.y = 2 + Math.sin(Date.now() * 0.001) * 0.3
            eggRef.current.rotation.y = Date.now() * 0.0005
            // Add pulsing effect
            const scale = 1 + Math.sin(Date.now() * 0.002) * 0.05
            eggRef.current.scale.set(scale, scale, scale)
          }

          // Animate point lights
          if (sceneRef.current) {
            // Find point lights
            sceneRef.current.traverse((object: any) => {
              if (object instanceof THREE.PointLight) {
                // Make lights pulse
                object.intensity = 1 + Math.sin(Date.now() * 0.002) * 0.3

                // Make lights move slightly
                if (object.position.x > 0) {
                  object.position.x = 10 + Math.sin(Date.now() * 0.001) * 2
                  object.position.z = 10 + Math.cos(Date.now() * 0.001) * 2
                } else {
                  object.position.x = Math.sin(Date.now() * 0.001) * 2
                  object.position.z = Math.cos(Date.now() * 0.001) * 2
                }
              }
            })
          }

          // Render scene
          rendererRef.current.render(sceneRef.current, cameraRef.current)

          // Request next frame
          animationFrameRef.current = requestAnimationFrame(animate)
        }

        animate()

        // Handle window resize
        const handleResize = () => {
          if (!cameraRef.current || !rendererRef.current) return

          cameraRef.current.aspect = window.innerWidth / window.innerHeight
          cameraRef.current.updateProjectionMatrix()
          rendererRef.current.setSize(window.innerWidth, window.innerHeight)
        }

        window.addEventListener("resize", handleResize)

        // Cleanup
        return () => {
          window.removeEventListener("resize", handleResize)

          if (animationFrameRef.current) {
            cancelAnimationFrame(animationFrameRef.current)
          }

          if (rendererRef.current && containerRef.current) {
            containerRef.current.removeChild(rendererRef.current.domElement)
            rendererRef.current.dispose()
          }
        }
      } catch (error) {
        console.error("Error initializing Three.js:", error)
      }
    }

    initThree()
  }, [])

  // Update camera position based on scroll
  useEffect(() => {
    if (!cameraRef.current) return

    // Adjust camera position based on scroll
    cameraRef.current.position.y = 5 + scrollY * 0.01
    cameraRef.current.position.z = 10 - scrollY * 0.01
  }, [scrollY])

  return <div ref={containerRef} className="absolute inset-0" />
}
