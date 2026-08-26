import { motion } from 'framer-motion'
import { Check, Loader2 } from 'lucide-react'
import type { DebateStatus, AgentRole } from '@/types'

const agents: AgentRole[] = ['challenger', 'defender', 'judge']

interface TimelineProps {
  currentRound: number
  totalRounds: number
  currentAgent: AgentRole
  status: DebateStatus
}

export function Timeline({ currentRound, totalRounds, currentAgent, status }: TimelineProps) {
  if (status === 'completed' || status === 'failed') return null

  const displayRound = Math.min(Math.max(currentRound, 1), totalRounds)

  return (
    <div className="rounded-2xl bg-white border border-accent-border p-6 shadow-card">
      <div className="mb-4 flex items-center justify-between">
        <h3 className="text-lg font-bold text-ink">
          Round {displayRound} / {totalRounds}
        </h3>
        <span className="text-sm font-medium text-on-surface-variant">
          {currentAgent ? `${currentAgent} is working…` : 'Waiting to start'}
        </span>
      </div>

      <div className="flex items-center gap-2">
        {agents.map((agent, index) => {
          const isCompleted =
            currentRound > displayRound ||
            (currentRound === displayRound &&
              agents.indexOf(currentAgent as AgentRole) > index) ||
            (currentRound === displayRound && !currentAgent && status !== 'pending')

          const isCurrent =
            currentRound === displayRound && currentAgent === agent

          return (
            <div key={agent} className="flex items-center gap-2 flex-1">
              <div className="flex flex-1 items-center gap-3">
                <motion.div
                  animate={isCurrent ? { scale: [1, 1.08, 1] } : {}}
                  transition={{ repeat: Infinity, duration: 1.8 }}
                  className={`
                    flex h-10 w-10 items-center justify-center rounded-full border-2
                    ${isCompleted
                      ? 'border-role-defender bg-role-defender text-white'
                      : isCurrent
                      ? 'border-primary bg-primary/10 text-primary'
                      : 'border-accent-outline-variant bg-surface-container-low text-on-surface-variant'}
                  `}
                >
                  {isCompleted ? (
                    <Check className="h-5 w-5" />
                  ) : isCurrent ? (
                    <Loader2 className="h-5 w-5 animate-spin" />
                  ) : (
                    <span className="text-xs font-bold">{index + 1}</span>
                  )}
                </motion.div>
                <span
                  className={`
                    hidden text-sm font-semibold sm:inline
                    ${isCompleted || isCurrent ? 'text-ink' : 'text-on-surface-variant/60'}
                  `}
                >
                  {agent ? agent.charAt(0).toUpperCase() + agent.slice(1) : ''}
                </span>
              </div>
              {index < agents.length - 1 && (
                <div
                  className={`
                    h-0.5 flex-1 rounded-full
                    ${isCompleted ? 'bg-role-defender' : 'bg-accent-outline-variant/40'}
                  `}
                />
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
