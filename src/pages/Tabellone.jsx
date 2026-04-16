import { useState } from 'react'
import TopAppBar from '../components/TopAppBar'
import BottomNav from '../components/BottomNav'
import ResultModal from '../components/ResultModal'

const ROW_H = 64
const CARD_W = 152
const CONN_W = 28
const TOTAL_W = CARD_W * 4 + CONN_W * 3

const ROUND_LABELS = ['Primo Turno', 'Quarti di Finale', 'Semifinali', 'Finale']

// Preview seed labels
const PREVIEW_BYES = ['1°A', '2°A', '1°C', '1°B']
const PREVIEW_PT = [
  ['3°B', '3°C'], ['2°B', '4°C'], ['2°C', '4°B'], ['3°A', '4°A']
]

function SvgConn({ h }) {
  const t = h / 4, b = 3 * h / 4, m = h / 2, mx = 14
  return (
    <svg width={CONN_W} height={h} className="block">
      <line x1="0" y1={t} x2={mx} y2={t} stroke="rgba(113,255,116,0.15)" strokeWidth="2" />
      <line x1={mx} y1={t} x2={mx} y2={b} stroke="rgba(113,255,116,0.15)" strokeWidth="2" />
      <line x1="0" y1={b} x2={mx} y2={b} stroke="rgba(113,255,116,0.15)" strokeWidth="2" />
      <line x1={mx} y1={m} x2={CONN_W} y2={m} stroke="rgba(113,255,116,0.15)" strokeWidth="2" />
    </svg>
  )
}

function TeamRow({ team, label, score, won, lost }) {
  const name = team?.name || label || 'Da definire'
  const abbr = team?.abbr || (label ? label.slice(0, 2) : '?')
  const ok = !!team || !!label
  return (
    <div className={`flex items-center justify-between px-2 py-1 ${won ? 'bg-secondary/10' : ''}`}>
      <div className="flex items-center gap-1.5 min-w-0 flex-1">
        <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[7px] font-bold shrink-0 ${
          won ? 'bg-secondary/20 text-secondary' : lost ? 'bg-red-500/10 text-red-400/40' : ok ? 'bg-[#2d5aa0] text-on-surface-variant/60' : 'bg-[#071530] text-white/10'
        }`}>{abbr}</span>
        <span className={`text-[10px] font-semibold truncate ${
          won ? 'text-white' : lost ? 'text-on-surface-variant/25 line-through' : ok ? 'text-on-surface/70' : 'text-on-surface-variant/20 italic'
        }`}>{name}</span>
      </div>
      {score != null && <span className={`text-[11px] font-black ml-1 shrink-0 ${won ? 'text-secondary' : 'text-on-surface-variant/25'}`}>{score}</span>}
    </div>
  )
}

function MatchCard({ casa, ospite, score, played, winner, isAdmin, onResult, casaLabel, ospiteLabel }) {
  const cW = played && winner === 'casa'
  const oW = played && winner === 'ospite'
  const canPlay = (casa || casaLabel) && (ospite || ospiteLabel) && !played && casa && ospite
  return (
    <div className={`bg-[#152040] rounded-lg border overflow-hidden ${played ? 'border-secondary/20' : 'border-white/10'}`} style={{ width: CARD_W }}>
      <TeamRow team={casa} label={casaLabel} score={played ? score?.split('-')[0] : null} won={cW} lost={oW} />
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

function ByeSlot({ team, label }) {
  const name = team?.name || label || '?'
  const abbr = team?.abbr || (label ? label.slice(0, 2) : '?')
  return (
    <div className="bg-[#152040]/40 rounded-lg border border-dashed border-white/5 px-2 py-1.5" style={{ width: CARD_W }}>
      <div className="flex items-center gap-1.5">
        <span className="w-5 h-5 rounded-full bg-secondary/10 border border-secondary/15 flex items-center justify-center text-[7px] font-bold text-secondary/50 shrink-0">{abbr}</span>
        <div className="min-w-0">
          <span className="text-[10px] text-on-surface/50 font-semibold truncate block">{name}</span>
          <span className="text-[7px] text-on-surface-variant/20 font-bold uppercase">Bye &rarr; Quarti</span>
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

export default function Tabellone({ isAdmin, bracket, gironi, onActivate, onResult, level, setLevel }) {
  const [resultTarget, setResultTarget] = useState(null)
  const [confirmActivate, setConfirmActivate] = useState(false)
  const isActive = bracket.active
  const hasTeams = Object.values(gironi).flat().length >= 12

  const pt = isActive ? bracket.rounds[0] : null
  const qf = isActive ? bracket.rounds[1] : null
  const sf = isActive ? bracket.rounds[2] : null
  const fi = isActive ? bracket.rounds[3]?.[0] : null
  const champion = fi?.played ? (fi.winner === 'casa' ? fi.casa : fi.ospite) : null

  function handleResult({ score, sets }) {
    if (!resultTarget) return
    onResult(resultTarget.round, resultTarget.match, { score, sets })
    setResultTarget(null)
  }

  // Non-admin placeholder
  if (!isAdmin && !isActive) {
    return (
      <div className="min-h-screen flex flex-col text-on-surface">
        <TopAppBar level={level} setLevel={setLevel} actions={null} />
        <main className="flex-grow flex flex-col items-center justify-center relative px-6 py-20">
          <img src="/court-sunset.png" alt="Campo" className="absolute inset-0 w-full h-full object-cover opacity-30" />
          <div className="absolute inset-0 bg-gradient-to-t from-[#071530] via-[#0E2044]/70 to-[#0E2044]/40" />
          <div className="relative z-10 flex flex-col items-center text-center max-w-lg">
            <div className="mb-10 p-8 rounded-full bg-[#0E2044]/40 backdrop-blur-md shadow-inner border border-white/5">
              <span className="material-symbols-outlined text-8xl text-[#77db90]" style={{ fontVariationSettings: "'FILL' 1" }}>emoji_events</span>
            </div>
            <h2 className="font-headline text-3xl md:text-5xl font-black text-[#dfe3e7] mb-6 tracking-tight leading-none">TABELLONE <span className="text-[#77db90]">FINALE</span></h2>
            <div className="h-1 w-24 bg-gradient-to-r from-transparent via-[#77db90] to-transparent mb-8" />
            <p className="font-body text-on-surface/70 text-lg leading-relaxed">Il tabellone sarà disponibile al termine della fase a gironi.</p>
          </div>
        </main>
        <BottomNav isAdmin={isAdmin} bracketActive={isActive} />
      </div>
    )
  }

  const gridStyle = {
    display: 'grid',
    gridTemplateColumns: `${CARD_W}px ${CONN_W}px ${CARD_W}px ${CONN_W}px ${CARD_W}px ${CONN_W}px ${CARD_W}px`,
    gridTemplateRows: `repeat(8, ${ROW_H}px)`,
    width: TOTAL_W,
  }

  return (
    <div className="min-h-screen text-on-surface">
      <TopAppBar level={level} setLevel={setLevel} actions={null} />
      <main className="pt-24 pb-32 px-4 max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <section>
          <div className="relative h-44 w-full rounded-xl overflow-hidden shadow-2xl">
            <div className="absolute inset-0 bg-gradient-to-br from-[#003918] to-[#071530]" />
            <div className="absolute inset-0 opacity-5" style={{ background: 'repeating-linear-gradient(45deg,#77db90 0,#77db90 1px,transparent 1px,transparent 40px)' }} />
            <div className="absolute inset-0 bg-gradient-to-t from-[#0E2044] to-transparent" />
            <div className="absolute bottom-6 left-6">
              <h2 className="font-headline text-4xl font-black italic uppercase tracking-tighter text-white">TABELLONE</h2>
              <p className="text-secondary font-bold tracking-widest text-xs uppercase mt-1">{isActive ? 'Eliminazione Diretta' : 'Anteprima Bracket'}</p>
            </div>
            {isActive && <span className="absolute top-4 right-4 px-3 py-1 rounded-full bg-secondary/20 text-secondary text-[10px] font-bold uppercase tracking-widest">Attivo</span>}
          </div>
        </section>

        {/* Champion */}
        {champion && (
          <div className="bg-gradient-to-r from-[#27F24C]/10 to-[#1DB954]/10 border border-secondary/30 rounded-2xl p-6 text-center">
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
                <p className="text-[10px] text-on-surface-variant">{hasTeams ? 'Classifiche congelate e bracket generato' : 'Servono 12 squadre (4 per girone)'}</p>
              </div>
            </div>
            {!confirmActivate ? (
              <button onClick={() => setConfirmActivate(true)} disabled={!hasTeams} className="w-full h-12 bg-gradient-to-r from-[#27F24C] to-[#1DB954] text-[#003909] font-headline font-black uppercase tracking-widest text-xs rounded-xl shadow-xl active:scale-[0.98] transition-transform disabled:opacity-30 disabled:pointer-events-none flex items-center justify-center gap-2">
                <span className="material-symbols-outlined text-sm">play_arrow</span>Procedi
              </button>
            ) : (
              <div className="space-y-3">
                <p className="text-on-surface-variant text-xs text-center">Sei sicuro? Non sarà più possibile aggiungere partite ai gironi.</p>
                <div className="flex gap-3">
                  <button onClick={() => setConfirmActivate(false)} className="flex-1 h-11 bg-white/5 border border-white/10 text-on-surface font-headline font-bold text-xs uppercase rounded-xl hover:bg-white/10 transition-colors">Annulla</button>
                  <button onClick={() => { onActivate(); setConfirmActivate(false) }} className="flex-1 h-11 bg-gradient-to-r from-[#27F24C] to-[#1DB954] text-[#003909] font-headline font-black uppercase text-xs rounded-xl active:scale-[0.98] transition-transform flex items-center justify-center gap-2">
                    <span className="material-symbols-outlined text-sm">check</span>Conferma
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Bracket */}
        <div className="overflow-x-auto -mx-4 px-4 pb-2">
          {/* Round labels */}
          <div className="flex mb-3" style={{ width: TOTAL_W }}>
            {ROUND_LABELS.map((label, i) => (
              <div key={i} className="text-center" style={{ width: CARD_W, marginRight: i < 3 ? CONN_W : 0 }}>
                <span className="text-[9px] font-bold uppercase tracking-widest text-on-surface-variant/40">{label}</span>
              </div>
            ))}
          </div>

          {/* Bracket grid */}
          <div style={gridStyle}>
            {/* Column 1: Entries (byes + PT matches) */}
            {[0, 1, 2, 3].map(i => {
              // Bye at row 2i+1, PT at row 2i+2
              const byeRow = 2 * i + 1
              const ptRow = 2 * i + 2

              const byeTeam = isActive ? qf[i]?.casa : null
              const byeLabel = !isActive ? PREVIEW_BYES[i] : null

              const ptMatch = isActive ? pt[i] : null
              const ptCasaLabel = !isActive ? PREVIEW_PT[i][0] : null
              const ptOspiteLabel = !isActive ? PREVIEW_PT[i][1] : null

              return [
                <div key={`bye${i}`} style={cell(byeRow, 1, 1)}>
                  <ByeSlot team={byeTeam} label={byeLabel} />
                </div>,
                <div key={`pt${i}`} style={cell(ptRow, 1, 1)}>
                  <MatchCard
                    casa={ptMatch?.casa} ospite={ptMatch?.ospite}
                    casaLabel={ptCasaLabel} ospiteLabel={ptOspiteLabel}
                    score={ptMatch?.score} played={ptMatch?.played} winner={ptMatch?.winner}
                    isAdmin={isAdmin} onResult={() => setResultTarget({ round: 0, match: i })}
                  />
                </div>,
              ]
            })}

            {/* Connectors: Entries → QF */}
            {[0, 1, 2, 3].map(i => (
              <div key={`c1_${i}`} style={cell(2 * i + 1, 2, 2)}><SvgConn h={ROW_H * 2} /></div>
            ))}

            {/* Column 3: QF */}
            {[0, 1, 2, 3].map(i => {
              const m = isActive ? qf[i] : null
              const cL = !isActive ? PREVIEW_BYES[i] : null
              const oL = !isActive ? `Vinc. PT${i + 1}` : null
              return (
                <div key={`qf${i}`} style={cell(2 * i + 1, 2, 3)}>
                  <MatchCard
                    casa={m?.casa} ospite={m?.ospite}
                    casaLabel={cL} ospiteLabel={oL}
                    score={m?.score} played={m?.played} winner={m?.winner}
                    isAdmin={isAdmin} onResult={() => setResultTarget({ round: 1, match: i })}
                  />
                </div>
              )
            })}

            {/* Connectors: QF → SF */}
            {[0, 1].map(i => (
              <div key={`c2_${i}`} style={cell(4 * i + 1, 4, 4)}><SvgConn h={ROW_H * 4} /></div>
            ))}

            {/* Column 5: SF */}
            {[0, 1].map(i => {
              const m = isActive ? sf[i] : null
              const cL = !isActive ? `Vinc. QF${2 * i + 1}` : null
              const oL = !isActive ? `Vinc. QF${2 * i + 2}` : null
              return (
                <div key={`sf${i}`} style={cell(4 * i + 1, 4, 5)}>
                  <MatchCard
                    casa={m?.casa} ospite={m?.ospite}
                    casaLabel={cL} ospiteLabel={oL}
                    score={m?.score} played={m?.played} winner={m?.winner}
                    isAdmin={isAdmin} onResult={() => setResultTarget({ round: 2, match: i })}
                  />
                </div>
              )
            })}

            {/* Connector: SF → F */}
            <div style={cell(1, 8, 6)}><SvgConn h={ROW_H * 8} /></div>

            {/* Column 7: Finale */}
            <div style={cell(1, 8, 7)}>
              {(() => {
                const m = isActive ? fi : null
                return (
                  <MatchCard
                    casa={m?.casa} ospite={m?.ospite}
                    casaLabel={!isActive ? 'Vinc. SF1' : null}
                    ospiteLabel={!isActive ? 'Vinc. SF2' : null}
                    score={m?.score} played={m?.played} winner={m?.winner}
                    isAdmin={isAdmin} onResult={() => setResultTarget({ round: 3, match: 0 })}
                  />
                )
              })()}
            </div>
          </div>
        </div>

        {/* Legend */}
        <div className="bg-[#152040] rounded-2xl border border-white/5 p-4">
          <p className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant mb-2">Formato</p>
          <div className="space-y-1.5 text-xs text-on-surface-variant/60">
            <div className="flex items-start gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-secondary/50 mt-1.5 shrink-0" />
              <span>I seed 1-4 accedono direttamente ai Quarti di Finale.</span>
            </div>
            <div className="flex items-start gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-secondary/50 mt-1.5 shrink-0" />
              <span>Al meglio di 3 set. In caso di 1-1, super tie-break a 10.</span>
            </div>
          </div>
        </div>
      </main>

      {resultTarget && isActive && (() => {
        const m = bracket.rounds[resultTarget.round][resultTarget.match]
        if (!m?.casa || !m?.ospite) return null
        return <ResultModal match={{ casa: m.casa, ospite: m.ospite }} onClose={() => setResultTarget(null)} onConfirm={handleResult} />
      })()}

      <BottomNav isAdmin={isAdmin} bracketActive={isActive} />
    </div>
  )
}
