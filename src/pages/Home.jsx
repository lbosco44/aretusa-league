import { Link } from 'react-router-dom'
import TopAppBar from '../components/TopAppBar'
import BottomNav from '../components/BottomNav'

export default function Home({ matches }) {
  const nextMatch = matches.find(m => !m.played)
  const leader = { name: 'Calvo / Bosco', club: 'TC Aretusa', rank: '#1', pg: 3, v: 3, p: 0, pts: 9 }

  return (
    <div className="bg-surface text-on-surface font-body selection:bg-secondary selection:text-on-secondary min-h-screen">
      <TopAppBar actions={
        <>
          <button className="text-[#dfe3e7] hover:text-[#71ff74] transition-colors">
            <span className="material-symbols-outlined">notifications</span>
          </button>
          <div className="w-8 h-8 rounded-full bg-[#2d5aa0] flex items-center justify-center border-2 border-primary/20">
            <span className="material-symbols-outlined text-on-surface-variant text-lg">account_circle</span>
          </div>
        </>
      } />

      <main className="pt-20 pb-32 px-4 max-w-5xl mx-auto space-y-8">

        {/* Hero */}
        <section className="relative overflow-hidden rounded-3xl h-64 flex items-end p-6">
          <img src="/hero-ball.png" alt="Pallina da padel" className="absolute inset-0 w-full h-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-t from-[#071530] via-[#0E2044]/60 to-transparent" />
          <div className="relative w-full flex justify-between items-end">
            <div className="space-y-1">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-secondary/20 text-secondary text-xs font-bold uppercase tracking-widest backdrop-blur-md">
                <span className="w-2 h-2 rounded-full bg-secondary animate-pulse" />
                {nextMatch ? `Prossima Partita • ${nextMatch.ora}` : 'Fase a gironi in corso'}
              </span>
              <h2 className="font-headline text-3xl font-black italic uppercase text-white leading-tight">
                {nextMatch ? `${nextMatch.casa.name.split('/')[0].trim()}<br/>vs ${nextMatch.ospite.name.split('/')[0].trim()}` : 'IL TORNEO STA\nPER INIZIARE...'}
              </h2>
            </div>
            <Link to="/calendario" className="bg-gradient-to-r from-[#77db90] to-[#3fa35f] text-on-primary font-headline font-bold px-6 py-3 rounded-xl shadow-lg shadow-primary/20 active:scale-95 transition-all text-sm uppercase tracking-wide">
              VEDI PARTITE
            </Link>
          </div>
        </section>

        {/* Quick Stats */}
        <section className="grid grid-cols-2 md:grid-cols-3 gap-4">
          <div className="bg-[#D3D0CB] p-5 rounded-2xl flex flex-col justify-between h-32 text-surface">
            <span className="text-xs font-black uppercase tracking-widest opacity-60">Squadre</span>
            <div className="flex items-baseline gap-2">
              <span className="font-headline text-4xl font-bold">16</span>
              <span className="material-symbols-outlined text-surface/40">groups</span>
            </div>
          </div>
          <div className="bg-[#D3D0CB] p-5 rounded-2xl flex flex-col justify-between h-32 text-surface">
            <span className="text-xs font-black uppercase tracking-widest opacity-60">Montepremi</span>
            <div className="flex items-end justify-between">
              <span className="font-headline text-sm font-bold opacity-70 leading-tight">Trofei, Coppe<br/>&amp; Sorprese!</span>
              <span className="material-symbols-outlined text-5xl text-surface/40">emoji_events</span>
            </div>
          </div>
          <div className="col-span-2 md:col-span-1 bg-[#D3D0CB] p-5 rounded-2xl flex flex-col justify-between h-32 text-surface relative overflow-hidden">
            <span className="text-xs font-black uppercase tracking-widest opacity-60">Prossima</span>
            <div className="flex flex-col">
              {nextMatch
                ? <>
                    <span className="font-headline text-lg font-bold">{nextMatch.casa.club} • {nextMatch.ora}</span>
                    <span className="text-sm font-medium opacity-80 italic">{nextMatch.casa.name} vs {nextMatch.ospite.name}</span>
                  </>
                : <span className="font-headline text-lg font-bold">Nessuna in programma</span>
              }
            </div>
            <div className="absolute -right-4 -bottom-4 opacity-10">
              <span className="material-symbols-outlined text-8xl">event</span>
            </div>
          </div>
        </section>

        {/* Navigation Cards */}
        <section className="space-y-4">
          <div className="flex items-center justify-between px-2">
            <h3 className="font-headline text-lg font-bold tracking-tight uppercase text-secondary">League Portal</h3>
            <span className="text-xs font-medium text-on-surface-variant">Tocca per esplorare</span>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[
              { to: '/gironi',    img: '/gironi-bg.png',    title: 'Gironi',    sub: 'Classifiche & Gruppi' },
              { to: '/calendario',img: '/calendario-bg.png',title: 'Calendario',sub: 'Partite & Campi' },
              { to: '/tabellone', img: '/court-sunset.png', title: 'Tabellone', sub: 'Eliminazione Diretta' },
            ].map(({ to, img, title, sub }) => (
              <Link key={to} to={to} className="group relative overflow-hidden rounded-2xl aspect-[16/10] md:aspect-square cursor-pointer block">
                <img src={img} alt={title} loading="lazy" className="absolute inset-0 w-full h-full object-cover opacity-50 group-hover:opacity-65 group-hover:scale-105 transition-all duration-500" />
                <div className="absolute inset-0 bg-gradient-to-t from-[#071530] via-[#0E2044]/50 to-transparent" />
                <div className="absolute bottom-4 left-4">
                  <h4 className="font-headline text-2xl font-black uppercase italic text-white group-hover:text-secondary transition-colors">{title}</h4>
                  <p className="text-xs text-on-surface-variant font-medium">{sub}</p>
                </div>
                <div className="absolute top-4 right-4 bg-black/40 backdrop-blur p-2 rounded-full border border-white/10 opacity-0 group-hover:opacity-100 transition-opacity">
                  <span className="material-symbols-outlined text-white">north_east</span>
                </div>
              </Link>
            ))}
          </div>
        </section>

        {/* Leader */}
        <section className="space-y-4">
          <h3 className="font-headline text-lg font-bold tracking-tight uppercase text-on-surface px-2">Leader Girone A</h3>
          <div className="bg-[#152040] rounded-3xl overflow-hidden border border-outline-variant/10">
            <div className="p-6 flex flex-col md:flex-row gap-6">
              <div className="flex-1 flex gap-4 items-center">
                <div className="w-16 h-16 rounded-2xl bg-[#2d5aa0] flex items-center justify-center text-primary font-headline font-bold text-2xl border border-primary/20">
                  CB
                </div>
                <div>
                  <p className="text-xs font-bold uppercase text-on-surface-variant tracking-widest">Leader Girone A</p>
                  <h5 className="text-xl font-headline font-bold uppercase text-white">{leader.name}</h5>
                  <p className="text-xs text-on-surface-variant mt-0.5">{leader.club}</p>
                  <div className="flex gap-2 mt-1">
                    <span className="px-2 py-0.5 rounded-md bg-secondary/10 text-secondary text-[10px] font-bold uppercase">{leader.v}V {leader.p}P</span>
                    <span className="px-2 py-0.5 rounded-md bg-primary/10 text-primary text-[10px] font-bold uppercase">{leader.pts} Punti</span>
                  </div>
                </div>
              </div>
              <div className="flex items-center justify-between md:justify-end gap-8 border-t md:border-t-0 md:border-l border-outline-variant/20 pt-4 md:pt-0 md:pl-8">
                <div className="text-center">
                  <p className="text-[10px] uppercase font-bold text-on-surface-variant mb-1">Rank</p>
                  <p className="font-headline text-2xl font-bold text-secondary">{leader.rank}</p>
                </div>
                <div className="text-center">
                  <p className="text-[10px] uppercase font-bold text-on-surface-variant mb-1">Partite</p>
                  <p className="font-headline text-2xl font-bold text-white">{leader.pg}</p>
                </div>
                <div className="text-center">
                  <p className="text-[10px] uppercase font-bold text-on-surface-variant mb-1">Punti</p>
                  <p className="font-headline text-2xl font-bold text-white">{leader.pts}</p>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* FAB */}
      <Link to="/calendario" className="fixed bottom-24 right-4 z-40 bg-gradient-to-r from-[#77db90] to-[#3fa35f] text-on-primary w-14 h-14 rounded-full flex items-center justify-center shadow-xl shadow-primary/30 active:scale-95 transition-all">
        <span className="material-symbols-outlined text-on-primary">add</span>
      </Link>

      <BottomNav />
    </div>
  )
}
