import { Routes, Route } from 'react-router-dom'
import { useState } from 'react'
import Home from './pages/Home'
import Gironi from './pages/Gironi'
import Calendario from './pages/Calendario'
import Tabellone from './pages/Tabellone'
import { initialMatches } from './data/matches'

export default function App() {
  const [matches, setMatches] = useState(initialMatches)

  return (
    <Routes>
      <Route path="/"           element={<Home matches={matches} />} />
      <Route path="/gironi"     element={<Gironi />} />
      <Route path="/calendario" element={<Calendario matches={matches} setMatches={setMatches} />} />
      <Route path="/tabellone"  element={<Tabellone />} />
    </Routes>
  )
}
