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

export default function App() {
  const [teams, setTeams] = useState(loadTeams)
  const [matches, setMatches] = useState(loadMatches)
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

  useEffect(() => {
    localStorage.setItem('aretusa_teams', JSON.stringify(teams))
  }, [teams])

  useEffect(() => {
    localStorage.setItem('aretusa_matches', JSON.stringify(matches))
  }, [matches])

  return (
    <Routes>
      <Route path="/" element={<Home matches={matches} teams={teams} isAdmin={isAdmin} />} />
      <Route path="/gironi" element={<Gironi gironi={gironi} isAdmin={isAdmin} />} />
      <Route path="/calendario" element={<Calendario matches={matches} setMatches={setMatches} teams={teams} isAdmin={isAdmin} />} />
      <Route path="/tabellone" element={<Tabellone isAdmin={isAdmin} />} />
      <Route path="/regolamento" element={<Regolamento isAdmin={isAdmin} />} />
      <Route path="/admin" element={<Admin teams={teams} setTeams={setTeams} matches={matches} setMatches={setMatches} isAdmin={isAdmin} login={login} logout={logout} />} />
    </Routes>
  )
}
