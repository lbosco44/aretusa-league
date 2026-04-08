export default function TopAppBar({ actions }) {
  return (
    <header className="fixed top-0 w-full z-50 bg-[#0E2044]/80 backdrop-blur-xl shadow-2xl shadow-black/40">
      <div className="flex items-center justify-between px-6 h-16 w-full">
        <img src="/logo-white.png" alt="Aretusa League" className="h-9 w-auto object-contain" />
        <div className="flex items-center gap-3">
          {actions}
        </div>
      </div>
    </header>
  )
}
