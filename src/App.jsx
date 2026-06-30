import { useState, useEffect, useRef, useCallback, useMemo } from 'react'
import confetti from 'canvas-confetti'

/* === MEDIOS REALES (carpeta /public/media) === */
const BASE = '/media/'
const STORY = [
  { type: 'photo', src: BASE + 'foto-abrazo.jpg',
    text: 'Desde que llegaste a mi vida, cada momento a tu lado ha sido mi recuerdo favorito...' },
  { type: 'photo', src: BASE + 'foto-castillo.jpg',
    text: '...ver al mundo a través de tus ojos llenos de magia e ilusión es el regalo más grande.' },
  { type: 'photo', src: BASE + 'foto-dragon.jpg',
    text: 'Amo compartir contigo las cosas más sencillas y las aventuras más locas.' },
  { type: 'video', src: BASE + 'video1.mp4',
    text: 'Porque no importa cuántos años pasen, siempre seremos el mejor equipo del mundo.' },
]
const GALLERY = [
  { type: 'photo', src: BASE + 'foto-hollywood.jpg' },
  { type: 'video', src: BASE + 'video2.mp4' },
  { type: 'photo', src: BASE + 'foto-triton.jpg' },
  { type: 'video', src: BASE + 'video3.mp4' },
  { type: 'photo', src: BASE + 'foto-spacemountain.jpg' },
  { type: 'video', src: BASE + 'video4.mp4' },
]

/* === Cielo estrellado de fondo === */
function Starfield() {
  const stars = useMemo(() => Array.from({ length: 70 }, () => ({
    top: Math.random() * 100, left: Math.random() * 100,
    size: Math.random() * 2.4 + 0.6, delay: Math.random() * 4, dur: Math.random() * 3 + 2,
  })), [])
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      <div className="absolute inset-0" style={{ background: 'radial-gradient(120% 80% at 50% -10%, #2a2f6e 0%, #161a40 45%, #0b1026 100%)' }} />
      <div className="absolute -top-24 -left-24 w-80 h-80 rounded-full" style={{ background: 'radial-gradient(circle,#ff9ec1aa,transparent 70%)', filter: 'blur(20px)' }} />
      <div className="absolute -bottom-24 -right-16 w-80 h-80 rounded-full" style={{ background: 'radial-gradient(circle,#8ec5ffaa,transparent 70%)', filter: 'blur(20px)' }} />
      {stars.map((s, i) => (
        <span key={i} className="absolute rounded-full bg-white" style={{
          top: s.top + '%', left: s.left + '%', width: s.size, height: s.size,
          animation: `twinkle ${s.dur}s ease-in-out ${s.delay}s infinite`,
        }} />
      ))}
    </div>
  )
}

/* === Marco de medio (foto o video) === */
function MediaFrame({ item }) {
  return (
    <div className="relative w-full rounded-3xl overflow-hidden shadow-2xl ring-1 ring-white/20"
      style={{ aspectRatio: '3/4', background: '#1b2150', animation: 'sway 6s ease-in-out infinite' }}>
      {item.type === 'video'
        ? <video src={item.src} autoPlay muted loop playsInline className="absolute inset-0 w-full h-full object-cover" />
        : <img src={item.src} alt="" className="absolute inset-0 w-full h-full object-cover" />}
      <div className="absolute inset-0" style={{ boxShadow: 'inset 0 0 60px rgba(0,0,0,.35)' }} />
      <div className="absolute top-3 right-3 text-2xl" style={{ animation: 'floatUp 2s ease-in-out infinite alternate' }}>✨</div>
    </div>
  )
}

/* === FASE 1: Recorrido nostálgico === */
function PhaseStory({ onDone }) {
  const [i, setI] = useState(0)
  const last = i === STORY.length - 1
  return (
    <div className="relative min-h-full flex flex-col items-center px-6 py-8">
      <Starfield />
      <div className="relative z-10 w-full max-w-md flex-1 flex flex-col items-center justify-center gap-5">
        <div className="flex flex-col items-center gap-1 fade-up">
          <p className="ff-label text-pink-200/80 tracking-[0.3em] text-[11px] uppercase">Para mi Isa</p>
          <h2 className="ff-title gold-text text-3xl font-black leading-tight text-center">Nuestra Aventura</h2>
        </div>
        <div key={'m' + i} className="w-full pop-in"><MediaFrame item={STORY[i]} /></div>
        <p key={'t' + i} className="ff-body fade-up text-center text-lg leading-relaxed text-white/95">
          {STORY[i].text}
        </p>
      </div>
      <div className="relative z-10 w-full max-w-md flex flex-col items-center gap-5 pb-2">
        <div className="flex gap-2">
          {STORY.map((_, d) => (
            <span key={d} className="h-1.5 rounded-full transition-all duration-500"
              style={{ width: d === i ? 28 : 8, background: d === i ? '#f6d365' : 'rgba(255,255,255,.3)' }} />
          ))}
        </div>
        <button onClick={() => (last ? onDone() : setI(i + 1))}
          className="ff-body w-full py-4 rounded-full text-base font-semibold text-[#3a2a00] active:scale-95 transition"
          style={{ background: 'linear-gradient(100deg,#ffe08a,#f6c14b)', animation: 'pulseGlow 2.6s ease-in-out infinite' }}>
          {last ? 'Continuar  →' : 'Siguiente  →'}
        </button>
      </div>
    </div>
  )
}

/* === FASE 2: Rasca y gana === */
function PhaseScratch({ onReveal }) {
  const canvasRef = useRef(null)
  const wrapRef = useRef(null)
  const drawing = useRef(false)
  const [revealed, setRevealed] = useState(false)
  const [hint, setHint] = useState(true)

  const setup = useCallback(() => {
    const c = canvasRef.current, w = wrapRef.current
    if (!c || !w) return
    const r = w.getBoundingClientRect()
    const dpr = window.devicePixelRatio || 1
    c.width = r.width * dpr; c.height = r.height * dpr
    c.style.width = r.width + 'px'; c.style.height = r.height + 'px'
    const ctx = c.getContext('2d'); ctx.scale(dpr, dpr)
    const g = ctx.createLinearGradient(0, 0, r.width, r.height)
    g.addColorStop(0, '#b8c0ff'); g.addColorStop(.5, '#cdb4ff'); g.addColorStop(1, '#ff9ec1')
    ctx.fillStyle = g; ctx.fillRect(0, 0, r.width, r.height)
    ctx.fillStyle = 'rgba(255,255,255,.85)'; ctx.font = '600 15px Cinzel,Georgia,serif'; ctx.textAlign = 'center'
    ctx.fillText('✦  raspa aquí  ✦', r.width / 2, r.height / 2)
    ctx.globalCompositeOperation = 'destination-out'
  }, [])

  useEffect(() => {
    setup()
    const o = () => setup()
    window.addEventListener('resize', o)
    return () => window.removeEventListener('resize', o)
  }, [setup])

  const pos = (e) => {
    const c = canvasRef.current, r = c.getBoundingClientRect()
    const p = e.touches ? e.touches[0] : e
    return { x: p.clientX - r.left, y: p.clientY - r.top }
  }
  const scratch = (e) => {
    if (!drawing.current || revealed) return
    e.preventDefault()
    const ctx = canvasRef.current.getContext('2d')
    const { x, y } = pos(e)
    ctx.beginPath(); ctx.arc(x, y, 26, 0, Math.PI * 2); ctx.fill()
  }
  const check = () => {
    const c = canvasRef.current, ctx = c.getContext('2d')
    const d = ctx.getImageData(0, 0, c.width, c.height).data
    let clear = 0
    for (let p = 3; p < d.length; p += 160) { if (d[p] === 0) clear++ }
    if (clear / (d.length / 160) > 0.5 && !revealed) setRevealed(true)
  }
  const start = (e) => { drawing.current = true; setHint(false); scratch(e) }
  const end = () => { if (drawing.current) { drawing.current = false; check() } }

  return (
    <div className="relative min-h-full flex flex-col items-center justify-center px-6 py-10">
      <Starfield />
      <div className="relative z-10 w-full max-w-md flex flex-col items-center text-center gap-7">
        <p className="ff-body fade-up text-lg leading-relaxed text-white/95">
          Y creo que ya va siendo hora de volver a crear recuerdos inolvidables...
          <span className="block mt-3 text-pink-200 font-semibold">Raspa la tarjeta para revelar tu sorpresa ✨</span>
        </p>

        <div ref={wrapRef} className="relative w-full rounded-3xl overflow-hidden shadow-2xl ring-2 ring-amber-200/50" style={{ aspectRatio: '16/10' }}>
          <div className="absolute inset-0 flex flex-col items-center justify-center text-center px-4"
            style={{ background: 'linear-gradient(135deg,#241a00,#4a3500 55%,#241a00)' }}>
            <div className="text-3xl">🎟️</div>
            <p className="ff-label mt-1 text-[11px] tracking-[0.35em] text-amber-200/80 uppercase">Boleto mágico</p>
            <p className="ff-title gold-text text-2xl font-extrabold leading-tight mt-1">¡Nos vamos de viaje!</p>
            <p className="ff-body text-amber-100/70 text-xs mt-2">toca abajo para descubrir a dónde</p>
          </div>
          <canvas ref={canvasRef}
            className={'absolute inset-0 touch-none transition-opacity duration-700 ' + (revealed ? 'opacity-0 pointer-events-none' : 'opacity-100')}
            onMouseDown={start} onMouseMove={scratch} onMouseUp={end} onMouseLeave={end}
            onTouchStart={start} onTouchMove={scratch} onTouchEnd={end} />
          {hint && !revealed && (
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <span className="text-3xl" style={{ animation: 'floatUp 1.2s ease-in-out infinite alternate' }}>👆</span>
            </div>
          )}
        </div>

        <button disabled={!revealed} onClick={onReveal}
          className={'ff-body w-full py-4 rounded-full text-base font-bold transition active:scale-95 ' + (revealed ? 'text-[#3a2a00]' : 'text-white/40')}
          style={revealed
            ? { background: 'linear-gradient(100deg,#ffe08a,#f6c14b)', animation: 'pulseGlow 2s ease-in-out infinite' }
            : { background: 'rgba(255,255,255,.08)' }}>
          {revealed ? '¡Abrir mi sorpresa! 🎉' : 'Raspa la tarjeta para continuar'}
        </button>
      </div>
    </div>
  )
}

/* === FASE 3: La gran revelación === */
function PhaseReveal() {
  useEffect(() => {
    const colors = ['#f6d365', '#fff2b8', '#ff9ec1', '#ffd166', '#ffffff', '#ff8fab']
    const fire = (o) => confetti(Object.assign({ particleCount: 90, spread: 75, origin: { y: .6 }, colors }, o))
    fire({})
    const bursts = [200, 500, 900, 1400].map((t) => setTimeout(() => {
      fire({ angle: 60, origin: { x: 0, y: .7 } })
      fire({ angle: 120, origin: { x: 1, y: .7 } })
    }, t))
    const rain = setInterval(() => fire({ particleCount: 30, spread: 120, startVelocity: 25, origin: { y: 0 } }), 1600)
    const stop = setTimeout(() => clearInterval(rain), 9000)
    return () => { bursts.forEach(clearTimeout); clearInterval(rain); clearTimeout(stop) }
  }, [])

  return (
    <div className="relative min-h-full flex flex-col items-center px-6 py-10"
      style={{ background: 'radial-gradient(130% 90% at 50% 0%, #3a2350 0%, #241640 45%, #0b1026 100%)' }}>
      <Starfield />
      <div className="relative z-10 w-full max-w-md flex flex-col items-center text-center gap-5">
        <div className="text-5xl pop-in">🏰✨🎢</div>
        <h1 className="ff-title pop-in gold-text font-extrabold leading-tight" style={{ fontSize: '2.2rem' }}>
          ¡Prepara las maletas, Isa!
        </h1>
        <p className="ff-body fade-up text-white text-xl font-semibold leading-snug">
          ¡En <span className="ff-label gold-text font-bold tracking-wider">SEPTIEMBRE</span> nos vamos juntas a
          <span className="ff-title block text-2xl mt-2 gold-text font-extrabold">HOLLYWOOD STUDIOS</span>
          <span className="ff-label block text-sm mt-1 text-pink-200/90 tracking-[0.25em] uppercase">y a</span>
          <span className="ff-title block text-2xl gold-text font-extrabold">EPIC UNIVERSE!</span>
        </p>

        <div className="w-full rounded-3xl overflow-hidden shadow-2xl ring-2 ring-amber-200/50 pop-in" style={{ aspectRatio: '3/4' }}>
          <img src={BASE + 'foto-hollywood.jpg'} alt="Hollywood Studios" className="w-full h-full object-cover" />
        </div>

        <div className="w-full overflow-x-auto -mx-2 px-2 fade-up">
          <div className="flex gap-3 py-1" style={{ width: 'max-content' }}>
            {GALLERY.map((m, k) => (
              <div key={k} className="rounded-2xl overflow-hidden ring-1 ring-white/20 shadow-lg" style={{ width: 96, height: 128, background: '#1b2150' }}>
                {m.type === 'video'
                  ? <video src={m.src} autoPlay muted loop playsInline className="w-full h-full object-cover" />
                  : <img src={m.src} alt="" className="w-full h-full object-cover" />}
              </div>
            ))}
          </div>
        </div>

        <p className="ff-body fade-up text-pink-200 text-lg mt-1">
          Te ama,<span className="ff-title block gold-text text-2xl font-bold mt-1">Mamá 💛</span>
        </p>
      </div>
    </div>
  )
}

/* === App: máquina de estados de las 3 fases === */
export default function App() {
  const [phase, setPhase] = useState(1) // 1 story · 2 scratch · 3 reveal
  const [fading, setFading] = useState(false)
  const go = (n) => {
    setFading(true)
    setTimeout(() => { setPhase(n); setFading(false); window.scrollTo(0, 0) }, 450)
  }
  return (
    <div className={'min-h-full transition-opacity duration-500 ' + (fading ? 'opacity-0' : 'opacity-100')}>
      {phase === 1 && <PhaseStory onDone={() => go(2)} />}
      {phase === 2 && <PhaseScratch onReveal={() => go(3)} />}
      {phase === 3 && <PhaseReveal />}
    </div>
  )
}
