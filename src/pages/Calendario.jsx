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
  let startDay = firstDay.getDay() - 1
  if (startDay < 0) startDay = 6
  const daysInMonth = new Date(year, month + 1, 0).getDate()
  const days = []
  for (let i = 0; i < startDay; i++) days.push(null)
  for (let d = 1; d <= daysInMonth; d++) days.push(d)
  return days
}

const sortMatches = (a, b) => a.date === b.date ? a.ora.localeCompare(b.ora) : a.date.localeCompare(b.date)

export default function Calendario({ matches, setMatches, teams, isAdmin, bracketActive, level, setLevel, gender, setGender, gironiList }) {
  const GIRONI = gironiList || ['A', 'B', 'C']
  const [showAdd, setShowAdd] = useState(false)
  const [resultId, setResultId] = useState(null)
  const [editId, setEditId] = useState(null)
  const [deleteId, setDeleteId] = useState(null)
  const [filterGirone, setFilterGirone] = useState(null)

  // Calendar state
  const today = new Date()
  const [calYear, setCalYear] = useState(today.getFullYear())
  const [calMonth, setCalMonth] = useState(today.getMonth())
  const [selectedDate, setSelectedDate] = useState(() => toKey(today.getFullYear(), today.getMonth(), today.getDate()))

  // Filtered matches
  const filtered = filterGirone ? matches.filter(m => m.girone === filterGirone) : matches

  // Match dates set for dot indicators
  const matchDates = new Set(filtered.map(m => m.date))

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
    ? filtered.filter(m => m.date === selectedDate)
    : null

  // Grouped matches (for full list below calendar)
  const grouped = {}
  filtered.forEach(m => {
    if (!grouped[m.date]) grouped[m.date] = []
    grouped[m.date].push(m)
  })

  // Upcoming matches (not played, sorted by date/time)
  const todayStr = toKey(today.getFullYear(), today.getMonth(), today.getDate())
  const upcoming = filtered
    .filter(m => !m.played && m.date >= todayStr)
    .sort(sortMatches)
    .slice(0, 6)

  // Find match by ID helpers
  const findMatch = (id) => matches.find(m => m.id === id)
  const deleteMatch = findMatch(deleteId)

  function handleAdd(nm) {
    setMatches(prev => [...prev, { id: Date.now(), ...nm }].sort(sortMatches))
    setShowAdd(false)
  }

  function handleResult({ score, sets, tbTarget }) {
    setMatches(prev => prev.map(m => m.id === resultId ? { ...m, score, sets, tbTarget, played: true } : m))
    setResultId(null)
  }

  function handleResetResult(matchId) {
    setMatches(prev => prev.map(m => m.id === matchId ? { ...m, score: null, sets: null, tbTarget: null, played: false } : m))
  }

  function handleDelete() {
    setMatches(prev => prev.filter(m => m.id !== deleteId))
    setDeleteId(null)
  }

  function handleEdit(updated) {
    setMatches(prev => prev.map(m => m.id === editId ? updated : m).sort(sortMatches))
    setEditId(null)
  }

  const todayKey = toKey(today.getFullYear(), today.getMonth(), today.getDate())

  return (
    <div className="min-h-screen text-on-surface">
      <TopAppBar level={level} setLevel={setLevel} gender={gender} setGender={setGender} />
      <main className="pt-24 px-4 max-w-4xl mx-auto space-y-6 pb-32">
        <div>
          <span className="text-secondary font-headline uppercase tracking-[0.2em] text-xs font-bold">Padel League</span>
          <h2 className="text-4xl font-headline font-black text-on-surface uppercase" style={{ letterSpacing: '-0.04em' }}>Calendario</h2>
        </div>

        {/* Apple-style calendar */}
        <div className="bg-[#152040] rounded-2xl border border-white/5 overflow-hidden">
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

          <div className="grid grid-cols-7 px-3 pt-3">
            {GIORNI_SHORT.map((g, i) => (
              <div key={i} className="text-center text-[10px] font-bold uppercase tracking-widest text-on-surface-variant/50 py-1">{g}</div>
            ))}
          </div>

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
                    ${isSelected ? 'bg-secondary text-[rgb(var(--on-secondary))]' : isToday ? 'bg-white/10 text-white' : 'text-on-surface/70 hover:bg-white/5'}`}
                >
                  <span className={`text-sm font-semibold ${isSelected ? 'font-black' : ''}`}>{day}</span>
                  {hasMatch && (
                    <span className={`w-1.5 h-1.5 rounded-full mt-0.5 ${isSelected ? 'bg-[rgb(var(--on-secondary))]' : 'bg-secondary'}`} />
                  )}
                </button>
              )
            })}
          </div>
        </div>

        {/* Selected date matches (right after calendar) */}
        {selectedDate && (
          <section className="space-y-4">
            <div className="flex items-center gap-4">
              <h3 className="font-headline font-bold text-xl text-on-surface whitespace-nowrap">{fmtDate(selectedDate)}</h3>
              <div className="h-px flex-grow bg-[#3f4a3f]/30" />
            </div>
            {selectedMatches.length > 0 ? (
              selectedMatches.map(m => (
                <MatchCard
                  key={m.id}
                  match={m}
                  isAdmin={isAdmin}
                  onInsertResult={() => setResultId(m.id)}
                  onEdit={() => setEditId(m.id)}
                  onDelete={() => setDeleteId(m.id)}
                  onResetResult={() => handleResetResult(m.id)}
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

        {/* Girone filter */}
        <div className="glass-radio-group" data-count={GIRONI.length + 1}>
          {[null, ...GIRONI].map((g, i) => [
            <input key={`r${i}`} type="radio" name="cal-filter" id={`cal-filter-${i}`} checked={filterGirone === g} onChange={() => setFilterGirone(g)} />,
            <label key={`l${i}`} htmlFor={`cal-filter-${i}`}>{g == null ? 'Tutti' : (GIRONI.length > 3 ? g : `Girone ${g}`)}</label>,
          ])}
          <div className="glass-glider" data-pos={filterGirone ? GIRONI.indexOf(filterGirone) + 1 : 0} />
        </div>

        {/* Upcoming mini list */}
        {upcoming.length > 0 && (
          <div className="bg-[#152040] rounded-2xl border border-white/5 overflow-hidden">
            <div className="flex items-center gap-2 px-5 py-3 border-b border-white/5">
              <span className="material-symbols-outlined text-secondary text-sm" style={{ fontVariationSettings: "'FILL' 1" }}>schedule</span>
              <h4 className="font-headline font-bold text-xs uppercase tracking-widest text-on-surface-variant">Prossimi Eventi</h4>
            </div>
            <div className="divide-y divide-white/5">
              {upcoming.map(m => (
                <button
                  key={m.id}
                  onClick={() => setSelectedDate(m.date)}
                  className="w-full flex items-center gap-3 px-5 py-3 hover:bg-[#1e3368] transition-colors text-left"
                >
                  <div className="flex flex-col items-center justify-center w-10 shrink-0">
                    <span className="text-[10px] font-bold uppercase text-secondary tracking-wider">
                      {MESI[+m.date.split('-')[1] - 1]}
                    </span>
                    <span className="font-headline font-black text-lg text-white leading-tight">{+m.date.split('-')[2]}</span>
                  </div>
                  <div className="h-8 w-px bg-white/10 shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-white truncate">{m.casa.name} <span className="text-on-surface-variant/50 font-normal">vs</span> {m.ospite.name}</p>
                    <p className="text-[10px] text-on-surface-variant/60 font-medium">{m.ora} &bull; Girone {m.girone} &bull; {m.casa.club}</p>
                  </div>
                  <span className="material-symbols-outlined text-on-surface-variant/30 text-sm shrink-0">chevron_right</span>
                </button>
              ))}
            </div>
          </div>
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
                {grouped[date].map(m => (
                  <MatchCard
                    key={m.id}
                    match={m}
                    isAdmin={isAdmin}
                    onInsertResult={() => setResultId(m.id)}
                    onEdit={() => setEditId(m.id)}
                    onDelete={() => setDeleteId(m.id)}
                    onResetResult={() => handleResetResult(m.id)}
                  />
                ))}
              </section>
            ))}
            {matches.length === 0 && <p className="text-on-surface-variant text-center py-12">Nessuna partita in calendario.</p>}
          </>
        )}
      </main>
      <BottomNav isAdmin={isAdmin} bracketActive={bracketActive} />

      {/* Floating Action Button — aggiungi partita (admin only, gironi phase) */}
      {isAdmin && !bracketActive && (
        <button
          onClick={() => setShowAdd(true)}
          aria-label="Aggiungi partita"
          className="fab-upload"
        >
          <span className="material-symbols-outlined" style={{ fontSize: '32px', fontVariationSettings: "'FILL' 1" }}>add</span>
        </button>
      )}

      {showAdd && <AddMatchModal onClose={() => setShowAdd(false)} onAdd={handleAdd} teams={teams} matches={matches} />}
      {editId !== null && (() => { const m = findMatch(editId); return m ? <EditMatchModal match={m} teams={teams} onClose={() => setEditId(null)} onSave={handleEdit} /> : null })()}
      {resultId !== null && (() => { const m = findMatch(resultId); return m ? <ResultModal match={m} onClose={() => setResultId(null)} onConfirm={handleResult} /> : null })()}

      {/* Delete confirmation */}
      {deleteId !== null && deleteMatch && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4" onClick={() => setDeleteId(null)}>
          <div className="w-full max-w-sm bg-[#1e3368] rounded-2xl shadow-2xl border border-white/10 overflow-hidden" onClick={e => e.stopPropagation()}>
            <div className="p-6 space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-red-500/10 border border-red-500/20 flex items-center justify-center">
                  <span className="material-symbols-outlined text-red-400">delete_forever</span>
                </div>
                <div>
                  <h3 className="font-headline font-black text-lg uppercase text-white">Elimina Partita</h3>
                  <p className="text-on-surface-variant text-xs mt-0.5">
                    {deleteMatch.casa.name} vs {deleteMatch.ospite.name}
                  </p>
                </div>
              </div>
              <p className="text-on-surface-variant text-sm">Sei sicuro di voler eliminare questa partita? L'azione non è reversibile.</p>
              <div className="flex gap-3">
                <button onClick={() => setDeleteId(null)} className="flex-1 h-12 bg-white/5 border border-white/10 text-on-surface font-headline font-bold text-xs uppercase tracking-widest rounded-xl hover:bg-white/10 transition-colors">
                  Annulla
                </button>
                <button onClick={handleDelete} className="flex-1 h-12 bg-red-500/20 border border-red-500/30 text-red-400 font-headline font-bold text-xs uppercase tracking-widest rounded-xl hover:bg-red-500/30 transition-colors flex items-center justify-center gap-2">
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
