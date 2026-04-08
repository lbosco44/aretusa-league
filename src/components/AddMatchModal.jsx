import { useState } from 'react'
import { teams } from '../data/teams'

export default function AddMatchModal({ onClose, onAdd }) {
  const [girone, setGirone] = useState('')
  const [casaIdx, setCasaIdx] = useState('')
  const [ospiteIdx, setOspiteIdx] = useState('')
  const [data, setData] = useState('')
  const [ora, setOra] = useState('')

  const gironeTeams = girone ? teams[girone] : []
  const casaTeam = casaIdx !== '' ? gironeTeams[+casaIdx] : null

  function handleAdd() {
    if (!girone || casaIdx === '' || ospiteIdx === '' || !data || !ora) {
      alert('Compila tutti i campi')
      return
    }
    onAdd({
      date: data,
      ora,
      girone,
      casa: teams[girone][+casaIdx],
      ospite: teams[girone][+ospiteIdx],
      played: false,
    })
  }

  return (
    <div
      className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-end md:items-center justify-center p-4"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="w-full max-w-lg bg-[#1e3368] rounded-3xl rounded-b-none md:rounded-3xl shadow-2xl border border-white/10 overflow-hidden">
        <div className="flex items-center justify-between p-6 border-b border-white/10 bg-[#254E8F]/40">
          <div className="flex items-center gap-3">
            <div className="w-2 h-8 bg-secondary rounded-full" />
            <h3 className="font-headline text-xl font-black uppercase">Nuova Partita</h3>
          </div>
          <button onClick={onClose} className="w-9 h-9 rounded-full bg-white/10 flex items-center justify-center hover:bg-white/20 transition-all">
            <span className="material-symbols-outlined text-on-surface">close</span>
          </button>
        </div>

        <div className="p-6 space-y-5 overflow-y-auto max-h-[70vh]">
          {/* Girone */}
          <div className="space-y-2">
            <label className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant flex items-center gap-1">
              <span className="material-symbols-outlined text-[14px]">grid_view</span>Girone
            </label>
            <div className="relative">
              <select
                value={girone}
                onChange={(e) => { setGirone(e.target.value); setCasaIdx(''); setOspiteIdx('') }}
                className="w-full h-12 px-4 bg-[#071530] border border-white/10 rounded-xl text-on-surface font-semibold appearance-none focus:outline-none focus:border-secondary transition-all"
              >
                <option value="">— Seleziona girone —</option>
                {['A','B','C','D'].map(g => <option key={g} value={g}>Girone {g}</option>)}
              </select>
              <span className="absolute right-4 top-1/2 -translate-y-1/2 material-symbols-outlined pointer-events-none text-on-surface-variant">expand_more</span>
            </div>
          </div>

          {/* Casa */}
          <div className="space-y-2">
            <label className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant flex items-center gap-1">
              <span className="material-symbols-outlined text-[14px]">home</span>Squadra Casa
            </label>
            <div className="relative">
              <select
                value={casaIdx}
                onChange={(e) => { setCasaIdx(e.target.value); setOspiteIdx('') }}
                disabled={!girone}
                className="w-full h-12 px-4 bg-[#071530] border border-white/10 rounded-xl text-on-surface font-semibold appearance-none focus:outline-none focus:border-secondary transition-all disabled:opacity-40"
              >
                <option value="">— Seleziona —</option>
                {gironeTeams.map((t, i) => <option key={i} value={i}>{t.name} ({t.club})</option>)}
              </select>
              <span className="absolute right-4 top-1/2 -translate-y-1/2 material-symbols-outlined pointer-events-none text-on-surface-variant">expand_more</span>
            </div>
            {casaTeam && (
              <p className="text-[10px] text-secondary font-bold pl-1">
                <span className="material-symbols-outlined text-[12px] align-middle">location_on</span> Campo: {casaTeam.club}
              </p>
            )}
          </div>

          {/* Ospite */}
          <div className="space-y-2">
            <label className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant flex items-center gap-1">
              <span className="material-symbols-outlined text-[14px]">sports_tennis</span>Squadra Ospite
            </label>
            <div className="relative">
              <select
                value={ospiteIdx}
                onChange={(e) => setOspiteIdx(e.target.value)}
                disabled={casaIdx === ''}
                className="w-full h-12 px-4 bg-[#071530] border border-white/10 rounded-xl text-on-surface font-semibold appearance-none focus:outline-none focus:border-secondary transition-all disabled:opacity-40"
              >
                <option value="">— Seleziona —</option>
                {gironeTeams.map((t, i) => i !== +casaIdx && (
                  <option key={i} value={i}>{t.name} ({t.club})</option>
                ))}
              </select>
              <span className="absolute right-4 top-1/2 -translate-y-1/2 material-symbols-outlined pointer-events-none text-on-surface-variant">expand_more</span>
            </div>
          </div>

          {/* Data & Ora */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant flex items-center gap-1">
                <span className="material-symbols-outlined text-[14px]">calendar_today</span>Data
              </label>
              <input type="date" value={data} onChange={(e) => setData(e.target.value)}
                className="w-full h-12 px-4 bg-[#071530] border border-white/10 rounded-xl text-on-surface font-semibold focus:outline-none focus:border-secondary transition-all" />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant flex items-center gap-1">
                <span className="material-symbols-outlined text-[14px]">schedule</span>Orario
              </label>
              <input type="time" value={ora} onChange={(e) => setOra(e.target.value)}
                className="w-full h-12 px-4 bg-[#071530] border border-white/10 rounded-xl text-on-surface font-semibold focus:outline-none focus:border-secondary transition-all" />
            </div>
          </div>
        </div>

        <div className="p-6 pt-0">
          <button onClick={handleAdd} className="w-full h-14 bg-gradient-to-r from-[#27F24C] to-[#1DB954] text-[#003909] font-headline font-black uppercase tracking-widest text-sm rounded-xl shadow-xl active:scale-[0.98] transition-transform flex items-center justify-center gap-2">
            <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>check_circle</span>
            Aggiungi al Calendario
          </button>
        </div>
      </div>
    </div>
  )
}
