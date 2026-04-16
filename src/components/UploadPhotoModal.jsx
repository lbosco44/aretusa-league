import { useState, useRef } from 'react'

const CLOUDINARY_CLOUD = 'dzvwpvixz'
const CLOUDINARY_PRESET = 'aretusa_gallery'

export default function UploadPhotoModal({ onClose, onUploaded }) {
  const [file, setFile] = useState(null)
  const [preview, setPreview] = useState(null)
  const [caption, setCaption] = useState('')
  const [uploading, setUploading] = useState(false)
  const [progress, setProgress] = useState(0)
  const [error, setError] = useState('')
  const inputRef = useRef(null)

  function handleFile(e) {
    const f = e.target.files?.[0]
    if (!f) return
    if (!f.type.startsWith('image/')) {
      setError('Seleziona un\'immagine valida')
      return
    }
    if (f.size > 10 * 1024 * 1024) {
      setError('L\'immagine deve essere inferiore a 10MB')
      return
    }
    setError('')
    setFile(f)
    setPreview(URL.createObjectURL(f))
  }

  async function handleUpload() {
    if (!file) { setError('Seleziona un\'immagine'); return }
    setUploading(true)
    setError('')
    setProgress(0)

    try {
      const formData = new FormData()
      formData.append('file', file)
      formData.append('upload_preset', CLOUDINARY_PRESET)

      const xhr = new XMLHttpRequest()
      xhr.open('POST', `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD}/image/upload`)

      xhr.upload.onprogress = (e) => {
        if (e.lengthComputable) setProgress(Math.round((e.loaded / e.total) * 100))
      }

      const result = await new Promise((resolve, reject) => {
        xhr.onload = () => {
          if (xhr.status === 200) resolve(JSON.parse(xhr.responseText))
          else reject(new Error('Upload fallito'))
        }
        xhr.onerror = () => reject(new Error('Errore di rete'))
        xhr.send(formData)
      })

      onUploaded({
        id: result.public_id,
        url: result.secure_url,
        publicId: result.public_id,
        caption: caption.trim(),
        uploadedAt: Date.now(),
      })
    } catch (e) {
      setError('Upload fallito. Riprova.')
      setUploading(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-end md:items-center justify-center p-4" onClick={e => e.target === e.currentTarget && !uploading && onClose()}>
      <div className="w-full max-w-lg bg-[#1e3368] rounded-3xl rounded-b-none md:rounded-3xl shadow-2xl border border-white/10 overflow-hidden">
        <div className="flex items-center justify-between p-6 border-b border-white/10 bg-[#254E8F]/40">
          <div className="flex items-center gap-3">
            <div className="w-2 h-8 bg-secondary rounded-full" />
            <h3 className="font-headline text-xl font-black uppercase">Carica Foto</h3>
          </div>
          <button onClick={onClose} disabled={uploading} className="w-9 h-9 rounded-full bg-white/10 flex items-center justify-center hover:bg-white/20 disabled:opacity-30">
            <span className="material-symbols-outlined text-on-surface">close</span>
          </button>
        </div>

        <div className="p-6 space-y-4">
          {/* File picker / preview */}
          {!preview ? (
            <button
              onClick={() => inputRef.current?.click()}
              className="w-full h-48 bg-[#071530] border-2 border-dashed border-white/15 rounded-2xl flex flex-col items-center justify-center gap-2 hover:border-secondary/40 transition-colors"
            >
              <span className="material-symbols-outlined text-4xl text-on-surface-variant/40">add_photo_alternate</span>
              <p className="text-sm font-semibold text-on-surface-variant">Seleziona un'immagine</p>
              <p className="text-[10px] text-on-surface-variant/50">JPG, PNG, WEBP — max 10MB</p>
            </button>
          ) : (
            <div className="relative rounded-2xl overflow-hidden bg-[#071530]" style={{ aspectRatio: '1' }}>
              <img src={preview} alt="Preview" className="absolute inset-0 w-full h-full object-cover" />
              {!uploading && (
                <button
                  onClick={() => { setFile(null); setPreview(null); if (inputRef.current) inputRef.current.value = '' }}
                  className="absolute top-2 right-2 w-9 h-9 rounded-full bg-black/60 backdrop-blur flex items-center justify-center hover:bg-black/80"
                >
                  <span className="material-symbols-outlined text-white text-sm">close</span>
                </button>
              )}
              {uploading && (
                <div className="absolute inset-0 bg-black/60 backdrop-blur-sm flex flex-col items-center justify-center gap-3">
                  <div className="w-16 h-16 border-4 border-secondary/30 border-t-secondary rounded-full animate-spin" />
                  <p className="text-white text-sm font-semibold">{progress}%</p>
                </div>
              )}
            </div>
          )}
          <input ref={inputRef} type="file" accept="image/*" onChange={handleFile} className="hidden" />

          {/* Caption */}
          <div className="space-y-2">
            <label className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant">Didascalia (opzionale)</label>
            <input
              type="text"
              placeholder="es. Rossi vs Bianchi"
              maxLength={60}
              value={caption}
              onChange={e => setCaption(e.target.value)}
              disabled={uploading}
              className="w-full h-12 px-4 bg-[#071530] border border-white/10 rounded-xl text-on-surface font-semibold placeholder:text-on-surface-variant/40 focus:outline-none focus:border-secondary disabled:opacity-50"
            />
          </div>

          {error && (
            <div className="flex items-center gap-2 px-4 py-3 bg-red-500/10 border border-red-500/20 rounded-xl">
              <span className="material-symbols-outlined text-red-400 text-sm">error</span>
              <p className="text-red-400 text-sm font-medium">{error}</p>
            </div>
          )}
        </div>

        <div className="p-6 pt-0">
          <button
            onClick={handleUpload}
            disabled={!file || uploading}
            className="w-full h-14 bg-gradient-to-r from-[#27F24C] to-[#1DB954] text-[#003909] font-headline font-black uppercase tracking-widest text-sm rounded-xl shadow-xl active:scale-[0.98] transition-transform disabled:opacity-30 disabled:pointer-events-none flex items-center justify-center gap-2"
          >
            <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>
              {uploading ? 'hourglass_top' : 'cloud_upload'}
            </span>
            {uploading ? 'Caricamento...' : 'Carica'}
          </button>
        </div>
      </div>
    </div>
  )
}
