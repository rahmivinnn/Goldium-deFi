import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function truncateAddress(address: string, startLength = 6, endLength = 4): string {
  if (!address) return ""
  if (address.length <= startLength + endLength) return address
  return `${address.slice(0, startLength)}...${address.slice(-endLength)}`
}

export function formatBalance(balance: number | undefined, decimals = 2): string {
  if (balance === undefined) return "0"
  return balance.toFixed(decimals)
}

export function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

export function getRandomInt(min: number, max: number): number {
  min = Math.ceil(min)
  max = Math.floor(max)
  return Math.floor(Math.random() * (max - min + 1)) + min
}

export function generateStars(
  count: number,
): { x: number; y: number; size: number; opacity: number; delay: number; duration: number }[] {
  const stars = []
  for (let i = 0; i < count; i++) {
    stars.push({
      x: Math.random() * 100,
      y: Math.random() * 100,
      size: Math.random() * 2 + 1,
      opacity: Math.random() * 0.7 + 0.3,
      delay: Math.random() * 3,
      duration: Math.random() * 3 + 2,
    })
  }
  return stars
}

export function generateParticles(count: number): {
  x: number
  y: number
  size: number
  opacity: number
  delay: number
  duration: number
  moveX: number
  moveY: number
}[] {
  const particles = []
  for (let i = 0; i < count; i++) {
    particles.push({
      x: 50 + (Math.random() * 40 - 20),
      y: 50 + (Math.random() * 40 - 20),
      size: Math.random() * 10 + 5,
      opacity: Math.random() * 0.5 + 0.2,
      delay: Math.random() * 5,
      duration: Math.random() * 5 + 3,
      moveX: Math.random() * 30 - 15,
      moveY: Math.random() * 30 - 15,
    })
  }
  return particles
}
