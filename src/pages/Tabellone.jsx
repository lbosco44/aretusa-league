import { useState } from 'react'
import TopAppBar from '../components/TopAppBar'
import BottomNav from '../components/BottomNav'
import ResultModal from '../components/ResultModal'

const ROUND_NAMES = ['Primo Turno', 'Quarti di Finale', 'Semifinali', 'Finale']

// Preview labels before activation
const PREVIEW = [
  [
    { casa: '3°B', ospite: '3°C' },
    { casa: '2°B', ospite: '4°C' },
    { casa: '2°C', ospite: '4°B' },
    { casa: '3°A', ospite: '4°A' },
  ],
  [
    { casa: '1°A', ospite: 'Vinc. PT1' },
    { casa: '2°A', ospite: 'Vinc. PT2' },
    { casa: '1°C', ospite: 'Vinc. PT3' },
    { casa: '1°B', ospite: 'Vinc. PT4' },
  ],
  [
    { casa: 'Vinc. QF1', ospite: 'Vinc. QF2' },
    { casa: 'Vinc. QF3', ospite: 'Vinc. QF4' },
  ],
  [
    { casa: 'Vinc. SF1', ospite: 'Vinc. SF2' },
  ],
]

function TeamSlot({ team, label, side, won, lost }) {
  if (!team && !label) {
    return (
      <div className={`flex items-center gap-2 ${side === 'right' ? 'flex-row-reverse text-right' : ''}`}>
        <div className="w-9 h-9 rounded-full bg-[#071530] border border-dashed border-white/10 flex items-center justify-center">
          <span className="material-symbols-outlined text-on-surface-variant/20 text-sm">help</span>
        </div>
        <span className="text-on-surface-variant/30 text-xs font-medium italic">Da definire</span>
      </div>
    )
  }

  if (label && !team) {
    return (
      <div className={`flex items-center gap-2 ${side === 'right' ? 'flex-row-reverse text-right' : ''}`}>
        <div className="w-9 h-9 rounded-full bg-[#254E8F]/40 border border-white/10 flex items-center justify-center">
          <span className="text-on-surface-variant/50 text-[10px] font-bold">?</span>
        </div>
        <span className="text-on-surface-variant/60 text-xs font-semibold">{label}</span>
      </div>
    )
  }

  return (
    <div className={`flex items-center gap-2 ${side === 'right' ? 'flex-row-reverse text-right' : ''}`}>
      <div className={`w-9 h-9 rounded-full flex items-center justify-center shrink-0 ${won ? 'bg-secondary/20 border-2 border-secondary/50' : lost ? 'bg-red-500/10 border border-red-500/20' : 'bg-[#2d5aa0] border border-white/10'}`}>
        <span className={`font-headline font-bold text-[10px] ${won ? 'text-secondary' : lost ? 'text-red-400/60' : 'text-on-surface-variant'}`}>{team.abbr}</span>
      </div>
      <div className="min-w-0">
        <p className={`text-xs font-bold truncate ${won ? 'text-white' : lost ? 'text-on-surface-variant/40 line-through' : 'text-on-surface/80'}`}>{team.name}</p>
        {team.seedLabel && <p className="text-[9px] text-on-surface-variant/40 font-medium">{team.seedLabel}</p>}
      </div>
    </div>
  )
}

function BracketMatch({ match, previewCasa, previewOspite, isAdmin, onResult, roundIdx }) {
  const canPlay = match && match.casa && match.ospite && !match.played
  const casaWon = match?.played && match.winner === 'casa'
  const ospiteWon = match?.played && match.winner === 'ospite'

  return (
    <div className={`bg-[#152040] rounded-xl border overflow-hidden ${match?.played ? 'border-secondary/20' : 'border-white/5'}`}>
      <div className="p-3 space-y-2">
        {/* Casa */}
        <div className="flex items-center justify-between gap-2">
          <div className="flex-1 min-w-0">
            <TeamSlot team={match?.casa} label={previewCasa} won={casaWon} lost={ospiteWon} />
          </div>
          {match?.played && (
            <span className={`text-sm font-black font-headline w-5 text-center ${casaWon ? 'text-secondary' : 'text-on-surface-variant/40'}`}>
              {match.score.split('-')[0]}
            </span>
          )}
        </div>

        <div className="flex items-center gap-2 px-1">
          <div className="h-px flex-1 bg-white/5" />
          <span className="text-[9px] font-bold uppercase tracking-widest text-on-surface-variant/30">vs</span>
          <div className="h-px flex-1 bg-white/5" />
        </div>

        {/* Ospite */}
        <div className="flex items-center justify-between gap-2">
          <div className="flex-1 min-w-0">
            <TeamSlot team={match?.ospite} label={previewOspite} won={ospiteWon} lost={casaWon} />
          </div>
          {match?.played && (
            <span className={`text-sm font-black font-headline w-5 text-center ${ospiteWon ? 'text-secondary' : 'text-on-surface-variant/40'}`}>
              {match.score.split('-')[1]}
            </span>
          )}
        </div>
      </div>

      {/* Sets detail */}
      {match?.played && match.sets && (
        <div className="px-3 pb-2 flex justify-center gap-2">
          {match.sets.map((s, i) => (
            <span key={i} className="text-[10px] text-on-surface-variant/50 bg-[#071530] px-2 py-0.5 rounded font-medium">
              {i < 2 ? `S${i + 1}` : 'TB'}: {s}
            </span>
          ))}
        </div>
      )}

      {/* Result button */}
      {isAdmin && canPlay && (
        <button
          onClick={onResult}
          className="w-full py-2 bg-secondary/10 border-t border-secondary/20 text-secondary font-headline font-bold text-[10px] uppercase tracking-widest hover:bg-secondary/20 transition-colors flex items-center justify-center gap-1"
        >
          <span className="material-symbols-outlined text-xs" style={{ fontVariationSettings: "'FILL' 1" }}>edit_note</span>
          Risultato
        </button>
      )}
    </div>
  )
}

export default function Tabellone({ isAdmin, bracket, gironi, onActivate, onResult }) {
  const [resultTarget, setResultTarget] = useState(null)
  const [confirmActivate, setConfirmActivate] = useState(false)

  const isActive = bracket.active
  const hasTeams = Object.values(gironi).flat().length >= 12

  // Find winner
  const finale = isActive ? bracket.rounds[3]?.[0] : null
  const champion = finale?.played
    ? (finale.winner === 'casa' ? finale.casa : finale.ospite)
    : null

  function handleResult({ score, sets }) {
    if (!resultTarget) return
    onResult(resultTarget.round, resultTarget.match, { score, sets })
    setResultTarget(null)
  }

  // For non-admin, if bracket is not active, show placeholder
  if (!isAdmin && !isActive) {
    return (
      <div className="min-h-screen flex flex-col text-on-surface">
        <TopAppBar actions={null} />
        <main className="flex-grow flex flex-col items-center justify-center relative px-6 py-20">
          <img src="/court-sunset.png" alt="Campo da padel" className="absolute inset-0 w-full h-full object-cover opacity-30" />
          <div className="absolute inset-0 bg-gradient-to-t from-[#071530] via-[#0E2044]/70 to-[#0E2044]/40" />
          <div className="relative z-10 flex flex-col items-center text-center max-w-lg">
            <div className="mb-10 p-8 rounded-full bg-[#0E2044]/40 backdrop-blur-md shadow-inner border border-white/5">
              <span className="material-symbols-outlined text-8xl text-[#77db90]" style={{ fontVariationSettings: "'FILL' 1" }}>emoji_events</span>
            </div>
            <h2 className="font-headline text-3xl md:text-5xl font-black text-[#dfe3e7] mb-6 tracking-tight leading-none">TABELLONE <span className="text-[#77db90]">FINALE</span></h2>
            <div className="h-1 w-24 bg-gradient-to-r from-transparent via-[#77db90] to-transparent mb-8" />
            <p className="font-body text-on-surface/70 text-lg leading-relaxed px-4">Il tabellone sarà disponibile al termine della fase a gironi.</p>
          </div>
        </main>
        <BottomNav isAdmin={isAdmin} bracketActive={isActive} />
      </div>
    )
  }

  return (
    <div className="min-h-screen text-on-surface">
      <TopAppBar actions={null} />

      <main className="pt-24 pb-32 px-4 max-w-3xl mx-auto space-y-6">
        {/* Header */}
        <section>
          <div className="relative h-48 w-full rounded-xl overflow-hidden shadow-2xl">
            <div className="absolute inset-0 bg-gradient-to-br from-[#003918] to-[#071530]" />
            <div className="absolute inset-0 opacity-5" style={{ background: 'repeating-linear-gradient(45deg,#77db90 0,#77db90 1px,transparent 1px,transparent 40px)' }} />
            <div className="absolute inset-0 bg-gradient-to-t from-[#0E2044] to-transparent" />
            <div className="absolute bottom-6 left-6">
              <h2 className="font-headline text-4xl font-black italic uppercase tracking-tighter text-white">TABELLONE</h2>
              <p className="text-secondary font-bold tracking-widest text-xs uppercase mt-1">
                {isActive ? 'Fase ad Eliminazione Diretta' : 'Anteprima Bracket'}
              </p>
            </div>
            {isActive && (
              <div className="absolute top-4 right-4">
                <span className="px-3 py-1 rounded-full bg-secondary/20 text-secondary text-[10px] font-bold uppercase tracking-widest">Attivo</span>
              </div>
            )}
          </div>
        </section>

        {/* Champion banner */}
        {champion && (
          <div className="bg-gradient-to-r from-[#27F24C]/10 to-[#1DB954]/10 border border-secondary/30 rounded-2xl p-6 text-center">
            <span className="material-symbols-outlined text-5xl text-secondary mb-2" style={{ fontVariationSettings: "'FILL' 1" }}>emoji_events</span>
            <p className="text-[10px] font-bold uppercase tracking-widest text-secondary mb-1">Campioni</p>
            <h3 className="font-headline text-2xl font-black text-white uppercase">{champion.name}</h3>
            {champion.club && <p className="text-on-surface-variant text-xs mt-1">{champion.club}</p>}
          </div>
        )}

        {/* Activate button for admin (not yet active) */}
        {isAdmin && !isActive && (
          <div className="bg-[#152040] rounded-2xl border border-white/5 p-6 space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-secondary/10 border border-secondary/30 flex items-center justify-center">
                <span className="material-symbols-outlined text-secondary" style={{ fontVariationSettings: "'FILL' 1" }}>rocket_launch</span>
              </div>
              <div>
                <h3 className="font-headline font-black text-sm uppercase text-white">Attiva Eliminazione Diretta</h3>
                <p className="text-[10px] text-on-surface-variant">
                  {hasTeams ? 'Le classifiche dei gironi verranno congelate e il bracket generato' : 'Servono 12 squadre (4 per girone) per attivare il tabellone'}
                </p>
              </div>
            </div>
            {!confirmActivate ? (
              <button
                onClick={() => setConfirmActivate(true)}
                disabled={!hasTeams}
                className="w-full h-12 bg-gradient-to-r from-[#27F24C] to-[#1DB954] text-[#003909] font-headline font-black uppercase tracking-widest text-xs rounded-xl shadow-xl active:scale-[0.98] transition-transform disabled:opacity-30 disabled:pointer-events-none flex items-center justify-center gap-2"
              >
                <span className="material-symbols-outlined text-sm">play_arrow</span>
                Procedi con il Tabellone
              </button>
            ) : (
              <div className="space-y-3">
                <p className="text-on-surface-variant text-xs text-center">Sei sicuro? Non sarà più possibile aggiungere partite ai gironi.</p>
                <div className="flex gap-3">
                  <button onClick={() => setConfirmActivate(false)} className="flex-1 h-12 bg-white/5 border border-white/10 text-on-surface font-headline font-bold text-xs uppercase tracking-widest rounded-xl hover:bg-white/10 transition-colors">
                    Annulla
                  </button>
                  <button onClick={() => { onActivate(); setConfirmActivate(false) }} className="flex-1 h-12 bg-gradient-to-r from-[#27F24C] to-[#1DB954] text-[#003909] font-headline font-black uppercase tracking-widest text-xs rounded-xl shadow-xl active:scale-[0.98] transition-transform flex items-center justify-center gap-2">
                    <span className="material-symbols-outlined text-sm">check</span>
                    Conferma
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Bracket rounds */}
        {ROUND_NAMES.map((name, rIdx) => {
          const roundMatches = isActive ? bracket.rounds[rIdx] : PREVIEW[rIdx]
          if (!roundMatches || roundMatches.length === 0) return null

          // Determine if round is current (has playable matches)
          const isCurrent = isActive && roundMatches.some(m => m.casa && m.ospite && !m.played)
          const isCompleted = isActive && roundMatches.length > 0 && roundMatches.every(m => m.played)

          return (
            <section key={rIdx} className="space-y-3">
              <div className="flex items-center gap-3">
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-xs font-black ${isCurrent ? 'bg-secondary/20 text-secondary border border-secondary/30' : isCompleted ? 'bg-secondary/10 text-secondary/50' : 'bg-[#254E8F]/40 text-on-surface-variant/50'}`}>
                  {rIdx + 1}
                </div>
                <div>
                  <h3 className="font-headline font-black text-sm uppercase text-white tracking-wide">{name}</h3>
                  <p className="text-[9px] text-on-surface-variant/50 font-medium">
                    {isCompleted ? 'Completato' : isCurrent ? 'In corso' : isActive ? 'In attesa' : `${roundMatches.length} ${roundMatches.length === 1 ? 'partita' : 'partite'}`}
                  </p>
                </div>
              </div>

              <div className={`grid gap-3 ${roundMatches.length > 2 ? 'grid-cols-1 sm:grid-cols-2' : 'grid-cols-1 max-w-md mx-auto'}`}>
                {roundMatches.map((match, mIdx) => (
                  <BracketMatch
                    key={`${rIdx}-${mIdx}`}
                    match={isActive ? match : null}
                    previewCasa={!isActive ? match.casa : undefined}
                    previewOspite={!isActive ? match.ospite : undefined}
                    isAdmin={isAdmin}
                    roundIdx={rIdx}
                    onResult={() => setResultTarget({ round: rIdx, match: mIdx })}
                  />
                ))}
              </div>
            </section>
          )
        })}

        {/* Legend */}
        <div className="bg-[#152040] rounded-2xl border border-white/5 p-4">
          <p className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant mb-3">Formato</p>
          <div className="space-y-2 text-xs text-on-surface-variant/70">
            <div className="flex items-start gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-secondary/60 mt-1.5 shrink-0" />
              <span>I seed 1-4 accedono direttamente ai Quarti di Finale.</span>
            </div>
            <div className="flex items-start gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-secondary/60 mt-1.5 shrink-0" />
              <span>Partita al meglio di 3 set. In caso di 1-1, super tie-break a 10 punti.</span>
            </div>
            <div className="flex items-start gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-secondary/60 mt-1.5 shrink-0" />
              <span>Chi perde viene eliminato. Il vincente avanza al turno successivo.</span>
            </div>
          </div>
        </div>
      </main>

      {/* Result modal for bracket matches */}
      {resultTarget && isActive && (() => {
        const m = bracket.rounds[resultTarget.round][resultTarget.match]
        if (!m || !m.casa || !m.ospite) return null
        return (
          <ResultModal
            match={{ casa: m.casa, ospite: m.ospite }}
            onClose={() => setResultTarget(null)}
            onConfirm={handleResult}
          />
        )
      })()}

      <BottomNav isAdmin={isAdmin} bracketActive={isActive} />
    </div>
  )
}
