import { useState, useEffect } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import Logo from './Logo'
import { useAuth } from '../context/AuthContext'
import api from '../api/client'

import MongoStatusBadge from './MongoStatusBadge'

const NAV = {
  donor: [
    { to: '/donor/dashboard', label: 'Dashboard', icon: '📊' },
    { to: '/donor/active-requests', label: 'Active Requests', icon: '🩸' },
    { to: '/donor/matching-requests', label: 'My Matching', icon: '🎯' },
  ],
  requester: [
    { to: '/requester/dashboard', label: 'Dashboard', icon: '📊' },
    { to: '/requester/create-request', label: 'Create Request', icon: '➕' },
    { to: '/requester/my-requests', label: 'My Requests', icon: '📋' },
  ],
  admin: [
    { to: '/admin/dashboard', label: 'Dashboard', icon: '📊' },
    { to: '/admin/donors', label: 'Donors', icon: '👥' },
    { to: '/admin/requests', label: 'Requests', icon: '🩸' },
    { to: '/admin/locations', label: 'Locations', icon: '📍' },
    { to: '/admin/analytics', label: 'Analytics', icon: '📈' },
  ],
}

export default function Navbar() {
  const { user, logout } = useAuth()
  const location = useLocation()
  const navigate = useNavigate()
  const [open, setOpen] = useState(false)
  const [bell, setBell] = useState(0)
  const role = user?.role

  const items = NAV[role] || []

  // Poll unread personal notifications for the bell badge (donors & requesters)
  useEffect(() => {
    if (role !== 'donor' && role !== 'requester') return
    let active = true
    const load = async () => {
      try {
        const { count } = await api('/notifications/unread/count')
        if (active) setBell(count || 0)
      } catch (_) {}
    }
    load()
    const t = setInterval(load, 15000)
    return () => { active = false; clearInterval(t) }
  }, [role, location.pathname])

  const doLogout = () => { logout(); navigate('/login') }
  const notifPath = role === 'requester' ? '/requester/notifications' : '/donor/notifications'

  return (
    <header className="topnav sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-3">
        <Logo to={role ? ({ donor: '/donor/dashboard', requester: '/requester/dashboard', admin: '/admin/dashboard' }[role]) : '/'} />

        <nav className="hidden lg:flex items-center gap-1">
          {items.map((i) => (
            <Link key={i.to} to={i.to} className={`nav-link ${location.pathname === i.to ? 'active' : ''}`}>
              {i.icon} <span className="hidden sm:inline">{i.label}</span>
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-1 sm:gap-2">
          <MongoStatusBadge />
          {(role === 'donor' || role === 'requester') && (
            <Link
              to={notifPath}
              className="bell-btn relative p-2 rounded-full hover:bg-red-50 text-slate-700 transition-colors"
              title="Notifications"
            >
              <span className="text-lg">🔔</span>
              {bell > 0 && <span className="bell-dot">{bell > 9 ? '9+' : bell}</span>}
            </Link>
          )}
          <div className="hidden sm:flex items-center gap-2 pl-2 border-l border-slate-200">
            <div className="w-9 h-9 rounded-full bg-gradient-to-br from-red-500 to-red-700 text-white flex items-center justify-center font-bold text-sm">
              {(user?.name || 'U').charAt(0).toUpperCase()}
            </div>
            <button onClick={doLogout} className="btn btn-ghost btn-sm">Logout</button>
          </div>
          <button className="lg:hidden btn btn-ghost btn-sm" onClick={() => setOpen(!open)}>☰</button>
        </div>
      </div>

      {open && (
        <div className="lg:hidden border-t border-slate-100 bg-white">
          <div className="px-4 py-3 flex flex-col gap-1">
            {items.map((i) => (
              <Link key={i.to} to={i.to} onClick={() => setOpen(false)} className={`nav-link ${location.pathname === i.to ? 'active' : ''}`}>
                {i.icon} {i.label}
              </Link>
            ))}
            {(role === 'donor' || role === 'requester') && (
              <Link to={notifPath} onClick={() => setOpen(false)} className="nav-link">
                🔔 Notifications {bell > 0 && `(${bell})`}
              </Link>
            )}
            {role === 'donor' && <Link to="/donor/profile" onClick={() => setOpen(false)} className="nav-link">👤 My Profile</Link>}
            <button onClick={doLogout} className="nav-link text-left text-red-600 mt-2">⏻ Logout</button>
          </div>
        </div>
      )}
    </header>
  )
}
