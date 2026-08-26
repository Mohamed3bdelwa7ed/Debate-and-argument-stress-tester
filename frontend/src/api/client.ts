import axios, { AxiosError, InternalAxiosRequestConfig } from 'axios'
import type { ApiError } from '@/types'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000'

export const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
})

export function getToken(): string | null {
  return localStorage.getItem('debate_token')
}

export function setToken(token: string): void {
  localStorage.setItem('debate_token', token)
}

export function removeToken(): void {
  localStorage.removeItem('debate_token')
}

api.interceptors.request.use((config: InternalAxiosRequestConfig) => {
  const token = getToken()
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

api.interceptors.response.use(
  (response) => response,
  (error: AxiosError<ApiError>) => {
    if (error.response?.status === 401 && !error.config?.url?.includes('/auth/me')) {
      removeToken()
      window.location.href = '/login'
    }
    return Promise.reject(error)
  }
)

export function getApiError(error: unknown): { code: string; message: string } {
  const axiosError = error as AxiosError<ApiError>
  if (axiosError.response?.data?.error) {
    return {
      code: axiosError.response.data.error.code,
      message: axiosError.response.data.error.message,
    }
  }
  return {
    code: 'NETWORK_ERROR',
    message: 'Something went wrong. Please try again.',
  }
}
