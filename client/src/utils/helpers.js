// Shared formatting helpers
export function formatDate(d) {
  if (!d) return '—'
  return new Date(d).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })
}

export function timeAgo(d) {
  if (!d) return ''
  const s = Math.floor((Date.now() - new Date(d).getTime()) / 1000)
  if (s < 60) return 'just now'
  const m = Math.floor(s / 60); if (m < 60) return `${m}m ago`
  const h = Math.floor(m / 60); if (h < 24) return `${h}h ago`
  const dd = Math.floor(h / 24); if (dd < 30) return `${dd}d ago`
  return formatDate(d)
}

export const urgencyClass = (u) =>
  u === 'Critical' ? 'badge-critical' : u === 'Urgent' ? 'badge-urgent' : 'badge-normal'
export const urgencyDot = (u) => (u === 'Critical' ? '🔴' : u === 'Urgent' ? '🟠' : '🟢')

export const statusClass = (s) => ({
  CREATED: 'badge-pending', MATCHING: 'badge-pending', DONORS_NOTIFIED: 'badge-pending',
  DONOR_RESPONDED: 'badge-active', FULFILLED: 'badge-fulfilled',
  CANCELLED: 'badge-cancelled', EXPIRED: 'badge-expired', NO_RESPONSE: 'badge-cancelled',
}[s] || 'badge-pending')

export const availabilityClass = (a) =>
  a === 'Available' ? 'badge-avail' : a === 'Temporarily Unavailable' ? 'badge-temp' : 'badge-notavail'

export const ACTIVE_STATUSES = ['CREATED', 'MATCHING', 'DONORS_NOTIFIED', 'DONOR_RESPONDED']

export const LOCATIONS = [
  'Gandhipuram','Peelamedu','RS Puram','Saibaba Colony','Singanallur','Ukkadam','Town Hall',
  'Ramanathapuram','Podanur','Kuniamuthur','Kovaipudur','Ganapathy','Saravanampatti','Thudiyalur','Vadavalli',
]
export const BLOOD_GROUPS = ['A+','A-','B+','B-','AB+','AB-','O+','O-']
