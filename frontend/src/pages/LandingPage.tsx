import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { ArrowRight, Scale, Sparkles, MessageSquare, BarChart3 } from 'lucide-react'
import { Button } from '@/components/ui/Button'

export function LandingPage() {
  const navigate = useNavigate()

  return (
    <div className="min-h-screen bg-surface">
      <nav className="sticky top-0 z-40 border-b border-accent-border bg-white/80 backdrop-blur-md">
        <div className="mx-auto flex max-w-container items-center justify-between px-6 py-3">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-white">
              <Sparkles className="h-4 w-4" />
            </div>
            <span className="text-lg font-extrabold tracking-tight text-ink">DebateAI</span>
          </div>
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="sm" onClick={() => navigate('/login')}>
              Sign In
            </Button>
            <Button size="sm" onClick={() => navigate('/login')}>
              Get Started
            </Button>
          </div>
        </div>
      </nav>

      <main>
        <section className="relative overflow-hidden px-6 pt-16 pb-24 sm:pt-24 sm:pb-32">
          <div className="pointer-events-none absolute -left-20 top-0 h-96 w-96 rounded-full bg-primary/10 blur-3xl" />
          <div className="pointer-events-none absolute right-0 top-20 h-96 w-96 rounded-full bg-secondary/10 blur-3xl" />

          <div className="relative mx-auto max-w-container text-center">
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <span className="inline-flex items-center gap-2 rounded-full bg-primary-fixed px-4 py-1.5 text-sm font-semibold text-primary">
                <Sparkles className="h-4 w-4" />
                AI-Powered Argument Stress Tester
              </span>
              <h1 className="mx-auto mt-6 max-w-3xl text-4xl font-extrabold tracking-tight text-ink sm:text-5xl lg:text-6xl">
                Stress-test your ideas before the world does
              </h1>
              <p className="mx-auto mt-6 max-w-2xl text-lg text-on-surface-variant">
                Submit any thesis, opinion, or business idea. Watch a Challenger attack it,
                a Defender rebut the objections, and a Judge score every round.
              </p>
              <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
                <Button size="lg" onClick={() => navigate('/login')}>
                  Start Debating
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
                <Button variant="secondary" size="lg" onClick={() => navigate('/login')}>
                  Sign In
                </Button>
              </div>
            </motion.div>
          </div>
        </section>

        <section className="border-y border-accent-border bg-white px-6 py-20">
          <div className="mx-auto max-w-container">
            <div className="mb-12 text-center">
              <h2 className="text-2xl font-bold text-ink sm:text-3xl">How it works</h2>
              <p className="mt-2 text-on-surface-variant">Three AI roles. One structured debate. Clear results.</p>
            </div>

            <div className="grid gap-6 md:grid-cols-3">
              {[
                {
                  icon: MessageSquare,
                  title: 'Submit your thesis',
                  description: 'Write an idea or opinion you want to test. Choose 2 or 3 rounds of debate.',
                  color: 'text-primary',
                  bg: 'bg-primary-fixed',
                },
                {
                  icon: Scale,
                  title: 'Watch the debate',
                  description: 'A Challenger attacks, a Defender rebuts, and a Judge scores each round live.',
                  color: 'text-secondary',
                  bg: 'bg-secondary-fixed',
                },
                {
                  icon: BarChart3,
                  title: 'Get the verdict',
                  description: 'Review final scores, reasoning, strongest arguments, and weakest rebuttals.',
                  color: 'text-tertiary',
                  bg: 'bg-amber-100',
                },
              ].map((step, i) => (
                <motion.div
                  key={step.title}
                  initial={{ opacity: 0, y: 16 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1 }}
                  className="rounded-2xl border border-accent-border bg-surface p-6 shadow-card"
                >
                  <div className={`mb-4 flex h-12 w-12 items-center justify-center rounded-xl ${step.bg} ${step.color}`}>
                    <step.icon className="h-6 w-6" />
                  </div>
                  <h3 className="text-lg font-bold text-ink">{step.title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-on-surface-variant">{step.description}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        <section className="px-6 py-20">
          <div className="mx-auto max-w-container">
            <div className="grid items-center gap-10 rounded-3xl bg-gradient-to-br from-primary to-secondary p-8 text-white shadow-card-hover sm:p-12 lg:grid-cols-2">
              <div>
                <h2 className="text-2xl font-bold tracking-tight sm:text-3xl">
                  Built for rigorous thinking
                </h2>
                <p className="mt-4 text-white/80">
                  The AI agents receive full context from previous rounds, so follow-up arguments target unresolved weaknesses—not just surface-level objections.
                </p>
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                {[
                  { label: 'Challenger', text: 'Attacks the thesis with structured counter-arguments.', color: 'bg-role-challenger' },
                  { label: 'Defender', text: 'Rebuts each objection with logical responses.', color: 'bg-role-defender' },
                  { label: 'Judge', text: 'Scores both sides and explains the reasoning.', color: 'bg-role-judge' },
                  { label: 'History', text: 'Save and review every debate you run.', color: 'bg-white/20' },
                ].map((item) => (
                  <div key={item.label} className="rounded-2xl bg-white/10 p-4 backdrop-blur-sm">
                    <div className={`mb-2 h-1.5 w-8 rounded-full ${item.color}`} />
                    <h4 className="font-bold">{item.label}</h4>
                    <p className="mt-1 text-sm text-white/80">{item.text}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        <footer className="border-t border-accent-border bg-white px-6 py-8">
          <div className="mx-auto flex max-w-container flex-col items-center justify-between gap-4 sm:flex-row">
            <div className="flex items-center gap-2">
              <div className="flex h-7 w-7 items-center justify-center rounded-md bg-primary text-white">
                <Sparkles className="h-3.5 w-3.5" />
              </div>
              <span className="font-bold text-ink">DebateAI</span>
            </div>
            <p className="text-sm text-on-surface-variant">
              © 2026 DebateAI. Built for the Debate & Argument Stress Tester.
            </p>
          </div>
        </footer>
      </main>
    </div>
  )
}
