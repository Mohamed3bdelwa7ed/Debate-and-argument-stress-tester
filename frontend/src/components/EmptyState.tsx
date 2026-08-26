import { motion } from 'framer-motion'
import { MessageSquarePlus } from 'lucide-react'

interface EmptyStateProps {
  title?: string
  description?: string
  action?: React.ReactNode
}

export function EmptyState({
  title = 'No debates yet',
  description = 'Start your first debate to stress-test an idea.',
  action,
}: EmptyStateProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-accent-outline bg-surface-container-low/50 p-12 text-center"
    >
      <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-surface-container-high text-primary">
        <MessageSquarePlus className="h-8 w-8" />
      </div>
      <h3 className="text-lg font-bold text-ink">{title}</h3>
      <p className="mt-1 max-w-sm text-sm text-on-surface-variant">{description}</p>
      {action && <div className="mt-6">{action}</div>}
    </motion.div>
  )
}
