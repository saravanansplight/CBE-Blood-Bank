import { Link } from 'react-router-dom'

export default function Logo({ to = '/' }) {
  return (
    <Link to={to} className="flex items-center gap-2.5 shrink-0 whitespace-nowrap group">
      <span className="drop-logo shrink-0 group-hover:scale-105 transition-transform">
        <svg viewBox="0 0 24 24"><path d="M12 2s6 7.5 6 12a6 6 0 0 1-12 0c0-4.5 6-12 6-12z" /></svg>
      </span>
      <div className="logo-text leading-tight flex flex-col justify-center">
        <div className="font-extrabold text-slate-900 text-base sm:text-lg tracking-tight">
          CBE <span className="text-red-600">BloodConnect</span>
        </div>
        <div className="text-[9.5px] sm:text-[10px] text-slate-600 font-extrabold tracking-wider uppercase">
          COIMBATORE BLOOD NETWORK
        </div>
      </div>
    </Link>
  )
}

