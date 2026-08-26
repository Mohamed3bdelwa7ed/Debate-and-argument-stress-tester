import { Link, useNavigate } from 'react-router-dom'
import { LogOut, Zap, User } from 'lucide-react'
import { useAuth } from '@/hooks/useAuth'
import { Button } from './ui/Button'

export function Navbar() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  return (
    <header className="sticky top-0 z-40 w-full border-b border-accent-border bg-white/80 backdrop-blur-md">
      <div className="mx-auto flex max-w-container items-center justify-between px-6 py-3">
        <Link to="/dashboard" className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-white">
            <Zap className="h-4 w-4" />
          </div>
          <span className="text-lg font-extrabold tracking-tight text-ink">DebateAI</span>
        </Link>

        <div className="flex items-center gap-4">
          {user && (
            <>
              <div className="hidden items-center gap-2 text-sm font-medium text-on-surface-variant sm:flex">
                <User className="h-4 w-4" />
                {user.email}
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  logout()
                  navigate('/login')
                }}
              >
                <LogOut className="mr-1.5 h-4 w-4" />
                Log out
              </Button>
            </>
          )}
        </div>
      </div>
    </header>
  )
}
