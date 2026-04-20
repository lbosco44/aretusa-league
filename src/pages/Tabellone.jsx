import { useState } from 'react'
import TopAppBar from '../components/TopAppBar'
import BottomNav from '../components/BottomNav'
import ResultModal from '../components/ResultModal'

const ROW_H_12 = 64
const ROW_H_24 = 52
const CARD_W = 152
const CONN_W = 28

// Bracket 12 squadre (Livello A / C): 4 round
const LABELS_12 = ['Primo Turno', 'Quarti', 'Semifinali', 'Finale']
const PREVIEW_BYES_12 = ['1°', '2° migliore', '1°', '1°']
const PREVIEW_PT_12 = [
  ['2°', '4°'], ['3°', '3°'], ['3°', '4°'], ['2°', '4°']
]

// Bracket 24 squadre (Livello B): 5 round
const LABELS_24 = ['Primo Turno', 'Ottavi', 'Quarti', 'Semifinali', 'Finale']
// R16_TO_R1_MAP[i] = R1 match che alimenta R16[i].ospite (ora 1:1)
const R16_TO_R1_MAP = [0, 1, 2, 3, 4, 5, 6, 7]
// Byes dal disegno: 1°, 1°, 2° migliore, 1°, 1°, 2° migliore, 1°, 1°
const PREVIEW_BYES_24 = ['1°', '1°', '2° migliore', '1°', '1°', '2° migliore', '1°', '1°']
// PT shapes dal disegno
const PREVIEW_PT_24 = [
  ['3°', '4°'], ['2°', '4°'], ['2°', '4°'], ['2°', '4°'],
  ['3°', '4°'], ['2°', '4°'], ['3°', '3°'], ['3°', '3°'],
]

function SvgConn({ h }) {
  const t = h / 4, b = 3 * h / 4, m = h / 2, mx = 14
  return (
    <svg width={CONN_W} height={h} className="block">
      <line x1="0" y1={t} x2={mx} y2={t} stroke="rgb(var(--secondary) / 0.15)" strokeWidth="2" />
      <line x1={mx} y1={t} x2={mx} y2={b} stroke="rgb(var(--secondary) / 0.15)" strokeWidth="2" />
      <line x1="0" y1={b} x2={mx} y2={b} stroke="rgb(var(--secondary) / 0.15)" strokeWidth="2" />
      <line x1={mx} y1={m} x2={CONN_W} y2={m} stroke="rgb(var(--secondary) / 0.15)" strokeWidth="2" />
    </svg>
  )
}

function SimpleConn({ h }) {
  const m = h / 2
  return (
    <svg width={CONN_W} height={h} className="block">
      <line x1="0" y1={m} x2={CONN_W} y2={m} stroke="rgb(var(--secondary) / 0.15)" strokeWidth="2" />
    </svg>
  )
}

function TeamRow({ team, label, score, won, lost, isBye }) {
  const name = team?.name || label || 'Da definire'
  const abbr = team?.abbr || (label ? label.slice(0, 2) : '?')
  const ok = !!team || !!label
  const bgCls = won ? 'bg-secondary/10' : isBye ? 'bg-secondary/25' : ''
  return (
    <div className={`flex items-center justify-between px-2 py-1 ${bgCls}`}>
      <div className="flex items-center gap-1.5 min-w-0 flex-1">
        <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[7px] font-bold shrink-0 ${
          won ? 'bg-secondary/20 text-secondary' : lost ? 'bg-red-500/10 text-red-400/40' : isBye ? 'bg-secondary/40 text-secondary' : ok ? 'bg-[#2d5aa0] text-on-surface-variant/60' : 'bg-[#071530] text-white/10'
        }`}>{abbr}</span>
        <span className={`text-[10px] font-semibold truncate ${
          won ? 'text-white' : lost ? 'text-on-surface-variant/25 line-through' : isBye ? 'text-white' : ok ? 'text-on-surface/70' : 'text-on-surface-variant/20 italic'
        }`}>{name}</span>
        {isBye && <span className="text-[7px] font-black text-secondary bg-secondary/30 px-1 py-0.5 rounded uppercase tracking-wider shrink-0">BYE</span>}
      </div>
      {score != null && <span className={`text-[11px] font-black ml-1 shrink-0 ${won ? 'text-secondary' : 'text-on-surface-variant/25'}`}>{score}</span>}
    </div>
  )
}

function MatchCard({ casa, ospite, score, played, winner, isAdmin, onResult, casaLabel, ospiteLabel, byeCasa }) {
  const cW = played && winner === 'casa'
  const oW = played && winner === 'ospite'
  const canPlay = (casa || casaLabel) && (ospite || ospiteLabel) && !played && casa && ospite
  return (
    <div className={`bg-[#152040] rounded-lg border overflow-hidden ${played ? 'border-secondary/20' : 'border-white/10'}`} style={{ width: CARD_W }}>
      <TeamRow team={casa} label={casaLabel} score={played ? score?.split('-')[0] : null} won={cW} lost={oW} isBye={byeCasa} />
      <div className="h-px bg-white/5" />
      <TeamRow team={ospite} label={ospiteLabel} score={played ? score?.split('-')[1] : null} won={oW} lost={cW} />
      {isAdmin && canPlay && (
        <button onClick={onResult} className="w-full py-1 bg-secondary/10 border-t border-secondary/20 text-secondary text-[8px] font-bold uppercase tracking-wider hover:bg-secondary/20 transition-colors flex items-center justify-center gap-1">
          <span className="material-symbols-outlined text-[10px]" style={{ fontVariationSettings: "'FILL' 1" }}>edit_note</span>
          Risultato
        </button>
      )}
    </div>
  )
}

function ByeSlot({ team, label, hint }) {
  const name = team?.name || label || '?'
  const abbr = team?.abbr || (label ? label.slice(0, 2) : '?')
  return (
    <div className="bg-[#152040]/40 rounded-lg border border-dashed border-white/5 px-2 py-1.5" style={{ width: CARD_W }}>
      <div className="flex items-center gap-1.5">
        <span className="w-5 h-5 rounded-full bg-secondary/10 border border-secondary/15 flex items-center justify-center text-[7px] font-bold text-secondary/50 shrink-0">{abbr}</span>
        <div className="min-w-0">
          <span className="text-[10px] text-on-surface/50 font-semibold truncate block">{name}</span>
          <span className="text-[7px] text-on-surface-variant/20 font-bold uppercase">{hint || 'Bye'}</span>
        </div>
      </div>
    </div>
  )
}

const cell = (row, span, col) => ({
  gridRow: `${row} / ${row + span}`,
  gridColumn: col,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
})

function Bracket12({ bracket, isActive, isAdmin, onResultClick }) {
  const ROW_H = ROW_H_12
  const TOTAL_W = CARD_W * 4 + CONN_W * 3
  const pt = isActive ? bracket.rounds[0] : null
  const qf = isActive ? bracket.rounds[1] : null
  const sf = isActive ? bracket.rounds[2] : null
  const fi = isActive ? bracket.rounds[3]?.[0] : null

  const gridStyle = {
    display: 'grid',
    gridTemplateColumns: `${CARD_W}px ${CONN_W}px ${CARD_W}px ${CONN_W}px ${CARD_W}px ${CONN_W}px ${CARD_W}px`,
    gridTemplateRows: `repeat(8, ${ROW_H}px)`,
    width: TOTAL_W,
  }

  return (
    <div className="overflow-x-auto -mx-4 px-4 pb-2">
      <div className="flex mb-3" style={{ width: TOTAL_W }}>
        {LABELS_12.map((label, i) => (
          <div key={i} className="text-center" style={{ width: CARD_W, marginRight: i < LABELS_12.length - 1 ? CONN_W : 0 }}>
            <span className="text-[9px] font-bold uppercase tracking-widest text-on-surface-variant/40">{label}</span>
          </div>
        ))}
      </div>

      <div style={gridStyle}>
        {[0, 1, 2, 3].map(i => {
          const ptMatch = isActive ? pt[i] : null
          return (
            <div key={`pt${i}`} style={cell(2 * i + 1, 2, 1)}>
              <MatchCard
                casa={ptMatch?.casa} ospite={ptMatch?.ospite}
                casaLabel={!isActive ? PREVIEW_PT_12[i][0] : null}
                ospiteLabel={!isActive ? PREVIEW_PT_12[i][1] : null}
                score={ptMatch?.score} played={ptMatch?.played} winner={ptMatch?.winner}
                isAdmin={isAdmin} onResult={() => onResultClick(0, i)}
              />
            </div>
          )
        })}
        {[0, 1, 2, 3].map(i => (
          <div key={`c1_${i}`} style={cell(2 * i + 1, 2, 2)}><SimpleConn h={ROW_H * 2} /></div>
        ))}
        {[0, 1, 2, 3].map(i => {
          const m = isActive ? qf[i] : null
          return (
            <div key={`qf${i}`} style={cell(2 * i + 1, 2, 3)}>
              <MatchCard
                casa={m?.casa} ospite={m?.ospite}
                casaLabel={!isActive ? PREVIEW_BYES_12[i] : null}
                ospiteLabel={!isActive ? `Vinc. PT${i + 1}` : null}
                score={m?.score} played={m?.played} winner={m?.winner}
                byeCasa={!m?.played}
                isAdmin={isAdmin} onResult={() => onResultClick(1, i)}
              />
            </div>
          )
        })}
        {[0, 1].map(i => (
          <div key={`c2_${i}`} style={cell(4 * i + 1, 4, 4)}><SvgConn h={ROW_H * 4} /></div>
        ))}
        {[0, 1].map(i => {
          const m = isActive ? sf[i] : null
          return (
            <div key={`sf${i}`} style={cell(4 * i + 1, 4, 5)}>
              <MatchCard
                casa={m?.casa} ospite={m?.ospite}
                casaLabel={!isActive ? `Vinc. QF${2 * i + 1}` : null}
                ospiteLabel={!isActive ? `Vinc. QF${2 * i + 2}` : null}
                score={m?.score} played={m?.played} winner={m?.winner}
                isAdmin={isAdmin} onResult={() => onResultClick(2, i)}
              />
            </div>
          )
        })}
        <div style={cell(1, 8, 6)}><SvgConn h={ROW_H * 8} /></div>
        <div style={cell(1, 8, 7)}>
          <MatchCard
            casa={fi?.casa} ospite={fi?.ospite}
            casaLabel={!isActive ? 'Vinc. SF1' : null}
            ospiteLabel={!isActive ? 'Vinc. SF2' : null}
            score={fi?.score} played={fi?.played} winner={fi?.winner}
            isAdmin={isAdmin} onResult={() => onResultClick(3, 0)}
          />
        </div>
      </div>
    </div>
  )
}

function Bracket24({ bracket, isActive, isAdmin, onResultClick }) {
  const ROW_H = ROW_H_24
  const TOTAL_W = CARD_W * 5 + CONN_W * 4
  const r1 = isActive ? bracket.rounds[0] : null
  const r16 = isActive ? bracket.rounds[1] : null
  const qf = isActive ? bracket.rounds[2] : null
  const sf = isActive ? bracket.rounds[3] : null
  const fi = isActive ? bracket.rounds[4]?.[0] : null

  const gridStyle = {
    display: 'grid',
    gridTemplateColumns: `${CARD_W}px ${CONN_W}px ${CARD_W}px ${CONN_W}px ${CARD_W}px ${CONN_W}px ${CARD_W}px ${CONN_W}px ${CARD_W}px`,
    gridTemplateRows: `repeat(16, ${ROW_H}px)`,
    width: TOTAL_W,
  }

  // Preview labels dal disegno Tabellone B
  const byePreview = (i) => PREVIEW_BYES_24[i]
  const r1Preview = (i) => PREVIEW_PT_24[i]

  return (
    <div className="overflow-x-auto -mx-4 px-4 pb-2">
      <div className="flex mb-3" style={{ width: TOTAL_W }}>
        {LABELS_24.map((label, i) => (
          <div key={i} className="text-center" style={{ width: CARD_W, marginRight: i < LABELS_24.length - 1 ? CONN_W : 0 }}>
            <span className="text-[9px] font-bold uppercase tracking-widest text-on-surface-variant/40">{label}</span>
          </div>
        ))}
      </div>

      <div style={gridStyle}>
        {/* Entry column: 8 R1 matches (no BYE — bye visible in R16) */}
        {[0, 1, 2, 3, 4, 5, 6, 7].map(i => {
          const r1Idx = R16_TO_R1_MAP[i]
          const r1Match = isActive ? r1[r1Idx] : null
          const r1P = r1Preview(r1Idx)
          return (
            <div key={`r1_${i}`} style={cell(2 * i + 1, 2, 1)}>
              <MatchCard
                casa={r1Match?.casa} ospite={r1Match?.ospite}
                casaLabel={!isActive ? r1P[0] : null}
                ospiteLabel={!isActive ? r1P[1] : null}
                score={r1Match?.score} played={r1Match?.played} winner={r1Match?.winner}
                isAdmin={isAdmin} onResult={() => onResultClick(0, r1Idx)}
              />
            </div>
          )
        })}

        {/* Connectors entries → R16 (1:1 mapping, simple line) */}
        {[0, 1, 2, 3, 4, 5, 6, 7].map(i => (
          <div key={`c1_${i}`} style={cell(2 * i + 1, 2, 2)}><SimpleConn h={ROW_H * 2} /></div>
        ))}

        {/* R16 column: 8 matches */}
        {[0, 1, 2, 3, 4, 5, 6, 7].map(i => {
          const m = isActive ? r16[i] : null
          const seedLabel = !isActive ? byePreview(i) : null
          return (
            <div key={`r16_${i}`} style={cell(2 * i + 1, 2, 3)}>
              <MatchCard
                casa={m?.casa} ospite={m?.ospite}
                casaLabel={seedLabel}
                ospiteLabel={!isActive ? `Vinc. R1` : null}
                score={m?.score} played={m?.played} winner={m?.winner}
                byeCasa={!m?.played}
                isAdmin={isAdmin} onResult={() => onResultClick(1, i)}
              />
            </div>
          )
        })}

        {/* Connectors R16 → QF */}
        {[0, 1, 2, 3].map(i => (
          <div key={`c2_${i}`} style={cell(4 * i + 1, 4, 4)}><SvgConn h={ROW_H * 4} /></div>
        ))}

        {/* QF column: 4 matches */}
        {[0, 1, 2, 3].map(i => {
          const m = isActive ? qf[i] : null
          return (
            <div key={`qf_${i}`} style={cell(4 * i + 1, 4, 5)}>
              <MatchCard
                casa={m?.casa} ospite={m?.ospite}
                casaLabel={!isActive ? `Vinc. R16 ${2 * i + 1}` : null}
                ospiteLabel={!isActive ? `Vinc. R16 ${2 * i + 2}` : null}
                score={m?.score} played={m?.played} winner={m?.winner}
                isAdmin={isAdmin} onResult={() => onResultClick(2, i)}
              />
            </div>
          )
        })}

        {/* Connectors QF → SF */}
        {[0, 1].map(i => (
          <div key={`c3_${i}`} style={cell(8 * i + 1, 8, 6)}><SvgConn h={ROW_H * 8} /></div>
        ))}

        {/* SF column: 2 matches */}
        {[0, 1].map(i => {
          const m = isActive ? sf[i] : null
          return (
            <div key={`sf_${i}`} style={cell(8 * i + 1, 8, 7)}>
              <MatchCard
                casa={m?.casa} ospite={m?.ospite}
                casaLabel={!isActive ? `Vinc. QF${2 * i + 1}` : null}
                ospiteLabel={!isActive ? `Vinc. QF${2 * i + 2}` : null}
                score={m?.score} played={m?.played} winner={m?.winner}
                isAdmin={isAdmin} onResult={() => onResultClick(3, i)}
              />
            </div>
          )
        })}

        {/* Connector SF → F */}
        <div style={cell(1, 16, 8)}><SvgConn h={ROW_H * 16} /></div>

        {/* Final */}
        <div style={cell(1, 16, 9)}>
          <MatchCard
            casa={fi?.casa} ospite={fi?.ospite}
            casaLabel={!isActive ? 'Vinc. SF1' : null}
            ospiteLabel={!isActive ? 'Vinc. SF2' : null}
            score={fi?.score} played={fi?.played} winner={fi?.winner}
            isAdmin={isAdmin} onResult={() => onResultClick(4, 0)}
          />
        </div>
      </div>
    </div>
  )
}

export default function Tabellone({ isAdmin, bracket, gironi, onActivate, onResult, level, setLevel, gender, setGender }) {
  const [resultTarget, setResultTarget] = useState(null)
  const [confirmActivate, setConfirmActivate] = useState(false)
  const isActive = bracket.active
  const totalTeams = Object.values(gironi).flat().length

  // 24-team bracket for Livello B, 12-team otherwise
  const is24 = (bracket.size === 24) || (!isActive && level === 'B')
  const requiredTeams = is24 ? 24 : 12
  const hasTeams = totalTeams >= requiredTeams

  const finalRoundIdx = is24 ? 4 : 3
  const fi = isActive ? bracket.rounds[finalRoundIdx]?.[0] : null
  const champion = fi?.played ? (fi.winner === 'casa' ? fi.casa : fi.ospite) : null

  function handleResult({ score, sets }) {
    if (!resultTarget) return
    onResult(resultTarget.round, resultTarget.match, { score, sets })
    setResultTarget(null)
  }

  function onResultClick(round, match) {
    setResultTarget({ round, match })
  }

  // Non-admin placeholder
  if (!isAdmin && !isActive) {
    return (
      <div className="min-h-screen flex flex-col text-on-surface">
        <TopAppBar level={level} setLevel={setLevel} gender={gender} setGender={setGender} />
        <main className="flex-grow flex flex-col items-center justify-center relative px-6 py-20">
          <img src="/court-sunset.png" alt="Campo" className="absolute inset-0 w-full h-full object-cover opacity-30" />
          <div className="absolute inset-0 bg-gradient-to-t from-[#071530] via-[#0E2044]/70 to-[#0E2044]/40" />
          <div className="relative z-10 flex flex-col items-center text-center max-w-lg">
            <div className="mb-10 p-8 rounded-full bg-[#0E2044]/40 backdrop-blur-md shadow-inner border border-white/5">
              <span className="material-symbols-outlined text-8xl text-[rgb(var(--primary))]" style={{ fontVariationSettings: "'FILL' 1" }}>emoji_events</span>
            </div>
            <h2 className="font-headline text-3xl md:text-5xl font-black text-[#dfe3e7] mb-6 tracking-tight leading-none">TABELLONE <span className="text-[rgb(var(--primary))]">FINALE</span></h2>
            <div className="h-1 w-24 bg-gradient-to-r from-transparent via-[rgb(var(--primary))] to-transparent mb-8" />
            <p className="font-body text-on-surface/70 text-lg leading-relaxed">Il tabellone sarà disponibile al termine della fase a gironi.</p>
          </div>
        </main>
        <BottomNav isAdmin={isAdmin} bracketActive={isActive} />
      </div>
    )
  }

  return (
    <div className="min-h-screen text-on-surface">
      <TopAppBar level={level} setLevel={setLevel} gender={gender} setGender={setGender} />
      <main className="pt-24 pb-32 px-4 max-w-6xl mx-auto space-y-6">
        {/* Header */}
        <section>
          <div className="relative h-44 w-full rounded-xl overflow-hidden shadow-2xl">
            <div className="absolute inset-0 bg-gradient-to-br from-[rgb(var(--on-primary))] to-[#071530]" />
            <div className="absolute inset-0 opacity-5" style={{ background: 'repeating-linear-gradient(45deg,rgb(var(--primary)) 0,rgb(var(--primary)) 1px,transparent 1px,transparent 40px)' }} />
            <div className="absolute inset-0 bg-gradient-to-t from-[#0E2044] to-transparent" />
            <div className="absolute bottom-6 left-6">
              <h2 className="font-headline text-4xl font-black italic uppercase tracking-tighter text-white">TABELLONE</h2>
              <p className="text-secondary font-bold tracking-widest text-xs uppercase mt-1">
                {isActive ? `Eliminazione Diretta · ${is24 ? 24 : 12} squadre` : `Anteprima · ${is24 ? 24 : 12} squadre`}
              </p>
            </div>
            {isActive && <span className="absolute top-4 right-4 px-3 py-1 rounded-full bg-secondary/20 text-secondary text-[10px] font-bold uppercase tracking-widest">Attivo</span>}
          </div>
        </section>

        {/* Champion */}
        {champion && (
          <div className="bg-gradient-to-r from-[rgb(var(--secondary))]/10 to-[rgb(var(--primary-container))]/10 border border-secondary/30 rounded-2xl p-6 text-center">
            <span className="material-symbols-outlined text-5xl text-secondary mb-2" style={{ fontVariationSettings: "'FILL' 1" }}>emoji_events</span>
            <p className="text-[10px] font-bold uppercase tracking-widest text-secondary mb-1">Campioni</p>
            <h3 className="font-headline text-2xl font-black text-white uppercase">{champion.name}</h3>
            {champion.club && <p className="text-on-surface-variant text-xs mt-1">{champion.club}</p>}
          </div>
        )}

        {/* Activate button */}
        {isAdmin && !isActive && (
          <div className="bg-[#152040] rounded-2xl border border-white/5 p-5 space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-secondary/10 border border-secondary/30 flex items-center justify-center">
                <span className="material-symbols-outlined text-secondary" style={{ fontVariationSettings: "'FILL' 1" }}>rocket_launch</span>
              </div>
              <div>
                <h3 className="font-headline font-black text-sm uppercase text-white">Attiva Eliminazione</h3>
                <p className="text-[10px] text-on-surface-variant">
                  {hasTeams ? 'Classifiche congelate e bracket generato' : `Servono ${requiredTeams} squadre (hai ${totalTeams})`}
                </p>
              </div>
            </div>
            {!confirmActivate ? (
              <button onClick={() => setConfirmActivate(true)} disabled={!hasTeams} className="w-full h-12 bg-gradient-to-r from-[rgb(var(--secondary))] to-[rgb(var(--primary-container))] text-[rgb(var(--on-secondary))] font-headline font-black uppercase tracking-widest text-xs rounded-xl shadow-xl active:scale-[0.98] transition-transform disabled:opacity-30 disabled:pointer-events-none flex items-center justify-center gap-2">
                <span className="material-symbols-outlined text-sm">play_arrow</span>Procedi
              </button>
            ) : (
              <div className="space-y-3">
                <p className="text-on-surface-variant text-xs text-center">Sei sicuro? Non sarà più possibile aggiungere partite ai gironi.</p>
                <div className="flex gap-3">
                  <button onClick={() => setConfirmActivate(false)} className="flex-1 h-11 bg-white/5 border border-white/10 text-on-surface font-headline font-bold text-xs uppercase rounded-xl hover:bg-white/10 transition-colors">Annulla</button>
                  <button onClick={() => { onActivate(); setConfirmActivate(false) }} className="flex-1 h-11 bg-gradient-to-r from-[rgb(var(--secondary))] to-[rgb(var(--primary-container))] text-[rgb(var(--on-secondary))] font-headline font-black uppercase text-xs rounded-xl active:scale-[0.98] transition-transform flex items-center justify-center gap-2">
                    <span className="material-symbols-outlined text-sm">check</span>Conferma
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Bracket */}
        {is24
          ? <Bracket24 bracket={bracket} isActive={isActive} isAdmin={isAdmin} onResultClick={onResultClick} />
          : <Bracket12 bracket={bracket} isActive={isActive} isAdmin={isAdmin} onResultClick={onResultClick} />}

        {/* Legend */}
        <div className="bg-[#152040] rounded-2xl border border-white/5 p-4">
          <p className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant mb-2">Formato</p>
          <div className="space-y-1.5 text-xs text-on-surface-variant/60">
            <div className="flex items-start gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-secondary/50 mt-1.5 shrink-0" />
              <span>{is24 ? 'I seed 1-8 accedono direttamente agli Ottavi.' : 'I seed 1-4 accedono direttamente ai Quarti.'}</span>
            </div>
            <div className="flex items-start gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-secondary/50 mt-1.5 shrink-0" />
              <span>Al meglio di 3 set. In caso di 1-1, super tie-break a 10.</span>
            </div>
          </div>
        </div>
      </main>

      {resultTarget && isActive && (() => {
        const m = bracket.rounds[resultTarget.round]?.[resultTarget.match]
        if (!m?.casa || !m?.ospite) return null
        return <ResultModal match={{ casa: m.casa, ospite: m.ospite }} onClose={() => setResultTarget(null)} onConfirm={handleResult} />
      })()}

      <BottomNav isAdmin={isAdmin} bracketActive={isActive} />
    </div>
  )
}
