import { motion } from 'framer-motion'
import { Swords } from 'lucide-react'
import type { ChallengerArgument } from '@/types'

interface ArgumentCardProps {
  argument: ChallengerArgument
  index: number
}

export function ArgumentCard({ argument, index }: ArgumentCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, x: -12 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.08 }}
      className="rounded-2xl border-l-4 border-role-challenger bg-white p-5 shadow-card"
    >
      <div className="mb-2 flex items-center gap-2">
        <Swords className="h-4 w-4 text-role-challenger" />
        <h4 className="text-sm font-bold text-role-challenger uppercase tracking-wide">
          Argument {index + 1}
        </h4>
      </div>
      <h5 className="mb-2 text-base font-bold text-ink">{argument.title}</h5>
      <p className="text-sm leading-relaxed text-on-surface-variant">{argument.argument}</p>
    </motion.div>
  )
}
