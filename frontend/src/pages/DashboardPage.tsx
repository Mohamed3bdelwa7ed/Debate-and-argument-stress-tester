import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Plus, ChevronLeft, ChevronRight } from 'lucide-react'
import { useAuth } from '@/hooks/useAuth'
import { useDebates } from '@/hooks/useDebates'
import { Button } from '@/components/ui/Button'
import { DebateCard } from '@/components/DebateCard'
import { EmptyState } from '@/components/EmptyState'
import { Navbar } from '@/components/Navbar'
import { SkeletonList } from '@/components/ui/Skeleton'
import { Badge } from '@/components/ui/Badge'

export function DashboardPage() {
  const navigate = useNavigate()
  const { user } = useAuth()
  const [page, setPage] = useState(1)
  const { data, isLoading, isError } = useDebates(page, 12)

  const totalPages = data ? Math.ceil(data.total / data.limit) : 0

  return (
    <div className="min-h-screen bg-surface">
      <Navbar />

      <main className="mx-auto max-w-container px-6 py-10">
        <section className="mb-10 rounded-3xl bg-gradient-to-br from-primary to-secondary p-8 text-white shadow-card-hover sm:p-12">
          <div className="max-w-2xl">
            <Badge variant="secondary" className="mb-4 border-white/20 bg-white/10 text-white">
              AI-Powered Argument Testing
            </Badge>
            <h1 className="text-3xl font-extrabold tracking-tight sm:text-4xl">
              Welcome back, {user?.email.split('@')[0] || 'Thinker'}
            </h1>
            <p className="mt-3 text-lg text-white/80">
              Submit a thesis and watch a Challenger, Defender, and Judge stress-test your idea in a structured debate.
            </p>
            <div className="mt-6 flex flex-wrap gap-4">
              <Button
                size="lg"
                onClick={() => navigate('/debate/new')}
                className="bg-white text-primary hover:bg-white/90"
              >
                <Plus className="mr-2 h-5 w-5" />
                Start New Debate
              </Button>
              <Button
                variant="ghost"
                size="lg"
                onClick={() => navigate('/debate/new')}
                className="text-white hover:bg-white/10 hover:text-white"
              >
                Learn more
              </Button>
            </div>
          </div>
        </section>

        <div className="mb-6 flex items-center justify-between">
          <h2 className="text-xl font-bold text-ink">Your Debates</h2>
          {data && data.total > 0 && (
            <p className="text-sm text-on-surface-variant">
              {data.total} total
            </p>
          )}
        </div>

        {isLoading && <SkeletonList count={6} />}

        {isError && (
          <div className="rounded-2xl border border-red-100 bg-red-50 p-6 text-center">
            <p className="text-sm font-medium text-role-challenger">
              Failed to load debates. Please refresh the page.
            </p>
          </div>
        )}

        {!isLoading && !isError && data?.items.length === 0 && (
          <EmptyState
            action={
              <Button onClick={() => navigate('/debate/new')}>
                <Plus className="mr-2 h-4 w-4" />
                Start your first debate
              </Button>
            }
          />
        )}

        {!isLoading && !isError && data && data.items.length > 0 && (
          <>
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {data.items.map((debate) => (
                <DebateCard key={debate.id} debate={debate} />
              ))}
            </div>

            {totalPages > 1 && (
              <div className="mt-8 flex items-center justify-center gap-2">
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page === 1}
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <span className="text-sm font-medium text-ink">
                  Page {page} of {totalPages}
                </span>
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  disabled={page === totalPages}
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            )}
          </>
        )}
      </main>
    </div>
  )
}
