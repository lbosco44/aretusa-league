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
          <div className="glow-card">
            <div className="glow-card-bg relative h-48 w-full">
              <div className="absolute inset-0 bg-gradient-to-br from-[#003918] to-[#071530]" />
              <div className="absolute inset-0 opacity-5" style={{ background: 'repeating-linear-gradient(45deg,#77db90 0,#77db90 1px,transparent 1px,transparent 40px)' }} />
              <div className="absolute inset-0 bg-gradient-to-t from-[#0E2044] to-transparent" />
              <div className="absolute bottom-6 left-6 z-10">
                <h2 className="font-headline text-4xl font-black italic uppercase tracking-tighter text-white">GIRONI</h2>
                <p className="text-secondary font-bold tracking-widest text-xs uppercase mt-1">Fase a Gironi &bull; 3 Gruppi &bull; {totalTeams} Squadre</p>
              </div>
            </div>
            <div className="glow-blob" />
          </div>
        </section>
        <div className="glass-radio-group mb-8" data-count="3">
          {['A','B','C'].map((g, i) => [
            <input key={`r${g}`} type="radio" name="girone" id={`girone-${g}`} checked={active === g} onChange={() => setActive(g)} />,
            <label key={`l${g}`} htmlFor={`girone-${g}`}>Girone {g}</label>,
          ])}
          <div className="glass-glider" data-pos={['A','B','C'].indexOf(active)} />
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
        <div className="mt-8">
          <div className="bg-[#152040] p-6 rounded-2xl flex items-center gap-4 border border-secondary/10">
            <div className="w-12 h-12 rounded-xl bg-secondary/10 border border-secondary/30 flex items-center justify-center shrink-0">
              <span className="material-symbols-outlined text-secondary" style={{ fontVariationSettings: "'FILL' 1" }}>info</span>
            </div>
            <div>
              <h4 className="font-headline font-black text-sm uppercase text-secondary">Come funziona</h4>
              <p className="text-on-surface-variant text-xs leading-relaxed mt-1">Tutte le coppie accedono al tabellone finale. Ogni coppia ha 4 partite garantite: 3 nella fase a gironi + 1 nella fase a eliminazione diretta. Il piazzamento nel girone determina il seed nel tabellone.</p>
            </div>
          </div>
        </div>
      </main>
      <BottomNav isAdmin={isAdmin} bracketActive={bracketActive} />
    </div>
  )
}
