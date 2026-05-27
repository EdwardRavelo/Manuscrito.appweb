import { useState, useEffect, useRef, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useEditorStore } from '@/store/editorStore'
import { useProjectStore } from '@/store/projectStore'

type RightTab = 'music' | 'focus' | 'stats'

type PomodoroPhase = 'work' | 'short-break' | 'long-break'


const PHASE_CONFIG: Record<PomodoroPhase, { label: string; duration: number; color: string }> = {
  work:        { label: 'Escritura',     duration: 25 * 60, color: 'var(--accent)' },
  'short-break': { label: 'Descanso',   duration: 5 * 60,  color: 'var(--accent-blue)' },
  'long-break':  { label: 'Descanso largo', duration: 15 * 60, color: 'var(--accent-purple)' },
}

export default function RightPanel() {
  const [tab, setTab] = useState<RightTab>('music')

  return (
    <div className="flex flex-col h-full overflow-hidden">
      {/* Tab bar */}
      <div
        className="flex items-center px-3 pt-3 pb-0 gap-1 flex-shrink-0"
        style={{ borderBottom: '1px solid var(--border)' }}
      >
        {([
          { id: 'music', label: '♪ Música' },
          { id: 'focus', label: 'Foco' },
          { id: 'stats', label: 'Stats' },
        ] as { id: RightTab; label: string }[]).map((t) => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className="px-3 py-2 text-xs font-medium relative transition-colors"
            style={{ color: tab === t.id ? 'var(--accent)' : 'var(--text-muted)' }}
          >
            {t.label}
            {tab === t.id && (
              <motion.div
                layoutId="right-tab"
                className="absolute bottom-0 left-0 right-0 h-0.5 rounded-full"
                style={{ background: 'var(--accent)' }}
              />
            )}
          </button>
        ))}
      </div>

      <div className="flex-1 overflow-y-auto">
        <AnimatePresence mode="wait">
          {tab === 'music' && <MusicTab key="music" />}
          {tab === 'focus' && <FocusTab key="focus" />}
          {tab === 'stats' && <StatsTab key="stats" />}
        </AnimatePresence>
      </div>
    </div>
  )
}

/* ── Music Player ───────────────────────────────── */
function MusicTab() {
  const { activeDocument } = useEditorStore()
  const audioRef = useRef<HTMLAudioElement | null>(null)
  const [playing, setPlaying] = useState(false)
  const [currentTime, setCurrentTime] = useState(0)
  const [duration, setDuration] = useState(0)
  const [loop, setLoop] = useState(false)

  const songUrl = activeDocument?.songUrl ?? null
  const songTitle = activeDocument?.songTitle ?? null

  // Reset player when song changes
  useEffect(() => {
    setPlaying(false)
    setCurrentTime(0)
    setDuration(0)
  }, [songUrl])

  const togglePlay = () => {
    if (!audioRef.current || !songUrl) return
    if (playing) {
      audioRef.current.pause()
      setPlaying(false)
    } else {
      audioRef.current.play()
      setPlaying(true)
    }
  }

  const fmt = (s: number) => {
    if (!isFinite(s)) return '0:00'
    const m = Math.floor(s / 60)
    const sec = Math.floor(s % 60)
    return `${m}:${sec.toString().padStart(2, '0')}`
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="flex flex-col gap-5 p-4"
    >
      {songUrl ? (
        <>
          <audio
            key={songUrl}
            ref={audioRef}
            src={songUrl}
            loop={loop}
            onTimeUpdate={() => audioRef.current && setCurrentTime(audioRef.current.currentTime)}
            onLoadedMetadata={() => audioRef.current && setDuration(audioRef.current.duration)}
            onEnded={() => { setPlaying(false); setCurrentTime(0) }}
          />

          {/* Song info */}
          <div
            className="rounded-xl p-4 flex flex-col items-center gap-1 text-center"
            style={{ background: 'var(--bg)', border: '1px solid var(--border)' }}
          >
            <div
              className="w-12 h-12 rounded-full flex items-center justify-center mb-2"
              style={{ background: 'var(--bg-active)', fontSize: '22px' }}
            >
              {playing ? '♫' : '♪'}
            </div>
            <p
              className="font-serif font-semibold text-sm leading-snug"
              style={{ color: 'var(--text)' }}
            >
              {songTitle}
            </p>
            {activeDocument?.title && activeDocument.title !== songTitle && (
              <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
                {activeDocument.title}
              </p>
            )}
          </div>

          {/* Progress */}
          <div className="flex flex-col gap-1.5">
            <input
              type="range"
              min={0}
              max={duration || 0}
              step={0.1}
              value={currentTime}
              onChange={(e) => {
                const t = parseFloat(e.target.value)
                if (audioRef.current) audioRef.current.currentTime = t
                setCurrentTime(t)
              }}
              className="w-full accent-[var(--accent)]"
              style={{ accentColor: 'var(--accent)' }}
            />
            <div className="flex justify-between font-mono text-xs" style={{ color: 'var(--text-muted)' }}>
              <span>{fmt(currentTime)}</span>
              <span>{fmt(duration)}</span>
            </div>
          </div>

          {/* Controls */}
          <div className="flex items-center justify-center gap-4">
            <button
              onClick={() => setLoop((l) => !l)}
              className="w-8 h-8 rounded-full flex items-center justify-center transition-all"
              style={{
                background: loop ? 'var(--bg-active)' : 'var(--bg)',
                border: `1px solid ${loop ? 'var(--accent)' : 'var(--border)'}`,
                color: loop ? 'var(--accent)' : 'var(--text-muted)',
                fontSize: '12px',
              }}
              title="Repetir"
            >
              ↺
            </button>
            <button
              onClick={togglePlay}
              className="w-12 h-12 rounded-full flex items-center justify-center font-bold transition-all"
              style={{
                background: playing ? 'var(--bg-active)' : 'var(--accent)',
                color: playing ? 'var(--accent)' : 'var(--bg)',
                border: playing ? '1px solid var(--accent)' : 'none',
                fontSize: playing ? '14px' : '16px',
              }}
            >
              {playing ? '⏸' : '▶'}
            </button>
            <button
              onClick={() => {
                if (audioRef.current) { audioRef.current.currentTime = 0; setCurrentTime(0) }
              }}
              className="w-8 h-8 rounded-full flex items-center justify-center transition-all"
              style={{
                background: 'var(--bg)',
                border: '1px solid var(--border)',
                color: 'var(--text-muted)',
                fontSize: '11px',
              }}
              title="Reiniciar"
            >
              ⏮
            </button>
          </div>
        </>
      ) : (
        <div className="flex flex-col items-center justify-center gap-3 py-10 text-center">
          <span style={{ fontSize: '32px', opacity: 0.3 }}>♪</span>
          <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
            Selecciona un capítulo<br />para escuchar su canción
          </p>
        </div>
      )}
    </motion.div>
  )
}

/* ── Pomodoro Timer ─────────────────────────────── */
function FocusTab() {
  const [phase, setPhase] = useState<PomodoroPhase>('work')
  const [timeLeft, setTimeLeft] = useState(PHASE_CONFIG['work'].duration)
  const [running, setRunning] = useState(false)
  const [sessions, setSessions] = useState(0)
  const [dailyGoal, setDailyGoal] = useState(() => {
    const saved = localStorage.getItem('mss-daily-goal')
    return saved ? parseInt(saved, 10) : 1000
  })
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null)

  const config = PHASE_CONFIG[phase]
  const progress = 1 - timeLeft / config.duration
  const minutes = String(Math.floor(timeLeft / 60)).padStart(2, '0')
  const seconds = String(timeLeft % 60).padStart(2, '0')

  const radius = 54
  const circumference = 2 * Math.PI * radius
  const strokeDash = circumference * (1 - progress)

  const switchPhase = useCallback((p: PomodoroPhase) => {
    setPhase(p)
    setTimeLeft(PHASE_CONFIG[p].duration)
    setRunning(false)
    if (intervalRef.current) clearInterval(intervalRef.current)
  }, [])

  useEffect(() => {
    if (running) {
      intervalRef.current = setInterval(() => {
        setTimeLeft((t) => {
          if (t <= 1) {
            clearInterval(intervalRef.current!)
            setRunning(false)
            if (phase === 'work') {
              setSessions((s) => s + 1)
              switchPhase(sessions > 0 && (sessions + 1) % 4 === 0 ? 'long-break' : 'short-break')
            } else {
              switchPhase('work')
            }
            return 0
          }
          return t - 1
        })
      }, 1000)
    } else {
      if (intervalRef.current) clearInterval(intervalRef.current)
    }
    return () => { if (intervalRef.current) clearInterval(intervalRef.current) }
  }, [running, phase, sessions, switchPhase])

  const toggle = () => setRunning((r) => !r)
  const reset = () => switchPhase(phase)

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="flex flex-col gap-5 p-4"
    >
      {/* Phase selector */}
      <div
        className="flex rounded-xl overflow-hidden text-xs"
        style={{ background: 'var(--bg)', border: '1px solid var(--border)' }}
      >
        {(Object.keys(PHASE_CONFIG) as PomodoroPhase[]).map((p) => (
          <button
            key={p}
            onClick={() => switchPhase(p)}
            className="flex-1 py-2 text-center transition-colors"
            style={{
              background: phase === p ? 'var(--bg-active)' : 'transparent',
              color: phase === p ? PHASE_CONFIG[p].color : 'var(--text-muted)',
              fontSize: '10px',
            }}
          >
            {PHASE_CONFIG[p].label}
          </button>
        ))}
      </div>

      {/* Timer circle */}
      <div className="flex flex-col items-center gap-4">
        <div className="relative" style={{ width: 140, height: 140 }}>
          <svg width="140" height="140" style={{ transform: 'rotate(-90deg)' }}>
            {/* Track */}
            <circle
              cx="70" cy="70" r={radius}
              fill="none"
              stroke="var(--bg-active)"
              strokeWidth="6"
            />
            {/* Progress */}
            <circle
              cx="70" cy="70" r={radius}
              fill="none"
              stroke={config.color}
              strokeWidth="6"
              strokeLinecap="round"
              strokeDasharray={circumference}
              strokeDashoffset={strokeDash}
              style={{ transition: 'stroke-dashoffset 1s linear, stroke 0.3s' }}
            />
          </svg>
          {/* Time display */}
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span
              className="font-mono font-bold"
              style={{ fontSize: '28px', color: 'var(--text)', letterSpacing: '-0.02em' }}
            >
              {minutes}:{seconds}
            </span>
            <span className="text-xs mt-0.5" style={{ color: config.color }}>
              {config.label}
            </span>
          </div>
        </div>

        {/* Controls */}
        <div className="flex items-center gap-3">
          <button
            onClick={reset}
            className="w-8 h-8 rounded-full flex items-center justify-center transition-all"
            style={{ background: 'var(--bg)', border: '1px solid var(--border)', color: 'var(--text-muted)', fontSize: '11px' }}
          >
            ↺
          </button>
          <button
            onClick={toggle}
            className="w-12 h-12 rounded-full flex items-center justify-center font-bold transition-all"
            style={{
              background: running ? 'var(--bg-active)' : config.color,
              color: running ? config.color : 'var(--bg)',
              border: running ? `1px solid ${config.color}` : 'none',
              fontSize: running ? '14px' : '16px',
              boxShadow: running ? `0 0 16px ${config.color}40` : 'none',
            }}
          >
            {running ? '⏸' : '▶'}
          </button>
          <div
            className="w-8 h-8 rounded-full flex items-center justify-center font-mono text-xs"
            style={{ background: 'var(--bg)', border: '1px solid var(--border)', color: 'var(--accent)' }}
          >
            {sessions}
          </div>
        </div>

        <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
          {sessions === 0
            ? 'Empieza tu primera sesión'
            : `${sessions} sesión${sessions > 1 ? 'es' : ''} completada${sessions > 1 ? 's' : ''}`}
        </p>
      </div>

      {/* Writing goal */}
      <WritingGoal dailyGoal={dailyGoal} onGoalChange={(n) => { setDailyGoal(n); localStorage.setItem('mss-daily-goal', String(n)) }} />

      {/* Tips */}
      <WritingTip />
    </motion.div>
  )
}

function WritingGoal({ dailyGoal, onGoalChange }: { dailyGoal: number; onGoalChange: (n: number) => void }) {
  const { wordCount } = useEditorStore()

  const pct = Math.min(100, Math.round((wordCount / dailyGoal) * 100))

  return (
    <div
      className="rounded-xl p-4"
      style={{ background: 'var(--bg)', border: '1px solid var(--border)' }}
    >
      <div className="flex items-center justify-between mb-3">
        <span className="text-xs font-semibold" style={{ color: 'var(--text-mid)' }}>
          Objetivo de escritura
        </span>
        <div className="flex items-center gap-1">
          <button
            onClick={() => onGoalChange(Math.max(100, dailyGoal - 100))}
            className="w-5 h-5 rounded flex items-center justify-center text-xs"
            style={{ background: 'var(--bg-surface)', color: 'var(--text-muted)' }}
          >
            −
          </button>
          <span className="font-mono text-xs w-14 text-center" style={{ color: 'var(--accent)' }}>
            {dailyGoal.toLocaleString()}p
          </span>
          <button
            onClick={() => onGoalChange(dailyGoal + 100)}
            className="w-5 h-5 rounded flex items-center justify-center text-xs"
            style={{ background: 'var(--bg-surface)', color: 'var(--text-muted)' }}
          >
            +
          </button>
        </div>
      </div>

      {/* Progress bar */}
      <div
        className="h-2 rounded-full overflow-hidden mb-2"
        style={{ background: 'var(--bg-active)' }}
      >
        <motion.div
          className="h-full rounded-full"
          style={{ background: pct >= 100 ? 'var(--accent)' : 'var(--accent-dim)' }}
          animate={{ width: `${pct}%` }}
          transition={{ duration: 0.5, ease: 'easeOut' }}
        />
      </div>

      <div className="flex justify-between items-center">
        <span className="font-mono text-xs" style={{ color: 'var(--text-muted)' }}>
          {wordCount.toLocaleString()} palabras
        </span>
        <span
          className="font-mono text-xs font-semibold"
          style={{ color: pct >= 100 ? 'var(--accent)' : 'var(--text-muted)' }}
        >
          {pct}%
        </span>
      </div>

      {pct >= 100 && (
        <p className="text-xs mt-2 text-center" style={{ color: 'var(--accent)' }}>
          ✓ Objetivo cumplido
        </p>
      )}
    </div>
  )
}

const TIPS = [
  'Escribe primero, edita después.',
  'La primera versión no tiene que ser perfecta.',
  'Un párrafo a la vez.',
  'El bloqueo del escritor es miedo disfrazado.',
  'Escribe en el mismo lugar a la misma hora.',
  'Desconecta internet mientras escribes.',
  'Lee lo que amas para escribir mejor.',
  'La cantidad crea calidad.',
]

function WritingTip() {
  const [tip] = useState(() => TIPS[Math.floor(Math.random() * TIPS.length)])

  return (
    <div
      className="rounded-xl p-4"
      style={{ background: 'var(--bg-active)', border: '1px solid var(--border)' }}
    >
      <p className="text-xs italic leading-relaxed" style={{ color: 'var(--text-muted)' }}>
        "{tip}"
      </p>
    </div>
  )
}

/* ── Stats Tab ──────────────────────────────────── */
function StatsTab() {
  const { activeProject, documents } = useProjectStore()

  const totalWords = documents.reduce((acc, doc) => {
    const content = doc.content as { content?: { content?: { text?: string }[] }[] }
    try {
      let text = ''
      const walk = (nodes: { text?: string; content?: unknown[] }[]) => {
        for (const node of nodes) {
          if (node.text) text += node.text + ' '
          if (node.content) walk(node.content as { text?: string; content?: unknown[] }[])
        }
      }
      if (content.content) walk(content.content as { text?: string; content?: unknown[] }[])
      return acc + text.trim().split(/\s+/).filter(Boolean).length
    } catch {
      return acc
    }
  }, 0)

  const byStatus = {
    draft: documents.filter((d) => d.status === 'draft').length,
    revision: documents.filter((d) => d.status === 'revision').length,
    final: documents.filter((d) => d.status === 'final').length,
  }

  const stats = [
    { label: 'Documentos', value: documents.length, color: 'var(--accent)' },
    { label: 'Palabras totales', value: totalWords.toLocaleString(), color: 'var(--accent-blue)' },
    { label: 'Borradores', value: byStatus.draft, color: 'var(--text-muted)' },
    { label: 'En revisión', value: byStatus.revision, color: 'var(--accent-amber)' },
    { label: 'Finalizados', value: byStatus.final, color: 'var(--accent)' },
  ]

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="p-4 space-y-3"
    >
      <p className="text-xs font-semibold mb-4" style={{ color: 'var(--text-muted)' }}>
        {activeProject?.title}
      </p>
      {stats.map((s) => (
        <div
          key={s.label}
          className="flex items-center justify-between px-3 py-2.5 rounded-lg"
          style={{ background: 'var(--bg)', border: '1px solid var(--border)' }}
        >
          <span className="text-xs" style={{ color: 'var(--text-mid)' }}>{s.label}</span>
          <span className="font-mono text-sm font-bold" style={{ color: s.color }}>
            {s.value}
          </span>
        </div>
      ))}
    </motion.div>
  )
}
