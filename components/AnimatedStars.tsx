"use client"
import { motion } from "framer-motion"
import { Star } from "lucide-react"

export default function AnimatedStars() {
  return (
    <div className="flex justify-center gap-4 mt-6">
      {[1, 2, 3, 4, 5].map((i) => (
        <motion.div
          key={i}
          initial={{ opacity: 0, scale: 0 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{
            duration: 0.5,
            delay: 0.1 * i,
            repeat: Number.POSITIVE_INFINITY,
            repeatType: "reverse",
            repeatDelay: 1,
          }}
        >
          <Star className="h-8 w-8 text-yellow-500 fill-yellow-500" />
        </motion.div>
      ))}
    </div>
  )
}
