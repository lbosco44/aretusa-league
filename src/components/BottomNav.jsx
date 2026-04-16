import { useState, useEffect } from 'react'
import { Link, useLocation } from 'react-router-dom'

const tabs = [
  { to: '/',           icon: 'home',          label: 'Home' },
  { to: '/gironi',     icon: 'groups',        label: 'Gironi' },
  { to: '/calendario', icon: 'calendar_today', label: 'Calendario' },
  { to: '/tabellone',  icon: 'account_tree',  label: 'Tabellone' },
  { to: '/galleria',   icon: 'photo_library', label: 'Galleria' },
  { to: '/regolamento', icon: 'menu_book',    label: 'Regole' },
  { to: '/admin',      icon: 'lock',          iconActive: 'admin_panel_settings', label: 'Admin' },
]

export default function BottomNav({ isAdmin, bracketActive }) {
  const { pathname } = useLocation()
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    function onScroll() {
      setScrolled(window.scrollY > 40)
    }
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  const visibleTabs = tabs.filter(({ to }) => {
    if (to === '/tabellone' && !isAdmin && !bracketActive) return false
    return true
  })

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 flex justify-center transition-all duration-300"
      style={{ padding: scrolled ? '0 16px 8px' : '0' }}
    >
      <div
        className="flex justify-around items-center transition-all duration-500 ease-[cubic-bezier(0.32,0.72,0,1)]"
        style={{
          width: scrolled ? 'min(94%, 420px)' : '100%',
          paddingTop: scrolled ? '10px' : '14px',
          paddingBottom: scrolled ? '10px' : '18px',
          paddingLeft: '8px',
          paddingRight: '8px',
          borderRadius: scrolled ? '9999px' : '16px 16px 0 0',
          background: scrolled ? 'rgba(14, 32, 68, 0.7)' : 'rgba(14, 32, 68, 0.9)',
          backdropFilter: 'blur(24px)',
          WebkitBackdropFilter: 'blur(24px)',
          boxShadow: scrolled
            ? '0 -4px 32px rgba(0,0,0,0.4), 0 0 0 1px rgba(113,255,116,0.08), inset 0 -1px 0 rgba(255,255,255,0.05)'
            : '0 -8px 30px rgba(0,0,0,0.5)',
          border: scrolled ? '1px solid rgba(255,255,255,0.08)' : 'none',
        }}
      >
        {visibleTabs.map(({ to, icon, iconActive, label }) => {
          const active = to === '/' ? pathname === '/' : pathname.startsWith(to)
          const displayIcon = (to === '/admin' && isAdmin && iconActive) ? iconActive : icon
          return (
            <Link key={to} to={to} aria-label={label} className={`flex items-center justify-center transition-all ${active ? 'text-[#71ff74] scale-110' : 'text-[#dfe3e7]/60 hover:text-[#77db90]'}`}>
              <span className="material-symbols-outlined transition-all duration-500" style={{
                fontSize: scrolled ? '22px' : '26px',
                ...(active ? { fontVariationSettings: "'FILL' 1" } : {}),
              }}>{displayIcon}</span>
            </Link>
          )
        })}
      </div>
    </nav>
  )
}
