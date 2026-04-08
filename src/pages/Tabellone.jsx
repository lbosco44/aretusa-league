import { Link } from 'react-router-dom'
import TopAppBar from '../components/TopAppBar'
import BottomNav from '../components/BottomNav'

export default function Tabellone() {
  return (
    <div className="min-h-screen flex flex-col text-on-surface">
      <TopAppBar actions={<span className="material-symbols-outlined text-on-surface-variant">account_circle</span>} />

      <main className="flex-grow flex flex-col items-center justify-center relative px-6 py-20">
        <img src="/court-sunset.png" alt="Campo da padel" className="absolute inset-0 w-full h-full object-cover opacity-30" />
        <div className="absolute inset-0 bg-gradient-to-t from-[#071530] via-[#0E2044]/70 to-[#0E2044]/40" />

        {/* Ghost bracket */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-20 overflow-hidden">
          <div className="w-full h-full max-w-5xl grid grid-cols-3 gap-8 p-12">
            <div className="flex flex-col justify-around">
              {[0,1,2,3].map(i => <div key={i} className="h-16 w-full border-2 border-[rgba(119,219,144,0.08)] rounded-xl" />)}
            </div>
            <div className="flex flex-col justify-around py-20">
              {[0,1].map(i => <div key={i} className="h-20 w-full border-2 border-[rgba(119,219,144,0.08)] rounded-xl" />)}
            </div>
            <div className="flex flex-col justify-center">
              <div className="h-24 w-full border-4 border-dashed border-[rgba(119,219,144,0.08)] rounded-2xl flex items-center justify-center">
                <span className="material-symbols-outlined text-4xl text-[rgba(119,219,144,0.1)]">emoji_events</span>
              </div>
            </div>
          </div>
        </div>

        <div className="relative z-10 flex flex-col items-center text-center max-w-lg">
          <div className="mb-10 p-8 rounded-full bg-[#0E2044]/40 backdrop-blur-md shadow-inner border border-white/5">
            <span className="material-symbols-outlined text-8xl text-[#77db90]" style={{ fontVariationSettings: "'FILL' 1" }}>emoji_events</span>
          </div>
          <h2 className="font-headline text-3xl md:text-5xl font-black text-[#dfe3e7] mb-6 tracking-tight leading-none">
            TABELLONE <span className="text-[#77db90]">FINALE</span>
          </h2>
          <div className="h-1 w-24 bg-gradient-to-r from-transparent via-[#77db90] to-transparent mb-8" />
          <p className="font-body text-on-surface/70 text-lg leading-relaxed px-4">
            Il tabellone sarà disponibile al termine della fase a gironi
          </p>
          <div className="mt-12 flex flex-col sm:flex-row gap-4 items-center">
            <button className="bg-gradient-to-br from-primary to-primary-container text-on-primary px-8 py-3 rounded-lg font-bold uppercase tracking-widest text-xs flex items-center gap-2 shadow-lg shadow-primary/20 hover:scale-105 transition-transform active:scale-95">
              <span className="material-symbols-outlined text-sm">notifications</span>
              Avvisami quando pronto
            </button>
            <Link to="/gironi" className="text-on-surface-variant hover:text-primary transition-colors text-xs font-bold uppercase tracking-widest flex items-center gap-1">
              <span className="material-symbols-outlined text-sm">groups</span>
              Vedi Gironi
            </Link>
          </div>
        </div>
      </main>

      <BottomNav />
    </div>
  )
}
