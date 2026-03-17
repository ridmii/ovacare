import React from 'react'
import { motion } from 'framer-motion'

interface GlassCardProps {
  children: React.ReactNode
  className?: string
  hover?: boolean
  glow?: boolean
  onClick?: () => void
}

export function GlassCard({
  children,
  className = '',
  hover = false,
  glow = false,
  onClick,
}: GlassCardProps) {
  return (
    <motion.div
      className={`
        relative overflow-hidden rounded-2xl bg-white/70 backdrop-blur-xl border border-white/40 shadow-lg
        ${glow ? 'ring-1 ring-ovacare-purple/30' : ''}
        ${onClick ? 'cursor-pointer' : ''}
        ${className}
      `}
      whileHover={
        hover
          ? {
              y: -5,
              boxShadow:
                '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
              borderColor: 'rgba(102, 126, 234, 0.4)',
            }
          : {}
      }
      transition={{
        duration: 0.2,
      }}
      onClick={onClick}
    >
      {glow && (
        <div className="absolute inset-0 bg-gradient-to-br from-ovacare-purple/5 to-ovacare-pink/5 pointer-events-none" />
      )}
      <div className="relative z-10">{children}</div>
    </motion.div>
  )
}