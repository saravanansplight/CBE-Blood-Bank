import { useState, useEffect } from 'react'
import api from '../../api/client'
import { StatCard, Loader, StatusBadge } from '../../components/ui'

export default function AdminAnalytics() {
  const [a, setA] = useState(null)
  const [error, setError] = useState('')

  useEffect(() => { api('/admin/analytics').then(setA).catch((e) => setError(e.message)) }, [])

  if (error) return <div className="card p-8 text-center text-red-600">{error}</div>
  if (!a) return <Loader />

  const maxReq = Math.max(1, ...Object.values(a.byBloodGroup).map((g) => g.requests))
  const maxLoc = Math.max(1, ...Object.values(a.byLocation))
  const locEntries = Object.entries(a.byLocation).sort((x, y) => y[1] - x[1])

  return (
    <div className="animate-fade-in">
      <div className="mb-6">
        <h1 className="text-2xl font-extrabold text-slate-800">📈 Analytics</h1>
        <p className="text-slate-500 text-sm">Network insights across Coimbatore.</p>
      </div>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <StatCard label="Total Donors" value={a.totalDonors} icon="👥" accent="red" />
        <StatCard label="Available" value={a.availableDonors} icon="✅" accent="green" />
        <StatCard label="Notifications Sent" value={a.notificationsSent} icon="🔔" accent="amber" />
        <StatCard label="Responses" value={a.donorResponses.total} icon="🤝" accent="blue" />
      </div>

      <div className="grid lg:grid-cols-2 gap-6 mb-6">
        <div className="card p-6">
          <h3 className="font-bold text-slate-800 mb-4">Requests vs Donors by Blood Group</h3>
          <div className="space-y-3">
            {Object.entries(a.byBloodGroup).map(([g, vals]) => (
              <div key={g}>
                <div className="flex justify-between text-sm mb-1"><span className="font-semibold">{g}</span><span className="text-slate-500">{vals.donors} donors • {vals.requests} requests</span></div>
                <div className="flex gap-1 h-3 rounded-full overflow-hidden bg-slate-100">
                  <div className="bg-green-500" style={{ width: `${(vals.donors / Math.max(1, a.totalDonors)) * 100}%` }} />
                  <div className="bg-red-500" style={{ width: `${(vals.requests / maxReq) * 100}%` }} />
                </div>
              </div>
            ))}
          </div>
          <div className="flex gap-4 text-xs text-slate-500 mt-4"><span className="flex items-center gap-1"><span className="w-3 h-3 rounded bg-green-500" />Donors</span><span className="flex items-center gap-1"><span className="w-3 h-3 rounded bg-red-500" />Requests</span></div>
        </div>

        <div className="card p-6">
          <h3 className="font-bold text-slate-800 mb-4">Requests by Location</h3>
          <div className="space-y-2">
            {locEntries.length ? locEntries.map(([loc, n]) => (
              <div key={loc} className="flex items-center gap-3">
                <div className="w-28 text-xs text-slate-600 truncate">{loc}</div>
                <div className="flex-1 bg-slate-100 rounded-full h-5 overflow-hidden">
                  <div className="bg-gradient-to-r from-red-500 to-rose-500 h-full rounded-full flex items-center justify-end pr-2" style={{ width: `${Math.max(8, (n / maxLoc) * 100)}%` }}>
                    <span className="text-[10px] text-white font-bold">{n}</span>
                  </div>
                </div>
              </div>
            )) : <p className="text-slate-400 text-sm">No data yet.</p>}
          </div>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <div className="card p-6">
          <h3 className="font-bold text-slate-800 mb-4">Request Status Breakdown</h3>
          <div className="grid grid-cols-2 gap-3">
            {Object.entries(a.statusCounts).map(([s, n]) => (
              <div key={s} className="flex items-center justify-between rounded-xl bg-slate-50 px-4 py-3"><StatusBadge s={s} /><span className="font-bold text-slate-700">{n}</span></div>
            ))}
            {Object.keys(a.statusCounts).length === 0 && <p className="text-slate-400 text-sm">No data.</p>}
          </div>
        </div>
        <div className="card p-6">
          <h3 className="font-bold text-slate-800 mb-4">Donor Responses</h3>
          <div className="flex gap-6 items-center">
            <div className="text-center"><div className="text-4xl font-extrabold text-green-600">{a.donorResponses.accepted}</div><div className="text-sm text-slate-500">Accepted</div></div>
            <div className="text-center"><div className="text-4xl font-extrabold text-red-600">{a.donorResponses.rejected}</div><div className="text-sm text-slate-500">Rejected</div></div>
            <div className="text-center"><div className="text-4xl font-extrabold text-slate-600">{a.donorResponses.total}</div><div className="text-sm text-slate-500">Total</div></div>
          </div>
        </div>
      </div>
    </div>
  )
}
