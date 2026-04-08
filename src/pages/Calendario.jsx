import { useState } from 'react'
import TopAppBar from '../components/TopAppBar'
import BottomNav from '../components/BottomNav'
import MatchCard from '../components/MatchCard'
import AddMatchModal from '../components/AddMatchModal'
import ResultModal from '../components/ResultModal'

function fmtDate(d) {
  const [y, m, day] = d.split('-')
  const giorni = ['Dom', 'Lun', 'Mar', 'Mer', 'Gio', 'Ven', 'Sab']
  const mesi = ['GEN', 'FEB', 'MAR', 'APR', 'MAG', 'GIU', 'LUG', 'AGO', 'SET', 'OTT', 'NOV', 'DIC']
  const dt = new Date(+y, +m - 1, +day)
  return `${giorni[dt.getDay()]} ${day} ${mesi[+m - 1]}`
}

let _nextId = 100

export default function Calendario({ matches, setMatches }) {
  const [showAdd, setShowAdd] = useState(false)
  const [resultIdx, setResultIdx] = useState(null)

  const grouped = matches.reduce((acc, m, i) => {
    if (!acc[m.date]) acc[m.date] = []
    acc[m.date].push({ m, i })
    return acc
  }, {})
  const sortedDates = Object.keys(grouped).sort()

  function handleAdd(newMatch) {
    setMatches(prev => [...prev, { id: ++_nextId, ...newMatch }]
      .sort((a, b) => a.date === b.date ? a.ora.localeCompare(b.ora) : a.date.localeCompare(b.date)))
    setShowAdd(false)
  }

  function handleConfirmResult({ score, sets, tbTarget }) {
    setMatches(prev => prev.map((m, i) =>
      i === resultIdx ? { ...m, score, sets, tbTarget, played: true } : m
    ))
    setResultIdx(null)
  }

  return (
    <div className="min-h-screen text-on-surface">
      <TopAppBar actions={
        <button
          onClick={() => setShowAdd(true)}
          className="flex items-center gap-2 bg-gradient-to-r from-[#27F24C] to-[#1DB954] text-[#003909] font-headline font-bold px-4 py-2 rounded-xl text-xs uppercase tracking-widest shadow-lg active:scale-95 transition-all"
        >
          <span className="material-symbols-outlined text-sm" style={{ fontVariationSettings: "'FILL' 1" }}>add_circle</span>
          Aggiungi Partita
        </button>
      } />

      <main className="pt-24 px-4 max-w-4xl mx-auto space-y-8 pb-32">
        <div>
          <span className="text-secondary font-headline uppercase tracking-[0.2em] text-xs font-bold">Padel League</span>
          <h2 className="text-4xl font-headline font-black text-on-surface uppercase" style={{ letterSpacing: '-0.04em' }}>Calendario</h2>
        </div>

        {sortedDates.length === 0 && (
          <p className="text-on-surface-variant text-center py-12">Nessuna partita in calendario.</p>
        )}

        {sortedDates.map(date => (
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
              />
            ))}
          </section>
        ))}
      </main>

      <BottomNav />

      {showAdd && <AddMatchModal onClose={() => setShowAdd(false)} onAdd={handleAdd} />}
      {resultIdx !== null && (
        <ResultModal
          match={matches[resultIdx]}
          onClose={() => setResultIdx(null)}
          onConfirm={handleConfirmResult}
        />
      )}
    </div>
  )
}
