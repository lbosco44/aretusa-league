import { useState } from 'react'
import TopAppBar from '../components/TopAppBar'
import BottomNav from '../components/BottomNav'
import MatchCard from '../components/MatchCard'
import AddMatchModal from '../components/AddMatchModal'
import EditMatchModal from '../components/EditMatchModal'
import ResultModal from '../components/ResultModal'

const GIORNI = ['Dom','Lun','Mar','Mer','Gio','Ven','Sab']
const GIORNI_SHORT = ['L','M','M','G','V','S','D']
const MESI = ['GEN','FEB','MAR','APR','MAG','GIU','LUG','AGO','SET','OTT','NOV','DIC']
const MESI_FULL = ['Gennaio','Febbraio','Marzo','Aprile','Maggio','Giugno','Luglio','Agosto','Settembre','Ottobre','Novembre','Dicembre']

function fmtDate(d) {
  const [y,m,day] = d.split('-')
  const dt = new Date(+y,+m-1,+day)
  return `${GIORNI[dt.getDay()]} ${day} ${MESI[+m-1]}`
}

function toKey(y, m, d) {
  return `${y}-${String(m + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`
}

function getCalendarDays(year, month) {
  const firstDay = new Date(year, month, 1)
  // Monday-based: 0=Mon, 6=Sun
  let startDay = firstDay.getDay() - 1
  if (startDay < 0) startDay = 6
  const daysInMonth = new Date(year, month + 1, 0).getDate()
  const days = []
  // Empty slots before first day
  for (let i = 0; i < startDay; i++) days.push(null)
  for (let d = 1; d <= daysInMonth; d++) days.push(d)
  return days
}

let _nid = 100

export default function Calendario({ matches, setMatches, teams }) {
  const [showAdd, setShowAdd] = useState(false)
  const [resultIdx, setResultIdx] = useState(null)
  const [editIdx, setEditIdx] = useState(null)
  const [deleteConfirm, setDeleteConfirm] = useState(null)

  // Calendar state
  const today = new Date()
  const [calYear, setCalYear] = useState(today.getFullYear())
  const [calMonth, setCalMonth] = useState(today.getMonth())
  const [selectedDate, setSelectedDate] = useState(null)

  // Match dates set for dot indicators
  const matchDates = new Set(matches.map(m => m.date))

  const calDays = getCalendarDays(calYear, calMonth)

  function prevMonth() {
    if (calMonth === 0) { setCalYear(calYear - 1); setCalMonth(11) }
    else setCalMonth(calMonth - 1)
    setSelectedDate(null)
  }
  function nextMonth() {
    if (calMonth === 11) { setCalYear(calYear + 1); setCalMonth(0) }
    else setCalMonth(calMonth + 1)
    setSelectedDate(null)
  }

  // Matches for selected date
  const selectedMatches = selectedDate
    ? matches.map((m, i) => ({ m, i })).filter(({ m }) => m.date === selectedDate)
    : null

  // Grouped matches (for full list below calendar)
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

  const todayKey = toKey(today.getFullYear(), today.getMonth(), today.getDate())

  return (
    <div className="min-h-screen text-on-surface">
      <TopAppBar actions={
        <button onClick={() => setShowAdd(true)} className="flex items-center gap-2 bg-gradient-to-r from-[#27F24C] to-[#1DB954] text-[#003909] font-headline font-bold px-4 py-2 rounded-xl text-xs uppercase tracking-widest shadow-lg active:scale-95 transition-all">
          <span className="material-symbols-outlined text-sm" style={{ fontVariationSettings: "'FILL' 1" }}>add_circle</span>
          Aggiungi
        </button>
      } />
      <main className="pt-24 px-4 max-w-4xl mx-auto space-y-6 pb-32">
        <div>
          <span className="text-secondary font-headline uppercase tracking-[0.2em] text-xs font-bold">Padel League</span>
          <h2 className="text-4xl font-headline font-black text-on-surface uppercase" style={{ letterSpacing: '-0.04em' }}>Calendario</h2>
        </div>

        {/* Apple-style calendar */}
        <div className="bg-[#152040] rounded-2xl border border-white/5 overflow-hidden">
          {/* Month nav */}
          <div className="flex items-center justify-between px-5 py-4 border-b border-white/5">
            <button onClick={prevMonth} className="w-9 h-9 rounded-full hover:bg-white/10 flex items-center justify-center transition-colors">
              <span className="material-symbols-outlined text-on-surface-variant text-xl">chevron_left</span>
            </button>
            <h3 className="font-headline font-bold text-base text-white uppercase tracking-wide">
              {MESI_FULL[calMonth]} {calYear}
            </h3>
            <button onClick={nextMonth} className="w-9 h-9 rounded-full hover:bg-white/10 flex items-center justify-center transition-colors">
              <span className="material-symbols-outlined text-on-surface-variant text-xl">chevron_right</span>
            </button>
          </div>

          {/* Day headers */}
          <div className="grid grid-cols-7 px-3 pt-3">
            {GIORNI_SHORT.map((g, i) => (
              <div key={i} className="text-center text-[10px] font-bold uppercase tracking-widest text-on-surface-variant/50 py-1">{g}</div>
            ))}
          </div>

          {/* Day grid */}
          <div className="grid grid-cols-7 px-3 pb-4 gap-y-1">
            {calDays.map((day, i) => {
              if (day === null) return <div key={`e${i}`} />
              const dateKey = toKey(calYear, calMonth, day)
              const hasMatch = matchDates.has(dateKey)
              const isToday = dateKey === todayKey
              const isSelected = dateKey === selectedDate

              return (
                <button
                  key={i}
                  onClick={() => setSelectedDate(isSelected ? null : dateKey)}
                  className={`flex flex-col items-center justify-center py-1.5 rounded-xl transition-all relative
                    ${isSelected ? 'bg-secondary text-[#003909]' : isToday ? 'bg-white/10 text-white' : 'text-on-surface/70 hover:bg-white/5'}`}
                >
                  <span className={`text-sm font-semibold ${isSelected ? 'font-black' : ''}`}>{day}</span>
                  {hasMatch && (
                    <span className={`w-1.5 h-1.5 rounded-full mt-0.5 ${isSelected ? 'bg-[#003909]' : 'bg-secondary'}`} />
                  )}
                </button>
              )
            })}
          </div>
        </div>

        {/* Selected date matches */}
        {selectedDate && (
          <section className="space-y-4">
            <div className="flex items-center gap-4">
              <h3 className="font-headline font-bold text-xl text-on-surface whitespace-nowrap">{fmtDate(selectedDate)}</h3>
              <div className="h-px flex-grow bg-[#3f4a3f]/30" />
            </div>
            {selectedMatches.length > 0 ? (
              selectedMatches.map(({ m, i }) => (
                <MatchCard
                  key={m.id}
                  match={m}
                  onInsertResult={() => setResultIdx(i)}
                  onEdit={() => setEditIdx(i)}
                  onDelete={() => setDeleteConfirm(i)}
                />
              ))
            ) : (
              <div className="bg-[#152040] rounded-2xl border border-white/5 p-8 text-center">
                <span className="material-symbols-outlined text-3xl text-on-surface-variant/30 mb-2">event_busy</span>
                <p className="text-on-surface-variant/50 text-sm font-medium">Nessun evento in questo giorno</p>
              </div>
            )}
          </section>
        )}

        {/* Full match list (when no date selected) */}
        {!selectedDate && (
          <>
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
          </>
        )}
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
