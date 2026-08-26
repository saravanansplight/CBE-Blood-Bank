import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import api from '../../api/client'
import { useToast } from '../../context/ToastContext'
import { Loader, BloodChip, UrgencyBadge, StatusBadge } from '../../components/ui'
import { formatDate } from '../../utils/helpers'

export default function DonorRequestDetails() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { showToast } = useToast()
  const [r, setR] = useState(null)
  const [error, setError] = useState('')

  const load = () => api(`/blood-requests/${id}`).then(setR).catch((e) => setError(e.message))
  useEffect(() => { load() }, [id])

  const respond = async (action) => {
    if (action === 'accept' && !confirm('Confirm you accept this blood request? The requester will be notified.')) return
    try {
      const data = await api(`/donors/${id}/${action}`, { method: 'POST' })
      showToast(data.message, 'success')
      load()
    } catch (err) { showToast(err.message, 'error') }
  }

  if (error) return <div className="card p-8 text-center text-red-600">{error}</div>
  if (!r) return <Loader />

  const match = r.isMatching
  const resp = r.myResponse

  return (
    <div className="max-w-6xl mx-auto animate-fade-in">
      <button onClick={() => navigate(-1)} className="text-sm text-slate-500 hover:text-red-600 mb-4">← Back</button>
      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-4">
          <div className="card p-6">
            <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
              <div className="flex items-center gap-3">
                <BloodChip group={r.bloodGroup} />
                <div><div className="font-mono text-xs text-slate-400">{r.requestId}</div><div className="font-bold text-lg text-slate-800">{r.hospitalName}</div></div>
              </div>
              <UrgencyBadge u={r.urgency} />
            </div>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <Row label="🩸 Units Required" value={r.unitsRequired} />
              <Row label="📍 Location" value={r.locationName} />
              {r.distance && <Row label="📏 Distance from you" value={r.distance} />}
              <Row label="📅 Required Date" value={formatDate(r.requiredDate)} />
              <Row label="🕐 Required Time" value={r.requiredTime} />
              <Row label="📊 Status" value={<StatusBadge s={r.status} />} />
              <Row label="🕒 Created" value={r.createdAgo} />
              <Row label="👤 Requested by" value={r.requesterName} />
            </div>
            {r.message && <div className="mt-4 rounded-xl bg-slate-50 p-4 text-sm text-slate-600"><b>Message:</b> {r.message}</div>}
          </div>

          {match ? (
            <div className="card p-6 border-l-4 border-l-emerald-500">
              <div className="flex items-center gap-2 mb-3"><span className="badge badge-match">🟢 Matching Blood Group</span></div>
              {resp === 'ACCEPTED' ? (
                <div className="space-y-4">
                  <div className="rounded-xl bg-emerald-50 border border-emerald-200 p-4 text-emerald-800">
                    <div className="font-bold text-base mb-1">✅ You Accepted to Donate Blood!</div>
                    <p className="text-xs text-emerald-700">The requester has been notified. You can now contact the requester or hospital team below to coordinate donation.</p>
                  </div>

                  <div className="rounded-xl bg-slate-50 border border-slate-200 p-4">
                    <h4 className="font-bold text-slate-800 text-sm mb-3">📞 Requester Contact Details</h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between items-center py-1 border-b border-slate-200">
                        <span className="text-slate-500 font-medium">Contact Person:</span>
                        <span className="font-bold text-slate-800">{r.requesterName}</span>
                      </div>
                      <div className="flex justify-between items-center py-1 border-b border-slate-200">
                        <span className="text-slate-500 font-medium">Hospital:</span>
                        <span className="font-bold text-slate-800">{r.hospitalName} ({r.locationName})</span>
                      </div>
                      {r.requesterMobile && (
                        <div className="flex justify-between items-center py-1 border-b border-slate-200">
                          <span className="text-slate-500 font-medium">Phone Number:</span>
                          <span className="font-bold text-slate-800 font-mono">{r.requesterMobile}</span>
                        </div>
                      )}
                    </div>

                    <div className="mt-4 flex flex-wrap gap-2">
                      {r.requesterMobile && (
                        <a
                          href={`tel:${r.requesterMobile}`}
                          className="btn btn-success btn-sm flex items-center gap-1.5 font-bold shadow-sm hover:scale-105"
                        >
                          <span>📞 Call Requester ({r.requesterMobile})</span>
                        </a>
                      )}
                      {r.requesterEmail && (
                        <a
                          href={`mailto:${r.requesterEmail}`}
                          className="btn btn-outline btn-sm text-xs"
                        >
                          ✉️ Send Email
                        </a>
                      )}
                    </div>
                  </div>
                </div>
              ) : resp === 'REJECTED' ? (
                <div className="rounded-xl bg-red-50 p-4 text-red-700 font-medium">✕ You declined this request. You won't be notified about it again.</div>
              ) : (
                <>
                  <p className="text-sm text-slate-600 mb-4">This request matches your blood group. Would you like to respond?</p>
                  <div className="flex gap-3">
                    <button onClick={() => respond('accept')} className="btn btn-success">✓ Accept Request</button>
                    <button onClick={() => respond('reject')} className="btn btn-danger">✕ Reject Request</button>
                  </div>
                </>
              )}
            </div>
          ) : (
            <div className="card p-6 border-l-4 border-l-slate-300">
              <p className="text-sm text-slate-500">⚠️ This request does not match your blood group. You can view it but cannot respond.</p>
            </div>
          )}
        </div>

        <div className="space-y-4">
          <div className="card p-5">
            <h3 className="font-bold text-slate-800 mb-3">Request Snapshot</h3>
            <div className="space-y-2 text-sm">
              {[['Blood Group', r.bloodGroup], ['Urgency', r.urgency], ['Units', r.unitsRequired], ['Location', r.locationName]].map(([k, v]) => (
                <div key={k} className="flex justify-between border-b border-slate-100 pb-2"><span className="text-slate-500">{k}</span><span className="font-semibold text-slate-800">{v}</span></div>
              ))}
            </div>
          </div>
          <div className="card p-5 bg-amber-50 border-amber-100">
            <p className="text-xs text-amber-800">⚠️ <b>Disclaimer:</b> Donor availability does not guarantee blood availability. Final eligibility must be determined by medical professionals.</p>
          </div>
        </div>
      </div>
    </div>
  )
}

function Row({ label, value }) {
  return <div><div className="text-xs text-slate-400 uppercase">{label}</div><div className="font-semibold text-slate-700 mt-0.5">{value}</div></div>
}
