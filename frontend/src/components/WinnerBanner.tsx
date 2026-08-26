import { motion } from 'framer-motion'
import { Trophy, Scale } from 'lucide-react'
import { ScoreChip } from './ScoreChip'
import { capitalize } from '@/utils/format'
import type { Winner } from '@/types'

interface WinnerBannerProps {
  winner: Winner
  challengerScore: number | null
  defenderScore: number | null
  verdict: string | null
}

export function WinnerBanner({ winner, challengerScore, defenderScore, verdict }: WinnerBannerProps) {
  if (!winner) return null

  const gradients: Record<string, string> = {
    challenger: 'from-rose-500 to-red-600',
    defender: 'from-emerald-500 to-teal-600',
    tie: 'from-amber-400 to-orange-500',
  }

  const messages: Record<string, string> = {
    challenger: 'Challenger Wins',
    defender: 'Defender Wins',
    tie: "It's a Tie",
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      className={`
        relative overflow-hidden rounded-3xl bg-gradient-to-br ${gradients[winner]}
        p-8 text-white shadow-card-hover
      `}
    >
      <div className="absolute -right-8 -top-8 h-48 w-48 rounded-full bg-white/10 blur-3xl" />
      <div className="absolute -bottom-10 -left-10 h-40 w-40 rounded-full bg-white/10 blur-3xl" />

      <div className="relative flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
        <div className="flex items-start gap-4">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-white/20 backdrop-blur-sm">
            {winner === 'tie' ? <Scale className="h-7 w-7" /> : <Trophy className="h-7 w-7" />}
          </div>
          <div>
            <p className="text-sm font-semibold text-white/80">Final Verdict</p>
            <h2 className="text-3xl font-extrabold tracking-tight">{messages[winner]}</h2>
            {verdict && <p className="mt-2 max-w-xl text-white/90">{verdict}</p>}
          </div>
        </div>

        <div className="flex items-center gap-4">
          <ScoreChip score={challengerScore} label="Challenger" color="challenger" large />
          <ScoreChip score={defenderScore} label="Defender" color="defender" large />
        </div>
      </div>

      {winner !== 'tie' && (
        <div className="relative mt-6">
          <div className="flex h-2 overflow-hidden rounded-full bg-black/20">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${((challengerScore ?? 0) / 10) * 100}%` }}
              transition={{ duration: 1, ease: 'easeOut' }}
              className="bg-role-challenger"
            />
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${((defenderScore ?? 0) / 10) * 100}%` }}
              transition={{ duration: 1, ease: 'easeOut', delay: 0.2 }}
              className="bg-role-defender"
            />
          </div>
          <div className="mt-1 flex justify-between text-xs font-medium text-white/80">
            <span>{capitalize('challenger')}</span>
            <span>{capitalize('defender')}</span>
          </div>
        </div>
      )}
    </motion.div>
  )
}
