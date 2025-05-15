"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { Star, Copy, Check, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useToast } from "@/components/ui/use-toast"
import CTABackground from "@/components/three/CTABackground"

export default function CTASection() {
  const [isCopied, setIsCopied] = useState(false)
  const [isProcessing, setIsProcessing] = useState(false)
  const { toast } = useToast()

  const handleGetStarted = () => {
    setIsProcessing(true)

    // Simulate processing
    setTimeout(() => {
      toast({
        title: "Welcome to Goldium!",
        description: "You're all set to explore the Goldium ecosystem.",
      })
      setIsProcessing(false)
    }, 1500)
  }

  const copyToClipboard = () => {
    navigator.clipboard.writeText("APKBq8kzMBpVKxvqrw67vkd6KuGWqSu2GVb19eK4pump")
    setIsCopied(true)
    toast({
      title: "Address Copied",
      description: "Token address copied to clipboard",
    })
    setTimeout(() => setIsCopied(false), 2000)
  }

  return (
    <section id="get-started" className="py-20 relative overflow-hidden">
      {/* 3D Background */}
      <CTABackground />

      <div className="container mx-auto px-4 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="max-w-4xl mx-auto text-center"
        >
          <h2 className="text-3xl md:text-4xl font-bold mb-6 text-transparent bg-clip-text bg-gradient-to-r from-amber-500 to-yellow-300">
            Ready to Join the Goldium Ecosystem?
          </h2>
          <p className="text-lg text-gray-300 mb-10">
            Get started with Goldium.io today and experience the future of decentralized finance and NFTs.
          </p>

          <div className="flex flex-col md:flex-row gap-4 justify-center mb-12">
            <Button
              onClick={handleGetStarted}
              className="bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-600 hover:to-yellow-600 text-black font-medium text-lg py-6 px-8"
              size="lg"
              disabled={isProcessing}
            >
              {isProcessing ? (
                <>
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                  Processing...
                </>
              ) : (
                "Get Started"
              )}
            </Button>

            <div className="relative">
              <Button
                onClick={copyToClipboard}
                variant="outline"
                className="border-amber-500/30 bg-black/50 backdrop-blur-md hover:bg-amber-500/10 text-amber-300 font-medium flex items-center gap-2"
                size="lg"
              >
                <span className="font-mono">APKBq8kz...4pump</span>
                {isCopied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
              </Button>
            </div>
          </div>

          <div className="flex justify-center space-x-2">
            {[...Array(5)].map((_, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, scale: 0.5 }}
                whileInView={{ opacity: 1, scale: 1 }}
                transition={{ delay: i * 0.1, duration: 0.5 }}
                animate={{
                  y: [0, -5, 0],
                  scale: [1, 1.1, 1],
                }}
                viewport={{ once: true }}
              >
                <Star className="h-6 w-6 text-amber-400 fill-amber-400" />
              </motion.div>
            ))}
          </div>
          <p className="text-amber-300 mt-2">RATED 5 STARS BY USERS</p>
        </motion.div>
      </div>
    </section>
  )
}
