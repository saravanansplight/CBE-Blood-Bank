import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import api from '../../api/client'
import { useAuth } from '../../context/AuthContext'
import { StatCard, Loader, BloodChip, UrgencyBadge, StatusBadge } from '../../components/ui'

export default function RequesterDashboard() {
  const { updateName } = useAuth()
  const [data, setData] = useState(null)
  const [error, setError] = useState('')

  useEffect(() => {
    api('/requesters/dashboard').then((d) => { setData(d); updateName(d.requester.fullName) }).catch((e) => setError(e.message))
  }, [updateName])

  if (error) return <div className="card p-8 text-center text-red-600">{error}</div>
  if (!data) return <Loader />
  const s = data.stats

  return (
    <div className="animate-fade-in">
      <div className="card overflow-hidden mb-6">
        <div className="hero-grad hero-grid p-6 text-white flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-full bg-white/20 flex items-center justify-center text-3xl font-extrabold">{data.requester.fullName.charAt(0).toUpperCase()}</div>
            <div>
              <h1 className="text-2xl md:text-3xl font-extrabold">Welcome, {data.requester.fullName} 👋</h1>
              <p className="text-red-100 text-sm">Raise and track emergency blood requests</p>
            </div>
          </div>
          <Link to="/requester/create-request" className="btn bg-white text-red-600 hover:bg-red-50">➕ Create Blood Request</Link>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <StatCard label="Total Requests" value={s.totalRequests} icon="📋" accent="blue" to="/requester/my-requests" />
        <StatCard label="Donors Notified" value={s.donorsNotified} icon="📢" accent="amber" to="/requester/my-requests" />
        <StatCard label="Donors Responded" value={s.donorsResponded} icon="🤝" accent="green" to="/requester/my-requests" />
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 card p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-slate-800">Recent Requests</h3>
            <Link to="/requester/my-requests" className="text-sm text-red-600 font-semibold">View all →</Link>
          </div>
          <div className="space-y-3">
            {data.recent.length ? data.recent.map((r) => (
              <Link key={r._id} to={`/requester/request/${r._id}`} className="flex items-center justify-between p-3 rounded-xl hover:bg-slate-50 border border-slate-100">
                <div className="flex items-center gap-3">
                  <BloodChip group={r.bloodGroup} size="sm" />
                  <div>
                    <div className="font-semibold text-slate-800 text-sm">{r.requestId}</div>
                    <div className="text-xs text-slate-500">📍 {r.locationName} • {r.unitsRequired}u • {r.createdAgo}</div>
                  </div>
                </div>
                <div className="flex items-center gap-2"><UrgencyBadge u={r.urgency} /><StatusBadge s={r.status} /></div>
              </Link>
            )) : <p className="text-slate-400 text-sm py-6 text-center">No requests yet. Create your first blood request!</p>}
          </div>
        </div>
        <div className="card p-6">
          <h3 className="font-bold text-slate-800 mb-4">⚡ Quick Actions</h3>
          <div className="space-y-2">
            <Link to="/requester/create-request" className="btn btn-primary w-full">➕ Create Request</Link>
            <Link to="/requester/my-requests" className="btn btn-outline w-full">📋 My Requests</Link>
          </div>
          <div className="mt-5 rounded-xl bg-blue-50 p-4 text-xs text-blue-700">
            💡 <b>How it works:</b> When you create a request, matching blood-group donors across Coimbatore are instantly notified and ranked by distance. Track their responses here.
          </div>
        </div>
      </div>
    </div>
  )
}
