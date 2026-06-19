import React, { useEffect } from 'react'
import { Navigate, Outlet } from 'react-router-dom'
import useAuthStore from '../store/authStore'
import { Loader2 } from 'lucide-react'

const ProtectedRoute = () => {
  const { isAuthenticated, loading, loadUser, token } = useAuthStore()

  useEffect(() => {
    if (token && !isAuthenticated) {
      loadUser()
    }
  }, [token, isAuthenticated, loadUser])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="w-10 h-10 text-primary animate-spin" />
      </div>
    )
  }

  if (!isAuthenticated && !token) {
    return <Navigate to="/login" replace />
  }

  return <Outlet />
}

export default ProtectedRoute
