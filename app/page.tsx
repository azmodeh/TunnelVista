export default function Home() {
  return (
    <main className="min-h-screen flex items-center justify-center bg-gradient-to-br from-cyan-900 via-purple-900 to-pink-900">
      <div className="text-center p-12 bg-white/10 backdrop-blur-xl rounded-3xl border border-white/20">
        <h1 className="text-6xl font-bold mb-4 bg-gradient-to-r from-cyan-400 to-pink-400 bg-clip-text text-transparent">
          TunnelVista
        </h1>
        <p className="text-2xl text-cyan-100">Ready to connect.</p>
        <button className="mt-8 px-10 py-4 bg-cyan-500 hover:bg-cyan-400 text-black font-bold rounded-xl transition">
          Connect Now
        </button>
      </div>
    </main>
  )
}