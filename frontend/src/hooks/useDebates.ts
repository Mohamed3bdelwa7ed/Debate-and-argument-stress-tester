import { useQuery } from '@tanstack/react-query'
import { listDebates } from '@/api/debates'

export function useDebates(page = 1, limit = 20) {
  return useQuery({
    queryKey: ['debates', page, limit],
    queryFn: () => listDebates(page, limit),
  })
}
