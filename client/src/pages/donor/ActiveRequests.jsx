import { useState, useEffect } from 'react'
import api from '../../api/client'
import { PageHeader, Loader, EmptyState, RequestCard } from '../../components/ui'

export default function ActiveRequests() {
  const [data, setData] = useState(null)
  const [summary, setSummary] = useState(null)
  const [error, setError] = useState('')

  useEffect(() => {
    Promise.all([api('/blood-requests/active'), api('/blood-requests/active/summary')])
      .then(([d, s]) => { setData(d); setSummary(s) })
      .catch((e) => setError(e.message))
  }, [])

  if (error) return <div className="card p-8 text-center text-red-600">{error}</div>
  if (!data || !summary) return <Loader />

  return (
    <div className="animate-fade-in">
      <PageHeader title="🩸 Active Blood Requests" subtitle="The common board visible to every donor. Requests matching your blood group are highlighted." />
      <div className="flex flex-wrap items-center gap-3 mb-6">
        <div className="card px-5 py-3 flex items-center gap-3">
          <span className="text-2xl">🔴</span>
          <div><div className="text-2xl font-extrabold text-red-600 leading-none">{data.total}</div><div className="text-xs text-slate-500">Active Requests</div></div>
        </div>
        <div className="hidden sm:flex flex-wrap gap-2">
          {Object.entries(summary.byBloodGroup).map(([g, n]) => (
            <span key={g} className="badge bg-slate-100 text-slate-600">{g}: {n}</span>
          ))}
        </div>
      </div>
      <div className="space-y-4">
        {data.requests.length ? data.requests.map((r) => <RequestCard key={r._id} r={r} basePath="/donor/request" />) : <EmptyState msg="No active blood requests right now." icon="🩸" />}
      </div>
    </div>
  )
}
