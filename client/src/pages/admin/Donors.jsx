import { useState, useEffect } from 'react'
import api from '../../api/client'
import { useToast } from '../../context/ToastContext'
import { PageHeader, Loader, BloodChip, AvailabilityBadge } from '../../components/ui'

export default function AdminDonors() {
  const { showToast } = useToast()
  const [data, setData] = useState(null)
  const [error, setError] = useState('')

  const load = () => api('/admin/donors').then(setData).catch((e) => setError(e.message))
  useEffect(() => { load() }, [])

  const verify = async (id) => { try { const d = await api(`/admin/donors/${id}/verify`, { method: 'PATCH' }); showToast(d.message, 'success'); load() } catch (e) { showToast(e.message, 'error') } }
  const toggle = async (id) => { try { const d = await api(`/admin/donors/${id}/activate`, { method: 'PATCH' }); showToast(d.message, 'success'); load() } catch (e) { showToast(e.message, 'error') } }

  if (error) return <div className="card p-8 text-center text-red-600">{error}</div>
  if (!data) return <Loader />

  return (
    <div className="animate-fade-in">
      <PageHeader title="👥 Donor Management" subtitle="Donor names reflect the latest profile updates." />
      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="tbl">
            <thead><tr><th>Name</th><th>Username</th><th>Blood</th><th>Location</th><th>Availability</th><th>Verified</th><th>Status</th><th>Actions</th></tr></thead>
            <tbody>
              {data.donors.map((d) => (
                <tr key={d._id}>
                  <td className="font-semibold text-slate-800">{d.fullName}</td>
                  <td className="text-slate-500">@{d.username}</td>
                  <td><BloodChip group={d.bloodGroup} size="sm" /></td>
                  <td>📍 {d.locationName}</td>
                  <td><AvailabilityBadge a={d.availabilityStatus} /></td>
                  <td>{d.isVerified ? <span className="badge badge-accepted">✓ Verified</span> : <span className="badge badge-pending">Pending</span>}</td>
                  <td>{d.isActive ? <span className="badge badge-active">Active</span> : <span className="badge badge-cancelled">Inactive</span>}</td>
                  <td>
                    <button onClick={() => verify(d._id)} className="btn btn-ghost btn-sm">{d.isVerified ? 'Unverify' : 'Verify'}</button>
                    <button onClick={() => toggle(d._id)} className="btn btn-ghost btn-sm">{d.isActive ? 'Deactivate' : 'Activate'}</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
