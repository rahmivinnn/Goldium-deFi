"use client"

import { motion } from "framer-motion"
import { Wallet, Coins, BarChart3, ShoppingCart } from "lucide-react"
import FeaturesBackground from "@/components/three/FeaturesBackground"

export default function FeaturesSection() {
  const features = [
    {
      icon: <Wallet className="h-10 w-10" />,
      title: "Multi-Wallet Support",
      description: "Connect with Phantom, Solflare, or MetaMask to access the Goldium ecosystem.",
    },
    {
      icon: <Coins className="h-10 w-10" />,
      title: "DeFi Ecosystem",
      description: "Swap, stake, provide liquidity, and earn rewards with GOLD tokens.",
    },
    {
      icon: <BarChart3 className="h-10 w-10" />,
      title: "Yield Farming",
      description: "Maximize your returns with our optimized yield farming strategies.",
    },
    {
      icon: <ShoppingCart className="h-10 w-10" />,
      title: "NFT Marketplace",
      description: "Trade unique digital assets in our secure and user-friendly marketplace.",
    },
  ]

  return (
    <section className="py-20 relative overflow-hidden">
      {/* 3D Background */}
      <FeaturesBackground />

      <div className="container mx-auto px-4 relative z-10">
        <div className="text-center mb-16">
          <motion.h2
            className="text-4xl font-bold mb-4 text-white"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
          >
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-yellow-400 to-yellow-600">
              Powerful Features
            </span>
          </motion.h2>
          <motion.p
            className="text-lg text-gray-300 max-w-2xl mx-auto"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            viewport={{ once: true }}
          >
            Explore the cutting-edge capabilities of the Goldium platform
          </motion.p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {features.map((feature, index) => (
            <motion.div
              key={index}
              className="bg-gray-900/80 backdrop-blur-md border border-yellow-900/50 rounded-lg p-6 hover:border-yellow-600 transition-all"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              viewport={{ once: true }}
              whileHover={{
                y: -5,
                boxShadow: "0 10px 25px -5px rgba(255, 215, 0, 0.1), 0 8px 10px -6px rgba(255, 215, 0, 0.1)",
              }}
            >
              <div className="text-yellow-500 mb-4">{feature.icon}</div>
              <h3 className="text-xl font-semibold mb-2 text-white">{feature.title}</h3>
              <p className="text-gray-400">{feature.description}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
