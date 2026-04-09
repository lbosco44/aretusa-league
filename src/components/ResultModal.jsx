import { useState } from 'react'

export default function ResultModal({ match, onClose, onConfirm }) {
  const [s1a, setS1a] = useState('')
  const [s1b, setS1b] = useState('')
  const [s2a, setS2a] = useState('')
  const [s2b, setS2b] = useState('')
  const [s3a, setS3a] = useState('')
  const [s3b, setS3b] = useState('')
  const [tbTarget, setTbTarget] = useState(7)

  function handleConfirm() {
    const vals = [s1a, s1b, s2a, s2b, s3a, s3b]
    if (vals.some(v => v === '')) { alert('Inserisci tutti e 3 i punteggi dei set'); return }
    const nums = vals.map(Number)
    if (nums.some(isNaN)) { alert('I punteggi devono essere numeri'); return }
    const [n1a, n1b, n2a, n2b, n3a, n3b] = nums
    if (n1a === n1b || n2a === n2b || n3a === n3b) { alert('Nessun set può finire in parità'); return }
    // Validate realistic scores: sets max 7, tiebreak max 15
    if (n1a > 7 || n1b > 7 || n2a > 7 || n2b > 7) { alert('Il punteggio massimo di un set è 7'); return }
    const tbMax = tbTarget === 10 ? 15 : 10
    if (n3a > tbMax || n3b > tbMax) { alert(`Il punteggio massimo del tiebreak è ${tbMax}`); return }
    let cW = 0, oW = 0
    if (n1a > n1b) cW++; else oW++
    if (n2a > n2b) cW++; else oW++
    if (n3a > n3b) cW++; else oW++
    if (cW === oW) { alert('Il risultato deve avere un vincitore'); return }
    onConfirm({ score: `${cW}-${oW}`, sets: [`${n1a}-${n1b}`, `${n2a}-${n2b}`, `${n3a}-${n3b}`], tbTarget })
  }

  const inp = 'w-full h-14 text-3xl font-black text-center bg-[#071530] border border-white/10 rounded-xl focus:outline-none transition-all'

  return (
    <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-end md:items-center justify-center p-4" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="w-full max-w-lg bg-[#1e3368] rounded-3xl rounded-b-none md:rounded-3xl shadow-2xl border border-white/10 overflow-hidden">
        <div className="flex items-center justify-between p-6 border-b border-white/10 bg-[#254E8F]/40">
          <div className="flex items-center gap-3">
            <div className="w-2 h-8 bg-[#f36238] rounded-full" />
            <div>
              <h3 className="font-headline text-xl font-black uppercase">Inserisci Risultato</h3>
              <p className="text-xs text-on-surface-variant font-medium mt-0.5">{match.casa.name} vs {match.ospite.name}</p>
            </div>
          </div>
          <button onClick={onClose} className="w-9 h-9 rounded-full bg-white/10 flex items-center justify-center hover:bg-white/20"><span className="material-symbols-outlined text-on-surface">close</span></button>
        </div>
        <div className="p-6 space-y-5">
          {[['Set 1', s1a, setS1a, s1b, setS1b, true], ['Set 2', s2a, setS2a, s2b, setS2b, false]].map(([label, va, setA, vb, setB, showNames]) => (
            <div key={label} className="space-y-2">
              <label className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant">{label}</label>
              <div className="flex items-center gap-3">
                <div className="flex-1 min-w-0">
                  {showNames && <p className="text-[10px] text-on-surface-variant text-center truncate mb-1">{match.casa.name}</p>}
                  <input type="number" min="0" max="7" placeholder="0" value={va} onChange={e => setA(e.target.value)} className={`${inp} focus:border-[#71ff74]`} />
                </div>
                <span className="text-on-surface-variant font-black shrink-0">&ndash;</span>
                <div className="flex-1 min-w-0">
                  {showNames && <p className="text-[10px] text-on-surface-variant text-center truncate mb-1">{match.ospite.name}</p>}
                  <input type="number" min="0" max="7" placeholder="0" value={vb} onChange={e => setB(e.target.value)} className={`${inp} focus:border-[#71ff74]`} />
                </div>
              </div>
            </div>
          ))}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-[#f36238] inline-block" />Tiebreak
              </label>
              <div className="flex bg-[#071530] border border-white/10 p-1 rounded-xl gap-1">
                {[7, 10].map(n => (
                  <button key={n} onClick={() => setTbTarget(n)} className={`px-4 py-1.5 rounded-lg text-xs font-black uppercase transition-all ${tbTarget === n ? 'bg-[#f36238] text-white' : 'text-on-surface-variant'}`}>a {n}</button>
                ))}
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="flex-1 min-w-0"><input type="number" min="0" placeholder="0" value={s3a} onChange={e => setS3a(e.target.value)} className={`${inp} focus:border-[#f36238]`} /></div>
              <span className="text-on-surface-variant font-black shrink-0">&ndash;</span>
              <div className="flex-1 min-w-0"><input type="number" min="0" placeholder="0" value={s3b} onChange={e => setS3b(e.target.value)} className={`${inp} focus:border-[#f36238]`} /></div>
            </div>
          </div>
        </div>
        <div className="p-6 pt-0">
          <button onClick={handleConfirm} className="w-full h-14 bg-gradient-to-r from-[#f36238] to-[#d44e28] text-white font-headline font-black uppercase tracking-widest text-sm rounded-xl shadow-xl active:scale-[0.98] transition-transform flex items-center justify-center gap-2">
            <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>check_circle</span>
            Conferma Risultato
          </button>
        </div>
      </div>
    </div>
  )
}
