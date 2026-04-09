import { useState } from 'react'
import TopAppBar from '../components/TopAppBar'
import BottomNav from '../components/BottomNav'

const GIRONI = ['A', 'B', 'C']

export default function Admin({ teams, setTeams, matches, setMatches, isAdmin, login, logout }) {
  const [player1, setPlayer1] = useState('')
  const [player2, setPlayer2] = useState('')
  const [club, setClub] = useState('')
  const [girone, setGirone] = useState('A')
  const [error, setError] = useState('')

  // Login state
  const [pwd, setPwd] = useState('')
  const [loginError, setLoginError] = useState(false)

  function handleLogin(e) {
    e.preventDefault()
    if (login(pwd)) {
      setLoginError(false)
    } else {
      setLoginError(true)
    }
  }

  function addTeam() {
    const p1 = player1.trim()
    const p2 = player2.trim()
    const c = club.trim()
    if (!p1 || !p2) { setError('Inserisci entrambi i nomi dei giocatori'); return }
    if (teams[girone].length >= 4) { setError(`Il girone ${girone} è pieno (max 4 coppie)`); return }

    const name = `${p1} / ${p2}`
    const abbr = (p1[0] + p2[0]).toUpperCase()

    const allTeams = Object.values(teams).flat()
    if (allTeams.some(t => t.name === name)) { setError('Questa coppia esiste già'); return }

    const newTeam = { name, abbr, club: c || '' }
    setTeams(prev => ({ ...prev, [girone]: [...prev[girone], newTeam] }))
    setPlayer1('')
    setPlayer2('')
    setClub('')
    setError('')
  }

  function removeTeam(g, idx) {
    const team = teams[g][idx]
    setTeams(prev => ({
      ...prev,
      [g]: prev[g].filter((_, i) => i !== idx)
    }))
    setMatches(prev => prev.filter(m =>
      !(m.girone === g && (m.casa.abbr === team.abbr || m.ospite.abbr === team.abbr))
    ))
  }

  function moveTeam(fromGirone, idx, toGirone) {
    if (teams[toGirone].length >= 4) { setError(`Il girone ${toGirone} è pieno (max 4 coppie)`); return }
    const team = teams[fromGirone][idx]
    setTeams(prev => ({
      ...prev,
      [fromGirone]: prev[fromGirone].filter((_, i) => i !== idx),
      [toGirone]: [...prev[toGirone], team]
    }))
    setMatches(prev => prev.filter(m =>
      !(m.girone === fromGirone && (m.casa.abbr === team.abbr || m.ospite.abbr === team.abbr))
    ))
    setError('')
  }

  const totalTeams = Object.values(teams).flat().length
  const inputCls = 'w-full h-12 px-4 bg-[#071530] border border-white/10 rounded-xl text-on-surface font-semibold placeholder:text-on-surface-variant/40 focus:outline-none focus:border-secondary transition-all'
  const selectCls = 'w-full h-12 px-4 bg-[#071530] border border-white/10 rounded-xl text-on-surface font-semibold appearance-none focus:outline-none focus:border-secondary transition-all'

  // Login screen
  if (!isAdmin) {
    return (
      <div className="min-h-screen text-on-surface">
        <TopAppBar actions={
          <span className="material-symbols-outlined text-on-surface-variant">lock</span>
        } />
        <main className="pt-24 pb-32 px-4 max-w-md mx-auto flex flex-col items-center justify-center min-h-[70vh]">
          <div className="w-full bg-[#152040] rounded-2xl border border-white/5 overflow-hidden">
            <div className="p-6 border-b border-white/10 bg-[#254E8F]/40 text-center">
              <div className="w-16 h-16 rounded-2xl bg-secondary/10 border border-secondary/30 flex items-center justify-center mx-auto mb-4">
                <span className="material-symbols-outlined text-secondary text-3xl">admin_panel_settings</span>
              </div>
              <h2 className="font-headline text-2xl font-black uppercase text-white">Area Admin</h2>
              <p className="text-on-surface-variant text-xs mt-1">Inserisci la password per accedere</p>
            </div>
            <form onSubmit={handleLogin} className="p-6 space-y-4">
              <div className="space-y-2">
                <label className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant">Password</label>
                <input
                  type="password"
                  value={pwd}
                  onChange={e => { setPwd(e.target.value); setLoginError(false) }}
                  placeholder="Inserisci password..."
                  className={inputCls}
                  autoFocus
                />
              </div>
              {loginError && (
                <div className="flex items-center gap-2 px-4 py-3 bg-red-500/10 border border-red-500/20 rounded-xl">
                  <span className="material-symbols-outlined text-red-400 text-sm">error</span>
                  <p className="text-red-400 text-sm font-medium">Password errata</p>
                </div>
              )}
              <button
                type="submit"
                className="w-full h-14 bg-gradient-to-r from-[#27F24C] to-[#1DB954] text-[#003909] font-headline font-black uppercase tracking-widest text-sm rounded-xl shadow-xl active:scale-[0.98] transition-transform flex items-center justify-center gap-2"
              >
                <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>lock_open</span>
                Accedi
              </button>
            </form>
          </div>
        </main>
        <BottomNav isAdmin={isAdmin} />
      </div>
    )
  }

  // Admin panel
  return (
    <div className="min-h-screen text-on-surface">
      <TopAppBar actions={
        <button onClick={logout} className="flex items-center gap-2 bg-red-500/20 border border-red-500/30 text-red-400 font-headline font-bold px-4 py-2 rounded-xl text-xs uppercase tracking-widest active:scale-95 transition-all">
          <span className="material-symbols-outlined text-sm">logout</span>
          Esci
        </button>
      } />

      <main className="pt-24 pb-32 px-4 max-w-5xl mx-auto space-y-8">
        {/* Header */}
        <section>
          <div className="relative h-48 w-full rounded-xl overflow-hidden shadow-2xl">
            <div className="absolute inset-0 bg-gradient-to-br from-[#003918] to-[#071530]" />
            <div className="absolute inset-0 opacity-5" style={{ background: 'repeating-linear-gradient(45deg,#77db90 0,#77db90 1px,transparent 1px,transparent 40px)' }} />
            <div className="absolute inset-0 bg-gradient-to-t from-[#0E2044] to-transparent" />
            <div className="absolute bottom-6 left-6">
              <h2 className="font-headline text-4xl font-black italic uppercase tracking-tighter text-white">ADMIN</h2>
              <p className="text-secondary font-bold tracking-widest text-xs uppercase mt-1">Gestione Coppie &bull; {totalTeams} Iscritte</p>
            </div>
          </div>
        </section>

        {/* Add Team Form */}
        <section className="bg-[#152040] rounded-2xl border border-white/5 overflow-hidden">
          <div className="flex items-center gap-3 p-6 border-b border-white/10 bg-[#254E8F]/40">
            <div className="w-2 h-8 bg-secondary rounded-full" />
            <h3 className="font-headline text-lg font-black uppercase">Aggiungi Coppia</h3>
          </div>
          <div className="p-6 space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant">Giocatore 1</label>
                <input type="text" placeholder="es. Rossi" value={player1} onChange={e => setPlayer1(e.target.value)} className={inputCls} />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant">Giocatore 2</label>
                <input type="text" placeholder="es. Bianchi" value={player2} onChange={e => setPlayer2(e.target.value)} className={inputCls} />
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant">Club (opzionale)</label>
                <input type="text" placeholder="es. TC Aretusa" value={club} onChange={e => setClub(e.target.value)} className={inputCls} />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant">Girone</label>
                <select value={girone} onChange={e => setGirone(e.target.value)} className={selectCls}>
                  {GIRONI.map(g => (
                    <option key={g} value={g} disabled={teams[g].length >= 4}>Girone {g} ({teams[g].length}/4)</option>
                  ))}
                </select>
              </div>
            </div>

            {error && (
              <div className="flex items-center gap-2 px-4 py-3 bg-red-500/10 border border-red-500/20 rounded-xl">
                <span className="material-symbols-outlined text-red-400 text-sm">error</span>
                <p className="text-red-400 text-sm font-medium">{error}</p>
              </div>
            )}

            <button onClick={addTeam} className="w-full h-14 bg-gradient-to-r from-[#27F24C] to-[#1DB954] text-[#003909] font-headline font-black uppercase tracking-widest text-sm rounded-xl shadow-xl active:scale-[0.98] transition-transform flex items-center justify-center gap-2">
              <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>group_add</span>
              Aggiungi Coppia
            </button>
          </div>
        </section>

        {/* Teams by Girone */}
        {GIRONI.map(g => (
          <section key={g} className="bg-[#152040] rounded-2xl border border-white/5 overflow-hidden">
            <div className="flex items-center justify-between p-6 border-b border-white/10">
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-headline font-black text-lg ${teams[g].length > 0 ? 'bg-secondary/10 text-secondary border border-secondary/30' : 'bg-[#2d5aa0] text-on-surface-variant'}`}>
                  {g}
                </div>
                <div>
                  <h3 className="font-headline font-black uppercase text-white">Girone {g}</h3>
                  <p className="text-[10px] text-on-surface-variant font-medium">{teams[g].length}/4 coppie</p>
                </div>
              </div>
              {teams[g].length >= 4 && (
                <span className="px-3 py-1 rounded-full bg-secondary/10 text-secondary text-[10px] font-bold uppercase tracking-widest">Completo</span>
              )}
            </div>

            {teams[g].length === 0 ? (
              <div className="p-8 text-center">
                <span className="material-symbols-outlined text-4xl text-on-surface-variant/30 mb-2">group_off</span>
                <p className="text-on-surface-variant/50 text-sm">Nessuna coppia in questo girone</p>
              </div>
            ) : (
              <div className="divide-y divide-white/5">
                {teams[g].map((team, idx) => (
                  <div key={idx} className="flex items-center justify-between p-4 hover:bg-[#1e3368] transition-colors group">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-[#2d5aa0] flex items-center justify-center">
                        <span className="font-headline font-bold text-xs text-on-surface-variant">{team.abbr}</span>
                      </div>
                      <div>
                        <span className="font-headline font-bold tracking-tight text-white">{team.name}</span>
                        {team.club && <p className="text-[10px] text-on-surface-variant/70 font-medium mt-0.5">{team.club}</p>}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <select
                        value=""
                        onChange={e => { if (e.target.value) moveTeam(g, idx, e.target.value) }}
                        className="h-9 px-2 bg-[#071530] border border-white/10 rounded-lg text-on-surface-variant text-xs font-medium appearance-none focus:outline-none focus:border-secondary cursor-pointer"
                      >
                        <option value="">Sposta...</option>
                        {GIRONI.filter(x => x !== g).map(x => (
                          <option key={x} value={x} disabled={teams[x].length >= 4}>Girone {x} ({teams[x].length}/4)</option>
                        ))}
                      </select>
                      <button onClick={() => removeTeam(g, idx)} className="w-9 h-9 rounded-lg bg-red-500/10 border border-red-500/20 flex items-center justify-center hover:bg-red-500/20 transition-colors">
                        <span className="material-symbols-outlined text-red-400 text-sm">delete</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>
        ))}
      </main>

      <BottomNav isAdmin={isAdmin} />
    </div>
  )
}
