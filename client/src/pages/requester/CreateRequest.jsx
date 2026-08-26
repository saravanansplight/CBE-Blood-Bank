import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../../api/client'
import { useToast } from '../../context/ToastContext'
import { PageHeader } from '../../components/ui'
import LocationSelect from '../../components/LocationSelect'
import { BLOOD_GROUPS } from '../../utils/helpers'

export default function CreateRequest() {
  const { showToast } = useToast()
  const navigate = useNavigate()
  const [form, setForm] = useState({
    bloodGroup: '', unitsRequired: '1', hospitalName: '', locationName: '',
    requiredDate: new Date(Date.now() + 86400000).toISOString().slice(0, 10), requiredTime: '12:00',
    urgency: 'Critical', message: '',
  })
  const [busy, setBusy] = useState(false)
  const set = (k, v) => setForm({ ...form, [k]: v })

  const submit = async (e) => {
    e.preventDefault()
    setBusy(true)
    try {
      const data = await api('/requesters/requests', { method: 'POST', body: form })
      showToast(data.message, 'success', 5000)
      setTimeout(() => navigate(`/requester/request/${data.request._id}`), 1400)
    } catch (err) {
      showToast(err.message, 'error'); setBusy(false)
    }
  }

  return (
    <div className="max-w-3xl mx-auto animate-fade-in">
      <div className="text-center mb-6">
        <div className="w-16 h-16 mx-auto rounded-2xl bg-red-50 flex items-center justify-center text-3xl mb-2">🩸</div>
        <h1 className="text-2xl font-extrabold text-slate-800">Create Blood Request</h1>
        <p className="text-slate-500 text-sm">Matching blood-group donors across Coimbatore will be notified instantly.</p>
      </div>
      <form onSubmit={submit} className="card p-6 md:p-8 space-y-5">
        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <label className="field-label">Blood Group Required *</label>
            <select className="select" value={form.bloodGroup} onChange={(e) => set('bloodGroup', e.target.value)} required>
              <option value="">Select blood group</option>{BLOOD_GROUPS.map((g) => <option key={g}>{g}</option>)}
            </select>
          </div>
          <div>
            <label className="field-label">Units Required *</label>
            <input type="number" min="1" max="20" className="input" value={form.unitsRequired} onChange={(e) => set('unitsRequired', e.target.value)} required />
          </div>
        </div>
        <div><label className="field-label">Hospital Name *</label><input className="input" placeholder="e.g. KG Hospital, Peelamedu" value={form.hospitalName} onChange={(e) => set('hospitalName', e.target.value)} required /></div>
        <div className="grid md:grid-cols-3 gap-4">
          <div><label className="field-label">Coimbatore Location *</label><LocationSelect value={form.locationName} onChange={(e) => set('locationName', e.target.value)} /></div>
          <div><label className="field-label">Required Date *</label><input type="date" className="input" value={form.requiredDate} onChange={(e) => set('requiredDate', e.target.value)} required /></div>
          <div><label className="field-label">Required Time *</label><input type="time" className="input" value={form.requiredTime} onChange={(e) => set('requiredTime', e.target.value)} required /></div>
        </div>
        <div>
          <label className="field-label">Urgency *</label>
          <div className="grid grid-cols-3 gap-2">
            {[['Normal', '🟢', 'green'], ['Urgent', '🟠', 'amber'], ['Critical', '🔴', 'red']].map(([val, icon]) => (
              <label key={val} className="cursor-pointer">
                <input type="radio" name="urgency" className="hidden" checked={form.urgency === val} onChange={() => set('urgency', val)} />
                <div className={`border-2 rounded-xl p-3 text-center text-sm font-semibold ${form.urgency === val ? 'border-red-500 bg-red-50 text-red-600' : 'border-slate-200 text-slate-600'}`}>{icon} {val}</div>
              </label>
            ))}
          </div>
        </div>
        <div><label className="field-label">Additional Message</label><textarea className="textarea" rows="3" placeholder="Any details for donors (e.g. patient condition, contact preference)..." value={form.message} onChange={(e) => set('message', e.target.value)} /></div>
        <button type="submit" disabled={busy} className="btn btn-primary w-full py-3 text-base">{busy ? 'Creating & notifying donors...' : '🩸 Submit Blood Request'}</button>
      </form>
      <div className="mt-4 rounded-xl bg-blue-50 p-4 text-xs text-blue-700">
        ℹ️ On submit, the system finds exact blood-group donors, validates their Coimbatore location &amp; availability, ranks them by distance and sends personal matching notifications.
      </div>
    </div>
  )
}
