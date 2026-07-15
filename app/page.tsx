import Link from "next/link";

export default function Home() {
  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center p-6">
      <div className="max-w-2xl text-center space-y-8">
        <div className="text-6xl">🛡️</div>
        <h1 className="text-4xl font-bold text-white">
          CyberTeens
        </h1>
        <p className="text-xl text-slate-300">
          Aprende ciberseguridad de forma interactiva
        </p>
        <div className="space-y-4">
          <Link
            href="/modulo0"
            className="inline-block bg-cyan-500 hover:bg-cyan-600 text-white font-bold py-3 px-8 rounded-lg transition-colors"
          >
            Comenzar
          </Link>
        </div>
      </div>
    </div>
  );
}
