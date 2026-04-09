import { useState } from 'react'
import TopAppBar from '../components/TopAppBar'
import BottomNav from '../components/BottomNav'
import MatchCard from '../components/MatchCard'
import AddMatchModal from '../components/AddMatchModal'
import EditMatchModal from '../components/EditMatchModal'
import ResultModal from '../components/ResultModal'

const GIORNI = ['Dom','Lun','Mar','Mer','Gio','Ven','Sab']
const MESI = ['GEN','FEB','MAR','APR','MAG','GIU','LUG','AGO','SET','OTT','NOV','DIC']
function fmtDate(d) {
  const [y,m,day] = d.split('-')
  const dt = new Date(+y,+m-1,+day)
  return `${GIORNI[dt.getDay()]} ${day} ${MESI[+m-1]}`
}

let _nid = 100

export default function Calendario({ matches, setMatches, teams }) {
  const [showAdd, setShowAdd] = useState(false)
  const [resultIdx, setResultIdx] = useState(null)
  const [editIdx, setEditIdx] = useState(null)
  const [deleteConfirm, setDeleteConfirm] = useState(null)

  const grouped = {}
  matches.forEach((m, i) => { if (!grouped[m.date]) grouped[m.date] = []; grouped[m.date].push({ m, i }) })

  function handleAdd(nm) {
    setMatches(prev => [...prev, { id: ++_nid, ...nm }].sort((a,b) => a.date === b.date ? a.ora.localeCompare(b.ora) : a.date.localeCompare(b.date)))
    setShowAdd(false)
  }

  function handleResult({ score, sets, tbTarget }) {
    setMatches(prev => prev.map((m, i) => i === resultIdx ? { ...m, score, sets, tbTarget, played: true } : m))
    setResultIdx(null)
  }

  function handleDelete(idx) {
    setMatches(prev => prev.filter((_, i) => i !== idx))
    setDeleteConfirm(null)
  }

  function handleEdit(updated) {
    setMatches(prev => prev.map((m, i) => i === editIdx ? updated : m)
      .sort((a,b) => a.date === b.date ? a.ora.localeCompare(b.ora) : a.date.localeCompare(b.date)))
    setEditIdx(null)
  }

  return (
    <div className="min-h-screen text-on-surface">
      <TopAppBar actions={
        <button onClick={() => setShowAdd(true)} className="flex items-center gap-2 bg-gradient-to-r from-[#27F24C] to-[#1DB954] text-[#003909] font-headline font-bold px-4 py-2 rounded-xl text-xs uppercase tracking-widest shadow-lg active:scale-95 transition-all">
          <span className="material-symbols-outlined text-sm" style={{ fontVariationSettings: "'FILL' 1" }}>add_circle</span>
          Aggiungi
        </button>
      } />
      <main className="pt-24 px-4 max-w-4xl mx-auto space-y-8 pb-32">
        <div>
          <span className="text-secondary font-headline uppercase tracking-[0.2em] text-xs font-bold">Padel League</span>
          <h2 className="text-4xl font-headline font-black text-on-surface uppercase" style={{ letterSpacing: '-0.04em' }}>Calendario</h2>
        </div>
        {Object.keys(grouped).sort().map(date => (
          <section key={date} className="space-y-4 pb-4">
            <div className="flex items-center gap-4">
              <h3 className="font-headline font-bold text-xl text-on-surface whitespace-nowrap">{fmtDate(date)}</h3>
              <div className="h-px flex-grow bg-[#3f4a3f]/30" />
            </div>
            {grouped[date].map(({ m, i }) => (
              <MatchCard
                key={m.id}
                match={m}
                onInsertResult={() => setResultIdx(i)}
                onEdit={() => setEditIdx(i)}
                onDelete={() => setDeleteConfirm(i)}
              />
            ))}
          </section>
        ))}
        {matches.length === 0 && <p className="text-on-surface-variant text-center py-12">Nessuna partita in calendario.</p>}
      </main>
      <BottomNav />

      {showAdd && <AddMatchModal onClose={() => setShowAdd(false)} onAdd={handleAdd} teams={teams} />}
      {editIdx !== null && <EditMatchModal match={matches[editIdx]} teams={teams} onClose={() => setEditIdx(null)} onSave={handleEdit} />}
      {resultIdx !== null && <ResultModal match={matches[resultIdx]} onClose={() => setResultIdx(null)} onConfirm={handleResult} />}

      {/* Delete confirmation */}
      {deleteConfirm !== null && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4" onClick={() => setDeleteConfirm(null)}>
          <div className="w-full max-w-sm bg-[#1e3368] rounded-2xl shadow-2xl border border-white/10 overflow-hidden" onClick={e => e.stopPropagation()}>
            <div className="p-6 space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-red-500/10 border border-red-500/20 flex items-center justify-center">
                  <span className="material-symbols-outlined text-red-400">delete_forever</span>
                </div>
                <div>
                  <h3 className="font-headline font-black text-lg uppercase text-white">Elimina Partita</h3>
                  <p className="text-on-surface-variant text-xs mt-0.5">
                    {matches[deleteConfirm]?.casa.name} vs {matches[deleteConfirm]?.ospite.name}
                  </p>
                </div>
              </div>
              <p className="text-on-surface-variant text-sm">Sei sicuro di voler eliminare questa partita? L'azione non è reversibile.</p>
              <div className="flex gap-3">
                <button onClick={() => setDeleteConfirm(null)} className="flex-1 h-12 bg-white/5 border border-white/10 text-on-surface font-headline font-bold text-xs uppercase tracking-widest rounded-xl hover:bg-white/10 transition-colors">
                  Annulla
                </button>
                <button onClick={() => handleDelete(deleteConfirm)} className="flex-1 h-12 bg-red-500/20 border border-red-500/30 text-red-400 font-headline font-bold text-xs uppercase tracking-widest rounded-xl hover:bg-red-500/30 transition-colors flex items-center justify-center gap-2">
                  <span className="material-symbols-outlined text-sm">delete</span>
                  Elimina
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
