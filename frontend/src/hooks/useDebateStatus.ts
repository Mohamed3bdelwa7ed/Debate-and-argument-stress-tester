import { useQuery } from '@tanstack/react-query'
import { getDebateStatus } from '@/api/debates'
import type { DebateStatus } from '@/types'

export function useDebateStatus(id: string | undefined) {
  return useQuery({
    queryKey: ['debate-status', id],
    queryFn: () => getDebateStatus(id!),
    enabled: !!id,
    refetchInterval: (query) => {
      const status = query.state.data?.status as DebateStatus | undefined
      return status === 'pending' || status === 'running' ? 2500 : false
    },
  })
}
