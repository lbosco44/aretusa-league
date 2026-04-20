import { Routes, Route } from 'react-router-dom'
import { useState, useEffect } from 'react'
import { doc, setDoc, getDoc, onSnapshot } from 'firebase/firestore'
import { db } from './firebase'
import Home from './pages/Home'
import Gironi from './pages/Gironi'
import Calendario from './pages/Calendario'
import Tabellone from './pages/Tabellone'
import Admin from './pages/Admin'
import Regolamento from './pages/Regolamento'
import Galleria from './pages/Galleria'
import LoadingBall from './components/LoadingBall'

const EMPTY_BRACKET = { active: false, rounds: [[], [], [], []] }
const LEVELS = ['A', 'B', 'C']

// Gironi per livello: Livello B ha 6 gironi, gli altri ne hanno 3
const GIRONI_BY_LEVEL = {
  A: ['A', 'B', 'C'],
  B: ['A', 'B', 'C', 'D', 'E', 'F'],
  C: ['A', 'B', 'C'],
}

function getGironiList(level) {
  return GIRONI_BY_LEVEL[level] || ['A', 'B', 'C']
}

function emptyTeamsForLevel(level) {
  const result = {}
  getGironiList(level).forEach(g => { result[g] = [] })
  return result
}

function normalizeTeams(teams, gironiList) {
  const result = {}
  gironiList.forEach(g => { result[g] = (teams && teams[g]) || [] })
  return result
}

function collectionForLevel(level) {
  return `tournament_${level}`
}

function loadLevel() {
  const stored = localStorage.getItem('aretusa_level')
  return LEVELS.includes(stored) ? stored : 'A'
}

function buildGironi(teams, matches) {
  const gironi = {}
  for (const [girone, list] of Object.entries(teams)) {
    gironi[girone] = list.map((team, i) => {
      const stats = { pg: 0, v: 0, p: 0, sp: 0, sm: 0 }
      matches.filter(m => m.girone === girone && m.played).forEach(m => {
        const isCasa = m.casa.name === team.name
        const isOspite = m.ospite.name === team.name
        if (!isCasa && !isOspite) return
        stats.pg++
        const [setsWon, setsLost] = (m.score || '0-0').split('-').map(Number)
        if (isCasa) {
          stats.sp += setsWon; stats.sm += setsLost
          if (setsWon > setsLost) stats.v++; else stats.p++
        } else {
          stats.sp += setsLost; stats.sm += setsWon
          if (setsLost > setsWon) stats.v++; else stats.p++
        }
      })
      return {
        pos: i + 1,
        name: team.name,
        abbr: team.abbr,
        club: team.club || '',
        ...stats,
        pts: stats.sp,
      }
    }).sort((a, b) => b.pts - a.pts || (b.sp - b.sm) - (a.sp - a.sm))
      .map((r, i) => ({ ...r, pos: i + 1 }))
  }
  return gironi
}

function generateBracket(gironi, level) {
  const allTeams = []
  for (const [g, list] of Object.entries(gironi)) {
    list.forEach(t => allTeams.push({ name: t.name, abbr: t.abbr, club: t.club, girone: g, pos: t.pos, pts: t.pts, sp: t.sp, sm: t.sm }))
  }
  allTeams.sort((a, b) => b.pts - a.pts || (b.sp - b.sm) - (a.sp - a.sm))

  const t = (team, seed) => team ? { name: team.name, abbr: team.abbr, club: team.club, seed, seedLabel: `${team.pos}°${team.girone}` } : null
  const m = (casa, ospite) => ({ casa, ospite, score: null, sets: null, played: false, winner: null })

  // 24-team bracket per Livello B (6 gironi × 4): 6 primi + 2 migliori 2° ai bye,
  // altre 16 squadre al Primo Turno.
  if (level === 'B') {
    if (allTeams.length < 24) return EMPTY_BRACKET
    const gKeys = Object.keys(gironi)
    if (gKeys.length !== 6 || !gKeys.every(g => gironi[g].length === 4)) {
      return EMPTY_BRACKET
    }

    const sortByPts = (a, b) => b.pts - a.pts || (b.sp - b.sm) - (a.sp - a.sm)
    const withG = (team, girone) => ({ ...team, girone })

    const primi   = gKeys.map(g => withG(gironi[g][0], g)).sort(sortByPts)
    const secondi = gKeys.map(g => withG(gironi[g][1], g)).sort(sortByPts)
    const terzi   = gKeys.map(g => withG(gironi[g][2], g))
    const quarti  = gKeys.map(g => withG(gironi[g][3], g))

    const best2 = secondi[0]
    const second2 = secondi[1]
    const altri2 = [secondi[2], secondi[3], secondi[4], secondi[5]]

    // Ordine byes (ottavi, dall'alto verso il basso):
    // 1°, 1°, 2°migliore, 1°, 1°, 2°migliore, 1°, 1°
    const byes = [primi[0], primi[1], best2, primi[2], primi[3], second2, primi[4], primi[5]]

    // PT slot shapes (dal disegno):
    // PT1: 3° + 4°, PT2: 2° + 4°, PT3: 2° + 4°, PT4: 2° + 4°,
    // PT5: 3° + 4°, PT6: 2° + 4°, PT7: 3° + 3°, PT8: 3° + 3°
    const shuffle = (arr) => {
      const a = arr.slice()
      for (let i = a.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1))
        ;[a[i], a[j]] = [a[j], a[i]]
      }
      return a
    }

    const buildPT = (sec, ter, qua) => [
      [ter[0], qua[0]],   // PT1: 3° + 4°
      [sec[0], qua[1]],   // PT2: 2° + 4°
      [sec[1], qua[2]],   // PT3: 2° + 4°
      [sec[2], qua[3]],   // PT4: 2° + 4°
      [ter[1], qua[4]],   // PT5: 3° + 4°
      [sec[3], qua[5]],   // PT6: 2° + 4°
      [ter[2], ter[3]],   // PT7: 3° + 3°
      [ter[4], ter[5]],   // PT8: 3° + 3°
    ]

    let hardOnly = null
    let ideal = null
    for (let attempt = 0; attempt < 5000; attempt++) {
      const ptSol = buildPT(shuffle(altri2), shuffle(terzi), shuffle(quarti))
      const hardOk = ptSol.every(([x, y]) => x.girone !== y.girone)
      if (!hardOk) continue
      if (!hardOnly) hardOnly = ptSol
      const softOk = ptSol.every(([x, y], i) =>
        x.girone !== byes[i].girone && y.girone !== byes[i].girone
      )
      if (softOk) { ideal = ptSol; break }
    }

    const chosen = ideal || hardOnly
    if (!chosen) return EMPTY_BRACKET

    return {
      active: true,
      size: 24,
      rounds: [
        chosen.map(([a, b]) => m(t(a, null), t(b, null))),        // R1 (Primo Turno): 8 matches
        byes.map(bye => m(t(bye, null), null)),                   // R16 (Ottavi): 8 matches con bye in casa
        [m(null, null), m(null, null), m(null, null), m(null, null)], // QF: 4 matches
        [m(null, null), m(null, null)],                           // SF: 2 matches
        [m(null, null)],                                          // F: 1 match
      ],
    }
  }

  // 12-team bracket (Livelli A, C): 3 primi di girone + miglior 2° ai bye,
  // altre 8 squadre al Primo Turno.
  if (allTeams.length < 12) return EMPTY_BRACKET
  const gironiKeys = Object.keys(gironi)
  if (gironiKeys.length !== 3 || !gironiKeys.every(g => gironi[g].length === 4)) {
    return EMPTY_BRACKET
  }

  const sortByPts = (a, b) => b.pts - a.pts || (b.sp - b.sm) - (a.sp - a.sm)
  const withG = (team, girone) => ({ ...team, girone })

  const primi   = gironiKeys.map(g => withG(gironi[g][0], g)).sort(sortByPts)
  const secondi = gironiKeys.map(g => withG(gironi[g][1], g)).sort(sortByPts)
  const terzi   = gironiKeys.map(g => withG(gironi[g][2], g))
  const quarti  = gironiKeys.map(g => withG(gironi[g][3], g))

  const migliore2 = secondi[0]
  const altri2 = [secondi[1], secondi[2]]

  // Bye QF1..QF4: miglior 1°, miglior 2°, secondo 1°, terzo 1°
  const byes = [primi[0], migliore2, primi[1], primi[2]]

  // Brute-force abbinamenti PT:
  //  PT1 (→QF1): 1 da altri2 + 1 da quarti
  //  PT2 (→QF2): 2 da terzi
  //  PT3 (→QF3): terzo rimanente + 1 da quarti
  //  PT4 (→QF4): altro da altri2 + quarto rimanente
  const permute = arr => arr.length <= 1 ? [arr.slice()] :
    arr.flatMap((x, i) => permute([...arr.slice(0, i), ...arr.slice(i + 1)]).map(p => [x, ...p]))

  let hardOnly = null
  let ideal = null
  outer:
  for (const a2p of permute(altri2)) {
    for (const tp of permute(terzi)) {
      for (const qp of permute(quarti)) {
        const pairs = [
          [a2p[0], qp[0]], // PT1
          [tp[0], tp[1]],  // PT2
          [tp[2], qp[1]],  // PT3
          [a2p[1], qp[2]], // PT4
        ]
        const hardOk = pairs.every(([x, y]) => x.girone !== y.girone)
        if (!hardOk) continue
        const softOk = pairs.every(([x, y], i) =>
          x.girone !== byes[i].girone && y.girone !== byes[i].girone
        )
        if (!hardOnly) hardOnly = pairs
        if (softOk) { ideal = pairs; break outer }
      }
    }
  }

  const chosen = ideal || hardOnly
  if (!chosen) return EMPTY_BRACKET

  return {
    active: true,
    size: 12,
    rounds: [
      chosen.map(([a, b]) => m(t(a, null), t(b, null))),
      byes.map(bye => m(t(bye, null), null)),
      [m(null, null), m(null, null)],
      [m(null, null)],
    ]
  }
}

function advanceBracket(bracket, roundIdx, matchIdx, result) {
  const next = JSON.parse(JSON.stringify(bracket))
  if (!next.rounds[roundIdx] || !next.rounds[roundIdx][matchIdx]) return bracket
  const match = next.rounds[roundIdx][matchIdx]
  match.score = result.score
  match.sets = result.sets
  match.played = true

  const parts = result.score.split('-').map(Number)
  const cW = parts[0] || 0
  const oW = parts[1] || 0
  if (cW === oW) return bracket
  const winner = cW > oW ? { ...match.casa } : { ...match.ospite }
  match.winner = cW > oW ? 'casa' : 'ospite'

  const totalRounds = next.rounds.length
  // Last round has no next
  if (roundIdx >= totalRounds - 1) return next

  // PT → next round (R16 per 24-team, QF per 12-team): 1:1 mapping a .ospite
  if (roundIdx === 0) {
    next.rounds[1][matchIdx].ospite = winner
    return next
  }

  // Standard halving: match i in round N feeds match floor(i/2) in round N+1,
  // casa if i even, ospite if i odd.
  const nextIdx = Math.floor(matchIdx / 2)
  const slot = matchIdx % 2 === 0 ? 'casa' : 'ospite'
  next.rounds[roundIdx + 1][nextIdx][slot] = winner
  return next
}

function makeSyncSetter(rawSetter, docRef, toFirestore) {
  return function syncSetter(updaterOrValue) {
    if (typeof updaterOrValue === 'function') {
      rawSetter(prev => {
        const next = updaterOrValue(prev)
        setDoc(docRef, toFirestore ? toFirestore(next) : next).catch(console.error)
        return next
      })
    } else {
      rawSetter(updaterOrValue)
      setDoc(docRef, toFirestore ? toFirestore(updaterOrValue) : updaterOrValue).catch(console.error)
    }
  }
}

export default function App() {
  const [level, setLevelState] = useState(loadLevel)
  const [teams, setTeams] = useState(() => emptyTeamsForLevel(loadLevel()))
  const [matches, setMatches] = useState([])
  const [bracket, setBracket] = useState(EMPTY_BRACKET)
  const [gallery, setGallery] = useState({ list: [] })
  const [isAdmin, setIsAdmin] = useState(false)
  const [loading, setLoading] = useState(true)
  const gironi = buildGironi(teams, matches)

  // Firestore refs for current level
  const col = collectionForLevel(level)
  const teamsRef = doc(db, col, 'teams')
  const matchesRef = doc(db, col, 'matches')
  const bracketRef = doc(db, col, 'bracket')
  const galleryRef = doc(db, col, 'gallery')

  const syncTeams = makeSyncSetter(setTeams, teamsRef)
  const syncMatches = makeSyncSetter(setMatches, matchesRef, list => ({ list }))
  const syncBracket = makeSyncSetter(setBracket, bracketRef)
  const syncGallery = makeSyncSetter(setGallery, galleryRef)

  function setLevel(newLevel) {
    if (!LEVELS.includes(newLevel) || newLevel === level) return
    localStorage.setItem('aretusa_level', newLevel)
    setLevelState(newLevel)
  }

  const gironiList = getGironiList(level)

  // Real-time Firestore listeners (re-subscribe when level changes)
  useEffect(() => {
    setLoading(true)
    setTeams(emptyTeamsForLevel(level))
    setMatches([])
    setBracket(EMPTY_BRACKET)
    setGallery({ list: [] })

    let loadCount = 0
    const done = () => { if (++loadCount >= 4) setLoading(false) }
    const onError = (e) => { console.error('Firestore error:', e); done() }

    const list = getGironiList(level)
    const unsubs = [
      onSnapshot(teamsRef, snap => {
        if (snap.exists()) setTeams(normalizeTeams(snap.data(), list))
        else setTeams(emptyTeamsForLevel(level))
        done()
      }, onError),
      onSnapshot(matchesRef, snap => {
        if (snap.exists()) setMatches(snap.data().list || [])
        done()
      }, onError),
      onSnapshot(bracketRef, snap => {
        if (snap.exists()) setBracket(snap.data())
        done()
      }, onError),
      onSnapshot(galleryRef, snap => {
        if (snap.exists()) setGallery(snap.data())
        done()
      }, onError),
    ]

    // Fallback: unlock UI after 8s anche in caso di problemi
    const timeout = setTimeout(() => setLoading(false), 8000)
    return () => { unsubs.forEach(u => u()); clearTimeout(timeout) }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [level])

  // One-time migration: old `tournament` collection → `tournament_A`
  useEffect(() => {
    async function migrate() {
      try {
        const newSnap = await getDoc(doc(db, 'tournament_A', 'teams'))
        if (newSnap.exists()) return

        const oldTeams = await getDoc(doc(db, 'tournament', 'teams'))
        if (!oldTeams.exists()) return

        const oldMatches = await getDoc(doc(db, 'tournament', 'matches'))
        const oldBracket = await getDoc(doc(db, 'tournament', 'bracket'))

        await setDoc(doc(db, 'tournament_A', 'teams'), oldTeams.data())
        if (oldMatches.exists()) await setDoc(doc(db, 'tournament_A', 'matches'), oldMatches.data())
        if (oldBracket.exists()) await setDoc(doc(db, 'tournament_A', 'bracket'), oldBracket.data())
      } catch (e) { console.error('Migration to tournament_A failed:', e) }
    }
    migrate()
  }, [])

  // Verify admin token on mount
  useEffect(() => {
    const token = sessionStorage.getItem('aretusa_token')
    if (!token) return
    fetch('/api/verify', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ token }),
    })
      .then(r => r.json())
      .then(d => { if (d.valid) setIsAdmin(true); else sessionStorage.removeItem('aretusa_token') })
      .catch(() => { sessionStorage.removeItem('aretusa_token') })
  }, [])

  async function login(pwd) {
    try {
      const res = await fetch('/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password: pwd }),
      })
      if (!res.ok) return false
      const { token } = await res.json()
      sessionStorage.setItem('aretusa_token', token)
      setIsAdmin(true)
      return true
    } catch {
      return false
    }
  }

  function logout() {
    sessionStorage.removeItem('aretusa_token')
    setIsAdmin(false)
  }

  function activateTabellone() {
    const newBracket = generateBracket(gironi, level)
    syncBracket(newBracket)
  }

  function handleBracketResult(roundIdx, matchIdx, result) {
    syncBracket(prev => advanceBracket(prev, roundIdx, matchIdx, result))
  }

  if (loading) {
    return <LoadingBall label={`Caricamento Livello ${level}...`} />
  }

  const commonProps = { level, setLevel, isAdmin, bracketActive: bracket.active, gironiList }

  return (
    <Routes>
      <Route path="/" element={<Home matches={matches} teams={teams} {...commonProps} />} />
      <Route path="/gironi" element={<Gironi gironi={gironi} {...commonProps} />} />
      <Route path="/calendario" element={<Calendario matches={matches} setMatches={syncMatches} teams={teams} {...commonProps} />} />
      <Route path="/tabellone" element={
        <Tabellone
          bracket={bracket}
          gironi={gironi}
          onActivate={activateTabellone}
          onResult={handleBracketResult}
          {...commonProps}
        />
      } />
      <Route path="/regolamento" element={<Regolamento {...commonProps} />} />
      <Route path="/galleria" element={<Galleria gallery={gallery} setGallery={syncGallery} {...commonProps} />} />
      <Route path="/admin" element={<Admin teams={teams} setTeams={syncTeams} matches={matches} setMatches={syncMatches} bracket={bracket} setBracket={syncBracket} login={login} logout={logout} {...commonProps} />} />
    </Routes>
  )
}
