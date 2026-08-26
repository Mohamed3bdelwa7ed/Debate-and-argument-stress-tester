import { useEffect, useRef } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { motion } from 'framer-motion'
import { ArrowLeft, AlertCircle, Loader2 } from 'lucide-react'
import { useDebate } from '@/hooks/useDebate'
import { useDebateStatus } from '@/hooks/useDebateStatus'
import { queryClient } from '@/main'
import { Navbar } from '@/components/Navbar'
import { Button } from '@/components/ui/Button'
import { Timeline } from '@/components/Timeline'
import { WinnerBanner } from '@/components/WinnerBanner'
import { RoundAccordion } from '@/components/RoundAccordion'
import { EmptyState } from '@/components/EmptyState'
import { SkeletonList } from '@/components/ui/Skeleton'
import { truncate } from '@/utils/format'


export function DebatePage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const lastStatusRef = useRef<string | null>(null)

  const { data: debate, isLoading, isError } = useDebate(id)
  const { data: status } = useDebateStatus(id)

  useEffect(() => {
    const currentStatus = status?.status
    if (currentStatus && id && lastStatusRef.current !== currentStatus) {
      lastStatusRef.current = currentStatus
      if (currentStatus === 'running' || currentStatus === 'pending') {
        queryClient.invalidateQueries({ queryKey: ['debate', id] })
      }
    }
  }, [status?.status, id])

  const combinedStatus = status?.status || debate?.status || 'pending'
  const currentRound = status?.current_round ?? debate?.current_round ?? 0
  const currentAgent = status?.current_agent ?? debate?.current_agent ?? null
  const totalRounds = status?.total_rounds ?? debate?.rounds_count ?? 2

  return (
    <div className="min-h-screen bg-surface">
      <Navbar />

      <main className="mx-auto max-w-content px-6 py-8">
        <button
          onClick={() => navigate('/dashboard')}
          className="mb-4 flex items-center gap-1 text-sm font-semibold text-on-surface-variant hover:text-primary"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Dashboard
        </button>

        {isLoading && <SkeletonList count={3} />}

        {isError && (
          <EmptyState
            title="Could not load debate"
            description="The debate may not exist or you may not have permission to view it."
            action={
              <Button onClick={() => navigate('/dashboard')}>Back to Dashboard</Button>
            }
          />
        )}

        {debate && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <section className="mb-6 rounded-2xl border border-accent-border bg-white p-6 shadow-card">
              <p className="text-xs font-bold uppercase tracking-wide text-on-surface-variant">
                Thesis
              </p>
              <h1 className="mt-2 text-xl font-bold leading-snug text-ink sm:text-2xl">
                {truncate(debate.thesis, 300)}
              </h1>
            </section>

            {(combinedStatus === 'pending' || combinedStatus === 'running') && (
              <div className="mb-8">
                <Timeline
                  currentRound={currentRound}
                  totalRounds={totalRounds}
                  currentAgent={currentAgent}
                  status={combinedStatus}
                />
                <p className="mt-4 text-center text-sm text-on-surface-variant">
                  Polling for updates…
                </p>
              </div>
            )}

            {combinedStatus === 'failed' && (
              <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-8 flex flex-col items-center rounded-2xl border border-red-100 bg-red-50 p-8 text-center"
              >
                <AlertCircle className="mb-3 h-10 w-10 text-role-challenger" />
                <h2 className="text-lg font-bold text-ink">This debate could not be completed</h2>
                <p className="mt-2 text-sm text-on-surface-variant">
                  An error occurred while running the AI debate. You can start a new one any time.
                </p>
                <Button className="mt-6" onClick={() => navigate('/dashboard')}>
                  Back to Dashboard
                </Button>
              </motion.div>
            )}

            {combinedStatus === 'completed' && (
              <motion.div
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-8"
              >
                <WinnerBanner
                  winner={debate.final_winner}
                  challengerScore={debate.final_challenger_score}
                  defenderScore={debate.final_defender_score}
                  verdict={debate.final_verdict}
                />
              </motion.div>
            )}

            {debate.rounds.length > 0 && (
              <div className="space-y-4">
                <h2 className="text-xl font-bold text-ink">Rounds</h2>
                {debate.rounds.map((round) => (
                  <RoundAccordion key={round.id} round={round} />
                ))}
              </div>
            )}

            {combinedStatus !== 'completed' && combinedStatus !== 'failed' && debate.rounds.length === 0 && (
              <div className="mt-8 rounded-2xl border border-dashed border-accent-outline bg-surface-container-low/50 p-12 text-center">
                <Loader2 className="mx-auto mb-3 h-8 w-8 animate-spin text-primary" />
                <h3 className="text-base font-bold text-ink">Debate is starting</h3>
                <p className="mt-1 text-sm text-on-surface-variant">
                  The AI agents will begin challenging your thesis shortly.
                </p>
              </div>
            )}
          </motion.div>
        )}
      </main>
    </div>
  )
}
