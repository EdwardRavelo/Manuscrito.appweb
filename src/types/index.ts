export type DocumentType = 'chapter' | 'note' | 'idea' | 'character' | 'scene'
export type DocumentStatus = 'draft' | 'revision' | 'final'
export type EditorMode = 'write' | 'chapters' | 'outline' | 'ideas'
export type MarginCommentColor = 'amber' | 'green' | 'red' | 'purple'

export interface MarginComment {
  id: string
  text: string
  color: MarginCommentColor
  createdAt: number
}

export interface Project {
  id: string
  title: string
  description: string
  createdAt: number
  updatedAt: number
  palette?: string
  coverColor?: string
}

export interface Document {
  id: string
  projectId: string
  title: string
  type: DocumentType
  order: number
  content: object // TipTap JSON
  status: DocumentStatus
  tags: string[]
  cardColor?: string
  marginComments?: MarginComment[]
  songUrl?: string
  songTitle?: string
  createdAt: number
  updatedAt: number
}

export interface StickyNote {
  id: string
  projectId: string
  content: string
  color: string
  x: number
  y: number
  width: number
  createdAt: number
  updatedAt: number
}
