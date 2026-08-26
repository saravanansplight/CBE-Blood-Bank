import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import api from '../api/client'
import { useAuth } from '../context/AuthContext'
import { useToast } from '../context/ToastContext'
import Logo from '../components/Logo'

const empty = { fullName: '', username: '', mobile: '', email: '', password: '', confirmPassword: '' }

export default function RequesterRegister() {
  const { login } = useAuth()
  const { showToast } = useToast()
  const navigate = useNavigate()
  const [form, setForm] = useState(empty)
  const [busy, setBusy] = useState(false)
  const set = (k, v) => setForm({ ...form, [k]: v })

  const submit = async (e) => {
    e.preventDefault()
    setBusy(true)
    try {
      const data = await api('/auth/register/requester', { method: 'POST', auth: false, body: form })
      login({ token: data.token, role: 'requester', fullName: data.fullName })
      showToast('Registration successful! Welcome 🎉', 'success')
      setTimeout(() => navigate('/requester/dashboard'), 900)
    } catch (err) {
      showToast(err.message, 'error'); setBusy(false)
    }
  }

  return (
    <div className="bg-slate-50 min-h-screen">
      <header className="bg-white border-b border-slate-200 sticky top-0 z-40">
        <div className="max-w-5xl mx-auto px-4 h-16 flex items-center justify-between">
          <Logo />
          <Link to="/login" className="btn btn-outline btn-sm">Login</Link>
        </div>
      </header>
      <main className="max-w-xl mx-auto px-4 py-8">
        <div className="text-center mb-6">
          <div className="w-16 h-16 mx-auto rounded-2xl bg-red-50 flex items-center justify-center text-3xl mb-3">🩸</div>
          <h1 className="text-3xl font-extrabold text-slate-800">Register as Requester</h1>
          <p className="text-slate-500 mt-1">Create an account to raise emergency blood requests in Coimbatore.</p>
        </div>
        <form onSubmit={submit} className="card p-6 md:p-8 space-y-5">
          <div><label className="field-label">Full Name *</label><input className="input" placeholder="e.g. Priya Subramanian" value={form.fullName} onChange={(e) => set('fullName', e.target.value)} required /></div>
          <div className="grid md:grid-cols-2 gap-4">
            <div><label className="field-label">Username *</label><input className="input" placeholder="Choose a username" value={form.username} onChange={(e) => set('username', e.target.value)} required /></div>
            <div><label className="field-label">Mobile Number *</label><input className="input" placeholder="10-digit mobile" pattern="[0-9]{10}" maxLength="10" value={form.mobile} onChange={(e) => set('mobile', e.target.value)} required /></div>
          </div>
          <div><label className="field-label">Email *</label><input type="email" className="input" placeholder="you@example.com" value={form.email} onChange={(e) => set('email', e.target.value)} required /></div>
          <div className="grid md:grid-cols-2 gap-4">
            <div><label className="field-label">Password *</label><input type="password" className="input" placeholder="Min 6 characters" minLength="6" value={form.password} onChange={(e) => set('password', e.target.value)} required /></div>
            <div><label className="field-label">Confirm Password *</label><input type="password" className="input" placeholder="Re-enter password" value={form.confirmPassword} onChange={(e) => set('confirmPassword', e.target.value)} required /></div>
          </div>
          <button type="submit" disabled={busy} className="btn btn-primary w-full py-3 text-base">{busy ? 'Registering...' : '🩸 Register as Requester'}</button>
          <p className="text-center text-sm text-slate-500">Already have an account? <Link to="/login" className="text-red-600 font-semibold">Login here</Link></p>
        </form>
      </main>
    </div>
  )
}
