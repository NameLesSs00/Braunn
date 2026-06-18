import { Navigate, Outlet } from 'react-router-dom'
import { routes } from '../lib/routes'

export function AuthGuard() {
  const isAuthenticated = localStorage.getItem('isAuthenticated') === 'true'

  if (!isAuthenticated) {
    return <Navigate to={routes.login} replace />
  }

  return <Outlet />
}
