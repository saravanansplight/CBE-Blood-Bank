import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../../api/client'
import { useToast } from '../../context/ToastContext'
import { PageHeader, Loader, EmptyState } from '../../components/ui'

export default function RequesterNotifications() {
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
    if (notif.bloodRequestId) {
      navigate(`/requester/request/${notif.bloodRequestId}`)
    } else {
      navigate('/requester/my-requests')
    }
  }

  const markAll = async () => {
    try {
      await api('/notifications/read/all', { method: 'PATCH' })
      showToast('All notifications marked as read.', 'success')
      load()
    } catch (e) {
      showToast(e.message, 'error')
    }
  }

  if (error) return <div className="card p-8 text-center text-red-600">{error}</div>
  if (!items) return <Loader />

  const notifList = Array.isArray(items) ? items : []
  const unread = notifList.filter((n) => !n.isRead).length

  return (
    <div className="max-w-3xl mx-auto animate-fade-in">
      <PageHeader
        title="🔔 Requester Notifications"
        subtitle="Live alerts for donor responses, acceptances, and blood request updates."
      >
        {unread > 0 && (
          <button onClick={markAll} className="btn btn-outline btn-sm">
            ✓ Mark all read
          </button>
        )}
      </PageHeader>

      <div className="space-y-3">
        {notifList.length ? (
          notifList.map((n) => {
            const isAccepted = n.notificationType === 'DONOR_ACCEPTED'
            const cls = isAccepted
              ? 'border-l-emerald-500 bg-emerald-50/40'
              : n.urgency === 'Critical'
              ? 'border-l-red-500'
              : 'border-l-blue-500'

            return (
              <div
                key={n._id}
                className={`card p-4 border-l-4 ${cls} ${n.isRead ? 'opacity-70' : ''} cursor-pointer hover:shadow-md transition-all`}
                onClick={() => open(n)}
              >
                <div className="flex items-start gap-3">
                  <div className="text-2xl">{isAccepted ? '🤝' : n.urgency === 'Critical' ? '🔴' : '🔔'}</div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-bold text-slate-800">{n.title}</span>
                      {!n.isRead && <span className="badge badge-critical">New</span>}
                      {isAccepted && <span className="badge badge-accepted">Donor Ready</span>}
                    </div>
                    <p className="text-sm text-slate-600 mt-1">{n.message}</p>
                    <div className="text-xs text-slate-400 mt-1.5 flex items-center gap-2">
                      <span>🕒 {n.createdAgo}</span>
                      <span>•</span>
                      <span className="text-red-600 font-semibold">Click to view request →</span>
                    </div>
                  </div>
                </div>
              </div>
            )
          })
        ) : (
          <EmptyState msg="No notifications yet. You will be alerted as soon as donors respond." icon="🔔" />
        )}
      </div>
    </div>
  )
}
