export default function GroupTable({ rows }) {
  return (
    <div className="bg-[#152040] rounded-2xl overflow-hidden shadow-xl">
      <div className="overflow-x-auto">
        <table className="w-full text-left border-separate border-spacing-y-2 px-4 py-4">
          <thead>
            <tr className="text-[10px] uppercase tracking-widest text-on-surface-variant font-bold">
              <th className="px-4 py-2">#</th>
              <th className="px-4 py-2">Coppia</th>
              <th className="px-4 py-2 text-center">PG</th>
              <th className="px-4 py-2 text-center">V</th>
              <th className="px-4 py-2 text-center">P</th>
              <th className="px-4 py-2 text-center">S+</th>
              <th className="px-4 py-2 text-center">S-</th>
              <th className="px-4 py-2 text-center text-secondary">Pts</th>
            </tr>
          </thead>
          <tbody className="text-sm font-medium">
            {rows.map((r) => {
              const isFirst = r.pos === 1
              return (
                <tr key={r.pos} className={isFirst ? 'bg-[#1e3368] hover:bg-[#254E8F] transition-colors border-l-4 border-[#71ff74] shadow-lg' : 'bg-[#071530]/40 hover:bg-[#1e3368] transition-colors'}>
                  <td className={`px-4 py-4 font-headline font-bold italic text-lg ${isFirst ? 'text-secondary' : 'text-on-surface-variant'}`}>{r.pos}</td>
                  <td className="px-4 py-4">
                    <div className="flex items-center gap-3">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center ${isFirst ? 'bg-secondary/10 border border-secondary/30' : 'bg-[#2d5aa0]'}`}>
                        <span className={`material-symbols-outlined text-sm ${isFirst ? 'text-secondary' : 'text-on-surface-variant'}`} style={isFirst ? { fontVariationSettings: "'FILL' 1" } : undefined}>groups</span>
                      </div>
                      <div>
                        <span className={`font-headline font-bold tracking-tight ${isFirst ? 'text-white' : 'text-on-surface/80'}`}>{r.name}</span>
                        <p className="text-[10px] text-on-surface-variant/70 font-medium mt-0.5">{r.club}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-4 text-center text-on-surface-variant">{r.pg}</td>
                  <td className="px-4 py-4 text-center text-on-surface-variant">{r.v}</td>
                  <td className="px-4 py-4 text-center text-on-surface-variant">{r.p}</td>
                  <td className="px-4 py-4 text-center text-on-surface-variant">{r.sp}</td>
                  <td className="px-4 py-4 text-center text-on-surface-variant">{r.sm}</td>
                  <td className={`px-4 py-4 text-center font-headline font-black text-lg ${isFirst ? 'text-secondary' : 'text-on-surface'}`}>{r.pts}</td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  )
}
