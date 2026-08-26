import { useState, useEffect } from 'react'
import api from '../../api/client'
import { useAuth } from '../../context/AuthContext'
import { useToast } from '../../context/ToastContext'
import { PageHeader, Loader, BloodChip, AvailabilityBadge } from '../../components/ui'
import LocationSelect from '../../components/LocationSelect'

export default function DonorProfile() {
  const { updateName } = useAuth()
  const { showToast } = useToast()
  const [d, setD] = useState(null)
  const [error, setError] = useState('')
  const [form, setForm] = useState(null)
  const [busy, setBusy] = useState(false)
  const [pw, setPw] = useState({ currentPassword: '', newPassword: '' })

  useEffect(() => {
    api('/donors/dashboard').then((data) => {
      setD(data.donor)
      updateName(data.donor.fullName)
      setForm({
        fullName: data.donor.fullName, username: data.donor.username, email: data.donor.email,
        mobile: data.donor.mobile, age: data.donor.age, gender: data.donor.gender,
        locationName: data.donor.locationName, availabilityStatus: data.donor.availabilityStatus,
        lastDonationDate: data.donor.lastDonationDate ? data.donor.lastDonationDate.slice(0, 10) : '',
      })
    }).catch((e) => setError(e.message))
  }, [updateName])

  if (error) return <div className="card p-8 text-center text-red-600">{error}</div>
  if (!form) return <Loader />
  const set = (k, v) => setForm({ ...form, [k]: v })

  const save = async (e) => {
    e.preventDefault()
    setBusy(true)
    try {
      const data = await api('/donors/profile', { method: 'PUT', body: form })
      setD(data.donor)
      updateName(data.donor.fullName)
      showToast('Profile updated successfully!', 'success')
    } catch (err) { showToast(err.message, 'error') }
    setBusy(false)
  }

  const changePw = async (e) => {
    e.preventDefault()
    try {
      const data = await api('/donors/password', { method: 'PUT', body: pw })
      showToast(data.message, 'success'); setPw({ currentPassword: '', newPassword: '' })
    } catch (err) { showToast(err.message, 'error') }
  }

  return (
    <div className="max-w-6xl mx-auto animate-fade-in">
      <PageHeader title="👤 My Profile" subtitle="Edit your details. Your display name updates instantly across the portal, requester and admin views." />
      <div className="grid lg:grid-cols-3 gap-6">
        <form onSubmit={save} className="card p-6 lg:col-span-2 space-y-4">
          <div className="grid md:grid-cols-2 gap-4">
            <div><label className="field-label">Display Name *</label><input className="input" value={form.fullName} onChange={(e) => set('fullName', e.target.value)} required /></div>
            <div><label className="field-label">Username</label><input className="input" value={form.username} onChange={(e) => set('username', e.target.value)} /></div>
          </div>
          <div className="grid md:grid-cols-2 gap-4">
            <div><label className="field-label">Email *</label><input type="email" className="input" value={form.email} onChange={(e) => set('email', e.target.value)} required /></div>
            <div><label className="field-label">Mobile *</label><input className="input" value={form.mobile} onChange={(e) => set('mobile', e.target.value)} required /></div>
          </div>
          <div className="grid md:grid-cols-3 gap-4">
            <div><label className="field-label">Age *</label><input type="number" min="18" max="65" className="input" value={form.age} onChange={(e) => set('age', e.target.value)} required /></div>
            <div>
              <label className="field-label">Gender</label>
              <select className="select" value={form.gender} onChange={(e) => set('gender', e.target.value)}>
                {['Male', 'Female', 'Other'].map((g) => <option key={g}>{g}</option>)}
              </select>
            </div>
            <div>
              <label className="field-label">Blood Group</label>
              <select className="select" disabled><option>{d.bloodGroup}</option></select>
              <p className="text-[11px] text-slate-400 mt-1">Blood group cannot be changed.</p>
            </div>
          </div>
          <div className="grid md:grid-cols-2 gap-4">
            <div><label className="field-label">Coimbatore Location</label><LocationSelect value={form.locationName} onChange={(e) => set('locationName', e.target.value)} /></div>
            <div>
              <label className="field-label">Availability</label>
              <select className="select" value={form.availabilityStatus} onChange={(e) => set('availabilityStatus', e.target.value)}>
                {['Available', 'Temporarily Unavailable', 'Not Available'].map((a) => <option key={a}>{a}</option>)}
              </select>
            </div>
          </div>
          <div><label className="field-label">Last Donation Date</label><input type="date" className="input" value={form.lastDonationDate} onChange={(e) => set('lastDonationDate', e.target.value)} /></div>
          <button type="submit" disabled={busy} className="btn btn-primary">{busy ? 'Saving...' : '💾 Save Changes'}</button>
        </form>

        <div className="space-y-4">
          <div className="card p-6 text-center">
            <div className="w-20 h-20 mx-auto rounded-full bg-gradient-to-br from-red-500 to-red-700 text-white flex items-center justify-center text-3xl font-extrabold mb-3">{d.fullName.charAt(0).toUpperCase()}</div>
            <div className="font-bold text-lg text-slate-800">{d.fullName}</div>
            <div className="flex justify-center mt-2"><BloodChip group={d.bloodGroup} size="sm" /></div>
            <div className="mt-3"><AvailabilityBadge a={d.availabilityStatus} /></div>
            <div className="text-sm text-slate-400 mt-2">📍 {d.locationName}</div>
          </div>
          <details className="card p-5">
            <summary className="cursor-pointer font-semibold text-slate-700">🔑 Change Password</summary>
            <form onSubmit={changePw} className="mt-4 space-y-3">
              <input type="password" className="input" placeholder="Current password" value={pw.currentPassword} onChange={(e) => setPw({ ...pw, currentPassword: e.target.value })} required />
              <input type="password" className="input" placeholder="New password (min 6)" minLength="6" value={pw.newPassword} onChange={(e) => setPw({ ...pw, newPassword: e.target.value })} required />
              <button type="submit" className="btn btn-outline btn-sm w-full">Update Password</button>
            </form>
          </details>
        </div>
      </div>
    </div>
  )
}
