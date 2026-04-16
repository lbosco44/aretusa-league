import { useState, useEffect } from 'react'

const LEVELS = ['A', 'B', 'C']

export default function TopAppBar({ actions, level = 'A', setLevel }) {
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    function onScroll() {
      setScrolled(window.scrollY > 40)
    }
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  return (
    <header className="fixed top-0 left-0 right-0 z-50 flex justify-center transition-all duration-300"
      style={{ padding: scrolled ? '8px 16px 0' : '0' }}
    >
      <div
        className="relative flex items-center justify-between transition-all duration-500 ease-[cubic-bezier(0.32,0.72,0,1)]"
        style={{
          width: scrolled ? 'min(92%, 420px)' : '100%',
          height: scrolled ? '48px' : '64px',
          padding: scrolled ? '0 16px' : '0 24px',
          borderRadius: scrolled ? '9999px' : '0',
          background: scrolled ? 'rgba(14, 32, 68, 0.7)' : 'rgba(14, 32, 68, 0.8)',
          backdropFilter: 'blur(24px)',
          WebkitBackdropFilter: 'blur(24px)',
          boxShadow: scrolled
            ? '0 8px 32px rgba(0,0,0,0.4), 0 0 0 1px rgba(113,255,116,0.08), inset 0 1px 0 rgba(255,255,255,0.05)'
            : '0 8px 30px rgba(0,0,0,0.4)',
          border: scrolled ? '1px solid rgba(255,255,255,0.08)' : 'none',
        }}
      >
        <img
          src="/logo-white.png"
          alt="Aretusa League"
          className="w-auto object-contain transition-all duration-500"
          style={{ height: scrolled ? '28px' : '36px' }}
        />

        {/* Level selector — always centered to avoid collision with right actions */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-20">
          <div className="glass-radio-group compact" data-count="3" style={{ width: 'auto' }}>
            {LEVELS.map(l => [
              <input
                key={`r${l}`}
                type="radio"
                name="level"
                id={`level-${l}`}
                checked={level === l}
                onChange={() => setLevel && setLevel(l)}
              />,
              <label key={`l${l}`} htmlFor={`level-${l}`}>{l}</label>,
            ])}
            <div className="glass-glider" data-pos={LEVELS.indexOf(level)} />
          </div>
        </div>

        <div className="flex items-center gap-3 relative z-10">{actions}</div>
      </div>
    </header>
  )
}
