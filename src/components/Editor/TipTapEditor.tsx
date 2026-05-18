import { useEffect, useRef } from 'react'
import { useEditor, EditorContent, BubbleMenu } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import Placeholder from '@tiptap/extension-placeholder'
import Highlight from '@tiptap/extension-highlight'
import Typography from '@tiptap/extension-typography'
import Underline from '@tiptap/extension-underline'
import CharacterCount from '@tiptap/extension-character-count'
import { useProjectStore } from '@/store/projectStore'
import { useEditorStore } from '@/store/editorStore'
import type { Document } from '@/types'

interface Props {
  document: Document
}

export default function TipTapEditor({ document }: Props) {
  const { editDocument } = useProjectStore()
  const { setWordCount } = useEditorStore()
  const saveTimer = useRef<ReturnType<typeof setTimeout> | null>(null)

  const editor = useEditor({
    extensions: [
      StarterKit,
      Placeholder.configure({ placeholder: 'Comienza a escribir...' }),
      Highlight.configure({ multicolor: true }),
      Typography,
      Underline,
      CharacterCount,
    ],
    content: document.content && Object.keys(document.content).length > 0
      ? document.content
      : '',
    editorProps: {
      attributes: { class: 'tiptap-editor' },
    },
    onUpdate: ({ editor }) => {
      setWordCount(editor.storage.characterCount.words())
      if (saveTimer.current) clearTimeout(saveTimer.current)
      saveTimer.current = setTimeout(() => {
        editDocument(document.id, { content: editor.getJSON() })
      }, 800)
    },
  })

  useEffect(() => {
    if (!editor) return
    const currentJSON = JSON.stringify(editor.getJSON())
    const newJSON = JSON.stringify(document.content)
    if (currentJSON !== newJSON) {
      editor.commands.setContent(
        document.content && Object.keys(document.content).length > 0
          ? document.content
          : '',
        false
      )
    }
    setWordCount(editor.storage.characterCount.words())
  }, [document.id]) // eslint-disable-line react-hooks/exhaustive-deps

  const wordCount = editor?.storage.characterCount.words() ?? 0
  const charCount = editor?.storage.characterCount.characters() ?? 0

  return (
    <div className="flex flex-col h-full">
      {editor && (
        <BubbleMenu editor={editor} tippyOptions={{ duration: 120, placement: 'top' }}>
          <div
            className="flex items-center gap-0.5 p-1 rounded-xl"
            style={{
              background: 'var(--bg-panel)',
              border: '1px solid var(--border-mid)',
              boxShadow: '0 4px 20px rgba(44,46,20,0.22)',
            }}
          >
            <BubbleBtn
              active={editor.isActive('bold')}
              onClick={() => editor.chain().focus().toggleBold().run()}
              title="Negrita (Ctrl+B)"
              style={{ fontWeight: 700 }}
            >B</BubbleBtn>
            <BubbleBtn
              active={editor.isActive('italic')}
              onClick={() => editor.chain().focus().toggleItalic().run()}
              title="Cursiva (Ctrl+I)"
              style={{ fontStyle: 'italic', fontFamily: 'Lora, serif' }}
            >I</BubbleBtn>
            <BubbleBtn
              active={editor.isActive('underline')}
              onClick={() => editor.chain().focus().toggleUnderline().run()}
              title="Subrayado (Ctrl+U)"
              style={{ textDecoration: 'underline' }}
            >U</BubbleBtn>
            <BubbleBtn
              active={editor.isActive('strike')}
              onClick={() => editor.chain().focus().toggleStrike().run()}
              title="Tachado"
              style={{ textDecoration: 'line-through' }}
            >S</BubbleBtn>

            <div className="w-px h-4 mx-0.5" style={{ background: 'var(--border-mid)' }} />

            <BubbleBtn
              active={editor.isActive('highlight')}
              onClick={() => editor.chain().focus().toggleHighlight().run()}
              title="Resaltar"
            >◈</BubbleBtn>

            <div className="w-px h-4 mx-0.5" style={{ background: 'var(--border-mid)' }} />

            <BubbleBtn
              active={editor.isActive('heading', { level: 1 })}
              onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
              title="Encabezado 1"
              mono
            >H1</BubbleBtn>
            <BubbleBtn
              active={editor.isActive('heading', { level: 2 })}
              onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
              title="Encabezado 2"
              mono
            >H2</BubbleBtn>

            <div className="w-px h-4 mx-0.5" style={{ background: 'var(--border-mid)' }} />

            <BubbleBtn
              active={editor.isActive('blockquote')}
              onClick={() => editor.chain().focus().toggleBlockquote().run()}
              title="Cita"
            >"</BubbleBtn>
          </div>
        </BubbleMenu>
      )}

      <EditorContent editor={editor} className="flex-1 overflow-y-auto" />

      <div
        className="flex items-center gap-4 px-2 py-3 mt-4 border-t text-xs font-mono select-none"
        style={{ borderColor: 'var(--border)', color: 'var(--text-muted)' }}
      >
        <span>{wordCount.toLocaleString()} palabras</span>
        <span>{charCount.toLocaleString()} caracteres</span>
      </div>
    </div>
  )
}

function BubbleBtn({
  children,
  active,
  onClick,
  title,
  mono,
  style,
}: {
  children: React.ReactNode
  active: boolean
  onClick: () => void
  title: string
  mono?: boolean
  style?: React.CSSProperties
}) {
  return (
    <button
      // Evita que el editor pierda el foco al hacer clic en el toolbar
      onMouseDown={(e) => e.preventDefault()}
      onClick={onClick}
      title={title}
      className="w-7 h-7 flex items-center justify-center rounded-lg text-xs transition-all"
      style={{
        background: active ? 'var(--accent)' : 'transparent',
        color: active ? 'var(--bg)' : 'var(--text-mid)',
        fontFamily: mono ? 'JetBrains Mono, monospace' : undefined,
        ...style,
      }}
    >
      {children}
    </button>
  )
}
