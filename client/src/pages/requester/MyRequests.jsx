import { useState, useEffect } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import api from '../../api/client'
import { PageHeader, Loader, EmptyState, BloodChip, UrgencyBadge, StatusBadge } from '../../components/ui'

export default function MyRequests() {
  const [searchParams] = useSearchParams()
  const filterType = searchParams.get('filter') // 'pending'

  const [data, setData] = useState(null)
  const [error, setError] = useState('')

  useEffect(() => { api('/requesters/requests').then(setData).catch((e) => setError(e.message)) }, [])

  if (error) return <div className="card p-8 text-center text-red-600">{error}</div>
  if (!data) return <Loader />

  const requestsToShow = data.requests.filter((r) => {
    if (filterType === 'pending') return r.pendingCount > 0
    if (filterType === 'notified') return r.notifiedCount > 0 && r.respondedCount === 0
    if (filterType === 'responded') return r.respondedCount > 0
    return true
  })

  const getSubtitle = () => {
    if (filterType === 'pending') return "Showing requests with pending donor responses."
    if (filterType === 'notified') return "Showing requests with notified donors."
    if (filterType === 'responded') return "Showing requests with donor responses."
    return "All requests you have raised."
  }

  return (
    <div className="max-w-5xl mx-auto animate-fade-in">
      <PageHeader 
        title="📋 My Blood Requests" 
        subtitle={getSubtitle()}
      >
        <div className="flex gap-2">
          {filterType && filterType !== 'notified' && filterType !== 'responded' && (
            <Link to="/requester/my-requests" className="btn btn-outline btn-sm">Clear Filter ✕</Link>
          )}
          <Link to="/requester/create-request" className="btn btn-primary btn-sm">➕ Create Request</Link>
        </div>
      </PageHeader>
      <div className="space-y-4">
        {requestsToShow.length ? requestsToShow.map((r) => (
          <Link key={r._id} to={`/requester/request/${r._id}`} className="card card-hover p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 group">
            <div className="flex items-center gap-4">
              <BloodChip group={r.bloodGroup} />
              <div>
                <div className="font-mono text-xs text-slate-400">{r.requestId}</div>
                <div className="font-bold text-slate-800">{r.hospitalName}</div>
                <div className="text-sm text-slate-500">📍 {r.locationName} • {r.unitsRequired}u • {r.createdAgo}</div>
              </div>
            </div>
            <div className="flex items-center justify-between sm:justify-end gap-3 w-full sm:w-auto mt-2 sm:mt-0">
              <div className="flex items-center gap-2">
                <UrgencyBadge u={r.urgency} />
                <StatusBadge s={r.status} />
              </div>
              <span className="text-xs font-bold text-red-600 hover:text-red-800 transition-colors flex items-center gap-0.5 group-hover:translate-x-1 duration-200">
                View →
              </span>
            </div>
          </Link>
        )) : <EmptyState msg="You have not created any blood requests yet." icon="📋" />}
      </div>
    </div>
  )
}
