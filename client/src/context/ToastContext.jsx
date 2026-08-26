import { createContext, useContext, useCallback, useState } from 'react'
import { createPortal } from 'react-dom'

const ToastContext = createContext(null)

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([])

  const remove = useCallback((id) => setToasts((t) => t.filter((x) => x.id !== id)), [])

  const showToast = useCallback((message, type = 'info', duration = 3800) => {
    const id = Date.now() + Math.random()
    setToasts((t) => [...t, { id, message, type }])
    setTimeout(() => remove(id), duration)
  }, [remove])

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      {createPortal(
        <div id="toast-root">
          {toasts.map((t) => {
            const icon = t.type === 'success' ? '✅' : t.type === 'error' ? '⚠️' : 'ℹ️'
            return (
              <div key={t.id} className={`toast ${t.type}`} style={{ animation: 'slideIn 0.25s ease' }}>
                <span>{icon}</span>
                <div>{t.message}</div>
              </div>
            )
          })}
        </div>,
        document.body
      )}
    </ToastContext.Provider>
  )
}

export function useToast() {
  const ctx = useContext(ToastContext)
  if (!ctx) throw new Error('useToast must be used within ToastProvider')
  return ctx
}
