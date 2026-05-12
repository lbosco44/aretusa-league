import { useState, useEffect } from 'react'
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

const ROUND_LABELS_12 = ['Primo Turno', 'Quarti', 'Semifinali', 'Finale']
const ROUND_LABELS_24 = ['Primo Turno', 'Ottavi', 'Quarti', 'Semifinali', 'Finale']
const ROUND_LABELS_10 = ['Primo Turno', 'Quarti', 'Semifinali', 'Finale']

function getRoundLabels(bracket) {
  if (bracket?.size === 24) return ROUND_LABELS_24
  if (bracket?.size === 10) return ROUND_LABELS_10
  return ROUND_LABELS_12
}

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

function BracketScheduleModal({ matchLabel, onClose, onSave, existing }) {
  const [date, setDate] = useState(existing?.date || '')
  const [time, setTime] = useState(existing?.time || '')
  function handleSave() {
    if (!date || !time) { alert('Inserisci data e orario'); return }
    onSave({ date, time })
  }
  return (
    <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-end md:items-center justify-center p-4" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="w-full max-w-sm bg-[#1e3368] rounded-3xl rounded-b-none md:rounded-3xl shadow-2xl border border-white/10 overflow-hidden">
        <div className="flex items-center justify-between p-5 border-b border-white/10">
          <div>
            <h3 className="font-headline text-lg font-black uppercase">Programma Partita</h3>
            <p className="text-xs text-on-surface-variant mt-0.5">{matchLabel}</p>
          </div>
          <button onClick={onClose} className="w-9 h-9 rounded-full bg-white/10 flex items-center justify-center">
            <span className="material-symbols-outlined text-on-surface">close</span>
          </button>
        </div>
        <div className="p-5 space-y-4">
          <div className="space-y-1.5">
            <label className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant">Data</label>
            <input type="date" value={date} onChange={e => setDate(e.target.value)}
              className="w-full h-12 bg-[#071530] border border-white/10 rounded-xl px-3 text-white text-sm focus:outline-none focus:border-secondary" />
          </div>
          <div className="space-y-1.5">
            <label className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant">Orario</label>
            <input type="time" value={time} onChange={e => setTime(e.target.value)}
              className="w-full h-12 bg-[#071530] border border-white/10 rounded-xl px-3 text-white text-sm focus:outline-none focus:border-secondary" />
          </div>
        </div>
        <div className="p-5 pt-0">
          <button onClick={handleSave} className="w-full h-12 bg-gradient-to-r from-secondary to-primary-container text-on-secondary font-headline font-black uppercase tracking-widest text-xs rounded-xl active:scale-[0.98] transition-transform">
            Salva
          </button>
        </div>
      </div>
    </div>
  )
}

function BracketMatchRow({ match, roundLabel, matchNum, isAdmin, onSchedule, onResult }) {
  const teamA = match?.casa?.name || 'Da definire'
  const teamB = match?.ospite?.name || 'Da definire'
  const hasTeams = match?.casa && match?.ospite
  const played = match?.played
  const scheduled = match?.date && match?.time

  return (
    <div className={`bg-[#152040] rounded-xl border ${played ? 'border-secondary/20' : 'border-white/5'} overflow-hidden`}>
      <div className="flex items-center gap-3 px-4 py-3">
        <div className="shrink-0">
          <span className="text-[8px] font-bold uppercase tracking-widest text-on-surface-variant/50 block">{roundLabel}</span>
          <span className="text-[10px] font-black text-secondary">#{matchNum}</span>
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-bold text-white truncate">{teamA} <span className="text-on-surface-variant/40 font-normal text-xs">vs</span> {teamB}</p>
          {scheduled && !played && (
            <p className="text-[10px] text-on-surface-variant/60 mt-0.5">{fmtDate(match.date)} · {match.time}</p>
          )}
          {played && (
            <p className="text-[10px] text-secondary font-bold mt-0.5">
              {match.score} · {fmtDate(match.date)} {match.time}
            </p>
          )}
          {!scheduled && !played && (
            <p className="text-[10px] text-on-surface-variant/30 mt-0.5 italic">Non programmata</p>
          )}
        </div>
        {isAdmin && !played && (
          <div className="flex items-center gap-2 shrink-0">
            <button onClick={onSchedule} className="w-8 h-8 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center hover:bg-white/10 transition-colors">
              <span className="material-symbols-outlined text-on-surface-variant text-sm">event</span>
            </button>
            {hasTeams && (
              <button onClick={onResult} className="w-8 h-8 rounded-xl bg-secondary/10 border border-secondary/20 flex items-center justify-center hover:bg-secondary/20 transition-colors">
                <span className="material-symbols-outlined text-secondary text-sm" style={{ fontVariationSettings: "'FILL' 1" }}>edit_note</span>
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

export default function Calendario({ matches, setMatches, teams, isAdmin, bracketActive, level, setLevel, gender, setGender, gironiList, bracket, onBracketResult, onBracketSchedule }) {
  const GIRONI = gironiList || ['A', 'B', 'C']
  const [showAdd, setShowAdd] = useState(false)
  const [resultId, setResultId] = useState(null)
  const [editId, setEditId] = useState(null)
  const [deleteId, setDeleteId] = useState(null)
  const [filterGirone, setFilterGirone] = useState(null)

  // Section toggle
  const [activeSection, setActiveSection] = useState(bracketActive ? 'tabellone' : 'gironi')
  useEffect(() => { if (bracketActive) setActiveSection('tabellone') }, [bracketActive])

  // Bracket modals
  const [scheduleTarget, setScheduleTarget] = useState(null) // { round, match }
  const [bracketResultTarget, setBracketResultTarget] = useState(null) // { round, match }

  // Calendar state
  const today = new Date()
  const [calYear, setCalYear] = useState(today.getFullYear())
  const [calMonth, setCalMonth] = useState(today.getMonth())
  const [selectedDate, setSelectedDate] = useState(() => toKey(today.getFullYear(), today.getMonth(), today.getDate()))

  // Filtered girone matches
  const filtered = filterGirone ? matches.filter(m => m.girone === filterGirone) : matches

  // Calendar dots: include bracket matches when viewing tabellone
  const gironeDates = new Set(filtered.map(m => m.date))
  const bracketDates = bracketActive && bracket?.rounds
    ? new Set(bracket.rounds.flatMap(r => r.map(m => m?.date)).filter(Boolean))
    : new Set()
  const matchDates = activeSection === 'tabellone' ? bracketDates : gironeDates

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

  const selectedMatches = selectedDate ? filtered.filter(m => m.date === selectedDate) : null

  const grouped = {}
  filtered.forEach(m => {
    if (!grouped[m.date]) grouped[m.date] = []
    grouped[m.date].push(m)
  })

  const todayStr = toKey(today.getFullYear(), today.getMonth(), today.getDate())
  const upcoming = filtered.filter(m => !m.played && m.date >= todayStr).sort(sortMatches).slice(0, 6)

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

  function handleBracketResultConfirm({ score, sets, tbTarget }) {
    if (!bracketResultTarget) return
    onBracketResult(bracketResultTarget.round, bracketResultTarget.match, { score, sets, tbTarget })
    setBracketResultTarget(null)
  }

  function handleBracketScheduleSave({ date, time }) {
    if (!scheduleTarget) return
    onBracketSchedule(scheduleTarget.round, scheduleTarget.match, { date, time })
    setScheduleTarget(null)
  }

  // Build flat bracket match list for display
  const roundLabels = getRoundLabels(bracket)
  const bracketMatches = bracketActive && bracket?.rounds
    ? bracket.rounds.flatMap((round, ri) =>
        round.map((match, mi) => ({ match, roundIdx: ri, matchIdx: mi, roundLabel: roundLabels[ri] || `Round ${ri}`, matchNum: mi + 1 }))
      )
    : []

  const todayKey = toKey(today.getFullYear(), today.getMonth(), today.getDate())

  // Bracket match for modals
  const scheduleMatch = scheduleTarget ? bracket?.rounds?.[scheduleTarget.round]?.[scheduleTarget.match] : null
  const bracketResultMatch = bracketResultTarget ? bracket?.rounds?.[bracketResultTarget.round]?.[bracketResultTarget.match] : null

  return (
    <div className="min-h-screen text-on-surface">
      <TopAppBar level={level} setLevel={setLevel} gender={gender} setGender={setGender} />
      <main className="pt-24 px-4 max-w-4xl mx-auto space-y-6 pb-32">
        <div>
          <span className="text-secondary font-headline uppercase tracking-[0.2em] text-xs font-bold">Padel League</span>
          <h2 className="text-4xl font-headline font-black text-on-surface uppercase" style={{ letterSpacing: '-0.04em' }}>Calendario</h2>
        </div>

        {/* Calendar widget */}
        <div className="bg-[#152040] rounded-2xl border border-white/5 overflow-hidden">
          <div className="flex items-center justify-between px-5 py-4 border-b border-white/5">
            <button onClick={prevMonth} className="w-9 h-9 rounded-full hover:bg-white/10 flex items-center justify-center transition-colors">
              <span className="material-symbols-outlined text-on-surface-variant text-xl">chevron_left</span>
            </button>
            <h3 className="font-headline font-bold text-base text-white uppercase tracking-wide">{MESI_FULL[calMonth]} {calYear}</h3>
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
                <button key={i} onClick={() => setSelectedDate(isSelected ? null : dateKey)}
                  className={`flex flex-col items-center justify-center py-1.5 rounded-xl transition-all relative
                    ${isSelected ? 'bg-secondary text-[rgb(var(--on-secondary))]' : isToday ? 'bg-white/10 text-white' : 'text-on-surface/70 hover:bg-white/5'}`}>
                  <span className={`text-sm font-semibold ${isSelected ? 'font-black' : ''}`}>{day}</span>
                  {hasMatch && <span className={`w-1.5 h-1.5 rounded-full mt-0.5 ${isSelected ? 'bg-[rgb(var(--on-secondary))]' : 'bg-secondary'}`} />}
                </button>
              )
            })}
          </div>
        </div>

        {/* Selected date matches */}
        {selectedDate && activeSection === 'gironi' && (
          <section className="space-y-4">
            <div className="flex items-center gap-4">
              <h3 className="font-headline font-bold text-xl text-on-surface whitespace-nowrap">{fmtDate(selectedDate)}</h3>
              <div className="h-px flex-grow bg-[#3f4a3f]/30" />
            </div>
            {selectedMatches.length > 0 ? selectedMatches.map(m => (
              <MatchCard key={m.id} match={m} isAdmin={isAdmin}
                onInsertResult={() => setResultId(m.id)} onEdit={() => setEditId(m.id)}
                onDelete={() => setDeleteId(m.id)} onResetResult={() => handleResetResult(m.id)} />
            )) : (
              <div className="bg-[#152040] rounded-2xl border border-white/5 p-8 text-center">
                <span className="material-symbols-outlined text-3xl text-on-surface-variant/30 mb-2">event_busy</span>
                <p className="text-on-surface-variant/50 text-sm font-medium">Nessun evento in questo giorno</p>
              </div>
            )}
          </section>
        )}

        {/* Section toggle */}
        {bracketActive && (
          <div className="glass-radio-group" data-count="2">
            <input type="radio" name="cal-section" id="sec-tabellone" checked={activeSection === 'tabellone'} onChange={() => setActiveSection('tabellone')} />
            <label htmlFor="sec-tabellone">Match Tabellone</label>
            <input type="radio" name="cal-section" id="sec-gironi" checked={activeSection === 'gironi'} onChange={() => setActiveSection('gironi')} />
            <label htmlFor="sec-gironi">Partite Gironi</label>
            <div className="glass-glider" data-pos={activeSection === 'tabellone' ? 0 : 1} />
          </div>
        )}

        {/* ── TABELLONE SECTION ── */}
        {activeSection === 'tabellone' && bracketActive && (
          <div className="space-y-6">
            {roundLabels.map((label, ri) => {
              const round = bracket.rounds[ri] || []
              if (round.length === 0) return null
              return (
                <section key={ri} className="space-y-3">
                  <div className="flex items-center gap-3">
                    <span className="text-[9px] font-black uppercase tracking-widest text-secondary">{label}</span>
                    <div className="h-px flex-grow bg-white/5" />
                  </div>
                  {round.map((match, mi) => (
                    <BracketMatchRow
                      key={`${ri}-${mi}`}
                      match={match}
                      roundLabel={label}
                      matchNum={mi + 1}
                      isAdmin={isAdmin}
                      onSchedule={() => setScheduleTarget({ round: ri, match: mi })}
                      onResult={() => setBracketResultTarget({ round: ri, match: mi })}
                    />
                  ))}
                </section>
              )
            })}
          </div>
        )}

        {/* ── GIRONI SECTION ── */}
        {activeSection === 'gironi' && (
          <>
            {/* Girone filter */}
            <div className="glass-radio-group" data-count={GIRONI.length + 1}>
              {[null, ...GIRONI].map((g, i) => [
                <input key={`r${i}`} type="radio" name="cal-filter" id={`cal-filter-${i}`} checked={filterGirone === g} onChange={() => setFilterGirone(g)} />,
                <label key={`l${i}`} htmlFor={`cal-filter-${i}`}>{g == null ? 'Tutti' : (GIRONI.length > 3 ? g : `Girone ${g}`)}</label>,
              ])}
              <div className="glass-glider" data-pos={filterGirone ? GIRONI.indexOf(filterGirone) + 1 : 0} />
            </div>

            {/* Upcoming */}
            {upcoming.length > 0 && (
              <div className="bg-[#152040] rounded-2xl border border-white/5 overflow-hidden">
                <div className="flex items-center gap-2 px-5 py-3 border-b border-white/5">
                  <span className="material-symbols-outlined text-secondary text-sm" style={{ fontVariationSettings: "'FILL' 1" }}>schedule</span>
                  <h4 className="font-headline font-bold text-xs uppercase tracking-widest text-on-surface-variant">Prossimi Eventi</h4>
                </div>
                <div className="divide-y divide-white/5">
                  {upcoming.map(m => (
                    <button key={m.id} onClick={() => setSelectedDate(m.date)}
                      className="w-full flex items-center gap-3 px-5 py-3 hover:bg-[#1e3368] transition-colors text-left">
                      <div className="flex flex-col items-center justify-center w-10 shrink-0">
                        <span className="text-[10px] font-bold uppercase text-secondary tracking-wider">{MESI[+m.date.split('-')[1] - 1]}</span>
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

            {/* Full list */}
            {!selectedDate && (
              <>
                {Object.keys(grouped).sort().map(date => (
                  <section key={date} className="space-y-4 pb-4">
                    <div className="flex items-center gap-4">
                      <h3 className="font-headline font-bold text-xl text-on-surface whitespace-nowrap">{fmtDate(date)}</h3>
                      <div className="h-px flex-grow bg-[#3f4a3f]/30" />
                    </div>
                    {grouped[date].map(m => (
                      <MatchCard key={m.id} match={m} isAdmin={isAdmin}
                        onInsertResult={() => setResultId(m.id)} onEdit={() => setEditId(m.id)}
                        onDelete={() => setDeleteId(m.id)} onResetResult={() => handleResetResult(m.id)} />
                    ))}
                  </section>
                ))}
                {matches.length === 0 && <p className="text-on-surface-variant text-center py-12">Nessuna partita in calendario.</p>}
              </>
            )}
          </>
        )}
      </main>

      <BottomNav isAdmin={isAdmin} bracketActive={bracketActive} />

      {isAdmin && !bracketActive && (
        <button onClick={() => setShowAdd(true)} aria-label="Aggiungi partita" className="fab-upload">
          <span className="material-symbols-outlined" style={{ fontSize: '32px', fontVariationSettings: "'FILL' 1" }}>add</span>
        </button>
      )}

      {/* Gironi modals */}
      {showAdd && <AddMatchModal onClose={() => setShowAdd(false)} onAdd={handleAdd} teams={teams} matches={matches} />}
      {editId !== null && (() => { const m = findMatch(editId); return m ? <EditMatchModal match={m} teams={teams} onClose={() => setEditId(null)} onSave={handleEdit} /> : null })()}
      {resultId !== null && (() => { const m = findMatch(resultId); return m ? <ResultModal match={m} onClose={() => setResultId(null)} onConfirm={handleResult} /> : null })()}

      {/* Delete */}
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
                  <p className="text-on-surface-variant text-xs mt-0.5">{deleteMatch.casa.name} vs {deleteMatch.ospite.name}</p>
                </div>
              </div>
              <p className="text-on-surface-variant text-sm">Sei sicuro di voler eliminare questa partita? L'azione non è reversibile.</p>
              <div className="flex gap-3">
                <button onClick={() => setDeleteId(null)} className="flex-1 h-12 bg-white/5 border border-white/10 text-on-surface font-headline font-bold text-xs uppercase tracking-widest rounded-xl hover:bg-white/10 transition-colors">Annulla</button>
                <button onClick={handleDelete} className="flex-1 h-12 bg-red-500/20 border border-red-500/30 text-red-400 font-headline font-bold text-xs uppercase tracking-widest rounded-xl hover:bg-red-500/30 transition-colors flex items-center justify-center gap-2">
                  <span className="material-symbols-outlined text-sm">delete</span>Elimina
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Bracket modals */}
      {scheduleTarget && (
        <BracketScheduleModal
          matchLabel={scheduleMatch ? `${roundLabels[scheduleTarget.round]} #${scheduleTarget.match + 1}${scheduleMatch.casa ? ` · ${scheduleMatch.casa.name} vs ${scheduleMatch.ospite?.name || 'TBD'}` : ''}` : ''}
          existing={scheduleMatch}
          onClose={() => setScheduleTarget(null)}
          onSave={handleBracketScheduleSave}
        />
      )}
      {bracketResultTarget && bracketResultMatch?.casa && bracketResultMatch?.ospite && (
        <ResultModal
          match={bracketResultMatch}
          onClose={() => setBracketResultTarget(null)}
          onConfirm={handleBracketResultConfirm}
        />
      )}
    </div>
  )
}
