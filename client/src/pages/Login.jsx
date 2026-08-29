import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import api from '../api/client'
import { useAuth, portalHome } from '../context/AuthContext'
import { useToast } from '../context/ToastContext'
import Logo from '../components/Logo'

export default function Login() {
  const { user, login } = useAuth()
  const { showToast } = useToast()
  const navigate = useNavigate()
  const [form, setForm] = useState({ username: '', password: '' })
  const [show, setShow] = useState(false)
  const [busy, setBusy] = useState(false)

  useEffect(() => { if (user) navigate(portalHome(user.role), { replace: true }) }, [user, navigate])

  const submit = async (e) => {
    e.preventDefault()
    setBusy(true)
    try {
      const data = await api('/auth/login', { method: 'POST', auth: false, body: form })
      login({ token: data.token, role: data.role, fullName: data.fullName })
      showToast('Login successful! Redirecting...', 'success')
      setTimeout(() => navigate(portalHome(data.role)), 700)
    } catch (err) {
      showToast(err.message, 'error'); setBusy(false)
    }
  }

  return (
    <div className="min-h-screen flex">
      <div className="hidden lg:flex lg:w-1/2 hero-grad hero-grid text-white p-12 flex-col justify-between">
        <Logo />
        <div>
          <h1 className="text-4xl font-extrabold leading-tight mb-4">Every second counts.<br />Every donor matters.</h1>
          <p className="text-red-100 max-w-md">Login to your portal — whether you donate blood, request it, or manage the network. Together we keep Coimbatore ready to respond.</p>
          <div className="flex gap-6 mt-8">
            <div><div className="text-3xl font-extrabold">15</div><div className="text-red-200 text-sm">Locations</div></div>
            <div><div className="text-3xl font-extrabold">8</div><div className="text-red-200 text-sm">Blood Groups</div></div>
          </div>
        </div>
        <p className="text-red-200 text-sm">© 2026 CBE BloodConnect</p>
      </div>

      <div className="w-full lg:w-1/2 flex items-center justify-center p-6 bg-slate-50">
        <div className="w-full max-w-md">
          <div className="lg:hidden flex items-center gap-2 mb-8 justify-center">
            <Logo />
          </div>
          <div className="card p-8 animate-fade-in">
            <h2 className="text-2xl font-extrabold text-slate-800 mb-1">Welcome Back 👋</h2>
            <p className="text-slate-500 text-sm mb-6">Login to access your portal.</p>
            <form onSubmit={submit} className="space-y-4">
              <div>
                <label className="field-label">Username</label>
                <input className="input" placeholder="Enter your username" value={form.username}
                  onChange={(e) => setForm({ ...form, username: e.target.value })} required />
              </div>
              <div>
                <label className="field-label">Password</label>
                <div className="relative">
                  <input type={show ? 'text' : 'password'} className="input pr-14" placeholder="Enter your password" value={form.password}
                    onChange={(e) => setForm({ ...form, password: e.target.value })} required />
                  <button type="button" onClick={() => setShow(!show)} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 text-sm">{show ? 'Hide' : 'Show'}</button>
                </div>
              </div>
              <button type="submit" disabled={busy} className="btn btn-primary w-full py-3 text-base">{busy ? 'Logging in...' : 'Login'}</button>
            </form>
            <div className="divider" />
            <div className="grid grid-cols-2 gap-3 text-sm">
              <Link to="/donor-register" className="btn btn-outline btn-sm">❤️ New Donor</Link>
              <Link to="/requester-register" className="btn btn-outline btn-sm">🩸 New Requester</Link>
            </div>
            <Link to="/" className="block text-center text-sm text-slate-500 hover:text-red-600 mt-4">← Back to home</Link>
          </div>

          <details className="mt-4 card p-4 text-sm">
            <summary className="cursor-pointer font-semibold text-slate-600">🔑 Demo login credentials</summary>
            <div className="mt-3 grid gap-2 text-xs">
              <div className="bg-slate-50 rounded px-3 py-2"><b>Admin:</b> admin / admin123</div>
              <div className="bg-slate-50 rounded px-3 py-2"><b>Requester:</b> priya1 / priya1</div>
              <div className="bg-slate-50 rounded px-3 py-2"><b>Donor (O+):</b> arun.o / donor123</div>
              <div className="bg-slate-50 rounded px-3 py-2"><b>Donor (A+):</b> arun.a / donor123</div>
            </div>
          </details>
        </div>
      </div>
    </div>
  )
}
