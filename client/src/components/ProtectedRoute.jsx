import { Navigate, Outlet } from 'react-router-dom'
import { useAuth, portalHome } from '../context/AuthContext'

// role = specific role to guard; anyRole = allow any of these roles
export default function ProtectedRoute({ role, anyRole }) {
  const { user } = useAuth()
  if (!user) return <Navigate to="/login" replace />
  if (role && user.role !== role) return <Navigate to={portalHome(user.role)} replace />
  if (anyRole && !anyRole.includes(user.role)) return <Navigate to={portalHome(user.role)} replace />
  return <Outlet />
}
