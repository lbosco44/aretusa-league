export default function MatchCard({ match, onInsertResult, onEdit, onDelete, isAdmin }) {
  const { casa, ospite, girone, ora, played, score, sets, tbTarget } = match
  const tbLabel = tbTarget ? `TB/${tbTarget}` : 'TB'

  return (
    <div className={`bg-[#152040] rounded-xl overflow-hidden shadow-lg border-l-4 ${played ? 'border-[#71ff74]' : 'border-[#3f4a3f]'}`}>
      <div className="p-4 sm:p-6">
        <div className="flex justify-between items-start mb-4">
          <div className="flex items-center gap-2 text-on-surface-variant text-xs uppercase tracking-widest font-bold">
            <span className="material-symbols-outlined text-sm">location_on</span>
            <span>{casa.club} &bull; {ora}</span>
            <span className="ml-1 text-[10px] text-on-surface-variant/50">Girone {girone}</span>
          </div>
          <div className="flex items-center gap-2">
            <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase ${played ? 'bg-[#27F24C] text-[#003909]' : 'bg-[#D3D0CB] text-[#152040]'}`}>
              {played ? 'Giocata' : 'Prossima'}
            </span>
            {isAdmin && (
              <>
                <button onClick={onEdit} className="w-8 h-8 rounded-lg bg-[#254E8F]/60 flex items-center justify-center hover:bg-[#254E8F] transition-colors" title="Modifica">
                  <span className="material-symbols-outlined text-on-surface-variant text-sm">edit</span>
                </button>
                <button onClick={onDelete} className="w-8 h-8 rounded-lg bg-red-500/10 flex items-center justify-center hover:bg-red-500/20 transition-colors" title="Elimina">
                  <span className="material-symbols-outlined text-red-400 text-sm">delete</span>
                </button>
              </>
            )}
          </div>
        </div>
        <div className="grid grid-cols-7 gap-4 items-center">
          <div className="col-span-3 flex items-center justify-end gap-3">
            <div className="text-right">
              <h4 className="font-headline font-bold text-base uppercase">{casa.name}</h4>
              <p className="text-on-surface-variant text-[10px]">{casa.club}</p>
            </div>
            <div className={`w-10 h-10 rounded-full bg-[#2d5aa0] flex items-center justify-center ${played ? 'border-2 border-[#71ff74]/30' : ''}`}>
              <span className={`font-headline font-bold text-xs ${played ? 'text-[#71ff74]' : 'text-on-surface-variant/70'}`}>{casa.abbr}</span>
            </div>
          </div>
          <div className="col-span-1 flex flex-col items-center justify-center">
            {played
              ? <div className="bg-[#1e3368] rounded-lg py-2 w-full flex justify-center"><span className="font-headline font-black text-xl text-[#71ff74]">{score}</span></div>
              : <span className="font-headline font-black text-xl text-[#3f4a3f] italic">VS</span>}
          </div>
          <div className="col-span-3 flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-[#2d5aa0] flex items-center justify-center">
              <span className={`font-headline font-bold text-xs ${played ? 'text-on-surface-variant' : 'text-on-surface-variant/70'}`}>{ospite.abbr}</span>
            </div>
            <div>
              <h4 className="font-headline font-bold text-base uppercase">{ospite.name}</h4>
              <p className="text-on-surface-variant text-[10px]">{ospite.club}</p>
            </div>
          </div>
        </div>
        {played && sets && (
          <div className="mt-4 pt-4 border-t border-white/5 flex flex-wrap justify-center gap-3">
            {sets.map((s, i) => (
              <div key={i} className="flex gap-2 items-center bg-[#2d5aa0]/50 px-4 py-2 rounded-lg">
                <span className="text-[#77db90] text-xs font-bold uppercase">{i < 2 ? `Set ${i + 1}` : tbLabel}</span>
                <span className="text-on-surface font-bold text-sm">{s}</span>
              </div>
            ))}
          </div>
        )}
        {!played && isAdmin && (
          <div className="mt-4 pt-3 border-t border-white/5 flex justify-center">
            <button onClick={onInsertResult} className="px-6 py-2.5 bg-secondary/10 hover:bg-secondary/20 border border-secondary/30 text-secondary font-headline font-bold text-xs uppercase tracking-widest rounded-xl transition-all flex items-center justify-center gap-2 active:scale-[0.98]">
              <span className="material-symbols-outlined text-sm" style={{ fontVariationSettings: "'FILL' 1" }}>edit_note</span>
              Inserisci Risultato
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
