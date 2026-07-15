import Link from "next/link";

export default function Home() {
  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center p-6">
      <div className="max-w-2xl text-center space-y-8">
        <div className="text-4xl sm:text-5xl md:text-6xl">🛡️</div>
        <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-white">
          CyberTeens
        </h1>
        <p className="text-lg sm:text-xl text-slate-300">
          Aprende ciberseguridad de forma interactiva
        </p>
        <div className="space-y-4">
          <Link
            href="/modulo0"
            className="inline-block bg-cyan-500 hover:bg-cyan-600 text-white font-bold py-3 px-8 min-h-[44px] rounded-lg transition-colors"
          >
            Comenzar
          </Link>
        </div>
      </div>
    </div>
  );
}
