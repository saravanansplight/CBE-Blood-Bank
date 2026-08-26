import { useState, useEffect } from 'react'
import api from '../../api/client'
import { PageHeader, Loader, EmptyState, RequestCard, BloodChip } from '../../components/ui'

export default function MatchingRequests() {
  const [data, setData] = useState(null)
  const [error, setError] = useState('')

  useEffect(() => {
    api('/donors/matching').then(setData).catch((e) => setError(e.message))
  }, [])

  if (error) return <div className="card p-8 text-center text-red-600">{error}</div>
  if (!data) return <Loader />

  return (
    <div className="animate-fade-in">
      <PageHeader title="🎯 My Matching Requests" subtitle="Active requests that match your blood group. Only you can Accept or Reject these.">
        <div className="card px-5 py-3 flex items-center gap-3">
          <BloodChip group={data.bloodGroup} />
          <div><div className="text-2xl font-extrabold text-green-600 leading-none">{data.total}</div><div className="text-xs text-slate-500">Matching</div></div>
        </div>
      </PageHeader>
      <div className="space-y-4">
        {data.requests.length ? data.requests.map((r) => <RequestCard key={r._id} r={r} basePath="/donor/request" />) : <EmptyState msg="No matching requests right now. Check back soon!" icon="🎯" />}
      </div>
    </div>
  )
}
