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

// Firestore non supporta array annidati: wrappiamo ogni round in { matches: [...] }
function bracketToFirestore(b) {
  if (!b) return b
  return {
    ...b,
    rounds: (b.rounds || []).map(r => ({
      matches: Array.isArray(r) ? r : (r?.matches || []),
    })),
  }
}
function bracketFromFirestore(data) {
  if (!data) return EMPTY_BRACKET
  return {
    ...data,
    rounds: (data.rounds || []).map(r => {
      if (Array.isArray(r)) return r
      if (r && Array.isArray(r.matches)) return r.matches
      return []
    }),
  }
}
const LEVELS = ['A', 'B', 'C']
const GENDERS = ['M', 'F']

// Gironi per livello maschile
const GIRONI_BY_LEVEL = {
  A: ['A', 'B', 'C'],
  B: ['A', 'B', 'C', 'D', 'E', 'F'],
  C: ['A', 'B', 'C'],
}
// Femminile: un solo livello, 2 gironi
const GIRONI_FEMMINILE = ['A', 'B']

function getGironiList(level, gender) {
  if (gender === 'F') return GIRONI_FEMMINILE
  return GIRONI_BY_LEVEL[level] || ['A', 'B', 'C']
}

function emptyTeamsFor(level, gender) {
  const result = {}
  getGironiList(level, gender).forEach(g => { result[g] = [] })
  return result
}

function normalizeTeams(teams, gironiList) {
  const result = {}
  gironiList.forEach(g => { result[g] = (teams && teams[g]) || [] })
  return result
}

function collectionFor(level, gender) {
  if (gender === 'F') return 'tournament_F'
  return `tournament_${level}`
}

function loadLevel() {
  const stored = localStorage.getItem('aretusa_level')
  return LEVELS.includes(stored) ? stored : 'A'
}

function loadGender() {
  const stored = localStorage.getItem('aretusa_gender')
  return GENDERS.includes(stored) ? stored : 'M'
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
    }).sort((a, b) => {
        if (b.pts !== a.pts) return b.pts - a.pts
        const h2h = matches.find(m =>
          m.girone === girone && m.played &&
          ((m.casa.name === a.name && m.ospite.name === b.name) ||
           (m.casa.name === b.name && m.ospite.name === a.name))
        )
        if (h2h) {
          const [cs, os] = (h2h.score || '0-0').split('-').map(Number)
          const aWins = (h2h.casa.name === a.name && cs > os) || (h2h.ospite.name === a.name && os > cs)
          const bWins = (h2h.casa.name === b.name && cs > os) || (h2h.ospite.name === b.name && os > cs)
          if (aWins) return -1
          if (bWins) return 1
        }
        return (b.sp - b.sm) - (a.sp - a.sm)
      })
      .map((r, i) => ({ ...r, pos: i + 1 }))
  }
  return gironi
}

function generateBracket(gironi, level, gender) {
  const allTeams = []
  for (const [g, list] of Object.entries(gironi)) {
    list.forEach(t => allTeams.push({ name: t.name, abbr: t.abbr, club: t.club, girone: g, pos: t.pos, pts: t.pts, sp: t.sp, sm: t.sm }))
  }
  allTeams.sort((a, b) => b.pts - a.pts || (b.sp - b.sm) - (a.sp - a.sm))

  const t = (team, seed) => team ? { name: team.name, abbr: team.abbr, club: team.club, seed, seedLabel: `${team.pos}°${team.girone}` } : null
  const m = (casa, ospite) => ({ casa, ospite, score: null, sets: null, played: false, winner: null })

  // 10-team bracket femminile (2 gironi × 5): 2 primi → bye in semifinale,
  // 2°/3°/4°/5° di ogni girone giocano primo turno e quarti intra-girone,
  // poi SF cross-girone e finale.
  if (gender === 'F') {
    if (allTeams.length < 10) return EMPTY_BRACKET
    const gKeys = Object.keys(gironi)
    if (gKeys.length !== 2 || !gKeys.every(g => gironi[g].length === 5)) {
      return EMPTY_BRACKET
    }
    const withG = (team, gg) => ({ ...team, girone: gg })
    const [gA, gB] = gKeys
    const A = gironi[gA].map(x => withG(x, gA))
    const B = gironi[gB].map(x => withG(x, gB))
    return {
      active: true,
      size: 10,
      rounds: [
        // PT: 4 match intra-girone (2°A+4°A, 3°A+5°A, 2°B+4°B, 3°B+5°B)
        [
          m(t(A[1], null), t(A[3], null)),
          m(t(A[2], null), t(A[4], null)),
          m(t(B[1], null), t(B[3], null)),
          m(t(B[2], null), t(B[4], null)),
        ],
        // QF: 2 match intra-girone (vincenti di coppie PT)
        [m(null, null), m(null, null)],
        // SF: bye (1°) casa + vincente QF ospite
        [m(t(A[0], null), null), m(t(B[0], null), null)],
        // F
        [m(null, null)],
      ]
    }
  }

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
        // Livello C: PT1=3°+3°, PT2=2°+4° (come da tabellone fisico)
        // Livello A: PT1=2°+4°, PT2=3°+3°
        // Livello A e C: PT1=3°+3°, PT2=2°+4°, PT3=3°+4°, PT4=2°+4°
        const pairsA = [
          [tp[0], tp[1]],  // PT1: 3° + 3°
          [a2p[0], qp[0]], // PT2: 2° + 4°
          [tp[2], qp[1]],  // PT3: 3° + 4°
          [a2p[1], qp[2]], // PT4: 2° + 4°
        ]
        const pairsC = [
          [tp[0], tp[1]],  // PT1: 3° + 3°
          [a2p[0], qp[0]], // PT2: 2° + 4°
          [tp[2], qp[1]],  // PT3: 3° + 4°
          [a2p[1], qp[2]], // PT4: 2° + 4°
        ]
        const pairs = level === 'C' ? pairsC : pairsA
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

  // Round con bye feeder: winner va nell'`.ospite` del prossimo round (stesso matchIdx).
  // - 10-team (F): QF → SF (roundIdx 1). PT → QF usa halving standard.
  // - 12-team (A/C): PT → QF (roundIdx 0).
  // - 24-team (B): R1 → R16 (roundIdx 0).
  const isByeFeeder =
    (bracket.size === 10 && roundIdx === 1) ||
    (bracket.size === 12 && roundIdx === 0) ||
    (bracket.size === 24 && roundIdx === 0)
  if (isByeFeeder) {
    next.rounds[roundIdx + 1][matchIdx].ospite = winner
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
  const [gender, setGenderState] = useState(loadGender)
  const [teams, setTeams] = useState(() => emptyTeamsFor(loadLevel(), loadGender()))
  const [matches, setMatches] = useState([])
  const [bracket, setBracket] = useState(EMPTY_BRACKET)
  const [gallery, setGallery] = useState({ list: [] })
  const [isAdmin, setIsAdmin] = useState(false)
  const [loading, setLoading] = useState(true)
  const gironi = buildGironi(teams, matches)

  // Applica classe female al body per theming rosa
  useEffect(() => {
    if (gender === 'F') document.body.classList.add('female')
    else document.body.classList.remove('female')
  }, [gender])

  // Firestore refs (collection dipende da level + gender)
  const col = collectionFor(level, gender)
  const teamsRef = doc(db, col, 'teams')
  const matchesRef = doc(db, col, 'matches')
  const bracketRef = doc(db, col, 'bracket')
  const galleryRef = doc(db, col, 'gallery')

  const syncTeams = makeSyncSetter(setTeams, teamsRef)
  const syncMatches = makeSyncSetter(setMatches, matchesRef, list => ({ list }))
  const syncBracket = makeSyncSetter(setBracket, bracketRef, bracketToFirestore)
  const syncGallery = makeSyncSetter(setGallery, galleryRef)

  function setLevel(newLevel) {
    if (!LEVELS.includes(newLevel) || newLevel === level) return
    localStorage.setItem('aretusa_level', newLevel)
    setLevelState(newLevel)
  }

  function setGender(newGender) {
    if (!GENDERS.includes(newGender) || newGender === gender) return
    localStorage.setItem('aretusa_gender', newGender)
    setGenderState(newGender)
  }

  const gironiList = getGironiList(level, gender)

  // Real-time Firestore listeners (re-subscribe when level or gender changes)
  useEffect(() => {
    setLoading(true)
    setTeams(emptyTeamsFor(level, gender))
    setMatches([])
    setBracket(EMPTY_BRACKET)
    setGallery({ list: [] })

    let loadCount = 0
    const done = () => { if (++loadCount >= 4) setLoading(false) }
    const onError = (e) => { console.error('Firestore error:', e); done() }

    const list = getGironiList(level, gender)
    const unsubs = [
      onSnapshot(teamsRef, snap => {
        if (snap.exists()) setTeams(normalizeTeams(snap.data(), list))
        else setTeams(emptyTeamsFor(level, gender))
        done()
      }, onError),
      onSnapshot(matchesRef, snap => {
        if (snap.exists()) setMatches(snap.data().list || [])
        done()
      }, onError),
      onSnapshot(bracketRef, snap => {
        if (snap.exists()) setBracket(bracketFromFirestore(snap.data()))
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
  }, [level, gender])

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
    const newBracket = generateBracket(gironi, level, gender)
    syncBracket(newBracket)
  }

  function handleBracketResult(roundIdx, matchIdx, result) {
    syncBracket(prev => advanceBracket(prev, roundIdx, matchIdx, result))
  }

  function handleBracketSwap(currentBracket, src, dst) {
    if (!currentBracket?.rounds) return
    const teamA = currentBracket.rounds?.[src.round]?.[src.match]?.[src.side]
    const teamB = currentBracket.rounds?.[dst.round]?.[dst.match]?.[dst.side]
    if (!teamA || !teamB) return
    const rounds = currentBracket.rounds.map((round, ri) => {
      if (!Array.isArray(round)) return round
      return round.map((match, mi) => {
        if (!match) return match
        if (ri === src.round && mi === src.match && ri === dst.round && mi === dst.match) {
          return { ...match, [src.side]: teamB, [dst.side]: teamA }
        }
        if (ri === src.round && mi === src.match) return { ...match, [src.side]: teamB }
        if (ri === dst.round && mi === dst.match) return { ...match, [dst.side]: teamA }
        return match
      })
    })
    syncBracket({ ...currentBracket, rounds })
  }

  if (loading) {
    const label = gender === 'F' ? 'Caricamento Femminile...' : `Caricamento Livello ${level}...`
    return <LoadingBall label={label} />
  }

  const commonProps = { level, setLevel, gender, setGender, isAdmin, bracketActive: bracket.active, gironiList }

  return (
    <Routes>
      <Route path="/" element={<Home matches={matches} teams={teams} {...commonProps} />} />
      <Route path="/gironi" element={<Gironi gironi={gironi} matches={matches} {...commonProps} />} />
      <Route path="/calendario" element={<Calendario matches={matches} setMatches={syncMatches} teams={teams} {...commonProps} />} />
      <Route path="/tabellone" element={
        <Tabellone
          bracket={bracket}
          gironi={gironi}
          onActivate={activateTabellone}
          onResult={handleBracketResult}
          onSwap={handleBracketSwap}
          {...commonProps}
        />
      } />
      <Route path="/regolamento" element={<Regolamento {...commonProps} />} />
      <Route path="/galleria" element={<Galleria gallery={gallery} setGallery={syncGallery} {...commonProps} />} />
      <Route path="/admin" element={<Admin teams={teams} setTeams={syncTeams} matches={matches} setMatches={syncMatches} bracket={bracket} setBracket={syncBracket} login={login} logout={logout} {...commonProps} />} />
    </Routes>
  )
}
