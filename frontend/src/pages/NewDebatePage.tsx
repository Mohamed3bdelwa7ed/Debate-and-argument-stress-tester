import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowLeft, Loader2 } from 'lucide-react'
import { motion } from 'framer-motion'
import { createDebate } from '@/api/debates'
import { getApiError } from '@/api/client'
import { Button } from '@/components/ui/Button'
import { Textarea } from '@/components/ui/Textarea'
import { Navbar } from '@/components/Navbar'
import { Card } from '@/components/ui/Card'

export function NewDebatePage() {
  const navigate = useNavigate()
  const [thesis, setThesis] = useState('')
  const [rounds, setRounds] = useState<2 | 3>(2)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const thesisLength = thesis.length
  const isValid = thesisLength >= 10 && thesisLength <= 5000

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!isValid) return

    setIsLoading(true)
    setError(null)

    try {
      const debate = await createDebate({ thesis, rounds })
      navigate(`/debate/${debate.id}`)
    } catch (err) {
      setError(getApiError(err).message)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-surface">
      <Navbar />

      <main className="mx-auto max-w-content px-6 py-10">
        <button
          onClick={() => navigate('/dashboard')}
          className="mb-6 flex items-center gap-1 text-sm font-semibold text-on-surface-variant hover:text-primary"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Dashboard
        </button>

        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <h1 className="text-3xl font-extrabold tracking-tight text-ink">
            Start a New Debate
          </h1>
          <p className="mt-2 text-on-surface-variant">
            Enter a thesis, opinion, or business idea. The AI will challenge, defend, and judge it.
          </p>

          <form onSubmit={handleSubmit} className="mt-8 space-y-6">
            <Card className="p-6">
              <Textarea
                label="Your thesis"
                placeholder="I want to build an AI tutor for university students..."
                value={thesis}
                onChange={(e) => setThesis(e.target.value)}
                rows={6}
                error={
                  thesisLength > 0 && thesisLength < 10
                    ? 'Thesis must be at least 10 characters.'
                    : thesisLength > 5000
                    ? 'Thesis must be 5000 characters or less.'
                    : undefined
                }
              />
              <div className="mt-2 flex justify-end text-xs font-medium text-on-surface-variant">
                <span className={thesisLength > 5000 ? 'text-role-challenger' : ''}>
                  {thesisLength}
                </span>
                <span>/5000</span>
              </div>
            </Card>

            <div className="grid gap-4 sm:grid-cols-2">
              {[2, 3].map((count) => (
                <button
                  key={count}
                  type="button"
                  onClick={() => setRounds(count as 2 | 3)}
                  className={`
                    relative rounded-2xl border-2 p-5 text-left transition-all
                    ${rounds === count
                      ? 'border-primary bg-primary-fixed/30 shadow-card'
                      : 'border-accent-border bg-white hover:border-primary/30 hover:bg-surface-container-low'}
                  `}
                >
                  {rounds === count && (
                    <div className="absolute right-4 top-4 flex h-5 w-5 items-center justify-center rounded-full bg-primary text-white">
                      <svg className="h-3 w-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                  )}
                  <span className="text-xs font-bold uppercase tracking-wide text-on-surface-variant">
                    Option {count - 1}
                  </span>
                  <h3 className="mt-1 text-xl font-bold text-ink">{count} Rounds</h3>
                  <p className="mt-2 text-sm text-on-surface-variant">
                    {count === 2
                      ? 'Quick stress test with two rounds of attack and defense.'
                      : 'Deeper analysis with three rounds including follow-up arguments.'}
                  </p>
                </button>
              ))}
            </div>

            {error && (
              <div className="rounded-lg bg-red-50 px-4 py-3 text-sm font-medium text-role-challenger">
                {error}
              </div>
            )}

            <div className="flex justify-end">
              <Button
                type="submit"
                size="lg"
                isLoading={isLoading}
                disabled={!isValid}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Starting debate…
                  </>
                ) : (
                  'Start Debate'
                )}
              </Button>
            </div>
          </form>
        </motion.div>
      </main>
    </div>
  )
}
