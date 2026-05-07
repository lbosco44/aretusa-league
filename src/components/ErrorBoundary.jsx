import React from 'react'

export default class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props)
    this.state = { error: null }
  }
  static getDerivedStateFromError(error) {
    return { error }
  }
  componentDidCatch(error, info) {
    console.error('App error:', error, info)
  }
  render() {
    if (this.state.error) {
      return (
        <div className="min-h-screen bg-[#0E2044] text-white p-6 flex flex-col items-center justify-center text-center">
          <h2 className="font-headline text-2xl font-black uppercase mb-4">Si è verificato un errore</h2>
          <pre className="text-xs bg-black/40 rounded p-4 max-w-full overflow-auto whitespace-pre-wrap">{String(this.state.error?.message || this.state.error)}</pre>
          <button onClick={() => { this.setState({ error: null }); location.reload() }} className="mt-6 px-4 py-2 bg-secondary text-on-secondary rounded-xl font-bold uppercase text-xs">
            Ricarica
          </button>
        </div>
      )
    }
    return this.props.children
  }
}
