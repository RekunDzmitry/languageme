import { useEffect } from 'react'
import { Navigate, useLocation } from 'react-router-dom'
import { useAuth } from '../../stores/AuthContext'
import { useProgress } from '../../stores/UserProgressContext'

// Wraps RequireAuth and additionally ensures the user is an admin.
// Non-admin authenticated users get a one-time toast and are redirected home.
export default function RequireAdmin({ children }) {
  const { isAuthenticated, isLoading, isAdmin } = useAuth()
  const { showNotification } = useProgress()
  const location = useLocation()
  const isForbidden = isAuthenticated && !isAdmin

  useEffect(() => {
    if (!isForbidden) return
    showNotification('Admin access required', 'info')
  }, [isForbidden, showNotification])

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="w-8 h-8 border-2 border-accent border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  if (!isAuthenticated) {
    return <Navigate to="/auth" state={{ from: location }} replace />
  }

  if (!isAdmin) {
    return <Navigate to="/" replace />
  }

  return children
}
