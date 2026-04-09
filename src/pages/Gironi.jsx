import { useState } from 'react'
import TopAppBar from '../components/TopAppBar'
import BottomNav from '../components/BottomNav'
import GroupTable from '../components/GroupTable'

export default function Gironi({ gironi, isAdmin, bracketActive }) {
  const [active, setActive] = useState('A')
  const totalTeams = Object.values(gironi).flat().length

  return (
    <div className="min-h-screen text-on-surface">
      <TopAppBar actions={<span className="material-symbols-outlined text-on-surface-variant">account_circle</span>} />
      <main className="pt-24 pb-32 px-4 max-w-5xl mx-auto">
        <section className="mb-8">
          <div className="relative h-48 w-full rounded-xl overflow-hidden shadow-2xl">
            <div className="absolute inset-0 bg-gradient-to-br from-[#003918] to-[#071530]" />
            <div className="absolute inset-0 opacity-5" style={{ background: 'repeating-linear-gradient(45deg,#77db90 0,#77db90 1px,transparent 1px,transparent 40px)' }} />
            <div className="absolute inset-0 bg-gradient-to-t from-[#0E2044] to-transparent" />
            <div className="absolute bottom-6 left-6">
              <h2 className="font-headline text-4xl font-black italic uppercase tracking-tighter text-white">GIRONI</h2>
              <p className="text-secondary font-bold tracking-widest text-xs uppercase mt-1">Fase a Gironi &bull; 3 Gruppi &bull; {totalTeams} Squadre</p>
            </div>
          </div>
        </section>
        <div className="flex gap-2 mb-8 bg-[#152040] p-1.5 rounded-xl border border-white/5">
          {['A','B','C'].map(g => (
            <button key={g} onClick={() => setActive(g)} className={`flex-1 py-3 px-4 rounded-lg font-headline font-bold text-sm transition-all ${active === g ? 'bg-[#254E8F] text-secondary' : 'text-on-surface/60 hover:bg-[#1e3368]'}`}>Girone {g}</button>
          ))}
        </div>
        {gironi[active].length > 0 ? (
          <GroupTable rows={gironi[active]} />
        ) : (
          <div className="bg-[#152040] rounded-2xl p-12 text-center border border-white/5">
            <span className="material-symbols-outlined text-5xl text-on-surface-variant/30 mb-3">group_off</span>
            <p className="text-on-surface-variant/50 text-sm font-medium">Nessuna coppia nel girone {active}</p>
            <p className="text-on-surface-variant/30 text-xs mt-1">Vai al pannello Admin per aggiungere le coppie</p>
          </div>
        )}
        <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-[#152040] p-6 rounded-2xl flex items-center gap-4 border border-secondary/10">
            <div className="w-1.5 h-12 bg-secondary rounded-full" />
            <div>
              <h4 className="font-headline font-black text-sm uppercase text-secondary">Promozione</h4>
              <p className="text-on-surface-variant text-xs">I primi due di ogni girone accedono alla fase a eliminazione diretta.</p>
            </div>
          </div>
          <div className="bg-[#152040] p-6 rounded-2xl flex items-center gap-4 border border-white/5">
            <div className="w-1.5 h-12 bg-on-surface-variant/30 rounded-full" />
            <div>
              <h4 className="font-headline font-black text-sm uppercase text-on-surface-variant">Consolazione</h4>
              <p className="text-on-surface-variant text-xs">I restanti accedono al tabellone Silver del torneo.</p>
            </div>
          </div>
        </div>
      </main>
      <BottomNav isAdmin={isAdmin} bracketActive={bracketActive} />
    </div>
  )
}
