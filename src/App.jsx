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

  // 24-team bracket for Livello B (5 rounds: R1, R16, QF, SF, F)
  if (level === 'B') {
    if (allTeams.length < 24) return EMPTY_BRACKET
    const s = allTeams
    // R1: pair seeds 9-24 as 9v24, 10v23, ..., 16v17 (highest non-bye vs lowest, down to middle)
    // Index mapping: R1[i] pairs s[8+i] with s[23-i] for i=0..7
    //   R1[0]: s[8] (9) vs s[23] (24)
    //   R1[1]: s[9] (10) vs s[22] (23)
    //   ...
    //   R1[7]: s[15] (16) vs s[16] (17)
    const r1 = Array.from({ length: 8 }, (_, i) =>
      m(t(s[8 + i], 9 + i), t(s[23 - i], 24 - i))
    )
    // R16: 8 matches, top seeds placed to avoid early meetings
    //   Feeder mapping: each R16 slot's "casa" is a bye seed, "ospite" comes from an R1 winner
    //   Top half bracket (R16 0-3): seeds 1, 8, 5, 4 — will meet in QF in that order
    //   Bottom half (R16 4-7): seeds 3, 6, 7, 2
    // R1 winner → R16[i].ospite mapping:
    //   R16[0] (S1) ← R1[0] (9v24 winner)
    //   R16[1] (S8) ← R1[7] (16v17 winner)
    //   R16[2] (S5) ← R1[3] (12v21 winner)
    //   R16[3] (S4) ← R1[4] (13v20 winner)
    //   R16[4] (S3) ← R1[5] (14v19 winner)
    //   R16[5] (S6) ← R1[2] (11v22 winner)
    //   R16[6] (S7) ← R1[1] (10v23 winner)
    //   R16[7] (S2) ← R1[6] (15v18 winner)
    const r16 = [
      m(t(s[0], 1), null),
      m(t(s[7], 8), null),
      m(t(s[4], 5), null),
      m(t(s[3], 4), null),
      m(t(s[2], 3), null),
      m(t(s[5], 6), null),
      m(t(s[6], 7), null),
      m(t(s[1], 2), null),
    ]
    return {
      active: true,
      size: 24,
      rounds: [
        r1,
        r16,
        [m(null, null), m(null, null), m(null, null), m(null, null)], // QF: 4 matches
        [m(null, null), m(null, null)], // SF: 2 matches
        [m(null, null)], // F: 1 match
      ],
    }
  }

  // 12-team bracket (default, 4 rounds: PT, QF, SF, F)
  if (allTeams.length < 12) return EMPTY_BRACKET
  const s = allTeams
  return {
    active: true,
    size: 12,
    rounds: [
      [m(t(s[7],8), t(s[8],9)), m(t(s[4],5), t(s[11],12)), m(t(s[5],6), t(s[10],11)), m(t(s[6],7), t(s[9],10))],
      [m(t(s[0],1), null), m(t(s[3],4), null), m(t(s[2],3), null), m(t(s[1],2), null)],
      [m(null, null), m(null, null)],
      [m(null, null)],
    ]
  }
}

// R1[i] winner → R16[j].ospite mapping for 24-team bracket
const R1_TO_R16_MAP = [0, 6, 5, 2, 3, 4, 7, 1]

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

  // For 24-team bracket, R1 → R16 uses custom mapping
  if (bracket.size === 24 && roundIdx === 0) {
    const targetIdx = R1_TO_R16_MAP[matchIdx]
    next.rounds[1][targetIdx].ospite = winner
    return next
  }

  // For 12-team bracket, PT → QF is 1:1 to .ospite
  if (bracket.size !== 24 && roundIdx === 0) {
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
