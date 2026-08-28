import { useState, useEffect } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import api from '../../api/client'
import { useToast } from '../../context/ToastContext'
import { PageHeader, Loader, BloodChip, UrgencyBadge, StatusBadge } from '../../components/ui'
import { formatDate } from '../../utils/helpers'

export default function AdminRequests() {
  const { showToast } = useToast()
  const [searchParams] = useSearchParams()
  const filterUrgency = searchParams.get('urgency') // e.g. 'Normal', 'Urgent', 'Critical'
  const filterStatus = searchParams.get('status') // e.g. 'DONOR_RESPONDED'

  const [data, setData] = useState(null)
  const [detail, setDetail] = useState(null)
  const [error, setError] = useState('')

  const load = () => api('/admin/requests').then(setData).catch((e) => setError(e.message))
  useEffect(() => { load() }, [])

  const view = async (id) => { try { setDetail(await api(`/admin/requests/${id}`)) } catch (e) { showToast(e.message, 'error') } }
  const updateStatus = async (id) => {
    const status = document.getElementById('statusSel').value
    try { await api(`/admin/requests/${id}/status`, { method: 'PATCH', body: { status } }); showToast('Status updated.', 'success'); setDetail(null); load() }
    catch (e) { showToast(e.message, 'error') }
  }

  if (error) return <div className="card p-8 text-center text-red-600">{error}</div>
  if (!data) return <Loader />

  const requestsToShow = data.requests.filter((r) => {
    const matchesUrgency = !filterUrgency || r.urgency === filterUrgency
    const matchesStatus = !filterStatus || r.status === filterStatus
    return matchesUrgency && matchesStatus
  })

  const hasFilter = filterUrgency || filterStatus

  return (
    <div className="animate-fade-in">
      <PageHeader 
        title="🩸 Request Management" 
        subtitle={
          hasFilter 
            ? `Showing only ${filterUrgency || ''} ${filterStatus ? filterStatus.replace(/_/g, ' ') : ''} requests.`
            : "All blood requests with status control."
        }
      >
        {hasFilter && (
          <Link to="/admin/requests" className="btn btn-outline btn-sm">Clear Filter ✕</Link>
        )}
      </PageHeader>
      <div className="space-y-3">
        {requestsToShow.map((r) => (
          <div key={r._id} className="card p-4 flex flex-col lg:flex-row lg:items-center justify-between gap-3">
            <div className="flex items-center gap-3 flex-wrap">
              <BloodChip group={r.bloodGroup} size="sm" />
              <div>
                <div className="font-mono text-xs text-slate-400">{r.requestId}</div>
                <div className="font-semibold text-slate-800 text-sm">{r.requesterName} • {r.hospitalName}</div>
                <div className="text-xs text-slate-500">📍 {r.locationName} • {r.unitsRequired}u • {r.createdAgo}</div>
              </div>
            </div>
            <div className="flex items-center gap-2 flex-wrap">
              <UrgencyBadge u={r.urgency} /><StatusBadge s={r.status} />
              <button onClick={() => view(r._id)} className="btn btn-primary btn-sm">View</button>
            </div>
          </div>
        ))}
      </div>

      {detail && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={(e) => e.target === e.currentTarget && setDetail(null)}>
          <div className="card p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3"><BloodChip group={detail.request.bloodGroup} /><div><div className="font-mono text-xs text-slate-400">{detail.request.requestId}</div><div className="font-bold text-slate-800">{detail.request.hospitalName}</div></div></div>
              <button onClick={() => setDetail(null)} className="btn btn-ghost btn-sm">✕</button>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm mb-4">
              <div><b>Requester:</b> {detail.request.requesterName}</div>
              <div><b>Units:</b> {detail.request.unitsRequired}</div>
              <div><b>Location:</b> {detail.request.locationName}</div>
              <div><b>Urgency:</b> {detail.request.urgency}</div>
              <div><b>Required:</b> {formatDate(detail.request.requiredDate)} {detail.request.requiredTime || ''}</div>
              <div><b>Status:</b> <StatusBadge s={detail.request.status} /></div>
            </div>
            {detail.request.message && <div className="rounded-xl bg-slate-50 p-3 text-sm mb-4">{detail.request.message}</div>}
            <h4 className="font-bold text-slate-700 mb-2">Matching Donors &amp; Responses</h4>
            <div className="space-y-2 mb-4">
              {detail.matches.length ? detail.matches.map((m, i) => (
                <div key={i} className="flex items-center justify-between p-2 rounded-lg border border-slate-100">
                  <div className="text-sm"><b>{m.donorName}</b> • {m.bloodGroup} • 📏 {m.distanceKm != null ? m.distanceKm + ' km' : 'N/A'}</div>
                  <span className={`badge ${m.responseStatus === 'ACCEPTED' ? 'badge-accepted' : m.responseStatus === 'REJECTED' ? 'badge-rejected' : 'badge-pending'}`}>{m.responseStatus}</span>
                </div>
              )) : <p className="text-sm text-slate-400">No matching donors recorded.</p>}
            </div>
            <div className="flex flex-wrap gap-2 items-center pt-3 border-t border-slate-100">
              <span className="text-sm text-slate-500">Update status:</span>
              <select id="statusSel" className="select max-w-xs" defaultValue={detail.request.status}>
                {['DONORS_NOTIFIED', 'DONOR_RESPONDED', 'FULFILLED', 'CANCELLED', 'EXPIRED', 'NO_RESPONSE'].map((s) => <option key={s}>{s}</option>)}
              </select>
              <button onClick={() => updateStatus(detail.request._id)} className="btn btn-primary btn-sm">Update</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
