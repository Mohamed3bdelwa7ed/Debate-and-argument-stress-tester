import { useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { ChevronDown, Swords, Shield } from 'lucide-react'
import { ArgumentCard } from './ArgumentCard'
import { RebuttalCard } from './RebuttalCard'
import { JudgeScorecard } from './JudgeScorecard'
import { WinnerBadge, StatusBadge } from './StatusBadge'
import { ScoreChip } from './ScoreChip'
import type { RoundResponse } from '@/types'

interface RoundAccordionProps {
  round: RoundResponse
  defaultOpen?: boolean
}

export function RoundAccordion({ round, defaultOpen = true }: RoundAccordionProps) {
  const [isOpen, setIsOpen] = useState(defaultOpen)

  const args = round.challenger_arguments || []
  const rebuttals = round.defender_rebuttals || []

  return (
    <div className="rounded-2xl bg-white border border-accent-border shadow-card overflow-hidden">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex w-full items-center justify-between p-5 text-left hover:bg-surface-container-low/50 transition-colors"
      >
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-surface-container-high text-primary font-bold">
            {round.round_number}
          </div>
          <div>
            <h3 className="text-base font-bold text-ink">Round {round.round_number}</h3>
            <div className="mt-1 flex items-center gap-2">
              {round.winner ? (
                <WinnerBadge winner={round.winner} />
              ) : (
                <StatusBadge status="pending" />
              )}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className="hidden items-center gap-3 sm:flex">
            <ScoreChip score={round.challenger_score} label="Challenger" color="challenger" />
            <ScoreChip score={round.defender_score} label="Defender" color="defender" />
          </div>
          <motion.div
            animate={{ rotate: isOpen ? 180 : 0 }}
            transition={{ duration: 0.2 }}
          >
            <ChevronDown className="h-5 w-5 text-on-surface-variant" />
          </motion.div>
        </div>
      </button>

      <AnimatePresence initial={false}>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25, ease: 'easeInOut' }}
            className="overflow-hidden"
          >
            <div className="border-t border-accent-border p-5">
              <div className="grid gap-6 lg:grid-cols-2">
                <div>
                  <div className="mb-3 flex items-center gap-2">
                    <Swords className="h-4 w-4 text-role-challenger" />
                    <h4 className="text-sm font-bold text-role-challenger uppercase tracking-wide">
                      Challenger's Arguments
                    </h4>
                  </div>
                  <div className="grid gap-3">
                    {args.length > 0 ? (
                      args.map((arg, i) => <ArgumentCard key={i} argument={arg} index={i} />)
                    ) : (
                      <p className="text-sm text-on-surface-variant">No arguments yet.</p>
                    )}
                  </div>
                </div>

                <div>
                  <div className="mb-3 flex items-center gap-2">
                    <Shield className="h-4 w-4 text-role-defender" />
                    <h4 className="text-sm font-bold text-role-defender uppercase tracking-wide">
                      Defender's Rebuttals
                    </h4>
                  </div>
                  <div className="grid gap-3">
                    {rebuttals.length > 0 ? (
                      rebuttals.map((reb, i) => <RebuttalCard key={i} rebuttal={reb} index={i} />)
                    ) : (
                      <p className="text-sm text-on-surface-variant">No rebuttals yet.</p>
                    )}
                  </div>
                </div>
              </div>

              <div className="mt-6">
                <JudgeScorecard round={round} />
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
