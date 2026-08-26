import { Badge } from './ui/Badge'
import type { DebateStatus, Winner } from '@/types'

const statusMap: Record<DebateStatus, { label: string; variant: 'default' | 'primary' | 'warning' | 'success' | 'error' }> = {
  pending: { label: 'Pending', variant: 'default' },
  running: { label: 'Running', variant: 'primary' },
  completed: { label: 'Completed', variant: 'success' },
  failed: { label: 'Failed', variant: 'error' },
}

export function StatusBadge({ status }: { status: DebateStatus }) {
  const config = statusMap[status] || statusMap.pending
  return <Badge variant={config.variant}>{config.label}</Badge>
}

export function WinnerBadge({ winner }: { winner: Winner }) {
  if (!winner) return null

  const map: Record<string, { label: string; variant: 'error' | 'success' | 'warning' }> = {
    challenger: { label: 'Challenger wins', variant: 'error' },
    defender: { label: 'Defender wins', variant: 'success' },
    tie: { label: 'Tie', variant: 'warning' },
  }

  const config = map[winner] || { label: winner, variant: 'default' as const }
  return <Badge variant={config.variant}>{config.label}</Badge>
}
