import { Link } from 'react-router-dom'
import { urgencyClass, urgencyDot, statusClass, availabilityClass } from '../utils/helpers'

export function BloodChip({ group, size = '' }) {
  return <span className={`bg-chip ${size === 'sm' ? 'bg-chip-sm' : ''}`}>{group}</span>
}

export function UrgencyBadge({ u }) {
  return <span className={`badge ${urgencyClass(u)}`}>{urgencyDot(u)} {u}</span>
}
export function StatusBadge({ s }) {
  return <span className={`badge ${statusClass(s)}`}>{s.replace(/_/g, ' ')}</span>
}
export function AvailabilityBadge({ a }) {
  return <span className={`badge ${availabilityClass(a)}`}>{a}</span>
}

export function StatCard({ label, value, icon, accent = 'red', to }) {
  const themes = {
    red: { text: 'text-red-600', bg: 'bg-red-50 text-red-600 border border-red-100' },
    green: { text: 'text-emerald-600', bg: 'bg-emerald-50 text-emerald-600 border border-emerald-100' },
    blue: { text: 'text-blue-600', bg: 'bg-blue-50 text-blue-600 border border-blue-100' },
    amber: { text: 'text-amber-600', bg: 'bg-amber-50 text-amber-600 border border-amber-100' },
  }
  const theme = themes[accent] || themes.red

  const inner = (
    <>
      <div className="flex-1 min-w-0">
        <div className={`text-3xl font-extrabold ${theme.text}`}>{value}</div>
        <div className="text-xs sm:text-sm text-slate-500 font-semibold mt-0.5 truncate">{label}</div>
        {to && (
          <div className="text-[11px] font-bold text-slate-400 mt-1 flex items-center gap-1 group-hover:text-red-600 transition-colors">
            <span>View →</span>
          </div>
        )}
      </div>
      <div className={`stat-icon-box ${theme.bg}`}>
        {icon}
      </div>
    </>
  )

  if (to) {
    return (
      <Link to={to} className="card stat-card p-5 group cursor-pointer border border-slate-100 hover:border-red-200">
        {inner}
      </Link>
    )
  }

  return (
    <div className="card stat-card p-5 border border-slate-100">
      {inner}
    </div>
  )
}

export function Loader() {
  return <div className="flex justify-center py-20"><div className="spinner" /></div>
}

export function EmptyState({ msg, icon = '📭' }) {
  return (
    <div className="card p-12 text-center">
      <div className="text-5xl mb-3">{icon}</div>
      <p className="text-slate-500">{msg}</p>
    </div>
  )
}

export function PageHeader({ title, subtitle, children }) {
  return (
    <div className="mb-6 animate-fade-in">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-800">{title}</h1>
          {subtitle && <p className="text-slate-500 text-sm mt-0.5">{subtitle}</p>}
        </div>
        {children}
      </div>
    </div>
  )
}

// Shared blood-request card used by donor Active & Matching lists
export function RequestCard({ r, basePath }) {
  const matchBadge = r.isMatching
    ? <span className="badge badge-match">🟢 Matching Blood Group</span>
    : <span className="badge bg-slate-100 text-slate-500">Available Request</span>
  const respBadge = r.myResponse === 'ACCEPTED'
    ? <span className="badge badge-accepted">✓ You Accepted</span>
    : r.myResponse === 'REJECTED'
    ? <span className="badge badge-rejected">✕ You Declined</span>
    : null
  return (
    <div className={`card card-hover p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 ${r.isMatching ? 'border-l-4 border-l-green-500' : ''}`}>
      <div className="flex items-center gap-4">
        <BloodChip group={r.bloodGroup} />
        <div>
          <div className="flex items-center gap-2 flex-wrap mb-1">
            <span className="font-mono text-xs text-slate-400">{r.requestId}</span>
            {matchBadge}{respBadge}
          </div>
          <div className="font-bold text-slate-800">{r.hospitalName || 'Hospital'}</div>
          <div className="text-sm text-slate-500 flex flex-wrap gap-x-4 gap-y-1 mt-0.5">
            <span>📍 {r.locationName}</span>
            <span>🩸 {r.unitsRequired} unit{r.unitsRequired === 1 ? '' : 's'}</span>
            {r.distance && <span>📏 {r.distance}</span>}
            <span>🕒 {r.createdAgo}</span>
          </div>
        </div>
      </div>
      <div className="flex items-center gap-2 shrink-0">
        <UrgencyBadge u={r.urgency} />
        <Link to={`${basePath}/${r._id}`} className="btn btn-primary btn-sm">View</Link>
      </div>
    </div>
  )
}

// Blood-group demand summary grid
export function BloodGroupSummary({ byGroup, total }) {
  const order = ['A+','A-','B+','B-','AB+','AB-','O+','O-']
  return (
    <div className="card p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-bold text-slate-800">Current Active Requests — Blood Group Demand</h3>
        <span className="badge badge-critical">🔴 {total} Active</span>
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {order.map((g) => {
          const n = byGroup[g] || 0
          const hot = n > 0
          return (
            <div key={g} className={`rounded-xl p-3 text-center ${hot ? 'bg-red-50 border border-red-100' : 'bg-slate-50'}`}>
              <div className="flex justify-center mb-1"><BloodChip group={g} size="sm" /></div>
              <div className={`text-xl font-extrabold ${hot ? 'text-red-600' : 'text-slate-400'}`}>{n}</div>
              <div className="text-[10px] text-slate-400 uppercase">{n === 1 ? 'Request' : 'Requests'}</div>
            </div>
          )
        })}
      </div>
      <div className="text-center text-sm text-slate-500 mt-4">Total: <b className="text-red-600">{total} Active Request{total === 1 ? '' : 's'}</b></div>
    </div>
  )
}
