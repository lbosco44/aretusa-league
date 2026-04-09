import { Link } from 'react-router-dom'
import TopAppBar from '../components/TopAppBar'
import BottomNav from '../components/BottomNav'

export default function Home({ matches, teams, isAdmin }) {
  const nextMatch = matches.find(m => !m.played)
  const totalTeams = Object.values(teams).flat().length

  return (
    <div className="bg-surface text-on-surface font-body min-h-screen">
      <TopAppBar actions={
        <div className="w-8 h-8 rounded-full bg-[#2d5aa0] flex items-center justify-center border-2 border-primary/20">
          <span className="material-symbols-outlined text-on-surface-variant text-lg">account_circle</span>
        </div>
      } />
      <main className="pt-20 pb-32 px-4 max-w-5xl mx-auto space-y-8">
        <section className="relative overflow-hidden rounded-3xl h-64 flex items-end p-6">
          <img src="/hero-ball.png" alt="Pallina da padel" className="absolute inset-0 w-full h-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-t from-[#071530] via-[#0E2044]/60 to-transparent" />
          <div className="relative w-full flex justify-between items-end">
            <div className="space-y-1">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-secondary/20 text-secondary text-xs font-bold uppercase tracking-widest backdrop-blur-md">
                <span className="w-2 h-2 rounded-full bg-secondary animate-pulse" />
                {nextMatch ? `Prossima Partita \u2022 ${nextMatch.ora}` : 'Fase a gironi in corso'}
              </span>
              <h2 className="font-headline text-3xl font-black italic uppercase text-white leading-tight">IL TORNEO STA<br/>PER INIZIARE...</h2>
            </div>
            <Link to="/calendario" className="bg-gradient-to-r from-[#77db90] to-[#3fa35f] text-on-primary font-headline font-bold px-6 py-3 rounded-xl shadow-lg shadow-primary/20 active:scale-95 transition-all text-sm uppercase tracking-wide">VEDI PARTITE</Link>
          </div>
        </section>

        <section className="grid grid-cols-2 md:grid-cols-3 gap-4">
          <div className="bg-[#D3D0CB] p-5 rounded-2xl flex flex-col justify-between h-32 text-[#0E2044]">
            <span className="text-xs font-black uppercase tracking-widest opacity-60">Squadre</span>
            <div className="flex items-baseline gap-2">
              <span className="font-headline text-4xl font-bold">{totalTeams}</span>
              <span className="material-symbols-outlined text-[#0E2044]/40">groups</span>
            </div>
          </div>
          <div className="bg-[#D3D0CB] p-5 rounded-2xl flex flex-col justify-between h-32 text-[#0E2044]">
            <span className="text-xs font-black uppercase tracking-widest opacity-60">Montepremi</span>
            <div className="flex items-end justify-between">
              <span className="font-headline text-sm font-bold opacity-70 leading-tight">Trofei, Coppe<br/>&amp; Sorprese!</span>
              <span className="material-symbols-outlined text-5xl text-[#0E2044]/40">emoji_events</span>
            </div>
          </div>
          <div className="col-span-2 md:col-span-1 bg-[#D3D0CB] p-5 rounded-2xl flex flex-col justify-between h-32 text-[#0E2044] relative overflow-hidden">
            <span className="text-xs font-black uppercase tracking-widest opacity-60">Prossima</span>
            {nextMatch ? (
              <div className="flex flex-col">
                <span className="font-headline text-lg font-bold">{nextMatch.casa.club} &bull; {nextMatch.ora}</span>
                <span className="text-sm font-medium opacity-80 italic">{nextMatch.casa.name} vs {nextMatch.ospite.name}</span>
              </div>
            ) : <span className="font-headline text-lg font-bold">In arrivo</span>}
          </div>
        </section>

        <section className="space-y-4">
          <h3 className="font-headline text-lg font-bold tracking-tight uppercase text-secondary px-2">League Portal</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[{ to:'/gironi', img:'/gironi-bg.png', t:'Gironi', s:'Classifiche & Gruppi' },
              { to:'/calendario', img:'/calendario-bg.png', t:'Calendario', s:'Partite & Campi' },
              { to:'/tabellone', img:'/court-sunset.png', t:'Tabellone', s:'Eliminazione Diretta' }
            ].map(({ to, img, t, s }) => (
              <Link key={to} to={to} className="group relative overflow-hidden rounded-2xl aspect-[16/10] md:aspect-square block">
                <img src={img} alt={t} loading="lazy" className="absolute inset-0 w-full h-full object-cover opacity-50 group-hover:opacity-65 group-hover:scale-105 transition-all duration-500" />
                <div className="absolute inset-0 bg-gradient-to-t from-[#071530] via-[#0E2044]/50 to-transparent" />
                <div className="absolute bottom-4 left-4">
                  <h4 className="font-headline text-2xl font-black uppercase italic text-white group-hover:text-secondary transition-colors">{t}</h4>
                  <p className="text-xs text-on-surface-variant font-medium">{s}</p>
                </div>
              </Link>
            ))}
          </div>
        </section>
      </main>
      {isAdmin && (
        <Link to="/admin" className="fixed bottom-24 right-4 z-40 bg-gradient-to-r from-[#77db90] to-[#3fa35f] text-on-primary w-14 h-14 rounded-full flex items-center justify-center shadow-xl shadow-primary/30 active:scale-95 transition-all">
          <span className="material-symbols-outlined">admin_panel_settings</span>
        </Link>
      )}
      <BottomNav isAdmin={isAdmin} />
    </div>
  )
}
