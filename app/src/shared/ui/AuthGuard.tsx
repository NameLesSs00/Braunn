import { Navigate, Outlet } from 'react-router-dom'
import { routes } from '../lib/routes'

export function AuthGuard() {
  const isAuthenticated = localStorage.getItem('isAuthenticated') === 'true'
  const hasToken = !!localStorage.getItem('access_token')

  if (!isAuthenticated || !hasToken) {
    return <Navigate to={routes.root} replace />
  }

  return <Outlet />
}
