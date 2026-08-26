import { useState, useEffect } from 'react'

export default function MongoStatusBadge() {
  const [dbState, setDbState] = useState({
    connected: false,
    type: 'loading',
    host: 'Connecting...',
    database: 'bloodconnect',
  })
  const [showModal, setShowModal] = useState(false)

  const checkStatus = async () => {
    try {
      const res = await fetch('/api/db-status')
      if (res.ok) {
        const data = await res.json()
        setDbState(data)
      } else {
        setDbState((s) => ({ ...s, connected: false, type: 'error' }))
      }
    } catch (_) {
      setDbState((s) => ({ ...s, connected: false, type: 'error' }))
    }
  }

  useEffect(() => {
    checkStatus()
    const timer = setInterval(checkStatus, 15000)
    return () => clearInterval(timer)
  }, [])

  const isAtlas = dbState.connected && dbState.type === 'atlas'
  const isMemory = dbState.connected && dbState.type === 'in-memory'

  return (
    <>
      <button
        onClick={() => setShowModal(true)}
        className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border transition-all duration-200 cursor-pointer shadow-xs hover:scale-105 ${
          isAtlas
            ? 'bg-emerald-50 text-emerald-800 border-emerald-300 hover:bg-emerald-100'
            : isMemory
            ? 'bg-amber-50 text-amber-800 border-amber-300 hover:bg-amber-100'
            : 'bg-rose-50 text-rose-800 border-rose-300 hover:bg-rose-100'
        }`}
        title="Click to view MongoDB Connection Details"
      >
        <span
          className={`w-2 h-2 rounded-full animate-pulse ${
            isAtlas ? 'bg-emerald-500' : isMemory ? 'bg-amber-500' : 'bg-rose-500'
          }`}
        />
        <span className="hidden md:inline">🍃</span>
        <span className="hidden sm:inline">
          {isAtlas ? 'MongoDB Atlas' : isMemory ? 'Demo In-Memory' : 'MongoDB Offline'}
        </span>
        <span className="sm:hidden text-[11px]">
          {isAtlas ? 'Atlas' : isMemory ? 'Demo' : 'Offline'}
        </span>
      </button>

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-fade-in">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 border border-slate-100 text-slate-800 relative">
            <button
              onClick={() => setShowModal(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 text-lg font-bold p-1 rounded-lg"
            >
              ✕
            </button>

            <div className="flex items-center gap-3 mb-4">
              <div
                className={`w-10 h-10 rounded-xl flex items-center justify-center text-xl font-bold ${
                  isAtlas ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'
                }`}
              >
                🍃
              </div>
              <div>
                <h3 className="font-bold text-lg text-slate-900">MongoDB Connection</h3>
                <p className="text-xs text-slate-500">CBE BloodConnect Database Status</p>
              </div>
            </div>

            <div className="space-y-3 bg-slate-50 p-4 rounded-xl border border-slate-200 text-xs">
              <div className="flex justify-between items-center py-1 border-b border-slate-200">
                <span className="text-slate-500 font-medium">Status:</span>
                <span
                  className={`font-bold flex items-center gap-1.5 ${
                    isAtlas ? 'text-emerald-600' : isMemory ? 'text-amber-600' : 'text-rose-600'
                  }`}
                >
                  <span
                    className={`w-2 h-2 rounded-full ${
                      isAtlas ? 'bg-emerald-500' : isMemory ? 'bg-amber-500' : 'bg-rose-500'
                    }`}
                  />
                  {isAtlas
                    ? 'Connected to Atlas Cloud'
                    : isMemory
                    ? 'In-Memory Demo Mode'
                    : 'Disconnected'}
                </span>
              </div>

              <div className="flex justify-between items-center py-1 border-b border-slate-200">
                <span className="text-slate-500 font-medium">Cluster Name:</span>
                <span className="font-semibold text-slate-700">CBB</span>
              </div>

              <div className="flex justify-between items-center py-1 border-b border-slate-200">
                <span className="text-slate-500 font-medium">Database Name:</span>
                <span className="font-semibold text-slate-700">{dbState.database || 'bloodconnect'}</span>
              </div>

              <div className="flex justify-between items-center py-1">
                <span className="text-slate-500 font-medium">Host / Node:</span>
                <span className="font-mono text-slate-700 truncate max-w-[200px]" title={dbState.host}>
                  {dbState.host}
                </span>
              </div>
            </div>

            <div className="mt-4 p-3 bg-emerald-50/70 border border-emerald-200/80 rounded-xl text-xs text-emerald-900">
              <p className="font-semibold mb-1">🔗 How to connect to your Atlas cluster CBB:</p>
              <ol className="list-decimal list-inside space-y-1 text-slate-700">
                <li>In MongoDB Atlas, click <b>Connect</b> on cluster <b>CBB</b>.</li>
                <li>Choose <b>Drivers (Node.js)</b> and copy your connection string.</li>
                <li>Paste it in <code className="bg-white px-1 py-0.5 rounded border border-emerald-200">server/.env</code> as <code className="bg-white px-1 py-0.5 rounded border border-emerald-200">MONGODB_URI</code>.</li>
              </ol>
            </div>

            <div className="mt-5 flex gap-2 justify-end">
              <button
                onClick={checkStatus}
                className="btn btn-ghost btn-sm text-xs font-semibold"
              >
                🔄 Refresh Status
              </button>
              <button
                onClick={() => setShowModal(false)}
                className="btn btn-primary btn-sm text-xs"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
