import { api } from './client'
import type {
  DebateCreateRequest,
  DebateDetailResponse,
  DebateListResponse,
  DebateResponse,
  DebateStatusResponse,
} from '@/types'

export async function createDebate(request: DebateCreateRequest): Promise<DebateResponse> {
  const { data } = await api.post<DebateResponse>('/api/debates', request)
  return data
}

export async function listDebates(page = 1, limit = 20): Promise<DebateListResponse> {
  const { data } = await api.get<DebateListResponse>('/api/debates', {
    params: { page, limit },
  })
  return data
}

export async function getDebate(id: string): Promise<DebateDetailResponse> {
  const { data } = await api.get<DebateDetailResponse>(`/api/debates/${id}`)
  return data
}

export async function getDebateStatus(id: string): Promise<DebateStatusResponse> {
  const { data } = await api.get<DebateStatusResponse>(`/api/debates/${id}/status`)
  return data
}
