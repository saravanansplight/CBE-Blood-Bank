import { useEffect, useState } from 'react'
import api from '../api/client'

export default function LocationSelect({ value, onChange, name = 'locationName', required = true, id }) {
  const [locations, setLocations] = useState([])
  useEffect(() => {
    api('/locations').then(setLocations).catch(() => {})
  }, [])
  return (
    <select
      id={id}
      name={name}
      className="select"
      value={value || ''}
      onChange={onChange}
      required={required}
    >
      <option value="">Select Coimbatore Location</option>
      {locations.map((l) => (
        <option key={l._id} value={l.locationName}>{l.locationName}</option>
      ))}
    </select>
  )
}
