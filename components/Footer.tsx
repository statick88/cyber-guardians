'use client'

export default function Footer() {
  return (
    <footer className="relative z-10 border-t border-white/5 mt-12 py-8 px-6">
      <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="text-center sm:text-left">
          <p className="text-xs font-mono text-slate-500">
            CyberGuardians — Plataforma Educativa de Ciberseguridad
          </p>
          <p className="text-[10px] font-mono text-slate-600 mt-1">
            Desarrollado por{' '}
            <a
              href="https://statick88.github.io"
              target="_blank"
              rel="noopener noreferrer"
              className="text-neon-cyan hover:underline"
            >
              Statick
            </a>
          </p>
        </div>
        <div className="flex items-center gap-4">
          <a
            href="https://statick88.github.io"
            target="_blank"
            rel="noopener noreferrer"
            className="text-[10px] font-mono text-slate-500 hover:text-neon-cyan transition-colors"
          >
            Contacto
          </a>
          <span className="text-slate-700">|</span>
          <a
            href="https://github.com/statick88"
            target="_blank"
            rel="noopener noreferrer"
            className="text-[10px] font-mono text-slate-500 hover:text-neon-cyan transition-colors"
          >
            GitHub
          </a>
        </div>
      </div>
    </footer>
  )
}
