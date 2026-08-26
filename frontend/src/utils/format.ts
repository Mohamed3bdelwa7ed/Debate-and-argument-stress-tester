import { formatDistanceToNow, format } from 'date-fns'

export function formatDate(isoDate: string): string {
  return format(new Date(isoDate), 'MMM d, yyyy')
}

export function formatDateTime(isoDate: string): string {
  return format(new Date(isoDate), 'MMM d, yyyy h:mm a')
}

export function timeAgo(isoDate: string): string {
  return formatDistanceToNow(new Date(isoDate), { addSuffix: true })
}

export function truncate(str: string, length: number): string {
  if (str.length <= length) return str
  return str.slice(0, length).trim() + '…'
}

export function capitalize(str: string): string {
  if (!str) return ''
  return str.charAt(0).toUpperCase() + str.slice(1)
}

export function scoreOutOf10(score: number | null | undefined): string {
  if (score == null) return '—'
  return score.toFixed(1)
}
