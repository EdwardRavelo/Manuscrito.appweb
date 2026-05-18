import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useAuthStore } from '@/store/authStore'

type Tab = 'signin' | 'signup'

const ERROR_MAP: Record<string, string> = {
  'Invalid login credentials':        'Email o contraseña incorrectos.',
  'Email not confirmed':               'Confirmá tu email antes de continuar.',
  'User already registered':           'Este email ya tiene una cuenta.',
  'Password should be at least':       'La contraseña debe tener al menos 6 caracteres.',
  'Unable to validate email address':  'El email no es válido.',
}

function humanizeError(msg: string): string {
  for (const [key, val] of Object.entries(ERROR_MAP)) {
    if (msg.includes(key)) return val
  }
  return 'Algo salió mal. Intentá de nuevo.'
}

export default function Login() {
  const { signIn, signUp } = useAuthStore()
  const [tab, setTab]         = useState<Tab>('signin')
  const [email, setEmail]     = useState('')
  const [password, setPassword] = useState('')
  const [error, setError]     = useState('')
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      if (tab === 'signin') {
        await signIn(email, password)
      } else {
        await signUp(email, password)
        setSuccess(true)
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Error desconocido'
      setError(humanizeError(msg))
    } finally {
      setLoading(false)
    }
  }

  return (
    <div
      className="min-h-screen flex flex-col items-center justify-center px-4"
      style={{ background: 'var(--bg)' }}
    >
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="w-full max-w-sm"
      >
        {/* Cabecera */}
        <div className="text-center mb-8">
          <span
            className="font-mono text-2xl font-bold tracking-widest"
            style={{ color: 'var(--accent)' }}
          >
            MANUSCRITO
          </span>
          <p className="font-sans text-xs mt-1" style={{ color: 'var(--text-muted)' }}>
            Tu espacio de escritura personal
          </p>
        </div>

        {/* Card */}
        <div
          className="rounded-2xl px-8 py-8"
          style={{
            background: 'var(--bg-paper)',
            boxShadow: '0 2px 8px rgba(44,46,20,0.08), 0 16px 48px rgba(44,46,20,0.10)',
          }}
        >
          {/* Tabs */}
          <div
            className="flex rounded-xl overflow-hidden mb-6 text-xs"
            style={{ background: 'var(--bg)', border: '1px solid var(--border)' }}
          >
            {(['signin', 'signup'] as Tab[]).map((t) => (
              <button
                key={t}
                onClick={() => { setTab(t); setError(''); setSuccess(false) }}
                className="flex-1 py-2 font-sans font-medium transition-colors"
                style={{
                  background: tab === t ? 'var(--bg-active)' : 'transparent',
                  color: tab === t ? 'var(--accent)' : 'var(--text-muted)',
                }}
              >
                {t === 'signin' ? 'Iniciar sesión' : 'Crear cuenta'}
              </button>
            ))}
          </div>

          <AnimatePresence mode="wait">
            {success ? (
              <motion.div
                key="success"
                initial={{ opacity: 0, scale: 0.97 }}
                animate={{ opacity: 1, scale: 1 }}
                className="text-center py-4 space-y-2"
              >
                <p className="text-2xl">✉️</p>
                <p className="font-serif text-base" style={{ color: 'var(--text)' }}>
                  Revisá tu email
                </p>
                <p className="font-sans text-xs" style={{ color: 'var(--text-muted)' }}>
                  Te enviamos un link de confirmación.
                </p>
              </motion.div>
            ) : (
              <motion.form
                key={tab}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.15 }}
                onSubmit={handleSubmit}
                className="space-y-4"
              >
                <Field label="Email">
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="tu@email.com"
                    required
                    autoFocus
                    className="w-full px-4 py-2.5 rounded-xl text-sm outline-none transition-all"
                    style={{
                      background: 'var(--bg)',
                      border: '1px solid var(--border-mid)',
                      color: 'var(--text)',
                      fontFamily: 'Plus Jakarta Sans, sans-serif',
                    }}
                    onFocus={(e) => (e.currentTarget.style.borderColor = 'var(--accent)')}
                    onBlur={(e)  => (e.currentTarget.style.borderColor = 'var(--border-mid)')}
                  />
                </Field>

                <Field label="Contraseña">
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    required
                    minLength={6}
                    className="w-full px-4 py-2.5 rounded-xl text-sm outline-none transition-all"
                    style={{
                      background: 'var(--bg)',
                      border: '1px solid var(--border-mid)',
                      color: 'var(--text)',
                      fontFamily: 'Plus Jakarta Sans, sans-serif',
                    }}
                    onFocus={(e) => (e.currentTarget.style.borderColor = 'var(--accent)')}
                    onBlur={(e)  => (e.currentTarget.style.borderColor = 'var(--border-mid)')}
                  />
                </Field>

                <AnimatePresence>
                  {error && (
                    <motion.p
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      className="text-xs px-3 py-2 rounded-lg"
                      style={{
                        background: 'rgba(138,48,32,0.08)',
                        color: 'var(--accent-red)',
                        border: '1px solid rgba(138,48,32,0.18)',
                      }}
                    >
                      {error}
                    </motion.p>
                  )}
                </AnimatePresence>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-2.5 rounded-xl text-sm font-semibold font-sans transition-all disabled:opacity-50"
                  style={{ background: 'var(--accent)', color: 'var(--bg)' }}
                >
                  {loading
                    ? 'Un momento...'
                    : tab === 'signin' ? 'Entrar' : 'Crear cuenta'}
                </button>
              </motion.form>
            )}
          </AnimatePresence>
        </div>

        <p
          className="text-center font-mono text-xs mt-6"
          style={{ color: 'var(--text-muted)', opacity: 0.5 }}
        >
          Todos los datos son privados y solo tuyos.
        </p>
      </motion.div>
    </div>
  )
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label
        className="block text-xs font-semibold uppercase tracking-wider mb-1.5"
        style={{ color: 'var(--text-muted)', fontFamily: 'JetBrains Mono, monospace' }}
      >
        {label}
      </label>
      {children}
    </div>
  )
}
