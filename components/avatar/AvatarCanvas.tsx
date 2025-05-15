"use client"

import type React from "react"

import { useRef, useEffect, useState } from "react"
import type { AvatarOptions } from "@/components/avatar/AvatarCreator"
import { motion } from "framer-motion"

interface AvatarCanvasProps {
  options: AvatarOptions
}

export default function AvatarCanvas({ options }: AvatarCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [isRotating, setIsRotating] = useState(false)
  const [rotationAngle, setRotationAngle] = useState(0)
  const [scale, setScale] = useState(1)
  const [position, setPosition] = useState({ x: 0, y: 0 })
  const [showParticles, setShowParticles] = useState(false)
  const particlesRef = useRef<HTMLCanvasElement>(null)
  const animationRef = useRef<number | null>(null)

  // Effect for drawing the avatar
  useEffect(() => {
    if (!canvasRef.current) return

    const canvas = canvasRef.current
    const ctx = canvas.getContext("2d")
    if (!ctx) return

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height)

    // Save the current state
    ctx.save()

    // Apply rotation if needed
    if (rotationAngle !== 0) {
      ctx.translate(canvas.width / 2, canvas.height / 2)
      ctx.rotate((rotationAngle * Math.PI) / 180)
      ctx.translate(-canvas.width / 2, -canvas.height / 2)
    }

    // Draw backdrop
    drawBackdrop(ctx, options.backdrop)

    // Draw avatar base
    drawAvatarBase(ctx, options.skin)

    // Draw eyes
    drawEyes(ctx, options.eyes)

    // Draw helmet
    drawHelmet(ctx, options.helmet)

    // Draw GOLD logo
    drawLogo(ctx)

    // Restore the saved state
    ctx.restore()
  }, [options, rotationAngle])

  // Effect for particle animation
  useEffect(() => {
    if (!particlesRef.current || !showParticles) return

    const canvas = particlesRef.current
    const ctx = canvas.getContext("2d")
    if (!ctx) return

    const particles: Particle[] = []
    const particleCount = 50

    // Create particles
    for (let i = 0; i < particleCount; i++) {
      particles.push({
        x: canvas.width / 2,
        y: canvas.height / 2,
        size: Math.random() * 5 + 1,
        speedX: (Math.random() - 0.5) * 3,
        speedY: (Math.random() - 0.5) * 3,
        color: getParticleColor(options.skin),
        opacity: 1,
      })
    }

    // Animation function
    function animate() {
      ctx.clearRect(0, 0, canvas.width, canvas.height)

      // Update and draw particles
      for (let i = 0; i < particles.length; i++) {
        const p = particles[i]
        p.x += p.speedX
        p.y += p.speedY
        p.opacity -= 0.01

        if (p.opacity <= 0) {
          // Reset particle
          p.x = canvas.width / 2
          p.y = canvas.height / 2
          p.opacity = 1
        }

        ctx.beginPath()
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2)
        ctx.fillStyle = `rgba(${p.color}, ${p.opacity})`
        ctx.fill()
      }

      animationRef.current = requestAnimationFrame(animate)
    }

    animate()

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current)
      }
    }
  }, [showParticles, options.skin])

  // Function to get particle color based on skin
  const getParticleColor = (skin: string) => {
    switch (skin) {
      case "gold":
        return "255, 215, 0"
      case "lava":
        return "255, 69, 0"
      case "crystal":
        return "135, 206, 235"
      case "void":
        return "75, 0, 130"
      default:
        return "255, 215, 0"
    }
  }

  // Interactive functions
  const handleMouseEnter = () => {
    setScale(1.05)
  }

  const handleMouseLeave = () => {
    setScale(1)
    setPosition({ x: 0, y: 0 })
  }

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!canvasRef.current) return

    const rect = canvasRef.current.getBoundingClientRect()
    const x = e.clientX - rect.left
    const y = e.clientY - rect.top

    // Calculate position relative to center
    const centerX = rect.width / 2
    const centerY = rect.height / 2

    // Limit movement to a small range
    const moveX = ((x - centerX) / centerX) * 10
    const moveY = ((y - centerY) / centerY) * 10

    setPosition({ x: moveX, y: moveY })
  }

  const handleClick = () => {
    setIsRotating(true)
    setShowParticles(true)

    // Rotate 360 degrees
    let angle = 0
    const rotate = () => {
      angle += 5
      setRotationAngle(angle)

      if (angle < 360) {
        requestAnimationFrame(rotate)
      } else {
        setRotationAngle(0)
        setIsRotating(false)

        // Hide particles after 2 seconds
        setTimeout(() => {
          setShowParticles(false)
        }, 2000)
      }
    }

    rotate()
  }

  const drawBackdrop = (ctx: CanvasRenderingContext2D, backdrop: string) => {
    const width = ctx.canvas.width
    const height = ctx.canvas.height

    switch (backdrop) {
      case "nebula":
        // Create a purple/blue nebula background
        const nebulaGradient = ctx.createRadialGradient(width / 2, height / 2, 0, width / 2, height / 2, width / 2)
        nebulaGradient.addColorStop(0, "#4B0082")
        nebulaGradient.addColorStop(0.5, "#191970")
        nebulaGradient.addColorStop(1, "#000000")
        ctx.fillStyle = nebulaGradient
        ctx.fillRect(0, 0, width, height)

        // Add some stars
        for (let i = 0; i < 100; i++) {
          const x = Math.random() * width
          const y = Math.random() * height
          const radius = Math.random() * 1.5
          ctx.beginPath()
          ctx.arc(x, y, radius, 0, Math.PI * 2)
          ctx.fillStyle = "white"
          ctx.fill()
        }
        break

      case "jungle":
        // Create a green jungle background
        const jungleGradient = ctx.createLinearGradient(0, 0, 0, height)
        jungleGradient.addColorStop(0, "#006400")
        jungleGradient.addColorStop(1, "#228B22")
        ctx.fillStyle = jungleGradient
        ctx.fillRect(0, 0, width, height)

        // Add some simple leaf shapes
        ctx.fillStyle = "#32CD32"
        for (let i = 0; i < 20; i++) {
          const x = Math.random() * width
          const y = Math.random() * height
          const size = 20 + Math.random() * 30
          ctx.beginPath()
          ctx.ellipse(x, y, size, size / 2, Math.random() * Math.PI, 0, Math.PI * 2)
          ctx.fill()
        }
        break

      case "ruins":
        // Create a golden ruins background
        const ruinsGradient = ctx.createLinearGradient(0, 0, 0, height)
        ruinsGradient.addColorStop(0, "#8B4513")
        ruinsGradient.addColorStop(1, "#A0522D")
        ctx.fillStyle = ruinsGradient
        ctx.fillRect(0, 0, width, height)

        // Add some simple column shapes
        ctx.fillStyle = "#D2B48C"
        for (let i = 0; i < 5; i++) {
          const x = (width / 6) * (i + 1)
          const columnWidth = 20
          const columnHeight = 150 + Math.random() * 50
          ctx.fillRect(x - columnWidth / 2, height - columnHeight, columnWidth, columnHeight)

          // Column top
          ctx.fillRect(x - columnWidth - 5, height - columnHeight - 10, columnWidth * 2 + 10, 20)
        }
        break

      default:
        // Plain black background
        ctx.fillStyle = "#000000"
        ctx.fillRect(0, 0, width, height)
        break
    }
  }

  const drawAvatarBase = (ctx: CanvasRenderingContext2D, skin: string) => {
    const width = ctx.canvas.width
    const height = ctx.canvas.height
    const centerX = width / 2
    const centerY = height / 2
    const radius = width * 0.3

    // Draw the base circle
    ctx.beginPath()
    ctx.arc(centerX, centerY, radius, 0, Math.PI * 2)

    // Set fill style based on skin type
    switch (skin) {
      case "gold":
        const goldGradient = ctx.createRadialGradient(
          centerX - radius / 3,
          centerY - radius / 3,
          0,
          centerX,
          centerY,
          radius,
        )
        goldGradient.addColorStop(0, "#FFD700")
        goldGradient.addColorStop(0.7, "#DAA520")
        goldGradient.addColorStop(1, "#B8860B")
        ctx.fillStyle = goldGradient
        break

      case "lava":
        const lavaGradient = ctx.createRadialGradient(centerX, centerY, 0, centerX, centerY, radius)
        lavaGradient.addColorStop(0, "#FF4500")
        lavaGradient.addColorStop(0.7, "#FF0000")
        lavaGradient.addColorStop(1, "#8B0000")
        ctx.fillStyle = lavaGradient
        break

      case "crystal":
        const crystalGradient = ctx.createRadialGradient(
          centerX - radius / 2,
          centerY - radius / 2,
          0,
          centerX,
          centerY,
          radius,
        )
        crystalGradient.addColorStop(0, "#E0FFFF")
        crystalGradient.addColorStop(0.5, "#87CEEB")
        crystalGradient.addColorStop(1, "#4169E1")
        ctx.fillStyle = crystalGradient
        break

      case "void":
        const voidGradient = ctx.createRadialGradient(centerX, centerY, 0, centerX, centerY, radius)
        voidGradient.addColorStop(0, "#4B0082")
        voidGradient.addColorStop(0.7, "#2E0854")
        voidGradient.addColorStop(1, "#120524")
        ctx.fillStyle = voidGradient
        break

      default:
        ctx.fillStyle = "#FFD700"
        break
    }

    ctx.fill()

    // Add a subtle shine effect
    ctx.beginPath()
    ctx.ellipse(centerX - radius / 3, centerY - radius / 3, radius / 4, radius / 6, Math.PI / 4, 0, Math.PI * 2)
    ctx.fillStyle = "rgba(255, 255, 255, 0.3)"
    ctx.fill()
  }

  const drawEyes = (ctx: CanvasRenderingContext2D, eyeType: string) => {
    const width = ctx.canvas.width
    const height = ctx.canvas.height
    const centerX = width / 2
    const centerY = height / 2
    const radius = width * 0.3

    // Eye positions
    const eyeDistance = radius * 0.5
    const leftEyeX = centerX - eyeDistance
    const rightEyeX = centerX + eyeDistance
    const eyeY = centerY - radius * 0.1
    const eyeSize = radius * 0.15

    switch (eyeType) {
      case "glow":
        // Glowing eyes
        // Left eye glow
        const leftGlowGradient = ctx.createRadialGradient(leftEyeX, eyeY, 0, leftEyeX, eyeY, eyeSize * 1.5)
        leftGlowGradient.addColorStop(0, "rgba(255, 255, 255, 0.8)")
        leftGlowGradient.addColorStop(0.5, "rgba(0, 255, 255, 0.5)")
        leftGlowGradient.addColorStop(1, "rgba(0, 255, 255, 0)")
        ctx.fillStyle = leftGlowGradient
        ctx.beginPath()
        ctx.arc(leftEyeX, eyeY, eyeSize * 1.5, 0, Math.PI * 2)
        ctx.fill()

        // Right eye glow
        const rightGlowGradient = ctx.createRadialGradient(rightEyeX, eyeY, 0, rightEyeX, eyeY, eyeSize * 1.5)
        rightGlowGradient.addColorStop(0, "rgba(255, 255, 255, 0.8)")
        rightGlowGradient.addColorStop(0.5, "rgba(0, 255, 255, 0.5)")
        rightGlowGradient.addColorStop(1, "rgba(0, 255, 255, 0)")
        ctx.fillStyle = rightGlowGradient
        ctx.beginPath()
        ctx.arc(rightEyeX, eyeY, eyeSize * 1.5, 0, Math.PI * 2)
        ctx.fill()

        // Left eye
        ctx.beginPath()
        ctx.arc(leftEyeX, eyeY, eyeSize, 0, Math.PI * 2)
        ctx.fillStyle = "rgba(0, 255, 255, 0.8)"
        ctx.fill()

        // Right eye
        ctx.beginPath()
        ctx.arc(rightEyeX, eyeY, eyeSize, 0, Math.PI * 2)
        ctx.fillStyle = "rgba(0, 255, 255, 0.8)"
        ctx.fill()
        break

      case "cute":
        // Cute eyes
        // Left eye
        ctx.beginPath()
        ctx.arc(leftEyeX, eyeY, eyeSize, 0, Math.PI * 2)
        ctx.fillStyle = "white"
        ctx.fill()

        // Left pupil
        ctx.beginPath()
        ctx.arc(leftEyeX, eyeY, eyeSize * 0.5, 0, Math.PI * 2)
        ctx.fillStyle = "black"
        ctx.fill()

        // Left highlight
        ctx.beginPath()
        ctx.arc(leftEyeX + eyeSize * 0.25, eyeY - eyeSize * 0.25, eyeSize * 0.15, 0, Math.PI * 2)
        ctx.fillStyle = "white"
        ctx.fill()

        // Right eye
        ctx.beginPath()
        ctx.arc(rightEyeX, eyeY, eyeSize, 0, Math.PI * 2)
        ctx.fillStyle = "white"
        ctx.fill()

        // Right pupil
        ctx.beginPath()
        ctx.arc(rightEyeX, eyeY, eyeSize * 0.5, 0, Math.PI * 2)
        ctx.fillStyle = "black"
        ctx.fill()

        // Right highlight
        ctx.beginPath()
        ctx.arc(rightEyeX + eyeSize * 0.25, eyeY - eyeSize * 0.25, eyeSize * 0.15, 0, Math.PI * 2)
        ctx.fillStyle = "white"
        ctx.fill()
        break

      case "cyber":
        // Cyber eyes
        // Left eye
        ctx.beginPath()
        ctx.rect(leftEyeX - eyeSize, eyeY - eyeSize / 2, eyeSize * 2, eyeSize)
        ctx.fillStyle = "black"
        ctx.fill()

        // Left eye glow
        ctx.beginPath()
        ctx.rect(leftEyeX - eyeSize * 0.8, eyeY - eyeSize * 0.3, eyeSize * 1.6, eyeSize * 0.6)
        ctx.fillStyle = "red"
        ctx.fill()

        // Right eye
        ctx.beginPath()
        ctx.rect(rightEyeX - eyeSize, eyeY - eyeSize / 2, eyeSize * 2, eyeSize)
        ctx.fillStyle = "black"
        ctx.fill()

        // Right eye glow
        ctx.beginPath()
        ctx.rect(rightEyeX - eyeSize * 0.8, eyeY - eyeSize * 0.3, eyeSize * 1.6, eyeSize * 0.6)
        ctx.fillStyle = "red"
        ctx.fill()
        break

      default:
        // Default eyes
        // Left eye
        ctx.beginPath()
        ctx.arc(leftEyeX, eyeY, eyeSize, 0, Math.PI * 2)
        ctx.fillStyle = "white"
        ctx.fill()

        // Left pupil
        ctx.beginPath()
        ctx.arc(leftEyeX, eyeY, eyeSize * 0.5, 0, Math.PI * 2)
        ctx.fillStyle = "black"
        ctx.fill()

        // Right eye
        ctx.beginPath()
        ctx.arc(rightEyeX, eyeY, eyeSize, 0, Math.PI * 2)
        ctx.fillStyle = "white"
        ctx.fill()

        // Right pupil
        ctx.beginPath()
        ctx.arc(rightEyeX, eyeY, eyeSize * 0.5, 0, Math.PI * 2)
        ctx.fillStyle = "black"
        ctx.fill()
        break
    }
  }

  const drawHelmet = (ctx: CanvasRenderingContext2D, helmet: string) => {
    const width = ctx.canvas.width
    const height = ctx.canvas.height
    const centerX = width / 2
    const centerY = height / 2
    const radius = width * 0.3

    switch (helmet) {
      case "eth":
        // Ethereum crown
        ctx.beginPath()
        ctx.moveTo(centerX - radius * 0.8, centerY - radius * 0.8)
        ctx.lineTo(centerX, centerY - radius * 1.5)
        ctx.lineTo(centerX + radius * 0.8, centerY - radius * 0.8)
        ctx.lineTo(centerX, centerY - radius * 1.1)
        ctx.closePath()

        const ethGradient = ctx.createLinearGradient(centerX, centerY - radius * 1.5, centerX, centerY - radius * 0.8)
        ethGradient.addColorStop(0, "#8A2BE2")
        ethGradient.addColorStop(1, "#4B0082")
        ctx.fillStyle = ethGradient
        ctx.fill()

        // Add some shine
        ctx.beginPath()
        ctx.moveTo(centerX - radius * 0.4, centerY - radius * 1.1)
        ctx.lineTo(centerX, centerY - radius * 1.4)
        ctx.lineTo(centerX + radius * 0.1, centerY - radius * 1.2)
        ctx.closePath()
        ctx.fillStyle = "rgba(255, 255, 255, 0.3)"
        ctx.fill()
        break

      case "sol":
        // Solana cap
        // Cap base
        ctx.beginPath()
        ctx.arc(centerX, centerY, radius * 1.1, Math.PI, 2 * Math.PI)
        ctx.lineTo(centerX + radius * 1.1, centerY - radius * 0.2)
        ctx.lineTo(centerX - radius * 1.1, centerY - radius * 0.2)
        ctx.closePath()

        const solGradient = ctx.createLinearGradient(centerX, centerY - radius * 1.1, centerX, centerY - radius * 0.2)
        solGradient.addColorStop(0, "#00FFA3")
        solGradient.addColorStop(1, "#03E1FF")
        ctx.fillStyle = solGradient
        ctx.fill()

        // Cap visor
        ctx.beginPath()
        ctx.ellipse(centerX, centerY - radius * 0.2, radius * 1.2, radius * 0.2, 0, 0, Math.PI)
        ctx.fillStyle = "#1E1E1E"
        ctx.fill()
        break

      case "none":
      default:
        // No helmet
        break
    }
  }

  const drawLogo = (ctx: CanvasRenderingContext2D) => {
    const width = ctx.canvas.width
    const height = ctx.canvas.height
    const centerX = width / 2
    const centerY = height / 2
    const radius = width * 0.3

    // Draw a small GOLD logo in the bottom right
    const logoSize = radius * 0.5
    const logoX = width - logoSize - 10
    const logoY = height - logoSize - 10

    // Create an image object for the logo
    const logo = new Image()
    logo.src = "/goldium-logo.png"
    logo.crossOrigin = "anonymous"

    // Draw the logo when it's loaded
    logo.onload = () => {
      ctx.drawImage(logo, logoX, logoY, logoSize, logoSize)
    }

    // Fallback if logo doesn't load
    logo.onerror = () => {
      // Draw a simple "G" as fallback
      ctx.font = `bold ${logoSize * 0.8}px Arial`
      ctx.fillStyle = "#FFD700"
      ctx.textAlign = "center"
      ctx.textBaseline = "middle"
      ctx.fillText("G", logoX + logoSize / 2, logoY + logoSize / 2)
    }
  }

  // Add token count display
  const formatTokenCount = (count: number) => {
    if (count >= 1_000_000_000) {
      return `${(count / 1_000_000_000).toFixed(1)}B`
    }
    if (count >= 1_000_000) {
      return `${(count / 1_000_000).toFixed(1)}M`
    }
    if (count >= 1_000) {
      return `${(count / 1_000).toFixed(1)}K`
    }
    return count.toString()
  }

  return (
    <div className="relative w-full aspect-square max-w-md mx-auto">
      <motion.div
        className="relative w-full h-full bg-black rounded-lg overflow-hidden shadow-lg shadow-amber-900/20"
        animate={{
          scale,
          x: position.x,
          y: position.y,
        }}
        transition={{ type: "spring", stiffness: 300, damping: 20 }}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        onMouseMove={handleMouseMove}
        onClick={handleClick}
        whileTap={{ scale: 0.95 }}
      >
        <canvas ref={canvasRef} width={512} height={512} className="w-full h-full" id="avatar-canvas" />
        <canvas
          ref={particlesRef}
          width={512}
          height={512}
          className="absolute top-0 left-0 w-full h-full pointer-events-none"
        />

        {/* Interactive tooltip */}
        <div className="absolute bottom-4 left-0 right-0 text-center text-white text-sm opacity-70 pointer-events-none">
          Click to animate
        </div>

        {/* Token count badge */}
        <div className="absolute top-4 right-4 bg-gradient-to-r from-yellow-600 to-amber-800 px-3 py-1 rounded-full text-black font-bold text-sm">
          {formatTokenCount(1_000_000)} GOLD
        </div>
      </motion.div>
    </div>
  )
}

// Type for particles
interface Particle {
  x: number
  y: number
  size: number
  speedX: number
  speedY: number
  color: string
  opacity: number
}
