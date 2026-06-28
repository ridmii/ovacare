import React from 'react'

interface EmojiProps {
  text: string
  size?: number
  className?: string
}

export function Emoji({ text, size = 24, className }: EmojiProps) {
  return (
    <span
      className={className}
      role="img"
      aria-hidden
      style={{
        fontSize: size,
        lineHeight: 1,
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontFamily: '"Apple Color Emoji", "Segoe UI Emoji", "Noto Color Emoji", sans-serif',
      }}
    >
      {text}
    </span>
  )
}
