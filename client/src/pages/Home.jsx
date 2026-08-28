import { useState } from 'react'
import { Link } from 'react-router-dom'
import Logo from '../components/Logo'
import MongoStatusBadge from '../components/MongoStatusBadge'
import BloodRequestsBell from '../components/BloodRequestsBell'
import { useAuth } from '../context/AuthContext'
import { BLOOD_GROUPS, LOCATIONS } from '../utils/helpers'

export default function Home() {
  const { user } = useAuth()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const role = user?.role

  const dashLink = role === 'admin' ? '/admin/dashboard' : role === 'requester' ? '/requester/dashboard' : '/donor/dashboard'

  return (
    <div className="bg-slate-50 min-h-screen">
      {/* NAV */}
      <header className="topnav sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-3 sm:px-6 h-16 flex items-center justify-between gap-2 sm:gap-4">
          <Logo />

          <nav className="hidden lg:flex items-center gap-1 xl:gap-2">
            <a href="#how" className="nav-link">How It Works</a>
            <a href="#groups" className="nav-link">Blood Groups</a>
            <a href="#coverage" className="nav-link">CBE Coverage</a>
            <a href="#features" className="nav-link">Features</a>
          </nav>

          <div className="flex items-center gap-1 sm:gap-2 shrink-0">
            <MongoStatusBadge />

            {/* Total Requests Live Bell Button */}
            <BloodRequestsBell />

            {/* User or Auth Links */}
            {user ? (
              <Link to={dashLink} className="btn btn-primary btn-sm font-bold shadow-xs">
                📊 Dashboard
              </Link>
            ) : (
              <div className="hidden md:flex items-center gap-1 sm:gap-2">
                <Link to="/login" className="btn btn-outline btn-sm font-semibold">
                  Login
                </Link>
                <Link to="/donor-register" className="btn btn-primary btn-sm font-semibold hidden sm:inline-flex">
                  Become a Donor
                </Link>
              </div>
            )}

            {/* Mobile Menu Hamburger */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden btn btn-ghost btn-sm text-lg p-1.5 ml-0.5 text-slate-700"
              aria-label="Toggle navigation menu"
            >
              {mobileMenuOpen ? '✕' : '☰'}
            </button>
          </div>
        </div>

        {/* Mobile Dropdown Drawer */}
        {mobileMenuOpen && (
          <div className="lg:hidden border-t border-slate-100 bg-white/95 backdrop-blur-md px-4 py-3 shadow-lg animate-fade-in">
            <div className="flex flex-col gap-1.5">
              <a
                href="#how"
                onClick={() => setMobileMenuOpen(false)}
                className="nav-link text-slate-700 py-2 px-3 rounded-lg hover:bg-slate-50"
              >
                📖 How It Works
              </a>
              <a
                href="#groups"
                onClick={() => setMobileMenuOpen(false)}
                className="nav-link text-slate-700 py-2 px-3 rounded-lg hover:bg-slate-50"
              >
                🩸 Blood Groups
              </a>
              <a
                href="#coverage"
                onClick={() => setMobileMenuOpen(false)}
                className="nav-link text-slate-700 py-2 px-3 rounded-lg hover:bg-slate-50"
              >
                📍 15 CBE Locations
              </a>
              <a
                href="#features"
                onClick={() => setMobileMenuOpen(false)}
                className="nav-link text-slate-700 py-2 px-3 rounded-lg hover:bg-slate-50"
              >
                ⚡ Features
              </a>
              <hr className="my-1 border-slate-100" />
              {!user ? (
                <div className="flex flex-col gap-2 pt-1">
                  <Link
                    to="/donor-register"
                    onClick={() => setMobileMenuOpen(false)}
                    className="btn btn-primary w-full text-center"
                  >
                    ❤️ Become a Donor
                  </Link>
                  <Link
                    to="/requester-register"
                    onClick={() => setMobileMenuOpen(false)}
                    className="btn btn-success w-full text-center"
                  >
                    🩸 Request Blood
                  </Link>
                  <Link
                    to="/login"
                    onClick={() => setMobileMenuOpen(false)}
                    className="btn btn-outline w-full text-center"
                  >
                    Login
                  </Link>
                </div>
              ) : (
                <Link
                  to={dashLink}
                  onClick={() => setMobileMenuOpen(false)}
                  className="btn btn-primary w-full text-center mt-1"
                >
                  📊 Go to Dashboard
                </Link>
              )}
            </div>
          </div>
        )}
      </header>

      {/* HERO */}
      <section className="hero-grad hero-grid text-white relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-16 md:py-24 relative z-10">
          <div className="grid md:grid-cols-2 gap-10 items-center">
            <div className="animate-fade-in">
              <span className="badge bg-white/15 text-white mb-4">🩸 Coimbatore • Tamil Nadu • India</span>
              <h1 className="text-4xl md:text-6xl font-extrabold leading-tight mb-4">Find Blood.<br />Connect Donors.<br /><span className="text-rose-200">Respond Faster.</span></h1>
              <p className="text-lg text-red-100 mb-8 max-w-lg">A Coimbatore-focused emergency blood donor coordination platform linking donors, requesters and administrators across 15 major city locations.</p>
              <div className="flex flex-wrap gap-3">
                <Link to="/requester-register" className="btn btn-success text-base px-6 py-3">🩸 Request Blood</Link>
                <Link to="/donor-register" className="btn bg-white text-red-600 hover:bg-red-50 text-base px-6 py-3">❤️ Become a Donor</Link>
              </div>
              <div className="flex gap-8 mt-10">
                <div><div className="text-3xl font-extrabold">15</div><div className="text-red-200 text-sm">CBE Locations</div></div>
                <div><div className="text-3xl font-extrabold">8</div><div className="text-red-200 text-sm">Blood Groups</div></div>
                <div><div className="text-3xl font-extrabold">24/7</div><div className="text-red-200 text-sm">Emergency Ready</div></div>
              </div>
            </div>
            <div className="hidden md:flex justify-center animate-fade-in">
              <div className="relative">
                <div className="w-72 h-72 rounded-full bg-white/10 flex items-center justify-center pulse-ring">
                  <div className="w-52 h-52 rounded-full bg-white/15 flex items-center justify-center">
                    <svg viewBox="0 0 24 24" className="w-28 h-28 fill-white"><path d="M12 2s6 7.5 6 12a6 6 0 0 1-12 0c0-4.5 6-12 6-12z" /></svg>
                  </div>
                </div>
                <div className="absolute -top-2 -right-4 bg-white text-red-600 rounded-xl px-3 py-2 shadow-lg font-bold text-sm">⚡ Instant Match</div>
                <div className="absolute bottom-0 -left-6 bg-white text-green-600 rounded-xl px-3 py-2 shadow-lg font-bold text-sm">🔔 Smart Alerts</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section id="how" className="max-w-7xl mx-auto px-4 sm:px-6 py-16">
        <div className="text-center mb-12">
          <span className="badge badge-critical">SIMPLE PROCESS</span>
          <h2 className="text-3xl md:text-4xl font-extrabold text-slate-800 mt-3">How It Works</h2>
          <p className="text-slate-500 mt-2">Three roles working together to save lives across Coimbatore.</p>
        </div>
        <div className="grid md:grid-cols-3 gap-6">
          {[
            { icon: '🆘', tag: 'STEP 1 — REQUESTER', color: 'text-red-600', bg: 'bg-red-50', title: 'Raise a Blood Request', desc: 'A requester logs the required blood group, units, hospital and Coimbatore location with an urgency level.' },
            { icon: '🎯', tag: 'STEP 2 — SYSTEM', color: 'text-green-600', bg: 'bg-green-50', title: 'Match & Notify Donors', desc: 'The system finds exact blood-group donors, ranks them by distance and sends personal matching notifications.' },
            { icon: '🤝', tag: 'STEP 3 — DONOR', color: 'text-blue-600', bg: 'bg-blue-50', title: 'Donor Responds', desc: 'Matching donors view the request and Accept or Reject. The requester tracks every response in real time.' },
          ].map((s) => (
            <div key={s.tag} className="card card-hover p-7 text-center">
              <div className={`w-14 h-14 mx-auto rounded-2xl ${s.bg} flex items-center justify-center text-3xl mb-4`}>{s.icon}</div>
              <div className={`${s.color} font-bold text-sm mb-1`}>{s.tag}</div>
              <h3 className="text-xl font-bold mb-2">{s.title}</h3>
              <p className="text-slate-500 text-sm">{s.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* BLOOD GROUPS */}
      <section id="groups" className="bg-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-10">
            <span className="badge badge-urgent">8 BLOOD GROUPS</span>
            <h2 className="text-3xl md:text-4xl font-extrabold text-slate-800 mt-3">Supported Blood Groups</h2>
            <p className="text-slate-500 mt-2">Exact blood-group matching ensures only compatible donors are alerted.</p>
          </div>
          <div className="grid grid-cols-4 md:grid-cols-8 gap-4">
            {BLOOD_GROUPS.map((g) => (
              <div key={g} className="card card-hover p-5 text-center">
                <div className="flex justify-center mb-2"><span className="bg-chip">{g}</span></div>
                <div className="text-xs text-slate-400">Supported</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FEATURES */}
      <section id="features" className="max-w-7xl mx-auto px-4 sm:px-6 py-16">
        <div className="text-center mb-12">
          <span className="badge badge-fulfilled">CORE FEATURES</span>
          <h2 className="text-3xl md:text-4xl font-extrabold text-slate-800 mt-3">Two Ways Donors See Requests</h2>
          <p className="text-slate-500 mt-2 max-w-2xl mx-auto">Every donor sees the common active request board. Only matching donors get personal notifications &amp; can respond.</p>
        </div>
        <div className="grid md:grid-cols-2 gap-6">
          <div className="card p-7 border-t-4 border-t-blue-500">
            <div className="text-3xl mb-3">📋</div>
            <h3 className="text-xl font-bold mb-1">Common Active Requests</h3>
            <p className="text-slate-500 text-sm mb-4">Every logged-in donor sees the full list of currently active blood requests and a live blood-group demand summary — even if the blood group doesn't match theirs.</p>
            <div className="bg-slate-50 rounded-xl p-4 text-sm font-mono text-slate-600 space-y-1">
              <div className="flex justify-between"><span>A+</span><span>2 Requests</span></div>
              <div className="flex justify-between"><span>O+</span><span>3 Requests</span></div>
              <div className="flex justify-between"><span>B-</span><span>1 Request</span></div>
            </div>
          </div>
          <div className="card p-7 border-t-4 border-t-green-500">
            <div className="text-3xl mb-3">🔔</div>
            <h3 className="text-xl font-bold mb-1">Personal Matching Notifications</h3>
            <p className="text-slate-500 text-sm mb-4">When a request matches a donor's blood group, that donor alone receives a private notification and can Accept or Reject — non-matching donors cannot respond.</p>
            <div className="bg-green-50 rounded-xl p-4 text-sm">
              <div className="font-bold text-green-700">🔔 New Matching Blood Request</div>
              <div className="text-slate-600 mt-1">O+ required • Peelamedu • 2 units • Critical</div>
              <div className="flex gap-2 mt-2"><span className="badge badge-match">Matching</span></div>
            </div>
          </div>
        </div>
      </section>

      {/* COVERAGE */}
      <section id="coverage" className="bg-slate-900 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-10">
            <span className="badge bg-white/15 text-white">📍 15 LOCATIONS</span>
            <h2 className="text-3xl md:text-4xl font-extrabold mt-3">Coimbatore Coverage</h2>
            <p className="text-slate-400 mt-2">Our operational area spans these 15 major Coimbatore locations.</p>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
            {LOCATIONS.map((l) => (
              <div key={l} className="bg-white/5 hover:bg-white/10 rounded-lg px-4 py-3 text-sm text-center transition">📍 {l}</div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 py-16">
        <div className="card hero-grad p-10 md:p-14 text-center text-white">
          <h2 className="text-3xl md:text-4xl font-extrabold mb-3">Ready to save a life?</h2>
          <p className="text-red-100 mb-7 max-w-xl mx-auto">Join the Coimbatore blood donor network today, or raise an emergency blood request in seconds.</p>
          <div className="flex flex-wrap justify-center gap-3">
            <Link to="/donor-register" className="btn bg-white text-red-600 hover:bg-red-50 px-6 py-3">❤️ Register as Donor</Link>
            <Link to="/requester-register" className="btn btn-success px-6 py-3">🩸 Request Blood</Link>
          </div>
        </div>
      </section>

      {/* DISCLAIMER */}
      <section className="max-w-5xl mx-auto px-4 sm:px-6 pb-8">
        <div className="rounded-xl bg-amber-50 border border-amber-200 p-5 text-sm text-amber-800">
          <strong>⚠️ Medical Disclaimer:</strong> CBE BloodConnect is an academic blood donor coordination platform. Donor availability shown on this application does not guarantee blood availability. Final donor eligibility, blood compatibility and donation approval must be determined by qualified medical and blood-bank professionals.
        </div>
      </section>

      {/* FOOTER */}
      <footer className="bg-slate-800 text-slate-300">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-10 grid md:grid-cols-3 gap-8">
          <div>
            <div className="flex items-center gap-2 mb-3">
              <span className="drop-logo"><svg viewBox="0 0 24 24"><path d="M12 2s6 7.5 6 12a6 6 0 0 1-12 0c0-4.5 6-12 6-12z" /></svg></span>
              <div className="font-extrabold text-white text-lg">CBE BloodConnect</div>
            </div>
            <p className="text-sm text-slate-400">A Coimbatore-focused emergency blood donor coordination platform. Find Blood. Connect Donors. Respond Faster.</p>
          </div>
          <div>
            <h4 className="font-bold text-white mb-3">Quick Links</h4>
            <ul className="space-y-2 text-sm">
              <li><Link to="/login" className="hover:text-red-400">Login</Link></li>
              <li><Link to="/donor-register" className="hover:text-red-400">Donor Registration</Link></li>
              <li><Link to="/requester-register" className="hover:text-red-400">Request Blood</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="font-bold text-white mb-3">Coverage</h4>
            <p className="text-sm text-slate-400">15 major Coimbatore locations including Gandhipuram, Peelamedu, RS Puram, Singanallur &amp; more.</p>
          </div>
        </div>
        <div className="border-t border-slate-700 py-5 text-center text-sm text-slate-500">
          © 2026 CBE BloodConnect • MCA Mini Project • Built with React, Node.js, Express &amp; MongoDB Atlas
        </div>
      </footer>
    </div>
  )
}
