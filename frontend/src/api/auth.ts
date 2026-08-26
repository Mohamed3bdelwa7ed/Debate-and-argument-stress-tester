import { api } from './client'
import type { LoginCredentials, LoginResponse, RegisterCredentials, RegisterResponse, User } from '@/types'

export async function login(credentials: LoginCredentials): Promise<LoginResponse> {
  const { data } = await api.post<LoginResponse>('/api/auth/login', credentials)
  return data
}

export async function register(credentials: RegisterCredentials): Promise<RegisterResponse> {
  const { data } = await api.post<RegisterResponse>('/api/auth/register', credentials)
  return data
}

export async function getCurrentUser(): Promise<User> {
  const { data } = await api.get<User>('/api/auth/me')
  return data
}
