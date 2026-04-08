let _id = 0
const mk = (obj) => ({ id: ++_id, ...obj })

export const initialMatches = [
  mk({ date:'2025-05-17', ora:'18:30', girone:'A', casa:{name:'Calvo / Bosco',abbr:'CB',club:'TC Aretusa'}, ospite:{name:'Rossi / Bianchi',abbr:'RB',club:'Padel Club Siracusa'}, score:'2-1', sets:['6-4','3-6','10-8'], tbTarget:10, played:true }),
  mk({ date:'2025-05-17', ora:'20:00', girone:'A', casa:{name:'Ferrari / Martini',abbr:'FM',club:'ASD Ortigia Padel'}, ospite:{name:'Gallo / Esposito',abbr:'GE',club:'TC Belvedere'}, score:'3-0', sets:['6-3','6-2','7-4'], tbTarget:7, played:true }),
  mk({ date:'2025-05-19', ora:'19:00', girone:'B', casa:{name:'Moretti / De Luca',abbr:'MD',club:'Padel Club Siracusa'}, ospite:{name:'Vitale / Serra',abbr:'VS',club:'TC Belvedere'}, score:'3-0', sets:['6-2','6-4','7-3'], tbTarget:7, played:true }),
  mk({ date:'2025-05-19', ora:'21:00', girone:'A', casa:{name:'Calvo / Bosco',abbr:'CB',club:'TC Aretusa'}, ospite:{name:'Ferrari / Martini',abbr:'FM',club:'ASD Ortigia Padel'}, score:'3-0', sets:['6-1','6-3','7-2'], tbTarget:7, played:true }),
  mk({ date:'2025-05-20', ora:'20:00', girone:'A', casa:{name:'Ferrari / Martini',abbr:'FM',club:'ASD Ortigia Padel'}, ospite:{name:'Gallo / Esposito',abbr:'GE',club:'TC Belvedere'}, played:false }),
  mk({ date:'2025-05-20', ora:'21:30', girone:'B', casa:{name:'Colombo / Farina',abbr:'CF',club:'TC Aretusa'}, ospite:{name:'Bruno / Greco',abbr:'BG',club:'ASD Ortigia Padel'}, played:false }),
  mk({ date:'2025-05-22', ora:'19:30', girone:'C', casa:{name:'Russo / Conti',abbr:'RC',club:'TC Aretusa'}, ospite:{name:'Lombardi / De Santis',abbr:'LD',club:'TC Belvedere'}, played:false }),
  mk({ date:'2025-05-22', ora:'21:00', girone:'C', casa:{name:'Mancini / Ricci',abbr:'MR',club:'Padel Club Siracusa'}, ospite:{name:'Pellegrino / Caruso',abbr:'PC',club:'ASD Ortigia Padel'}, played:false }),
]

export let nextId = _id + 1
