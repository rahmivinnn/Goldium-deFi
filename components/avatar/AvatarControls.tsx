"use client"
import { Shuffle, RotateCcw, Download } from "lucide-react"
import { Button } from "@/components/ui/button"
import type { AvatarOptions } from "@/components/avatar/AvatarCreator"

interface AvatarControlsProps {
  options: AvatarOptions
  onOptionChange: (category: keyof AvatarOptions, value: string) => void
  onRandomize: () => void
  onReset: () => void
}

export default function AvatarControls({ options, onOptionChange, onRandomize, onReset }: AvatarControlsProps) {
  const categories = [
    {
      name: "Skin",
      key: "skin" as keyof AvatarOptions,
      options: [
        { value: "gold", label: "Gold" },
        { value: "lava", label: "Lava" },
        { value: "crystal", label: "Crystal" },
        { value: "void", label: "Void" },
      ],
    },
    {
      name: "Eyes",
      key: "eyes" as keyof AvatarOptions,
      options: [
        { value: "glow", label: "Glow" },
        { value: "cute", label: "Cute" },
        { value: "cyber", label: "Cyber" },
      ],
    },
    {
      name: "Helmet",
      key: "helmet" as keyof AvatarOptions,
      options: [
        { value: "eth", label: "ETH Crown" },
        { value: "sol", label: "SOL Cap" },
        { value: "none", label: "None" },
      ],
    },
    {
      name: "Backdrop",
      key: "backdrop" as keyof AvatarOptions,
      options: [
        { value: "nebula", label: "Nebula" },
        { value: "jungle", label: "Jungle" },
        { value: "ruins", label: "Golden Ruins" },
        { value: "none", label: "None" },
      ],
    },
  ]

  return (
    <div className="bg-gray-900 border border-yellow-900/50 rounded-lg p-6">
      <h2 className="text-2xl font-semibold mb-6 text-white">Customize Your Avatar</h2>

      <div className="space-y-6">
        {categories.map((category) => (
          <div key={category.key}>
            <h3 className="text-lg font-medium mb-3 text-white">{category.name}</h3>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {category.options.map((option) => (
                <button
                  key={option.value}
                  className={`px-4 py-2 rounded-md text-sm transition-all ${
                    options[category.key] === option.value
                      ? "bg-yellow-600 text-white"
                      : "bg-gray-800 text-gray-300 hover:bg-gray-700"
                  }`}
                  onClick={() => onOptionChange(category.key, option.value)}
                >
                  {option.label}
                </button>
              ))}
            </div>
          </div>
        ))}
      </div>

      <div className="mt-8 flex flex-wrap gap-4">
        <Button
          variant="outline"
          className="flex items-center gap-2 border-yellow-600 text-white hover:bg-yellow-900/30"
          onClick={onRandomize}
        >
          <Shuffle className="h-4 w-4" />
          Randomize
        </Button>

        <Button
          variant="outline"
          className="flex items-center gap-2 border-yellow-600 text-white hover:bg-yellow-900/30"
          onClick={onReset}
        >
          <RotateCcw className="h-4 w-4" />
          Reset
        </Button>

        <Button
          className="flex items-center gap-2 bg-gradient-to-r from-yellow-500 to-yellow-700 hover:from-yellow-400 hover:to-yellow-600 text-black"
          onClick={() => {
            // This would be implemented to download the canvas as an image
            const canvas = document.getElementById("avatar-canvas") as HTMLCanvasElement
            if (canvas) {
              const link = document.createElement("a")
              link.download = "goldium-avatar.png"
              link.href = canvas.toDataURL("image/png")
              link.click()
            }
          }}
        >
          <Download className="h-4 w-4" />
          Download Avatar
        </Button>
      </div>
    </div>
  )
}
