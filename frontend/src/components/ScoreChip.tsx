import { motion, useSpring, useTransform } from 'framer-motion'
import { useEffect } from 'react'

interface ScoreChipProps {
  score: number | null | undefined
  label: string
  color?: 'challenger' | 'defender' | 'judge'
  large?: boolean
}

export function ScoreChip({ score, label, color = 'judge', large = false }: ScoreChipProps) {
  const numeric = score ?? 0
  const spring = useSpring(0, { stiffness: 60, damping: 20 })
  const display = useTransform(spring, (v) => v.toFixed(1))

  useEffect(() => {
    spring.set(numeric)
  }, [numeric, spring])

  const colorClasses = {
    challenger: 'bg-red-50 text-role-challenger border-red-100',
    defender: 'bg-emerald-50 text-role-defender border-emerald-100',
    judge: 'bg-amber-50 text-role-judge border-amber-100',
  }

  return (
    <div className={`flex flex-col ${large ? 'items-start' : 'items-center'}`}>
      <span className="text-xs font-semibold text-on-surface-variant mb-1">{label}</span>
      <div
        className={`
          flex items-center justify-center rounded-xl border font-bold
          ${colorClasses[color]}
          ${large ? 'h-16 w-20 text-3xl' : 'h-10 w-12 text-lg'}
        `}
      >
        {score == null ? (
          <span className="text-on-surface-variant/40">—</span>
        ) : (
          <motion.span>{display}</motion.span>
        )}
      </div>
    </div>
  )
}
