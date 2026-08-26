import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import api from '../../api/client'
import { useAuth } from '../../context/AuthContext'
import { StatCard, BloodGroupSummary, BloodChip, AvailabilityBadge } from '../../components/ui'

export default function DonorDashboard() {
  const { updateName } = useAuth()
  const [dash, setDash] = useState(null)
  const [summary, setSummary] = useState(null)
  const [error, setError] = useState('')

  useEffect(() => {
    Promise.all([api('/donors/dashboard'), api('/blood-requests/active/summary')])
      .then(([d, s]) => { setDash(d); setSummary(s); updateName(d.donor.fullName) })
      .catch((e) => setError(e.message))
  }, [updateName])

  if (error) return <div className="card p-8 text-center text-red-600">{error}</div>
  if (!dash || !summary) return <div className="flex justify-center py-20"><div className="spinner" /></div>

  const d = dash.donor, s = dash.stats

  return (
    <div className="animate-fade-in">
      {/* Welcome banner */}
      <div className="card overflow-hidden mb-6">
        <div className="hero-grad hero-grid p-6 text-white">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-full bg-white/20 flex items-center justify-center text-3xl font-extrabold">{d.fullName.charAt(0).toUpperCase()}</div>
              <div>
                <h1 className="text-2xl md:text-3xl font-extrabold">Welcome, {d.fullName} 👋</h1>
                <p className="text-red-100 text-sm">Your donor portal overview</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <BloodChip group={d.bloodGroup} />
              <span className={`badge ${d.isVerified ? 'badge-accepted' : 'badge-pending'}`}>{d.isVerified ? '✓ Verified' : 'Pending'}</span>
            </div>
          </div>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 divide-x divide-slate-100">
          <div className="p-4 text-center"><div className="text-xs text-slate-400 uppercase">Blood Group</div><div className="font-bold text-slate-800 mt-1">{d.bloodGroup}</div></div>
          <div className="p-4 text-center"><div className="text-xs text-slate-400 uppercase">Location</div><div className="font-bold text-slate-800 mt-1">📍 {d.locationName}</div></div>
          <div className="p-4 text-center col-span-2 md:col-span-1"><div className="text-xs text-slate-400 uppercase">Availability</div><div className="mt-1"><AvailabilityBadge a={d.availabilityStatus} /></div></div>
        </div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <StatCard label="Active Blood Requests" value={s.activeRequests} icon="🩸" accent="red" to="/donor/active-requests" />
        <StatCard label="My Matching Requests" value={s.matchingRequests} icon="🎯" accent="green" to="/donor/matching-requests" />
        <StatCard label="Unread Notifications" value={s.unreadCount} icon="🔔" accent="amber" to="/donor/notifications" />
        <StatCard label="Accepted Requests" value={s.acceptedCount} icon="✅" accent="blue" to="/donor/matching-requests" />
      </div>

      <div className="card p-6 mb-6">
        <h3 className="font-bold text-slate-800 mb-4">⚡ Quick Actions</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <Link to="/donor/active-requests" className="btn btn-outline">🩸 Active Requests</Link>
          <Link to="/donor/matching-requests" className="btn btn-success">🎯 My Matches</Link>
          <Link to="/donor/notifications" className="btn btn-outline">🔔 Notifications</Link>
          <Link to="/donor/profile" className="btn btn-outline">👤 My Profile</Link>
        </div>
      </div>

      <BloodGroupSummary byGroup={summary.byBloodGroup} total={summary.totalActive} />
    </div>
  )
}
