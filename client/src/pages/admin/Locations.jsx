import { useState, useEffect } from 'react'
import api from '../../api/client'
import { useToast } from '../../context/ToastContext'
import { PageHeader, Loader } from '../../components/ui'

export default function AdminLocations() {
  const { showToast } = useToast()
  const [locations, setLocations] = useState(null)
  const [error, setError] = useState('')

  const load = () => api('/locations/all').then(setLocations).catch((e) => setError(e.message))
  useEffect(() => { load() }, [])

  const toggle = async (id) => { try { const d = await api(`/locations/${id}/toggle`, { method: 'PATCH' }); showToast(d.message, 'success'); load() } catch (e) { showToast(e.message, 'error') } }

  if (error) return <div className="card p-8 text-center text-red-600">{error}</div>
  if (!locations) return <Loader />

  return (
    <div className="max-w-6xl mx-auto animate-fade-in">
      <PageHeader title="📍 Location Management" subtitle="The 15 supported Coimbatore locations stored in the database." />
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {locations.map((l) => (
          <div key={l._id} className="card p-5">
            <div className="flex items-start justify-between">
              <div>
                <div className="font-bold text-slate-800">📍 {l.locationName}</div>
                <div className="text-xs text-slate-400">{l.district} • {l.latitude}, {l.longitude}</div>
              </div>
              {l.isActive ? <span className="badge badge-active">Active</span> : <span className="badge badge-cancelled">Inactive</span>}
            </div>
            <button onClick={() => toggle(l._id)} className="btn btn-outline btn-sm w-full mt-3">{l.isActive ? 'Deactivate' : 'Activate'}</button>
          </div>
        ))}
      </div>
    </div>
  )
}
