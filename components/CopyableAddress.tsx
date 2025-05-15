"use client"

import { useState } from "react"
import { Copy, Check } from "lucide-react"
import { useToast } from "@/components/ui/use-toast"

interface CopyableAddressProps {
  address: string
  label?: string
}

export function CopyableAddress({ address, label }: CopyableAddressProps) {
  const [copied, setCopied] = useState(false)
  const { toast } = useToast()

  const handleCopy = () => {
    navigator.clipboard.writeText(address)
    setCopied(true)

    toast({
      title: "Address Copied",
      description: "Address has been copied to clipboard",
    })

    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="flex flex-col">
      {label && <span className="text-sm text-yellow-500 mb-1">{label}</span>}
      <div className="flex items-center gap-2 bg-black/50 border border-yellow-700 rounded-md px-3 py-2">
        <code className="text-sm font-mono text-yellow-300">{address}</code>
        <button onClick={handleCopy} className="text-gray-400 hover:text-yellow-500 transition-colors">
          {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
        </button>
      </div>
    </div>
  )
}

// Add this line to support both default and named exports
export default CopyableAddress
