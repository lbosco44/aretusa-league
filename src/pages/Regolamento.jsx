import TopAppBar from '../components/TopAppBar'
import BottomNav from '../components/BottomNav'

const sections = [
  {
    icon: 'confirmation_number',
    title: 'Iscrizione',
    items: [
      'Quota d\'iscrizione: €35 a persona, da versare esclusivamente all\'organizzatore entro e non oltre la seconda gara di campionato.',
      'In regalo per ogni iscritto una maglia tecnica da Padel marca Joma o Siux.',
      'Al Club si pagherà separatamente il costo regolare della partita.',
    ],
  },
  {
    icon: 'emoji_events',
    title: 'Premiazioni',
    subtitle: 'Tabellone A',
    items: [
      '1\u00B0 classificati: racchette da Padel e trofei.',
      '2\u00B0 classificati: abbigliamento da Padel e accessori.',
      '3\u00B0 classificati: materiale da Padel o accessori.',
      '4\u00B0, 5\u00B0, 6\u00B0 classificati: accessori da Padel.',
      'Premio di partecipazione: maglia tecnica Joma o Siux in omaggio a ogni giocatore.',
    ],
  },
  {
    icon: 'groups',
    title: 'Formato Gironi',
    items: [
      'Ogni coppia verrà inserita in un girone composto da 4 coppie di pari livello (fascia A \u2013 livello alto).',
      '4 partite garantite per ogni coppia, secondo un calendario prestabilito.',
      'Le gare casalinghe si disputeranno nel circolo dove è stata effettuata l\'iscrizione; le trasferte presso i circoli di appartenenza delle coppie avversarie.',
    ],
  },
  {
    icon: 'calendar_month',
    title: 'Calendario e Prenotazioni',
    items: [
      'Le gare di girone si disputeranno a partire dal mese di aprile.',
      'L\'organizzatore, in accordo con i giocatori, provvederà a prenotare e confermare le gare, con frequenza di almeno una volta a settimana.',
      'Non è possibile prenotare i campi o le gare in autonomia senza il consenso dell\'organizzatore.',
      'Le gare si potranno giocare in qualsiasi giorno della settimana e a qualsiasi orario, in base agli impegni personali e alla disponibilità del circolo.',
    ],
  },
  {
    icon: 'swap_horiz',
    title: 'Spostamenti',
    items: [
      'Ogni coppia potrà spostare una gara una sola volta durante l\'intero campionato.',
      'Dopo tale possibilità, le coppie che non riusciranno a giocare perderanno la partita con \u22123 punti in classifica.',
    ],
  },
  {
    icon: 'sports_tennis',
    title: 'Formato Partita',
    items: [
      'La gara si disputa su 3 set regolari, con 1 ora e mezza di tempo a disposizione.',
      'In caso di parità (1-1), il terzo set si gioca al tie-break a 10 o a 7 punti, in base al tempo rimanente.',
      'Nel game, sul 40 pari, dopo il primo vantaggio si applica il killer point.',
      'Tutti e 3 i set devono essere disputati.',
      'Se la partita non termina nel tempo regolamentare, il punto del set non ultimato viene assegnato alla coppia in vantaggio nel punteggio parziale.',
    ],
  },
  {
    icon: 'leaderboard',
    title: 'Punteggio e Classifica',
    items: [
      'Ogni set vinto vale 1 punto in classifica.',
      'Esempio: 3-0 \u2192 chi vince ottiene 3 punti, chi perde 0. Risultato 2-1 \u2192 chi vince ottiene 2 punti, chi perde 1.',
      'A fine gironi, le coppie a pari punti verranno classificate in base allo scontro diretto.',
    ],
    highlight: 'Si consiglia di giocare ogni gara cercando di fare il maggior numero di punti possibile: la classifica finale del girone determinerà il posizionamento per il prosieguo del torneo.',
  },
  {
    icon: 'account_tree',
    title: 'Fasi Finali',
    items: [
      'A fine gironi, tutte le coppie accedono alle fasi finali in base al piazzamento in classifica.',
      'Le gare del tabellone A sono a eliminazione diretta.',
      'Le gare del tabellone si disputano in campo neutro, scelto esclusivamente dall\'organizzatore.',
      'Due coppie dello stesso circolo giocheranno nel medesimo club.',
      'Semifinali e finali si disputano in sede scelta dall\'organizzatore.',
    ],
  },
]

export default function Regolamento({ isAdmin, bracketActive, level, setLevel, gender, setGender }) {
  return (
    <div className="min-h-screen text-on-surface">
      <TopAppBar level={level} setLevel={setLevel} gender={gender} setGender={setGender} />

      <main className="pt-24 pb-32 px-4 max-w-3xl mx-auto space-y-6">
        {/* Header */}
        <section>
          <div className="relative h-48 w-full rounded-xl overflow-hidden shadow-2xl">
            <div className="absolute inset-0 bg-gradient-to-br from-[rgb(var(--primary-container))] to-[#071530]" />
            <div className="absolute inset-0 opacity-5" style={{ background: 'repeating-linear-gradient(45deg,rgb(var(--primary)) 0,rgb(var(--primary)) 1px,transparent 1px,transparent 40px)' }} />
            <div className="absolute inset-0 bg-gradient-to-t from-[#0E2044] to-transparent" />
            <div className="absolute bottom-6 left-6">
              <h2 className="font-headline text-4xl font-black italic uppercase tracking-tighter text-white">REGOLAMENTO</h2>
              <p className="text-secondary font-bold tracking-widest text-xs uppercase mt-1">Partecipazione &bull; Gara &bull; Premiazioni</p>
            </div>
          </div>
        </section>

        {/* Rule sections */}
        {sections.map((s, idx) => (
          <section key={idx} className="bg-[#152040] rounded-2xl border border-white/5 overflow-hidden">
            <div className="flex items-center gap-3 px-5 py-4 border-b border-white/5">
              <div className="w-10 h-10 rounded-xl bg-secondary/10 border border-secondary/30 flex items-center justify-center shrink-0">
                <span className="material-symbols-outlined text-secondary text-lg" style={{ fontVariationSettings: "'FILL' 1" }}>{s.icon}</span>
              </div>
              <div>
                <h3 className="font-headline font-black text-sm uppercase text-white tracking-wide">{s.title}</h3>
                {s.subtitle && <p className="text-[10px] text-on-surface-variant font-medium">{s.subtitle}</p>}
              </div>
            </div>
            <div className="px-5 py-4 space-y-3">
              {s.items.map((item, i) => (
                <div key={i} className="flex gap-3 items-start">
                  <span className="w-1.5 h-1.5 rounded-full bg-secondary/60 mt-2 shrink-0" />
                  <p className="text-on-surface/80 text-sm leading-relaxed">{item}</p>
                </div>
              ))}
              {s.highlight && (
                <div className="mt-3 px-4 py-3 bg-secondary/5 border border-secondary/15 rounded-xl">
                  <div className="flex gap-2 items-start">
                    <span className="material-symbols-outlined text-secondary text-sm mt-0.5 shrink-0">info</span>
                    <p className="text-secondary/90 text-xs font-semibold leading-relaxed">{s.highlight}</p>
                  </div>
                </div>
              )}
            </div>
          </section>
        ))}

        {/* Organizer */}
        <div className="bg-[#152040] rounded-2xl border border-white/5 p-5 flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-[#254E8F] flex items-center justify-center shrink-0">
            <span className="material-symbols-outlined text-on-surface-variant">person</span>
          </div>
          <div>
            <p className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant">Organizzazione</p>
            <p className="font-headline font-bold text-white">Giancarlo Amato</p>
          </div>
        </div>
      </main>

      <BottomNav isAdmin={isAdmin} bracketActive={bracketActive} />
    </div>
  )
}
