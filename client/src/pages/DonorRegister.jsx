import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import api from '../api/client'
import { useAuth } from '../context/AuthContext'
import { useToast } from '../context/ToastContext'
import Logo from '../components/Logo'
import LocationSelect from '../components/LocationSelect'
import { BLOOD_GROUPS } from '../utils/helpers'

const empty = {
  fullName: '', username: '', email: '', mobile: '', password: '', confirmPassword: '',
  age: '', gender: '', bloodGroup: '', locationName: '', availabilityStatus: 'Available', lastDonationDate: '',
}

export default function DonorRegister() {
  const { login } = useAuth()
  const { showToast } = useToast()
  const navigate = useNavigate()
  const [form, setForm] = useState(empty)
  const [consent, setConsent] = useState(false)
  const [busy, setBusy] = useState(false)

  const set = (k, v) => setForm({ ...form, [k]: v })

  const submit = async (e) => {
    e.preventDefault()
    setBusy(true)
    try {
      const data = await api('/auth/register/donor', { method: 'POST', auth: false, body: form })
      login({ token: data.token, role: 'donor', fullName: data.fullName })
      showToast('Registration successful! Welcome aboard 🎉', 'success')
      setTimeout(() => navigate('/donor/dashboard'), 900)
    } catch (err) {
      showToast(err.message, 'error'); setBusy(false)
    }
  }

  const input = (k, extra = {}) => (
    <input className="input" value={form[k]} onChange={(e) => set(k, e.target.value)} {...extra} />
  )

  return (
    <div className="bg-slate-50 min-h-screen">
      <header className="bg-white border-b border-slate-200 sticky top-0 z-40">
        <div className="max-w-5xl mx-auto px-4 h-16 flex items-center justify-between">
          <Logo />
          <Link to="/login" className="btn btn-outline btn-sm">Login</Link>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-4 py-8">
        <div className="text-center mb-6">
          <div className="w-16 h-16 mx-auto rounded-2xl bg-red-50 flex items-center justify-center text-3xl mb-3">❤️</div>
          <h1 className="text-3xl font-extrabold text-slate-800">Become a Blood Donor</h1>
          <p className="text-slate-500 mt-1">Join the Coimbatore blood donor network and help save lives.</p>
        </div>

        <form onSubmit={submit} className="card p-6 md:p-8 space-y-5">
          <div className="grid md:grid-cols-2 gap-4">
            <div><label className="field-label">Full Name *</label>{input('fullName', { placeholder: 'e.g. Arun Kumar', required: true })}</div>
            <div><label className="field-label">Username *</label>{input('username', { placeholder: 'Choose a username', required: true })}</div>
          </div>
          <div className="grid md:grid-cols-2 gap-4">
            <div><label className="field-label">Email *</label>{input('email', { type: 'email', placeholder: 'you@example.com', required: true })}</div>
            <div><label className="field-label">Mobile Number *</label>{input('mobile', { placeholder: '10-digit mobile', pattern: '[0-9]{10}', maxLength: 10, required: true })}</div>
          </div>
          <div className="grid md:grid-cols-2 gap-4">
            <div><label className="field-label">Password *</label>{input('password', { type: 'password', placeholder: 'Min 6 characters', minLength: 6, required: true })}</div>
            <div><label className="field-label">Confirm Password *</label>{input('confirmPassword', { type: 'password', placeholder: 'Re-enter password', required: true })}</div>
          </div>
          <div className="grid md:grid-cols-3 gap-4">
            <div><label className="field-label">Age *</label>{input('age', { type: 'number', min: 18, max: 65, placeholder: '18-65', required: true })}</div>
            <div>
              <label className="field-label">Gender *</label>
              <select className="select" value={form.gender} onChange={(e) => set('gender', e.target.value)} required>
                <option value="">Select</option><option>Male</option><option>Female</option><option>Other</option>
              </select>
            </div>
            <div>
              <label className="field-label">Blood Group *</label>
              <select className="select" value={form.bloodGroup} onChange={(e) => set('bloodGroup', e.target.value)} required>
                <option value="">Select</option>{BLOOD_GROUPS.map((g) => <option key={g}>{g}</option>)}
              </select>
            </div>
          </div>
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="field-label">Coimbatore Location *</label>
              <LocationSelect value={form.locationName} onChange={(e) => set('locationName', e.target.value)} />
            </div>
            <div>
              <label className="field-label">Availability Status</label>
              <select className="select" value={form.availabilityStatus} onChange={(e) => set('availabilityStatus', e.target.value)}>
                <option>Available</option><option>Temporarily Unavailable</option><option>Not Available</option>
              </select>
            </div>
          </div>
          <div><label className="field-label">Last Donation Date (optional)</label>{input('lastDonationDate', { type: 'date' })}</div>

          <div className="flex items-start gap-2 text-sm text-slate-500">
            <input type="checkbox" checked={consent} onChange={(e) => setConsent(e.target.checked)} required className="mt-1" />
            <label>I confirm the details are accurate and consent to be contacted for matching blood requests in Coimbatore.</label>
          </div>
          <button type="submit" disabled={busy} className="btn btn-primary w-full py-3 text-base">{busy ? 'Registering...' : '❤️ Register as Donor'}</button>
          <p className="text-center text-sm text-slate-500">Already have an account? <Link to="/login" className="text-red-600 font-semibold">Login here</Link></p>
        </form>

        <div className="mt-4 rounded-xl bg-amber-50 border border-amber-200 p-4 text-xs text-amber-800">
          <strong>Disclaimer:</strong> CBE BloodConnect is an academic blood donor coordination platform. Donor availability does not guarantee blood availability. Final eligibility and approval must be determined by qualified medical and blood-bank professionals.
        </div>
      </main>
    </div>
  )
}
