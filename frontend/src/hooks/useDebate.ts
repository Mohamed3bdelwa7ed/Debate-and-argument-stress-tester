import { useQuery } from '@tanstack/react-query'
import { getDebate } from '@/api/debates'

export function useDebate(id: string | undefined) {
  return useQuery({
    queryKey: ['debate', id],
    queryFn: () => getDebate(id!),
    enabled: !!id,
  })
}
