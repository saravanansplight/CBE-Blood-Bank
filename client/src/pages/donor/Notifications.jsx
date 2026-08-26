import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../../api/client'
import { useToast } from '../../context/ToastContext'
import { PageHeader, Loader, EmptyState } from '../../components/ui'

export default function DonorNotifications() {
  const { showToast } = useToast()
  const navigate = useNavigate()
  const [items, setItems] = useState(null)
  const [error, setError] = useState('')

  const load = () =>
    api('/notifications')
      .then((res) => {
        const list = Array.isArray(res) ? res : (res?.notifications || [])
        setItems(list)
      })
      .catch((e) => setError(e.message))

  useEffect(() => { load() }, [])

  const open = async (notif) => {
    try { await api(`/notifications/${notif._id}/read`, { method: 'PATCH' }) } catch (_) {}
    navigate('/donor/matching-requests')
  }

  const markAll = async () => {
    try { await api('/notifications/read/all', { method: 'PATCH' }); showToast('All notifications marked as read.', 'success'); load() } catch (e) { showToast(e.message, 'error') }
  }

  if (error) return <div className="card p-8 text-center text-red-600">{error}</div>
  if (!items) return <Loader />

  const notifList = Array.isArray(items) ? items : []
  const unread = notifList.filter((n) => !n.isRead).length

  return (
    <div className="max-w-3xl mx-auto animate-fade-in">
      <PageHeader title="🔔 Notifications" subtitle="Personal matching notifications sent only to your blood group.">
        {unread ? <button onClick={markAll} className="btn btn-outline btn-sm">✓ Mark all read</button> : null}
      </PageHeader>
      <div className="space-y-3">
        {notifList.length ? notifList.map((n) => {
          const cls = n.urgency === 'Critical' ? 'border-l-red-500' : n.urgency === 'Urgent' ? 'border-l-amber-500' : 'border-l-green-500'
          return (
            <div key={n._id} className={`card p-4 border-l-4 ${cls} ${n.isRead ? 'opacity-70' : ''} cursor-pointer`} onClick={() => open(n)}>
              <div className="flex items-start gap-3">
                <div className="text-2xl">{n.urgency === 'Critical' ? '🔴' : '🔔'}</div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-bold text-slate-800">{n.title}</span>
                    {!n.isRead && <span className="badge badge-critical">New</span>}
                  </div>
                  <p className="text-sm text-slate-600 mt-1">{n.message}</p>
                  <div className="text-xs text-slate-400 mt-1">🕒 {n.createdAgo}</div>
                </div>
              </div>
            </div>
          )
        }) : <EmptyState msg="No notifications yet." icon="🔔" />}
      </div>
    </div>
  )
}
