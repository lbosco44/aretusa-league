import { useState, useEffect, useRef } from 'react'

const LEVELS = ['A', 'B', 'C']

export default function TopAppBar({ actions, level = 'A', setLevel }) {
  const [scrolled, setScrolled] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)
  const menuRef = useRef(null)

  useEffect(() => {
    function onScroll() {
      setScrolled(window.scrollY > 40)
    }
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  useEffect(() => {
    function onClick(e) {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setMenuOpen(false)
      }
    }
    if (menuOpen) {
      document.addEventListener('mousedown', onClick)
      document.addEventListener('touchstart', onClick)
    }
    return () => {
      document.removeEventListener('mousedown', onClick)
      document.removeEventListener('touchstart', onClick)
    }
  }, [menuOpen])

  function handleSelect(l) {
    if (setLevel) setLevel(l)
    setMenuOpen(false)
  }

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

        {/* Level selector */}
        <div ref={menuRef} className="absolute left-1/2 -translate-x-1/2">
          <button
            onClick={() => setMenuOpen(o => !o)}
            className="flex items-center gap-1 font-headline font-black italic uppercase tracking-widest text-secondary hover:text-white transition-colors"
            style={{ fontSize: scrolled ? '12px' : '14px' }}
          >
            Livello {level}
            <span className="material-symbols-outlined" style={{ fontSize: scrolled ? '14px' : '16px' }}>
              {menuOpen ? 'expand_less' : 'expand_more'}
            </span>
          </button>

          {menuOpen && (
            <div className="absolute top-full left-1/2 -translate-x-1/2 mt-2 bg-[#152040] border border-white/10 rounded-xl shadow-2xl shadow-black/40 backdrop-blur-xl overflow-hidden min-w-[140px]">
              {LEVELS.map(l => (
                <button
                  key={l}
                  onClick={() => handleSelect(l)}
                  className={`w-full px-4 py-2.5 text-sm font-headline font-bold uppercase tracking-widest transition-colors flex items-center justify-between gap-3 ${
                    l === level
                      ? 'bg-secondary/10 text-secondary'
                      : 'text-on-surface-variant hover:bg-white/5 hover:text-white'
                  }`}
                >
                  <span>Livello {l}</span>
                  {l === level && <span className="material-symbols-outlined text-sm" style={{ fontVariationSettings: "'FILL' 1" }}>check_circle</span>}
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="flex items-center gap-3 relative z-10">{actions}</div>
      </div>
    </header>
  )
}
