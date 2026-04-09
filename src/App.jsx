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

function loadTeams() {
  try {
    const stored = localStorage.getItem('aretusa_teams')
    if (stored) return JSON.parse(stored)
  } catch { /* ignore */ }
  return EMPTY_TEAMS
}

function loadMatches() {
  try {
    const stored = localStorage.getItem('aretusa_matches')
    if (stored) return JSON.parse(stored)
  } catch { /* ignore */ }
  return initialMatches
}

function loadBracket() {
  try {
    const stored = localStorage.getItem('aretusa_bracket')
    if (stored) return JSON.parse(stored)
  } catch { /* ignore */ }
  return EMPTY_BRACKET
}

function buildGironi(teams, matches) {
  const gironi = {}
  for (const [girone, list] of Object.entries(teams)) {
    gironi[girone] = list.map((team, i) => {
      const stats = { pg: 0, v: 0, p: 0, sp: 0, sm: 0 }
      matches.filter(m => m.girone === girone && m.played).forEach(m => {
        const isCasa = m.casa.abbr === team.abbr
        const isOspite = m.ospite.abbr === team.abbr
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
  allTeams.sort((a, b) => b.pts - a.pts || (b.sp - b.sm) - (a.sp - a.sm))

  const s = allTeams // s[0] = seed 1, s[11] = seed 12
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
  const match = next.rounds[roundIdx][matchIdx]
  match.score = result.score
  match.sets = result.sets
  match.played = true

  const [cW, oW] = result.score.split('-').map(Number)
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
  const [isAdmin, setIsAdmin] = useState(() => sessionStorage.getItem('aretusa_admin') === '1')
  const gironi = buildGironi(teams, matches)

  function login(pwd) {
    if (pwd === 'Padelsiracusa567') {
      sessionStorage.setItem('aretusa_admin', '1')
      setIsAdmin(true)
      return true
    }
    return false
  }

  function logout() {
    sessionStorage.removeItem('aretusa_admin')
    setIsAdmin(false)
  }

  function activateTabellone() {
    const newBracket = generateBracket(gironi)
    setBracket(newBracket)
  }

  function handleBracketResult(roundIdx, matchIdx, result) {
    setBracket(prev => advanceBracket(prev, roundIdx, matchIdx, result))
  }

  useEffect(() => {
    localStorage.setItem('aretusa_teams', JSON.stringify(teams))
  }, [teams])

  useEffect(() => {
    localStorage.setItem('aretusa_matches', JSON.stringify(matches))
  }, [matches])

  useEffect(() => {
    localStorage.setItem('aretusa_bracket', JSON.stringify(bracket))
  }, [bracket])

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
