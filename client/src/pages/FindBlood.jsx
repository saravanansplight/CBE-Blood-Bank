import { useState } from 'react'
import api from '../api/client'
import { useToast } from '../context/ToastContext'
import { PageHeader, Loader, EmptyState, AvailabilityBadge, BloodChip } from '../components/ui'
import LocationSelect from '../components/LocationSelect'
import { BLOOD_GROUPS } from '../utils/helpers'

export default function FindBlood() {
  const { showToast } = useToast()
  const [filters, setFilters] = useState({ bloodGroup: '', locationName: '', availability: '' })
  const [results, setResults] = useState(null)
  const [loading, setLoading] = useState(false)

  const set = (k, v) => setFilters({ ...filters, [k]: v })

  const search = async (e) => {
    e?.preventDefault()
    setLoading(true)
    const params = new URLSearchParams()
    Object.entries(filters).forEach(([k, v]) => v && params.append(k, v))
    try {
      const data = await api(`/search?${params.toString()}`)
      setResults(data)
    } catch (err) {
      showToast(err.message, 'error')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div>
      <PageHeader title="🔍 Find Blood Donors" subtitle="Search available donors by blood group & Coimbatore location. Private addresses are never shown." />
      <form onSubmit={search} className="card p-5 mb-6 grid sm:grid-cols-4 gap-3">
        <div>
          <label className="field-label">Blood Group</label>
          <select className="select" value={filters.bloodGroup} onChange={(e) => set('bloodGroup', e.target.value)}>
            <option value="">Any</option>{BLOOD_GROUPS.map((g) => <option key={g}>{g}</option>)}
          </select>
        </div>
        <div>
          <label className="field-label">Location</label>
          <LocationSelect value={filters.locationName} onChange={(e) => set('locationName', e.target.value)} required={false} />
        </div>
        <div>
          <label className="field-label">Availability</label>
          <select className="select" value={filters.availability} onChange={(e) => set('availability', e.target.value)}>
            <option value="">Any</option><option value="Available">Available only</option>
          </select>
        </div>
        <div className="flex items-end"><button type="submit" className="btn btn-primary w-full">🔍 Search</button></div>
      </form>

      {loading ? <Loader /> : results === null ? null : !results.donors.length ? (
        <EmptyState msg={results.message || 'No matching donors found.'} icon="🔍" />
      ) : (
        <>
          <div className="mb-3 text-sm text-slate-500">Found <b className="text-slate-700">{results.donors.length}</b> donor(s)</div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {results.donors.map((d) => (
              <div key={d._id} className="card card-hover p-5">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-11 h-11 rounded-full bg-gradient-to-br from-red-500 to-red-700 text-white flex items-center justify-center font-bold">{d.fullName.charAt(0).toUpperCase()}</div>
                  <div><div className="font-bold text-slate-800">{d.fullName}</div><div className="text-xs text-slate-400">{d.gender} • {d.age} yrs</div></div>
                </div>
                <div className="flex items-center justify-between">
                  <BloodChip group={d.bloodGroup} size="sm" />
                  <AvailabilityBadge a={d.availabilityStatus} />
                </div>
                <div className="text-sm text-slate-500 mt-3">📍 {d.locationName}{d.distance ? ` • 📏 ${d.distance}` : ''}</div>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  )
}
