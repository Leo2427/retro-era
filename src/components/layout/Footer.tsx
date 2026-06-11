export function Footer() {
  return (
    <footer className="mt-auto border-t border-border">
      <div className="container-page flex flex-col items-center gap-4 py-8 sm:flex-row sm:justify-between">
        <div className="flex items-center gap-2">
          <span className="text-sm font-semibold text-text">RetroEra</span>
          <span className="text-sm text-text-muted">
            © {new Date().getFullYear()} 怀旧时光 · 经典永存
          </span>
        </div>
      </div>
    </footer>
  )
}
