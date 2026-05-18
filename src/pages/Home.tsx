import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { useProjectStore } from '@/store/projectStore'
import type { Project } from '@/types'

const COVER_COLORS = [
  '#4a5820', '#3a5040', '#5a4820', '#403858',
  '#2a4858', '#584038', '#3a5828', '#503840',
  '#285048', '#4a3820',
]

export default function Home() {
  const navigate = useNavigate()
  const { projects, loadProjects, addProject, removeProject, setActiveProject } = useProjectStore()
  const [showNew, setShowNew] = useState(false)
  const [newTitle, setNewTitle] = useState('')
  const [newDesc, setNewDesc] = useState('')
  const [selectedColor, setSelectedColor] = useState(COVER_COLORS[0])
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null)

  useEffect(() => { loadProjects() }, [loadProjects])

  const handleCreate = async () => {
    if (!newTitle.trim()) return
    const project = await addProject({
      title: newTitle.trim(),
      description: newDesc.trim(),
      coverColor: selectedColor,
    })
    setShowNew(false)
    setNewTitle('')
    setNewDesc('')
    await setActiveProject(project)
    navigate(`/project/${project.id}`)
  }

  const handleOpen = async (project: Project) => {
    await setActiveProject(project)
    navigate(`/project/${project.id}`)
  }

  const handleDelete = async (id: string) => {
    await removeProject(id)
    setConfirmDelete(null)
  }

  return (
    <div className="min-h-screen" style={{ background: 'var(--bg)' }}>
      {/* Header */}
      <header className="px-10 pt-10 pb-6 flex items-end justify-between">
        <motion.div
          initial={{ opacity: 0, y: -12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="flex items-center gap-3 mb-1">
            <span className="font-mono text-lg font-bold" style={{ color: 'var(--accent)', letterSpacing: '0.1em' }}>
              MANUSCRITO
            </span>
          </div>
          <p className="font-sans text-xs" style={{ color: 'var(--text-muted)' }}>
            Editor de escritura personal
          </p>
        </motion.div>

        <motion.button
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => setShowNew(true)}
          className="flex items-center gap-2 px-4 py-2 rounded-lg font-sans text-sm font-semibold"
          style={{
            background: 'var(--accent)',
            color: 'var(--bg)',
          }}
        >
          + Nuevo proyecto
        </motion.button>
      </header>

      {/* Divider */}
      <div className="mx-10 mb-8" style={{ height: '1px', background: 'var(--border)' }} />

      {/* Projects */}
      <main className="px-10 pb-10">
        {projects.length === 0 && !showNew && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex flex-col items-center justify-center py-32"
          >
            <div
              className="w-16 h-16 rounded-2xl flex items-center justify-center mb-6"
              style={{ background: 'var(--bg-panel)', border: '1px solid var(--border)' }}
            >
              <span style={{ fontSize: '28px', opacity: 0.4 }}>✍</span>
            </div>
            <p className="font-serif text-lg mb-1" style={{ color: 'var(--text-mid)' }}>
              Sin proyectos aún
            </p>
            <p className="font-sans text-xs" style={{ color: 'var(--text-muted)' }}>
              Crea tu primer proyecto para empezar
            </p>
          </motion.div>
        )}

        <div className="grid grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-5">
          <AnimatePresence>
            {projects.map((project, i) => (
              <motion.div
                key={project.id}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.92 }}
                transition={{ duration: 0.3, delay: i * 0.05 }}
                className="group cursor-pointer"
                onClick={() => handleOpen(project)}
              >
                {/* Book cover */}
                <div
                  className="relative overflow-hidden rounded-lg mb-2.5 transition-transform duration-300 group-hover:-translate-y-1"
                  style={{
                    background: project.coverColor ?? '#1a3a1e',
                    aspectRatio: '3/4',
                    boxShadow: '2px 4px 20px rgba(0,0,0,0.5)',
                  }}
                >
                  {/* Spine */}
                  <div
                    className="absolute left-0 top-0 bottom-0 w-3"
                    style={{ background: 'rgba(0,0,0,0.25)' }}
                  />
                  {/* Top edge */}
                  <div
                    className="absolute top-0 left-0 right-0 h-px"
                    style={{ background: 'rgba(255,255,255,0.08)' }}
                  />
                  {/* Accent line */}
                  <div
                    className="absolute top-0 left-3 right-0 h-0.5"
                    style={{ background: 'var(--accent)', opacity: 0.6 }}
                  />
                  {/* Content */}
                  <div className="absolute inset-0 flex flex-col justify-end p-3 pl-5">
                    <p
                      className="font-serif font-bold text-white text-sm leading-tight"
                      style={{ textShadow: '0 1px 4px rgba(0,0,0,0.5)' }}
                    >
                      {project.title}
                    </p>
                  </div>
                  {/* Hover overlay */}
                  <div
                    className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                    style={{ background: 'rgba(63,185,80,0.06)' }}
                  />
                  {/* Delete */}
                  <button
                    className="absolute top-1.5 right-1.5 w-6 h-6 rounded-md items-center justify-center text-xs hidden group-hover:flex transition-all"
                    style={{ background: 'rgba(0,0,0,0.5)', color: 'rgba(255,255,255,0.7)' }}
                    onClick={(e) => { e.stopPropagation(); setConfirmDelete(project.id) }}
                  >
                    ×
                  </button>
                </div>

                <p
                  className="font-sans text-xs font-medium truncate"
                  style={{ color: 'var(--text-mid)' }}
                >
                  {project.title}
                </p>
                <p className="font-mono text-xs" style={{ color: 'var(--text-muted)', fontSize: '10px' }}>
                  {new Date(project.updatedAt).toLocaleDateString('es', { day: 'numeric', month: 'short' })}
                </p>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      </main>

      {/* ── New project modal ── */}
      <AnimatePresence>
        {showNew && (
          <Modal onClose={() => setShowNew(false)}>
            <h2 className="font-serif text-xl font-bold mb-6" style={{ color: 'var(--text)' }}>
              Nuevo proyecto
            </h2>
            <div className="space-y-4">
              <Field label="Título">
                <input
                  autoFocus
                  type="text"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleCreate()}
                  placeholder="El nombre de tu obra..."
                  className="w-full px-4 py-2.5 rounded-lg text-sm outline-none"
                  style={{
                    background: 'var(--bg)',
                    border: '1px solid var(--border-mid)',
                    color: 'var(--text)',
                    fontFamily: 'Lora, serif',
                  }}
                />
              </Field>
              <Field label="Descripción (opcional)">
                <textarea
                  value={newDesc}
                  onChange={(e) => setNewDesc(e.target.value)}
                  placeholder="Sinopsis breve..."
                  rows={2}
                  className="w-full px-4 py-2.5 rounded-lg text-sm outline-none resize-none"
                  style={{
                    background: 'var(--bg)',
                    border: '1px solid var(--border)',
                    color: 'var(--text)',
                    fontFamily: 'Plus Jakarta Sans, sans-serif',
                  }}
                />
              </Field>
              <Field label="Color de portada">
                <div className="flex gap-2 flex-wrap">
                  {COVER_COLORS.map((color) => (
                    <button
                      key={color}
                      onClick={() => setSelectedColor(color)}
                      className="w-7 h-7 rounded-lg transition-all"
                      style={{
                        background: color,
                        outline: selectedColor === color ? '2px solid var(--accent)' : 'none',
                        outlineOffset: '2px',
                        transform: selectedColor === color ? 'scale(1.15)' : 'scale(1)',
                      }}
                    />
                  ))}
                </div>
              </Field>
            </div>
            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setShowNew(false)}
                className="flex-1 py-2.5 rounded-lg text-sm"
                style={{ background: 'var(--bg)', color: 'var(--text-muted)', border: '1px solid var(--border)' }}
              >
                Cancelar
              </button>
              <button
                onClick={handleCreate}
                disabled={!newTitle.trim()}
                className="flex-1 py-2.5 rounded-lg text-sm font-semibold disabled:opacity-40"
                style={{ background: 'var(--accent)', color: 'var(--bg)' }}
              >
                Crear
              </button>
            </div>
          </Modal>
        )}
      </AnimatePresence>

      {/* ── Confirm delete modal ── */}
      <AnimatePresence>
        {confirmDelete && (
          <Modal onClose={() => setConfirmDelete(null)}>
            <h3 className="font-serif text-lg font-bold mb-2" style={{ color: 'var(--text)' }}>
              Eliminar proyecto
            </h3>
            <p className="text-sm mb-6" style={{ color: 'var(--text-mid)' }}>
              Esta acción no se puede deshacer.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setConfirmDelete(null)}
                className="flex-1 py-2.5 rounded-lg text-sm"
                style={{ background: 'var(--bg)', color: 'var(--text-muted)', border: '1px solid var(--border)' }}
              >
                Cancelar
              </button>
              <button
                onClick={() => handleDelete(confirmDelete)}
                className="flex-1 py-2.5 rounded-lg text-sm font-semibold"
                style={{ background: 'var(--accent-red)', color: 'white' }}
              >
                Eliminar
              </button>
            </div>
          </Modal>
        )}
      </AnimatePresence>
    </div>
  )
}

function Modal({ children, onClose }: { children: React.ReactNode; onClose: () => void }) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-6"
      style={{ background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(6px)' }}
      onClick={onClose}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.96, y: 12 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.96, y: 12 }}
        transition={{ duration: 0.2 }}
        className="w-full max-w-md rounded-2xl p-7"
        style={{
          background: 'var(--bg-panel)',
          border: '1px solid var(--border-mid)',
          boxShadow: '0 24px 60px rgba(0,0,0,0.6)',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {children}
      </motion.div>
    </motion.div>
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
