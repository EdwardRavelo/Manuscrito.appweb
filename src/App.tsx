import { useEffect } from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import { supabase } from '@/lib/supabase'
import { useAuthStore } from '@/store/authStore'
import Home from '@/pages/Home'
import ProjectPage from '@/pages/Project'
import Login from '@/pages/Login'

export default function App() {
  const { user, loading, setUser } = useAuthStore()

  useEffect(() => {
    // Sesión inicial
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null)
    })
    // Escucha cambios (login, logout, token refresh)
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null)
    })
    return () => subscription.unsubscribe()
  }, [setUser])

  if (loading) {
    return (
      <div
        className="flex h-screen items-center justify-center"
        style={{ background: 'var(--bg)' }}
      >
        <span
          className="font-mono text-xs animate-pulse"
          style={{ color: 'var(--text-muted)' }}
        >
          Cargando...
        </span>
      </div>
    )
  }

  return (
    <Routes>
      <Route path="/login"               element={!user ? <Login />       : <Navigate to="/"       replace />} />
      <Route path="/"                    element={ user ? <Home />         : <Navigate to="/login"  replace />} />
      <Route path="/project/:projectId/*" element={ user ? <ProjectPage /> : <Navigate to="/login"  replace />} />
    </Routes>
  )
}
