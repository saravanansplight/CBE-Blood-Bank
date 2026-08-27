// Central API client. Uses relative "/api" base so the Vite dev proxy
// (dev) or Express static server (prod) routes requests to the backend.
const BASE = import.meta.env.VITE_API_URL || '/api'

export async function api(path, { method = 'GET', body, auth = true } = {}) {
  const headers = { 'Content-Type': 'application/json' }
  const token = localStorage.getItem('cbc_token')
  if (auth && token) headers['Authorization'] = `Bearer ${token}`

  let res
  try {
    res = await fetch(`${BASE}${path}`, {
      method,
      headers,
      body: body ? JSON.stringify(body) : undefined,
    })
  } catch (e) {
    throw new Error('Network error. Please check your connection and try again.')
  }

  let data = {}
  try { data = await res.json() } catch (_) {}
  if (!res.ok) {
    const errorMsg = data.message || (data.error && data.hint ? `${data.error} - ${data.hint}` : data.error) || `Request failed (${res.status})`;
    const err = new Error(errorMsg);
    err.status = res.status;
    err.data = data;
    if (res.status === 401) {
      localStorage.removeItem('cbc_token')
      localStorage.removeItem('cbc_role')
      localStorage.removeItem('cbc_name')
      if (!window.location.pathname.startsWith('/login')) window.location.href = '/login'
    }
    throw err
  }
  return data
}

export default api
