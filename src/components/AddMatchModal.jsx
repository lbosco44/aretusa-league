import { useState } from 'react'

export default function AddMatchModal({ onClose, onAdd, teams }) {
  const [girone, setGirone] = useState('')
  const [casaIdx, setCasaIdx] = useState('')
  const [ospiteIdx, setOspiteIdx] = useState('')
  const [data, setData] = useState('')
  const [ora, setOra] = useState('')

  const gironeTeams = girone ? (teams[girone] || []) : []
  const casaTeam = casaIdx !== '' ? gironeTeams[+casaIdx] : null

  const availableGironi = Object.entries(teams).filter(([, list]) => list.length >= 2).map(([g]) => g)

  function handleAdd() {
    if (!girone || casaIdx === '' || ospiteIdx === '' || !data || !ora) { alert('Compila tutti i campi'); return }
    onAdd({ date: data, ora, girone, casa: teams[girone][+casaIdx], ospite: teams[girone][+ospiteIdx], played: false })
  }

  const selCls = 'w-full h-12 px-4 bg-[#071530] border border-white/10 rounded-xl text-on-surface font-semibold appearance-none focus:outline-none focus:border-secondary transition-all'

  return (
    <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-end md:items-center justify-center p-4" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="w-full max-w-lg bg-[#1e3368] rounded-3xl rounded-b-none md:rounded-3xl shadow-2xl border border-white/10 overflow-hidden">
        <div className="flex items-center justify-between p-6 border-b border-white/10 bg-[#254E8F]/40">
          <div className="flex items-center gap-3">
            <div className="w-2 h-8 bg-secondary rounded-full" />
            <h3 className="font-headline text-xl font-black uppercase">Nuova Partita</h3>
          </div>
          <button onClick={onClose} className="w-9 h-9 rounded-full bg-white/10 flex items-center justify-center hover:bg-white/20"><span className="material-symbols-outlined text-on-surface">close</span></button>
        </div>
        <div className="p-6 space-y-5 overflow-y-auto max-h-[70vh]">
          <div className="space-y-2">
            <label className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant">Girone</label>
            <select value={girone} onChange={(e) => { setGirone(e.target.value); setCasaIdx(''); setOspiteIdx('') }} className={selCls}>
              <option value="">-- Seleziona girone --</option>
              {availableGironi.map(g => <option key={g} value={g}>Girone {g}</option>)}
            </select>
          </div>
          <div className="space-y-2">
            <label className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant">Squadra Casa</label>
            <select value={casaIdx} onChange={(e) => { setCasaIdx(e.target.value); setOspiteIdx('') }} disabled={!girone} className={`${selCls} disabled:opacity-40`}>
              <option value="">-- Seleziona --</option>
              {gironeTeams.map((t, i) => <option key={i} value={i}>{t.name} ({t.club})</option>)}
            </select>
            {casaTeam && <p className="text-[10px] text-secondary font-bold pl-1">Campo: {casaTeam.club}</p>}
          </div>
          <div className="space-y-2">
            <label className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant">Squadra Ospite</label>
            <select value={ospiteIdx} onChange={(e) => setOspiteIdx(e.target.value)} disabled={casaIdx === ''} className={`${selCls} disabled:opacity-40`}>
              <option value="">-- Seleziona --</option>
              {gironeTeams.map((t, i) => i !== +casaIdx ? <option key={i} value={i}>{t.name} ({t.club})</option> : null)}
            </select>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant">Data</label>
              <input type="date" value={data} onChange={(e) => setData(e.target.value)} className={selCls} />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant">Orario</label>
              <input type="time" value={ora} onChange={(e) => setOra(e.target.value)} className={selCls} />
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
