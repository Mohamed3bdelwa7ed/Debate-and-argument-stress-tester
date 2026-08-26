import { motion } from 'framer-motion'
import { Shield } from 'lucide-react'
import type { DefenderRebuttal } from '@/types'

interface RebuttalCardProps {
  rebuttal: DefenderRebuttal
  index: number
}

export function RebuttalCard({ rebuttal, index }: RebuttalCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, x: 12 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.08 }}
      className="rounded-2xl border-l-4 border-role-defender bg-white p-5 shadow-card"
    >
      <div className="mb-2 flex items-center gap-2">
        <Shield className="h-4 w-4 text-role-defender" />
        <h4 className="text-sm font-bold text-role-defender uppercase tracking-wide">
          Rebuttal
        </h4>
      </div>
      <p className="mb-2 text-xs font-semibold text-on-surface-variant">
        Responding to: <span className="text-ink">{rebuttal.argument_title}</span>
      </p>
      <p className="text-sm leading-relaxed text-on-surface-variant">{rebuttal.response}</p>
    </motion.div>
  )
}
