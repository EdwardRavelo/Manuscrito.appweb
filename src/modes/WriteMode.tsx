import { useState, useRef, useEffect } from 'react'
import { motion } from 'framer-motion'
import { useProjectStore } from '@/store/projectStore'
import { useEditorStore } from '@/store/editorStore'
import TipTapEditor from '@/components/Editor/TipTapEditor'
import MarginComments from '@/components/Editor/MarginComments'
import type { Document, MarginComment } from '@/types'

export default function WriteMode() {
  const { documents, activeProject, addDocument } = useProjectStore()
  const { activeDocument, setActiveDocument } = useEditorStore()

  useEffect(() => {
    if (!activeDocument && documents.length > 0) {
      setActiveDocument(documents[0])
    }
  }, [documents, activeDocument, setActiveDocument])

  const handleCreate = async () => {
    if (!activeProject) return
    const doc = await addDocument({
      projectId: activeProject.id,
      title: 'Sin título',
      type: 'chapter',
      order: 0,
      content: {},
      status: 'draft',
      tags: [],
    })
    setActiveDocument(doc)
  }

  const handleCommentsChange = (comments: MarginComment[]) => {
    if (!activeDocument) return
    useProjectStore.getState().editDocument(activeDocument.id, { marginComments: comments })
    useEditorStore.setState({ activeDocument: { ...activeDocument, marginComments: comments } })
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.2 }}
      className="h-full flex flex-col overflow-hidden"
    >
      {activeDocument ? (
        <div className="flex-1 overflow-auto" style={{ background: 'var(--bg-paper)' }}>
          <div className="min-h-full flex justify-center px-6 py-14">
            <div className="flex w-full gap-0" style={{ maxWidth: '1140px' }}>

              {/* ── Margen izquierdo ── */}
              <LeftMarginDecor />

              {/* ── Lienzo principal ── */}
              <div className="flex-1 min-w-0 px-10">
                <DocTitle doc={activeDocument} placeholder="Título..." />

                {/* Separador ornamental */}
                <div className="flex items-center gap-3 my-8">
                  <div className="flex-1 h-px" style={{ background: 'var(--border)' }} />
                  <span style={{ color: 'var(--text-muted)', fontSize: '10px', letterSpacing: '0.3em' }}>
                    ✦
                  </span>
                  <div className="flex-1 h-px" style={{ background: 'var(--border)' }} />
                </div>

                <TipTapEditor document={activeDocument} />
              </div>

              {/* ── Línea de margen — notebook rule ── */}
              <div
                className="self-stretch shrink-0 mx-5"
                style={{ borderLeft: '1px dashed rgba(80,90,40,0.18)' }}
              />

              {/* ── Margen derecho — notas ── */}
              <div className="w-52 shrink-0">
                <MarginComments
                  comments={activeDocument.marginComments ?? []}
                  onChange={handleCommentsChange}
                />
              </div>

            </div>
          </div>
        </div>
      ) : (
        <div
          className="flex-1 flex flex-col items-center justify-center gap-4"
          style={{ background: 'var(--bg-paper)' }}
        >
          <p className="font-serif text-xl" style={{ color: 'var(--text-muted)' }}>
            La página en blanco te espera
          </p>
          <button
            onClick={handleCreate}
            className="px-6 py-2.5 rounded-lg font-sans text-sm font-medium"
            style={{ background: 'var(--accent)', color: 'var(--bg)' }}
          >
            Comenzar a escribir
          </button>
        </div>
      )}
    </motion.div>
  )
}

function LeftMarginDecor() {
  return (
    <div className="w-14 shrink-0 flex flex-col items-center py-14 relative select-none pointer-events-none">
      {/* Dashed rule — espejo del margen derecho */}
      <div
        className="absolute right-0 inset-y-10"
        style={{ borderRight: '1px dashed rgba(80,90,40,0.18)' }}
      />
      {/* Ornamento: marcador + línea que se desvanece */}
      <div className="flex flex-col items-center gap-2.5" style={{ opacity: 0.22 }}>
        <span style={{ color: 'var(--accent)', fontSize: '8px' }}>◆</span>
        <div
          style={{
            width: 1,
            height: 52,
            background: 'linear-gradient(to bottom, var(--accent), transparent)',
          }}
        />
      </div>
    </div>
  )
}

function DocTitle({ doc, placeholder }: { doc: Document; placeholder: string }) {
  const [value, setValue] = useState(doc.title)
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    setValue(doc.title)
  }, [doc.id]) // eslint-disable-line react-hooks/exhaustive-deps

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value
    setValue(val)
    useEditorStore.setState({ activeDocument: { ...doc, title: val } })
    if (timer.current) clearTimeout(timer.current)
    timer.current = setTimeout(() => {
      useProjectStore.getState().editDocument(doc.id, { title: val })
    }, 500)
  }

  return (
    <input
      type="text"
      value={value}
      onChange={handleChange}
      placeholder={placeholder}
      className="w-full bg-transparent outline-none border-none font-serif font-bold"
      style={{
        fontSize: '2.4rem',
        lineHeight: '1.2',
        letterSpacing: '-0.01em',
        color: 'var(--text)',
      }}
    />
  )
}
