import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import api from '../../api/client'
import { PageHeader, Loader, EmptyState, BloodChip, UrgencyBadge, StatusBadge } from '../../components/ui'

export default function MyRequests() {
  const [data, setData] = useState(null)
  const [error, setError] = useState('')

  useEffect(() => { api('/requesters/requests').then(setData).catch((e) => setError(e.message)) }, [])

  if (error) return <div className="card p-8 text-center text-red-600">{error}</div>
  if (!data) return <Loader />

  return (
    <div className="max-w-5xl mx-auto animate-fade-in">
      <PageHeader title="📋 My Blood Requests" subtitle="All requests you have raised.">
        <Link to="/requester/create-request" className="btn btn-primary">➕ Create Request</Link>
      </PageHeader>
      <div className="space-y-4">
        {data.requests.length ? data.requests.map((r) => (
          <Link key={r._id} to={`/requester/request/${r._id}`} className="card card-hover p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-4">
              <BloodChip group={r.bloodGroup} />
              <div>
                <div className="font-mono text-xs text-slate-400">{r.requestId}</div>
                <div className="font-bold text-slate-800">{r.hospitalName}</div>
                <div className="text-sm text-slate-500">📍 {r.locationName} • {r.unitsRequired}u • {r.createdAgo}</div>
              </div>
            </div>
            <div className="flex items-center gap-2"><UrgencyBadge u={r.urgency} /><StatusBadge s={r.status} /></div>
          </Link>
        )) : <EmptyState msg="You have not created any blood requests yet." icon="📋" />}
      </div>
    </div>
  )
}
