import React from 'react'
import { motion } from 'framer-motion'

interface FloatingElementsProps {
  variant?: 'purple' | 'pink' | 'mixed'
}

export function FloatingElements({ variant = 'mixed' }: FloatingElementsProps) {
  const colors = {
    purple: ['bg-ovacare-purple', 'bg-ovacare-deep'],
    pink: ['bg-ovacare-pink', 'bg-ovacare-coral'],
    mixed: ['bg-ovacare-purple', 'bg-ovacare-pink', 'bg-ovacare-coral'],
  }

  const selectedColors = colors[variant]

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
      <motion.div
        className={`absolute top-[-10%] left-[-5%] w-96 h-96 rounded-full mix-blend-multiply filter blur-3xl opacity-20 ${selectedColors[0]}`}
        animate={{
          y: [0, 50, 0],
          x: [0, 30, 0],
          scale: [1, 1.1, 1],
        }}
        transition={{
          duration: 10,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
      />
      <motion.div
        className={`absolute top-[20%] right-[-10%] w-[500px] h-[500px] rounded-full mix-blend-multiply filter blur-3xl opacity-20 ${selectedColors[1] || selectedColors[0]}`}
        animate={{
          y: [0, -50, 0],
          x: [0, -30, 0],
          scale: [1, 1.2, 1],
        }}
        transition={{
          duration: 15,
          repeat: Infinity,
          ease: 'easeInOut',
          delay: 2,
        }}
      />
      <motion.div
        className={`absolute bottom-[-10%] left-[20%] w-[400px] h-[400px] rounded-full mix-blend-multiply filter blur-3xl opacity-20 ${selectedColors[2] || selectedColors[0]}`}
        animate={{
          y: [0, 40, 0],
          x: [0, -40, 0],
          scale: [1, 1.1, 1],
        }}
        transition={{
          duration: 12,
          repeat: Infinity,
          ease: 'easeInOut',
          delay: 4,
        }}
      />
    </div>
  )
}