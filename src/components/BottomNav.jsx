import { Link, useLocation } from 'react-router-dom'

const tabs = [
  { to: '/',           icon: 'home',          label: 'Home' },
  { to: '/gironi',     icon: 'groups',        label: 'Gironi' },
  { to: '/calendario', icon: 'calendar_today', label: 'Calendario' },
  { to: '/tabellone',  icon: 'account_tree',  label: 'Tabellone' },
]

export default function BottomNav() {
  const { pathname } = useLocation()

  return (
    <nav className="fixed bottom-0 left-0 w-full z-50 rounded-t-2xl bg-[#0E2044]/90 backdrop-blur-2xl shadow-[0_-8px_30px_rgb(0,0,0,0.5)]">
      <div className="flex justify-around items-center pt-3 pb-6 px-4">
        {tabs.map(({ to, icon, label }) => {
          const active = to === '/' ? pathname === '/' : pathname.startsWith(to)
          return (
            <Link key={to} to={to} className={`flex flex-col items-center justify-center transition-all ${active ? 'text-[#71ff74] scale-110' : 'text-[#dfe3e7]/60 hover:text-[#77db90]'}`}>
              <span className="material-symbols-outlined mb-1" style={active ? { fontVariationSettings: "'FILL' 1" } : undefined}>{icon}</span>
              <span className="font-label text-[10px] uppercase tracking-widest font-semibold">{label}</span>
            </Link>
          )
        })}
      </div>
    </nav>
  )
}
