import { useNavigate } from 'react-router-dom'
import { Clock, Trophy } from 'lucide-react'
import { Card } from './ui/Card'
import { StatusBadge, WinnerBadge } from './StatusBadge'
import { ScoreChip } from './ScoreChip'
import { formatDate } from '@/utils/format'
import type { DebateListItem } from '@/types'

interface DebateCardProps {
  debate: DebateListItem
}

export function DebateCard({ debate }: DebateCardProps) {
  const navigate = useNavigate()

  return (
    <Card
      hover
      onClick={() => navigate(`/debate/${debate.id}`)}
      className="group flex h-full flex-col p-5 transition-all"
    >
      <div className="mb-3 flex items-start justify-between gap-3">
        <StatusBadge status={debate.status} />
        <div className="flex items-center gap-1 text-xs font-medium text-on-surface-variant">
          <Clock className="h-3.5 w-3.5" />
          {formatDate(debate.created_at)}
        </div>
      </div>

      <h3 className="mb-4 line-clamp-2 text-base font-bold leading-snug text-ink">
        {debate.thesis}
      </h3>

      {debate.status === 'completed' && (
        <div className="mt-auto space-y-3 border-t border-accent-border pt-4">
          <div className="flex items-center gap-2">
            <Trophy className="h-4 w-4 text-role-judge" />
            {debate.final_winner ? (
              <WinnerBadge winner={debate.final_winner} />
            ) : (
              <span className="text-sm text-on-surface-variant">No winner</span>
            )}
          </div>
          <div className="flex items-center gap-3">
            <ScoreChip score={debate.final_challenger_score} label="Challenger" color="challenger" />
            <ScoreChip score={debate.final_defender_score} label="Defender" color="defender" />
          </div>
        </div>
      )}

      {debate.status !== 'completed' && (
        <div className="mt-auto border-t border-accent-border pt-4">
          <p className="text-sm text-on-surface-variant">
            {debate.rounds_count} rounds
          </p>
        </div>
      )}
    </Card>
  )
}
