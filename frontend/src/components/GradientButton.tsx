import React from 'react'
import { motion } from 'framer-motion'

interface GradientButtonProps {
  children: React.ReactNode
  onClick?: () => void
  variant?: 'primary' | 'secondary' | 'outline'
  size?: 'sm' | 'md' | 'lg'
  className?: string
  type?: 'button' | 'submit' | 'reset'
  disabled?: boolean
}

export function GradientButton({
  children,
  onClick,
  variant = 'primary',
  size = 'md',
  className = '',
  type = 'button',
  disabled = false,
}: GradientButtonProps) {
  const baseStyles =
    'relative inline-flex items-center justify-center rounded-full font-semibold transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed'

  const variants = {
    primary:
      'bg-gradient-to-r from-ovacare-purple to-ovacare-deep text-white shadow-md hover:shadow-lg focus:ring-ovacare-purple',
    secondary:
      'bg-gradient-to-r from-ovacare-pink to-ovacare-coral text-white shadow-md hover:shadow-lg focus:ring-ovacare-pink',
    outline:
      'bg-transparent border-2 border-ovacare-purple text-ovacare-purple hover:bg-ovacare-purple/5 focus:ring-ovacare-purple',
  }

  const sizes = {
    sm: 'px-4 py-1.5 text-sm',
    md: 'px-6 py-2.5 text-base',
    lg: 'px-8 py-3.5 text-lg',
  }

  return (
    <motion.button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${className}`}
      whileHover={
        !disabled
          ? {
              scale: 1.02,
            }
          : {}
      }
      whileTap={
        !disabled
          ? {
              scale: 0.98,
            }
          : {}
      }
    >
      {children}
    </motion.button>
  )
}