import { useState } from 'react'
import TopAppBar from '../components/TopAppBar'
import BottomNav from '../components/BottomNav'
import UploadPhotoModal from '../components/UploadPhotoModal'

function cloudinaryUrl(url, transform) {
  if (!url || !url.includes('/upload/')) return url
  return url.replace('/upload/', `/upload/${transform}/`)
}

function fmtDate(ts) {
  if (!ts) return ''
  const d = new Date(ts)
  const day = String(d.getDate()).padStart(2, '0')
  const month = String(d.getMonth() + 1).padStart(2, '0')
  return `${day}/${month}/${d.getFullYear()}`
}

export default function Galleria({ gallery, setGallery, isAdmin, bracketActive, level, setLevel }) {
  const [showUpload, setShowUpload] = useState(false)
  const [lightboxIdx, setLightboxIdx] = useState(null)
  const [deleteConfirm, setDeleteConfirm] = useState(null)

  const photos = gallery?.list || []
  const sortedPhotos = [...photos].sort((a, b) => (b.uploadedAt || 0) - (a.uploadedAt || 0))

  function handleUploaded(photo) {
    setGallery(prev => ({ list: [...(prev?.list || []), photo] }))
    setShowUpload(false)
  }

  function handleDelete(id) {
    setGallery(prev => ({ list: (prev?.list || []).filter(p => p.id !== id) }))
    setDeleteConfirm(null)
    setLightboxIdx(null)
  }

  const lightboxPhoto = lightboxIdx != null ? sortedPhotos[lightboxIdx] : null

  return (
    <div className="min-h-screen text-on-surface">
      <TopAppBar level={level} setLevel={setLevel} />

      <main className="pt-24 pb-32 px-4 max-w-5xl mx-auto space-y-6">
        {/* Header */}
        <section>
          <div className="relative h-44 w-full rounded-xl overflow-hidden shadow-2xl">
            <div className="absolute inset-0 bg-gradient-to-br from-[rgb(var(--on-primary))] to-[#071530]" />
            <div className="absolute inset-0 opacity-5" style={{ background: 'repeating-linear-gradient(45deg,rgb(var(--primary)) 0,rgb(var(--primary)) 1px,transparent 1px,transparent 40px)' }} />
            <div className="absolute inset-0 bg-gradient-to-t from-[#0E2044] to-transparent" />
            <div className="absolute bottom-6 left-6">
              <h2 className="font-headline text-4xl font-black italic uppercase tracking-tighter text-white">GALLERIA</h2>
              <p className="text-secondary font-bold tracking-widest text-xs uppercase mt-1">
                {sortedPhotos.length} {sortedPhotos.length === 1 ? 'Foto' : 'Foto'} &bull; Livello {level}
              </p>
            </div>
          </div>
        </section>

        {/* Gallery */}
        {sortedPhotos.length === 0 ? (
          <div className="bg-[#152040] rounded-2xl border border-white/5 p-12 text-center">
            <span className="material-symbols-outlined text-5xl text-on-surface-variant/30 mb-3">photo_library</span>
            <p className="text-on-surface-variant/60 text-sm font-medium">Nessuna foto ancora caricata</p>
            {isAdmin && <p className="text-on-surface-variant/40 text-xs mt-1">Usa il pulsante verde in basso a destra per caricare la prima</p>}
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 gap-6 md:gap-8 py-4">
            {sortedPhotos.map((photo, i) => (
              <button
                key={photo.id}
                onClick={() => setLightboxIdx(i)}
                className="polaroid"
              >
                <div className="polaroid-photo">
                  <img
                    src={cloudinaryUrl(photo.url, 'w_500,h_500,c_fill,q_auto,f_auto')}
                    alt={photo.caption || 'Foto'}
                    loading="lazy"
                  />
                </div>
                <div className="polaroid-caption">
                  {photo.caption || 'Aretusa League'}
                </div>
                <div className="polaroid-date">{fmtDate(photo.uploadedAt)}</div>
              </button>
            ))}
          </div>
        )}
      </main>

      <BottomNav isAdmin={isAdmin} bracketActive={bracketActive} />

      {/* Floating Action Button (admin only) */}
      {isAdmin && (
        <button
          onClick={() => setShowUpload(true)}
          aria-label="Carica foto"
          className="fab-upload"
        >
          <span className="material-symbols-outlined" style={{ fontSize: '32px', fontVariationSettings: "'FILL' 1" }}>add</span>
        </button>
      )}

      {/* Upload modal */}
      {showUpload && <UploadPhotoModal onClose={() => setShowUpload(false)} onUploaded={handleUploaded} />}

      {/* Lightbox */}
      {lightboxPhoto && (
        <div className="fixed inset-0 z-50 bg-black/95 flex items-center justify-center p-4" onClick={() => setLightboxIdx(null)}>
          <button
            onClick={() => setLightboxIdx(null)}
            className="absolute top-4 right-4 w-11 h-11 rounded-full bg-white/10 flex items-center justify-center hover:bg-white/20 z-10"
          >
            <span className="material-symbols-outlined text-white">close</span>
          </button>

          {/* Prev */}
          {lightboxIdx > 0 && (
            <button
              onClick={e => { e.stopPropagation(); setLightboxIdx(lightboxIdx - 1) }}
              className="absolute left-4 w-11 h-11 rounded-full bg-white/10 flex items-center justify-center hover:bg-white/20 z-10"
            >
              <span className="material-symbols-outlined text-white">chevron_left</span>
            </button>
          )}
          {/* Next */}
          {lightboxIdx < sortedPhotos.length - 1 && (
            <button
              onClick={e => { e.stopPropagation(); setLightboxIdx(lightboxIdx + 1) }}
              className="absolute right-4 w-11 h-11 rounded-full bg-white/10 flex items-center justify-center hover:bg-white/20 z-10"
            >
              <span className="material-symbols-outlined text-white">chevron_right</span>
            </button>
          )}

          <div className="flex flex-col items-center gap-4 max-w-5xl w-full" onClick={e => e.stopPropagation()}>
            <img
              src={cloudinaryUrl(lightboxPhoto.url, 'w_1600,q_auto,f_auto')}
              alt={lightboxPhoto.caption}
              className="max-h-[75vh] max-w-full object-contain rounded-xl shadow-2xl"
            />
            <div className="flex flex-col items-center gap-1 text-center">
              {lightboxPhoto.caption && (
                <p className="text-white text-lg font-medium" style={{ fontFamily: "'Caveat', cursive" }}>
                  {lightboxPhoto.caption}
                </p>
              )}
              <p className="text-white/50 text-xs font-medium">{fmtDate(lightboxPhoto.uploadedAt)}</p>
            </div>
            {isAdmin && (
              <button
                onClick={() => setDeleteConfirm(lightboxPhoto.id)}
                className="px-5 py-2 bg-red-500/20 border border-red-500/30 text-red-400 font-headline font-bold text-xs uppercase tracking-widest rounded-xl hover:bg-red-500/30 flex items-center gap-2"
              >
                <span className="material-symbols-outlined text-sm">delete</span>
                Elimina Foto
              </button>
            )}
          </div>
        </div>
      )}

      {/* Delete confirmation */}
      {deleteConfirm && (
        <div className="fixed inset-0 z-[60] bg-black/80 backdrop-blur-sm flex items-center justify-center p-4" onClick={() => setDeleteConfirm(null)}>
          <div className="w-full max-w-sm bg-[#1e3368] rounded-2xl shadow-2xl border border-white/10 overflow-hidden" onClick={e => e.stopPropagation()}>
            <div className="p-6 space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-red-500/10 border border-red-500/20 flex items-center justify-center">
                  <span className="material-symbols-outlined text-red-400">delete_forever</span>
                </div>
                <h3 className="font-headline font-black text-lg uppercase text-white">Elimina Foto</h3>
              </div>
              <p className="text-on-surface-variant text-sm">Sei sicuro di voler eliminare questa foto? L'azione non è reversibile.</p>
              <div className="flex gap-3">
                <button onClick={() => setDeleteConfirm(null)} className="flex-1 h-12 bg-white/5 border border-white/10 text-on-surface font-headline font-bold text-xs uppercase tracking-widest rounded-xl hover:bg-white/10">
                  Annulla
                </button>
                <button onClick={() => handleDelete(deleteConfirm)} className="flex-1 h-12 bg-red-500/20 border border-red-500/30 text-red-400 font-headline font-bold text-xs uppercase tracking-widest rounded-xl hover:bg-red-500/30 flex items-center justify-center gap-2">
                  <span className="material-symbols-outlined text-sm">delete</span>
                  Elimina
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
