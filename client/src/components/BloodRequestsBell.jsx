import { useState, useEffect } from 'react'
import { createPortal } from 'react-dom'
import { Link } from 'react-router-dom'
import { BloodChip, UrgencyBadge, StatusBadge } from './ui'

export default function BloodRequestsBell() {
  const [open, setOpen] = useState(false)
  const [activeTab, setActiveTab] = useState('all') // 'all' | 'active'
  const [data, setData] = useState({
    totalActive: 0,
    totalRequests: 0,
    byBloodGroup: {},
    allByGroup: {},
    requests: [],
  })
  const [loading, setLoading] = useState(false)

  const loadData = async () => {
    try {
      setLoading(true)
      const token = localStorage.getItem('cbc_token')
      const headers = token ? { Authorization: `Bearer ${token}` } : {}

      const [sumRes, allRes] = await Promise.all([
        fetch('/api/blood-requests/active/summary', { headers }).then((r) => (r.ok ? r.json() : null)),
        fetch('/api/blood-requests/all', { headers }).then((r) => (r.ok ? r.json() : null)),
      ])

      const requestsList = allRes?.requests || []
      const totalReq = allRes?.total || sumRes?.totalRequests || requestsList.length

      setData({
        totalActive: sumRes?.totalActive || 0,
        totalRequests: totalReq,
        byBloodGroup: sumRes?.byBloodGroup || {},
        allByGroup: sumRes?.allByGroup || sumRes?.byBloodGroup || {},
        requests: requestsList,
      })
    } catch (_) {
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadData()
    const timer = setInterval(loadData, 15000)
    return () => clearInterval(timer)
  }, [])

  // Close on Escape key & lock body scroll when open
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') setOpen(false)
    }
    if (open) {
      document.body.style.overflow = 'hidden'
      window.addEventListener('keydown', handleKeyDown)
    } else {
      document.body.style.overflow = ''
    }
    return () => {
      document.body.style.overflow = ''
      window.removeEventListener('keydown', handleKeyDown)
    }
  }, [open])

  const bloodGroups = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-']
  const displayRequests =
    activeTab === 'active'
      ? data.requests.filter((r) => !['FULFILLED', 'CANCELLED', 'EXPIRED'].includes(r.status))
      : data.requests

  const badgeCount = data.totalRequests > 0 ? data.totalRequests : data.totalActive

  const modalContent = open ? (
    <div
      className="fixed inset-0 bg-slate-950/75 backdrop-blur-sm flex items-center justify-center p-3 sm:p-6 animate-fade-in"
      style={{ zIndex: 999999 }}
    >
      {/* Click outside backdrop to close */}
      <div className="absolute inset-0" onClick={() => setOpen(false)} />

      {/* Main Dialog Box */}
      <div className="bg-white rounded-2xl sm:rounded-3xl shadow-2xl w-full max-w-3xl max-h-[90vh] flex flex-col border border-slate-200 text-slate-800 relative z-10 overflow-hidden animate-scale-up">
        {/* Modal Header */}
        <div className="p-4 sm:p-5 px-5 sm:px-6 border-b border-slate-100 flex items-center justify-between bg-gradient-to-r from-red-50 via-rose-50/40 to-white shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-red-600 text-white flex items-center justify-center text-xl font-black shadow-sm shrink-0">
              🩸
            </div>
            <div>
              <h3 className="font-extrabold text-base sm:text-lg text-slate-900 flex flex-wrap items-center gap-2">
                <span>Coimbatore Blood Requests & Demands</span>
                <span className="badge badge-critical text-xs">
                  {data.totalRequests} Total ({data.totalActive} Active)
                </span>
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Live emergency requests across 15 Coimbatore city locations
              </p>
            </div>
          </div>
          <button
            onClick={() => setOpen(false)}
            className="w-9 h-9 rounded-xl bg-slate-100 text-slate-500 hover:text-slate-900 hover:bg-slate-200 flex items-center justify-center text-lg font-black transition-colors cursor-pointer shrink-0"
            title="Close"
          >
            ✕
          </button>
        </div>

        {/* Modal Scrollable Body */}
        <div className="p-4 sm:p-6 overflow-y-auto space-y-6 flex-1">
          {/* Demands by Blood Group */}
          <div className="bg-slate-50/90 p-4 sm:p-5 rounded-2xl border border-slate-200">
            <div className="flex items-center justify-between mb-3.5">
              <h4 className="text-xs font-black text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                <span>🩸 Demands By Blood Group</span>
              </h4>
              <span className="text-[11px] font-bold text-red-600 bg-red-50 border border-red-200 px-2.5 py-0.5 rounded-full">
                8 Blood Groups
              </span>
            </div>

            <div className="grid grid-cols-4 sm:grid-cols-8 gap-2 sm:gap-2.5">
              {bloodGroups.map((bg) => {
                const activeCount = data.byBloodGroup[bg] || 0
                const totalGroupCount = data.allByGroup[bg] || activeCount
                const isHot = activeCount > 0 || totalGroupCount > 0

                return (
                  <div
                    key={bg}
                    className={`rounded-xl py-3 px-1 text-center border transition-all flex flex-col items-center justify-center gap-1 ${
                      isHot
                        ? 'bg-white border-red-300 shadow-xs'
                        : 'bg-white/80 border-slate-200'
                    }`}
                  >
                    <div className="inline-flex items-center justify-center px-2 py-0.5 rounded-md bg-gradient-to-br from-red-500 to-red-700 text-white font-black text-xs shadow-2xs">
                      {bg}
                    </div>
                    <div className={`font-black text-base leading-tight mt-0.5 ${activeCount > 0 ? 'text-red-600' : 'text-slate-800'}`}>
                      {totalGroupCount}
                    </div>
                    <div className="text-[9.5px] text-slate-500 font-semibold">
                      {activeCount > 0 ? `${activeCount} Act` : 'Req'}
                    </div>
                  </div>
                )
              })}
            </div>
          </div>

          {/* Filter Tabs & Requests List */}
          <div>
            <div className="flex items-center justify-between mb-3.5 border-b border-slate-100 pb-2.5">
              <div className="flex gap-2">
                <button
                  onClick={() => setActiveTab('all')}
                  className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                    activeTab === 'all'
                      ? 'bg-red-600 text-white shadow-xs'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  All Requests ({data.requests.length})
                </button>
                <button
                  onClick={() => setActiveTab('active')}
                  className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                    activeTab === 'active'
                      ? 'bg-red-600 text-white shadow-xs'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  Active Only ({data.totalActive})
                </button>
              </div>
              <button
                onClick={loadData}
                disabled={loading}
                className="text-xs text-red-600 font-bold hover:underline flex items-center gap-1 cursor-pointer"
              >
                🔄 Refresh
              </button>
            </div>

            {displayRequests.length ? (
              <div className="space-y-3 max-h-80 overflow-y-auto pr-1">
                {displayRequests.map((r) => (
                  <div
                    key={r._id}
                    className="p-4 rounded-2xl border border-slate-100 hover:border-red-200 bg-slate-50/60 hover:bg-white transition-all flex flex-wrap items-center justify-between gap-3 shadow-2xs"
                  >
                    <div className="flex items-center gap-3.5">
                      <BloodChip group={r.bloodGroup} size="sm" />
                      <div>
                        <div className="font-bold text-slate-900 text-sm flex items-center gap-2">
                          <span>{r.hospitalName}</span>
                          <StatusBadge s={r.status} />
                        </div>
                        <div className="text-xs text-slate-500 flex flex-wrap gap-x-3 gap-y-0.5 mt-1">
                          <span>📍 {r.locationName}</span>
                          <span>🩸 {r.unitsRequired} unit{r.unitsRequired === 1 ? '' : 's'}</span>
                          <span>🕒 {r.createdAgo}</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <UrgencyBadge u={r.urgency} />
                      <Link
                        to={`/donor/request/${r._id}`}
                        onClick={() => setOpen(false)}
                        className="btn btn-primary btn-sm text-xs py-1.5 px-3 rounded-lg font-bold"
                      >
                        View
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-8 text-center rounded-2xl bg-slate-50 border border-dashed border-slate-200 text-slate-500 text-xs flex flex-col items-center gap-2">
                <span className="text-2xl">📋</span>
                <span>No blood requests found in the network.</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  ) : null

  return (
    <>
      <button
        onClick={() => {
          setOpen(true)
          loadData()
        }}
        className="bell-btn relative p-2 rounded-full hover:bg-red-50 text-slate-700 transition-all duration-150 cursor-pointer flex items-center justify-center shrink-0"
        title="Live Blood Requests & Demands"
      >
        <span className="text-xl">🔔</span>
        {badgeCount > 0 && (
          <span className="bell-dot">
            {badgeCount > 9 ? '9+' : badgeCount}
          </span>
        )}
      </button>

      {/* Render via React Portal on document.body to escape header stacking context */}
      {typeof document !== 'undefined' && createPortal(modalContent, document.body)}
    </>
  )
}
