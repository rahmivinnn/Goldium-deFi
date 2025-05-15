"use client"

import { useState } from "react"
import AvatarCanvas from "@/components/avatar/AvatarCanvas"
import AvatarControls from "@/components/avatar/AvatarControls"
import { GOLD_TOKEN } from "@/constants/tokens"

export type AvatarOptions = {
  skin: "gold" | "lava" | "crystal" | "void"
  eyes: "glow" | "cute" | "cyber"
  helmet: "eth" | "sol" | "none"
  backdrop: "nebula" | "jungle" | "ruins" | "none"
}

export default function AvatarCreator() {
  const [options, setOptions] = useState<AvatarOptions>({
    skin: "gold",
    eyes: "glow",
    helmet: "eth",
    backdrop: "nebula",
  })

  const handleOptionChange = (category: keyof AvatarOptions, value: string) => {
    setOptions((prev) => ({
      ...prev,
      [category]: value,
    }))
  }

  const handleRandomize = () => {
    const skins = ["gold", "lava", "crystal", "void"]
    const eyes = ["glow", "cute", "cyber"]
    const helmets = ["eth", "sol", "none"]
    const backdrops = ["nebula", "jungle", "ruins", "none"]

    setOptions({
      skin: skins[Math.floor(Math.random() * skins.length)] as AvatarOptions["skin"],
      eyes: eyes[Math.floor(Math.random() * eyes.length)] as AvatarOptions["eyes"],
      helmet: helmets[Math.floor(Math.random() * helmets.length)] as AvatarOptions["helmet"],
      backdrop: backdrops[Math.floor(Math.random() * backdrops.length)] as AvatarOptions["backdrop"],
    })
  }

  const handleReset = () => {
    setOptions({
      skin: "gold",
      eyes: "glow",
      helmet: "eth",
      backdrop: "nebula",
    })
  }

  return (
    <div>
      {/* Token Supply Banner */}
      <div className="mb-8 bg-gradient-to-r from-gray-900 to-black border border-yellow-600/30 rounded-lg p-6 text-center">
        <h2 className="text-2xl font-bold text-white mb-2">Goldium Token Supply</h2>
        <div className="text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-yellow-400 to-yellow-600">
          {GOLD_TOKEN.totalSupply?.toLocaleString()} GOLD
        </div>
        <p className="text-gray-400 mt-2">Total supply of 1 billion GOLD tokens</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="order-2 lg:order-1">
          <AvatarControls
            options={options}
            onOptionChange={handleOptionChange}
            onRandomize={handleRandomize}
            onReset={handleReset}
          />
        </div>
        <div className="order-1 lg:order-2">
          <AvatarCanvas options={options} />
        </div>
      </div>
    </div>
  )
}
