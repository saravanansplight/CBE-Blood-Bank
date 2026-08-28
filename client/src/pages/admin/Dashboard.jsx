import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import api from '../../api/client'
import { StatCard, Loader } from '../../components/ui'

export default function AdminDashboard() {
  const [stats, setStats] = useState(null)
  const [error, setError] = useState('')

  useEffect(() => { api('/admin/dashboard').then((d) => setStats(d.stats)).catch((e) => setError(e.message)) }, [])

  if (error) return <div className="card p-8 text-center text-red-600">{error}</div>
  if (!stats) return <Loader />

  return (
    <div className="animate-fade-in">
      <div className="card overflow-hidden mb-6">
        <div className="hero-grad hero-grid p-6 text-white flex items-center gap-4">
          <div className="w-16 h-16 rounded-full bg-white/20 flex items-center justify-center text-3xl">🛡️</div>
          <div><h1 className="text-2xl md:text-3xl font-extrabold">Admin Control Center</h1><p className="text-red-100 text-sm">Monitor donors, requests &amp; responses across Coimbatore</p></div>
        </div>
      </div>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-6">
        <StatCard label="Total Donors" value={stats.totalDonors} icon="👥" accent="red" to="/admin/donors" />
        <StatCard label="Active Requests" value={stats.totalActiveRequests} icon="🩸" accent="blue" to="/admin/requests" />
        <StatCard label="Normal" value={stats.normalRequests} icon="🟢" accent="green" to="/admin/requests?urgency=Normal" />
        <StatCard label="Urgent" value={stats.urgentRequests} icon="🟠" accent="amber" to="/admin/requests?urgency=Urgent" />
        <StatCard label="Critical" value={stats.criticalRequests} icon="🔴" accent="red" to="/admin/requests?urgency=Critical" />
        <StatCard label="Responses" value={stats.totalResponses} icon="🤝" accent="amber" to="/admin/requests?status=DONOR_RESPONDED" />
      </div>
      <div className="grid lg:grid-cols-3 gap-6">
        <Link to="/admin/donors" className="card card-hover p-6"><div className="text-3xl mb-2">👥</div><h3 className="font-bold text-slate-800">Donor Management</h3><p className="text-sm text-slate-500 mt-1">View, verify, activate or deactivate donors. See name changes instantly.</p></Link>
        <Link to="/admin/requests" className="card card-hover p-6"><div className="text-3xl mb-2">🩸</div><h3 className="font-bold text-slate-800">Request Management</h3><p className="text-sm text-slate-500 mt-1">Track every request, its matching donors and responses.</p></Link>
        <Link to="/admin/analytics" className="card card-hover p-6"><div className="text-3xl mb-2">📈</div><h3 className="font-bold text-slate-800">Analytics</h3><p className="text-sm text-slate-500 mt-1">Requests by blood group, location and response insights.</p></Link>
      </div>
    </div>
  )
}
