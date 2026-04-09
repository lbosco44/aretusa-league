import { Routes, Route } from 'react-router-dom'
import { useState, useEffect } from 'react'
import Home from './pages/Home'
import Gironi from './pages/Gironi'
import Calendario from './pages/Calendario'
import Tabellone from './pages/Tabellone'
import Admin from './pages/Admin'
import Regolamento from './pages/Regolamento'
import { initialMatches } from './data/matches'

const EMPTY_TEAMS = { A: [], B: [], C: [] }
const EMPTY_BRACKET = { active: false, rounds: [[], [], [], []] }
const INTEGRITY_SALT = 'aretusa_v1_9f3k'

function simpleHash(str) {
  let h = 0
  for (let i = 0; i < str.length; i++) {
    h = ((h << 5) - h + str.charCodeAt(i)) | 0
  }
  return (h >>> 0).toString(36)
}

function saveWithHash(key, data) {
  const json = JSON.stringify(data)
  localStorage.setItem(key, json)
  localStorage.setItem(key + '_h', simpleHash(INTEGRITY_SALT + json))
}

function loadWithHash(key, fallback) {
  try {
    const json = localStorage.getItem(key)
    if (!json) return fallback
    const hash = localStorage.getItem(key + '_h')
    if (hash && hash !== simpleHash(INTEGRITY_SALT + json)) {
      console.warn(`Integrity check failed for ${key}, resetting`)
      localStorage.removeItem(key)
      localStorage.removeItem(key + '_h')
      return fallback
    }
    return JSON.parse(json)
  } catch {
    return fallback
  }
}

function loadTeams() { return loadWithHash('aretusa_teams', EMPTY_TEAMS) }
function loadMatches() { return loadWithHash('aretusa_matches', initialMatches) }
function loadBracket() { return loadWithHash('aretusa_bracket', EMPTY_BRACKET) }

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
        promo: false,
      }
    }).sort((a, b) => b.pts - a.pts || (b.sp - b.sm) - (a.sp - a.sm))
      .map((r, i) => ({ ...r, pos: i + 1, promo: i < 2 }))
  }
  return gironi
}

// Generate bracket from gironi standings
// 12 teams → 4 byes (seeds 1-4) + 4 primo turno matches
// Seeding: 1v winner(8v9), 4v winner(5v12), 3v winner(6v11), 2v winner(7v10)
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
      // Round 0: Primo Turno
      [m(t(s[7],8), t(s[8],9)), m(t(s[4],5), t(s[11],12)), m(t(s[5],6), t(s[10],11)), m(t(s[6],7), t(s[9],10))],
      // Round 1: Quarti di Finale (seeds 1,4,3,2 have byes)
      [m(t(s[0],1), null), m(t(s[3],4), null), m(t(s[2],3), null), m(t(s[1],2), null)],
      // Round 2: Semifinali
      [m(null, null), m(null, null)],
      // Round 3: Finale
      [m(null, null)],
    ]
  }
}

// Advance winner to next round
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
  if (cW === oW) return bracket // tie not allowed, return unchanged
  const winner = cW > oW ? { ...match.casa } : { ...match.ospite }
  match.winner = cW > oW ? 'casa' : 'ospite'

  if (roundIdx === 0) {
    // PT[i] winner → QF[i].ospite
    next.rounds[1][matchIdx].ospite = winner
  } else if (roundIdx === 1) {
    // QF[0] winner → SF[0].casa, QF[1] → SF[0].ospite
    // QF[2] winner → SF[1].casa, QF[3] → SF[1].ospite
    const sfIdx = matchIdx < 2 ? 0 : 1
    const slot = matchIdx % 2 === 0 ? 'casa' : 'ospite'
    next.rounds[2][sfIdx][slot] = winner
  } else if (roundIdx === 2) {
    // SF[0] winner → F.casa, SF[1] → F.ospite
    next.rounds[3][0][matchIdx === 0 ? 'casa' : 'ospite'] = winner
  }

  return next
}

export default function App() {
  const [teams, setTeams] = useState(loadTeams)
  const [matches, setMatches] = useState(loadMatches)
  const [bracket, setBracket] = useState(loadBracket)
  const [isAdmin, setIsAdmin] = useState(false)
  const gironi = buildGironi(teams, matches)

  // Verify existing token on mount
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
    setBracket(newBracket)
  }

  function handleBracketResult(roundIdx, matchIdx, result) {
    setBracket(prev => advanceBracket(prev, roundIdx, matchIdx, result))
  }

  useEffect(() => { saveWithHash('aretusa_teams', teams) }, [teams])
  useEffect(() => { saveWithHash('aretusa_matches', matches) }, [matches])
  useEffect(() => { saveWithHash('aretusa_bracket', bracket) }, [bracket])

  // Multi-tab sync
  useEffect(() => {
    function onStorage(e) {
      if (e.key === 'aretusa_teams') setTeams(loadTeams())
      if (e.key === 'aretusa_matches') setMatches(loadMatches())
      if (e.key === 'aretusa_bracket') setBracket(loadBracket())
    }
    window.addEventListener('storage', onStorage)
    return () => window.removeEventListener('storage', onStorage)
  }, [])

  return (
    <Routes>
      <Route path="/" element={<Home matches={matches} teams={teams} isAdmin={isAdmin} bracketActive={bracket.active} />} />
      <Route path="/gironi" element={<Gironi gironi={gironi} isAdmin={isAdmin} bracketActive={bracket.active} />} />
      <Route path="/calendario" element={<Calendario matches={matches} setMatches={setMatches} teams={teams} isAdmin={isAdmin} bracketActive={bracket.active} />} />
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
      <Route path="/admin" element={<Admin teams={teams} setTeams={setTeams} matches={matches} setMatches={setMatches} isAdmin={isAdmin} login={login} logout={logout} bracketActive={bracket.active} />} />
    </Routes>
  )
}
