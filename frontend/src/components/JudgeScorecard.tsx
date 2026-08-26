import { motion } from 'framer-motion'
import { Gavel, Target, AlertCircle } from 'lucide-react'
import { ScoreChip } from './ScoreChip'
import { WinnerBadge } from './StatusBadge'
import type { RoundResponse } from '@/types'

interface JudgeScorecardProps {
  round: RoundResponse
}

export function JudgeScorecard({ round }: JudgeScorecardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-2xl border border-amber-200/60 bg-amber-50/60 p-5"
    >
      <div className="mb-4 flex items-center gap-2">
        <Gavel className="h-5 w-5 text-role-judge" />
        <h4 className="text-sm font-bold text-role-judge uppercase tracking-wide">
          Judge's Scorecard
        </h4>
      </div>

      <div className="mb-4 flex flex-wrap items-center gap-6">
        <ScoreChip score={round.challenger_score} label="Challenger" color="challenger" />
        <ScoreChip score={round.defender_score} label="Defender" color="defender" />
        <div className="flex flex-col items-start">
          <span className="text-xs font-semibold text-on-surface-variant mb-1">Round Winner</span>
          {round.winner ? <WinnerBadge winner={round.winner} /> : <span className="text-sm text-on-surface-variant">—</span>}
        </div>
      </div>

      {round.judge_reason && (
        <p className="mb-3 text-sm leading-relaxed text-ink">
          <span className="font-semibold">Reasoning: </span>
          {round.judge_reason}
        </p>
      )}

      <div className="grid gap-3 sm:grid-cols-2">
        {round.strongest_argument && (
          <div className="flex items-start gap-2 rounded-xl bg-white/70 p-3">
            <Target className="mt-0.5 h-4 w-4 shrink-0 text-role-defender" />
            <div>
              <span className="text-xs font-semibold text-on-surface-variant">Strongest Argument</span>
              <p className="text-sm text-ink">{round.strongest_argument}</p>
            </div>
          </div>
        )}
        {round.weakest_rebuttal && (
          <div className="flex items-start gap-2 rounded-xl bg-white/70 p-3">
            <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-role-challenger" />
            <div>
              <span className="text-xs font-semibold text-on-surface-variant">Weakest Rebuttal</span>
              <p className="text-sm text-ink">{round.weakest_rebuttal}</p>
            </div>
          </div>
        )}
      </div>
    </motion.div>
  )
}
