import { type ReactNode } from 'react'
import { motion } from 'framer-motion'

interface CardProps {
  children: ReactNode
  className?: string
  hover?: boolean
  onClick?: () => void
}

export function Card({ children, className = '', hover = false, onClick }: CardProps) {
  return (
    <motion.div
      onClick={onClick}
      whileHover={hover ? { y: -2 } : undefined}
      className={`
        rounded-2xl bg-white border border-accent-border shadow-card
        ${hover ? 'cursor-pointer transition-shadow duration-300 hover:shadow-card-hover' : ''}
        ${className}
      `}
    >
      {children}
    </motion.div>
  )
}
