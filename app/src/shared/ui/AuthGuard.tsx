import { Navigate, Outlet } from 'react-router-dom'
import { routes } from '../lib/routes'
import { getAccessToken } from '../utils/authUtils'

export function AuthGuard() {
  const token = getAccessToken()

  if (!token) {
    return <Navigate to={routes.root} replace />
  }

  return <Outlet />
}
