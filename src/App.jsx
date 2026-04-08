import { Routes, Route } from 'react-router-dom'
import { useState, Component } from 'react'
import Home from './pages/Home'
import Gironi from './pages/Gironi'
import Calendario from './pages/Calendario'
import Tabellone from './pages/Tabellone'
import { initialMatches } from './data/matches'

class ErrorBoundary extends Component {
  constructor(props) {
    super(props)
    this.state = { error: null }
  }
  static getDerivedStateFromError(error) {
    return { error }
  }
  render() {
    if (this.state.error) {
      return (
        <div style={{ color: '#dfe3e7', padding: '2rem', fontFamily: 'monospace' }}>
          <h2>Errore di rendering</h2>
          <pre style={{ fontSize: '12px', opacity: 0.7 }}>{String(this.state.error)}</pre>
        </div>
      )
    }
    return this.props.children
  }
}

export default function App() {
  const [matches, setMatches] = useState(initialMatches)

  return (
    <ErrorBoundary>
      <Routes>
        <Route path="/"           element={<Home matches={matches} />} />
        <Route path="/gironi"     element={<Gironi />} />
        <Route path="/calendario" element={<Calendario matches={matches} setMatches={setMatches} />} />
        <Route path="/tabellone"  element={<Tabellone />} />
      </Routes>
    </ErrorBoundary>
  )
}
