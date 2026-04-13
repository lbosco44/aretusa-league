import { Routes, Route } from 'react-router-dom'
import { useState, useEffect, useRef } from 'react'
import { doc, setDoc, getDoc, onSnapshot } from 'firebase/firestore'
import { db } from './firebase'
import Home from './pages/Home'
import Gironi from './pages/Gironi'
import Calendario from './pages/Calendario'
import Tabellone from './pages/Tabellone'
import Admin from './pages/Admin'
import Regolamento from './pages/Regolamento'

const EMPTY_TEAMS = { A: [], B: [], C: [] }
const EMPTY_BRACKET = { active: false, rounds: [[], [], [], []] }

// Firestore document refs
const teamsRef = doc(db, 'tournament', 'teams')
const matchesRef = doc(db, 'tournament', 'matches')
const bracketRef = doc(db, 'tournament', 'bracket')

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
        pts: stats.v * 3,
      }
    }).sort((a, b) => b.pts - a.pts || (b.sp - b.sm) - (a.sp - a.sm))
      .map((r, i) => ({ ...r, pos: i + 1 }))
  }
  return gironi
}

function generateBracket(gironi) {
  const allTeams = []
  for (const [g, list] of Object.entries(gironi)) {
    list.forEach(t => allTeams.push({ name: t.name, abbr: t.abbr, club: t.club, girone: g, pos: t.pos, pts: t.pts, sp: t.sp, sm: t.sm }))
  }
  if (allTeams.length < 12) return EMPTY_BRACKET
  allTeams.sort((a, b) => b.pts - a.pts || (b.sp - b.sm) - (a.sp - a.sm))

  const s = allTeams
  const t = (team, seed) => team ? { name: team.name, abbr: team.abbr, club: team.club, seed, seedLabel: `${team.pos}°${team.girone}` } : null
  const m = (casa, ospite) => ({ casa, ospite, score: null, sets: null, played: false, winner: null })

  return {
    active: true,
    rounds: [
      [m(t(s[7],8), t(s[8],9)), m(t(s[4],5), t(s[11],12)), m(t(s[5],6), t(s[10],11)), m(t(s[6],7), t(s[9],10))],
      [m(t(s[0],1), null), m(t(s[3],4), null), m(t(s[2],3), null), m(t(s[1],2), null)],
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

  if (roundIdx === 0) {
    next.rounds[1][matchIdx].ospite = winner
  } else if (roundIdx === 1) {
    const sfIdx = matchIdx < 2 ? 0 : 1
    const slot = matchIdx % 2 === 0 ? 'casa' : 'ospite'
    next.rounds[2][sfIdx][slot] = winner
  } else if (roundIdx === 2) {
    next.rounds[3][0][matchIdx === 0 ? 'casa' : 'ospite'] = winner
  }

  return next
}

// Creates a setter that syncs to Firestore
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
  const [teams, setTeams] = useState(EMPTY_TEAMS)
  const [matches, setMatches] = useState([])
  const [bracket, setBracket] = useState(EMPTY_BRACKET)
  const [isAdmin, setIsAdmin] = useState(false)
  const [loading, setLoading] = useState(true)
  const gironi = buildGironi(teams, matches)

  // Sync setters: update state + write to Firestore
  const syncTeams = makeSyncSetter(setTeams, teamsRef)
  const syncMatches = makeSyncSetter(setMatches, matchesRef, list => ({ list }))
  const syncBracket = makeSyncSetter(setBracket, bracketRef)

  // Real-time Firestore listeners
  useEffect(() => {
    let loadCount = 0
    const done = () => { if (++loadCount >= 3) setLoading(false) }

    const unsubs = [
      onSnapshot(teamsRef, snap => {
        if (snap.exists()) setTeams(snap.data())
        done()
      }),
      onSnapshot(matchesRef, snap => {
        if (snap.exists()) setMatches(snap.data().list || [])
        done()
      }),
      onSnapshot(bracketRef, snap => {
        if (snap.exists()) setBracket(snap.data())
        done()
      }),
    ]
    return () => unsubs.forEach(u => u())
  }, [])

  // One-time migration: localStorage → Firestore
  useEffect(() => {
    async function migrate() {
      try {
        const snap = await getDoc(teamsRef)
        if (snap.exists()) return // Firestore already has data

        const t = localStorage.getItem('aretusa_teams')
        const m = localStorage.getItem('aretusa_matches')
        const b = localStorage.getItem('aretusa_bracket')

        if (t) await setDoc(teamsRef, JSON.parse(t))
        if (m) await setDoc(matchesRef, { list: JSON.parse(m) })
        if (b) await setDoc(bracketRef, JSON.parse(b))
      } catch (e) { console.error('Migration failed:', e) }
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
    const newBracket = generateBracket(gironi)
    syncBracket(newBracket)
  }

  function handleBracketResult(roundIdx, matchIdx, result) {
    syncBracket(prev => advanceBracket(prev, roundIdx, matchIdx, result))
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0E2044] flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-[#71ff74]/30 border-t-[#71ff74] rounded-full animate-spin" />
          <p className="text-on-surface-variant text-sm font-medium">Caricamento...</p>
        </div>
      </div>
    )
  }

  return (
    <Routes>
      <Route path="/" element={<Home matches={matches} teams={teams} isAdmin={isAdmin} bracketActive={bracket.active} />} />
      <Route path="/gironi" element={<Gironi gironi={gironi} isAdmin={isAdmin} bracketActive={bracket.active} />} />
      <Route path="/calendario" element={<Calendario matches={matches} setMatches={syncMatches} teams={teams} isAdmin={isAdmin} bracketActive={bracket.active} />} />
      <Route path="/tabellone" element={
        <Tabellone
          isAdmin={isAdmin}
          bracket={bracket}
          gironi={gironi}
          onActivate={activateTabellone}
          onResult={handleBracketResult}
        />
      } />
      <Route path="/regolamento" element={<Regolamento isAdmin={isAdmin} bracketActive={bracket.active} />} />
      <Route path="/admin" element={<Admin teams={teams} setTeams={syncTeams} matches={matches} setMatches={syncMatches} bracket={bracket} setBracket={syncBracket} isAdmin={isAdmin} login={login} logout={logout} bracketActive={bracket.active} />} />
    </Routes>
  )
}
