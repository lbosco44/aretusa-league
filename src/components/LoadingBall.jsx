export default function LoadingBall({ label = 'Caricamento...' }) {
  return (
    <div className="min-h-screen bg-[#0E2044] flex items-center justify-center">
      <div className="flex flex-col items-center gap-6">
        <div className="loading-ball-wrap">
          <div className="loading-ball">
            <svg viewBox="0 0 100 100" width="72" height="72">
              <circle cx="50" cy="50" r="46" fill="#d9f75b" />
              <path d="M 6 42 Q 50 50 6 58" fill="none" stroke="#ffffff" strokeWidth="2.5" strokeLinecap="round" opacity="0.9" />
              <path d="M 94 42 Q 50 50 94 58" fill="none" stroke="#ffffff" strokeWidth="2.5" strokeLinecap="round" opacity="0.9" />
            </svg>
          </div>
          <div className="loading-ball-shadow" />
        </div>
        <p className="text-on-surface-variant text-sm font-medium">{label}</p>
      </div>
    </div>
  )
}
