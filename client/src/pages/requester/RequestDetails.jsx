import { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import api from '../../api/client'
import { useToast } from '../../context/ToastContext'
import { Loader, BloodChip, UrgencyBadge, StatusBadge, EmptyState } from '../../components/ui'
import { formatDate } from '../../utils/helpers'
import { ACTIVE_STATUSES } from '../../utils/helpers'

export default function RequesterRequestDetails() {
  const { id } = useParams()
  const { showToast } = useToast()
  const [r, setR] = useState(null)
  const [error, setError] = useState('')

  const load = () => api(`/requesters/requests/${id}`).then(setR).catch((e) => setError(e.message))
  useEffect(() => { load() }, [id])

  const cancel = async () => {
    if (!confirm('Cancel this blood request? Matching donors will be informed.')) return
    try { await api(`/requesters/requests/${id}/cancel`, { method: 'PATCH' }); showToast('Request cancelled.', 'success'); load() }
    catch (e) { showToast(e.message, 'error') }
  }

  if (error) return <div className="card p-8 text-center text-red-600">{error}</div>
  if (!r) return <Loader />
  const isActive = ACTIVE_STATUSES.includes(r.status) || r.status === 'NO_RESPONSE'

  return (
    <div className="max-w-6xl mx-auto animate-fade-in">
      <Link to="/requester/my-requests" className="text-sm text-slate-500 hover:text-red-600 mb-4 inline-block">← My Requests</Link>
      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-4">
          <div className="card p-6">
            <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
              <div className="flex items-center gap-3">
                <BloodChip group={r.bloodGroup} />
                <div><div className="font-mono text-xs text-slate-400">{r.requestId}</div><div className="font-bold text-lg text-slate-800">{r.hospitalName}</div></div>
              </div>
              <div className="flex items-center gap-2"><UrgencyBadge u={r.urgency} /><StatusBadge s={r.status} /></div>
            </div>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <Row label="🩸 Units" value={r.unitsRequired} />
              <Row label="📍 Location" value={r.locationName} />
              <Row label="📅 Required" value={`${formatDate(r.requiredDate)} ${r.requiredTime || ''}`} />
              <Row label="🕒 Created" value={r.createdAgo} />
              <Row label="👥 Donors Notified" value={r.matchedDonorCount} />
            </div>
            {r.message && <div className="mt-4 rounded-xl bg-slate-50 p-4 text-sm text-slate-600"><b>Message:</b> {r.message}</div>}
            {isActive && <div className="mt-4"><button onClick={cancel} className="btn btn-danger btn-sm">✕ Cancel Request</button></div>}
          </div>

          <div className="card p-6">
            <h3 className="font-bold text-slate-800 mb-3">🤝 Donor Responses</h3>
            {r.responses.length ? (
              <div className="space-y-3">
                {r.responses.map((res, i) => (
                  <div
                    key={i}
                    className={`p-4 rounded-xl border transition-all ${
                      res.responseStatus === 'ACCEPTED'
                        ? 'bg-emerald-50/80 border-emerald-300 shadow-sm'
                        : 'bg-slate-50 border-slate-200'
                    }`}
                  >
                    <div className="flex flex-wrap items-center justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <BloodChip group={res.bloodGroup} size="sm" />
                        <div>
                          <div className="font-bold text-slate-800 text-sm flex items-center gap-2">
                            <span>{res.donorName}</span>
                            {res.responseStatus === 'ACCEPTED' ? (
                              <span className="badge badge-accepted">✓ Accepted to Donate</span>
                            ) : (
                              <span className="badge badge-rejected">✕ Declined</span>
                            )}
                          </div>
                          <div className="text-xs text-slate-500 mt-0.5 flex flex-wrap gap-x-3">
                            {res.donorLocation && <span>📍 {res.donorLocation}</span>}
                            <span>📏 {res.distanceKm != null ? res.distanceKm + ' km away' : 'Nearby'}</span>
                            <span>🕒 {res.respondedAgo}</span>
                          </div>
                        </div>
                      </div>

                      {res.responseStatus === 'ACCEPTED' && res.donorMobile && (
                        <div className="flex flex-wrap items-center gap-2">
                          <a
                            href={`tel:${res.donorMobile}`}
                            className="btn btn-success btn-sm flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 shadow-sm hover:scale-105"
                          >
                            <span>📞 Call:</span>
                            <span className="font-mono">{res.donorMobile}</span>
                          </a>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : <p className="text-slate-400 text-sm py-4 text-center">No donor responses yet. Matching donors are being notified.</p>}
          </div>
        </div>

        <div className="space-y-4">
          <div className="card p-5">
            <h3 className="font-bold text-slate-800 mb-3">📜 Status History</h3>
            <div className="space-y-3">
              {r.history.length ? r.history.map((h, i) => (
                <div key={i} className="flex gap-3 text-sm">
                  <div className="w-2 h-2 rounded-full bg-red-500 mt-1.5 shrink-0" />
                  <div>
                    <span className="font-semibold text-slate-700">{h.status.replace(/_/g, ' ')}</span>
                    <div className="text-xs text-slate-400">{h.note} • {h.when} • by {h.changedBy}</div>
                  </div>
                </div>
              )) : <p className="text-slate-400 text-sm">No history.</p>}
            </div>
          </div>
          <div className="card p-5 bg-amber-50 border-amber-100">
            <p className="text-xs text-amber-800">⚠️ <b>Disclaimer:</b> A donor response indicates willingness — it does not confirm actual donation. Coordinate directly with the donor/medical team.</p>
          </div>
        </div>
      </div>
    </div>
  )
}

function Row({ label, value }) {
  return <div><div className="text-xs text-slate-400 uppercase">{label}</div><div className="font-semibold text-slate-700 mt-0.5">{value}</div></div>
}
