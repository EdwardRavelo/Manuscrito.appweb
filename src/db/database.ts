import { supabase } from '@/lib/supabase'
import type { Project, Document, StickyNote } from '@/types'

// ── Mappers: snake_case (DB) → camelCase (TS) ─────────────────────

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function mapProject(row: any): Project {
  return {
    id: row.id,
    title: row.title,
    description: row.description ?? '',
    coverColor: row.cover_color,
    palette: row.palette,
    createdAt: new Date(row.created_at).getTime(),
    updatedAt: new Date(row.updated_at).getTime(),
  }
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function mapDocument(row: any): Document {
  return {
    id: row.id,
    projectId: row.project_id,
    title: row.title,
    type: row.type,
    order: row.order,
    content: row.content ?? {},
    status: row.status,
    tags: row.tags ?? [],
    cardColor: row.card_color,
    marginComments: row.margin_comments ?? [],
    songUrl: row.song_url ?? undefined,
    songTitle: row.song_title ?? undefined,
    createdAt: new Date(row.created_at).getTime(),
    updatedAt: new Date(row.updated_at).getTime(),
  }
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function mapStickyNote(row: any): StickyNote {
  return {
    id: row.id,
    projectId: row.project_id,
    content: row.content ?? '',
    color: row.color,
    x: row.x ?? 0,
    y: row.y ?? 0,
    width: row.width ?? 200,
    createdAt: new Date(row.created_at).getTime(),
    updatedAt: new Date(row.updated_at).getTime(),
  }
}

async function uid(): Promise<string> {
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('No autenticado')
  return user.id
}

// ── Projects ──────────────────────────────────────────────────────

export async function getAllProjects(): Promise<Project[]> {
  const { data, error } = await supabase
    .from('projects')
    .select('*')
    .order('updated_at', { ascending: false })
  if (error) throw error
  return (data ?? []).map(mapProject)
}

export async function getProject(id: string): Promise<Project | null> {
  const { data } = await supabase.from('projects').select('*').eq('id', id).single()
  return data ? mapProject(data) : null
}

export async function createProject(
  data: Omit<Project, 'id' | 'createdAt' | 'updatedAt'>
): Promise<Project> {
  const userId = await uid()
  const { data: row, error } = await supabase
    .from('projects')
    .insert({ title: data.title, description: data.description, cover_color: data.coverColor, user_id: userId })
    .select()
    .single()
  if (error) throw error
  return mapProject(row)
}

export async function updateProject(id: string, data: Partial<Project>): Promise<void> {
  const patch: Record<string, unknown> = { updated_at: new Date().toISOString() }
  if (data.title       !== undefined) patch.title       = data.title
  if (data.description !== undefined) patch.description = data.description
  if (data.coverColor  !== undefined) patch.cover_color = data.coverColor
  const { error } = await supabase.from('projects').update(patch).eq('id', id)
  if (error) throw error
}

export async function deleteProject(id: string): Promise<void> {
  // ON DELETE CASCADE elimina documentos y sticky_notes asociados
  const { error } = await supabase.from('projects').delete().eq('id', id)
  if (error) throw error
}

// ── Documents ─────────────────────────────────────────────────────

export async function getProjectDocuments(projectId: string): Promise<Document[]> {
  const { data, error } = await supabase
    .from('documents')
    .select('*')
    .eq('project_id', projectId)
    .order('order', { ascending: true })
  if (error) throw error
  return (data ?? []).map(mapDocument)
}

export async function createDocument(
  data: Omit<Document, 'id' | 'createdAt' | 'updatedAt'>
): Promise<Document> {
  const userId = await uid()
  const { data: row, error } = await supabase
    .from('documents')
    .insert({
      project_id: data.projectId,
      title:      data.title,
      type:       data.type,
      order:      data.order,
      content:    data.content,
      status:     data.status,
      tags:       data.tags,
      user_id:    userId,
      song_url:   data.songUrl,
      song_title: data.songTitle,
    })
    .select()
    .single()
  if (error) throw error
  return mapDocument(row)
}

export async function updateDocument(id: string, data: Partial<Document>): Promise<void> {
  const patch: Record<string, unknown> = { updated_at: new Date().toISOString() }
  if (data.title           !== undefined) patch.title            = data.title
  if (data.type            !== undefined) patch.type             = data.type
  if (data.order           !== undefined) patch.order            = data.order
  if (data.content         !== undefined) patch.content          = data.content
  if (data.status          !== undefined) patch.status           = data.status
  if (data.tags            !== undefined) patch.tags             = data.tags
  if (data.cardColor       !== undefined) patch.card_color       = data.cardColor
  if (data.marginComments  !== undefined) patch.margin_comments  = data.marginComments
  if (data.songUrl         !== undefined) patch.song_url         = data.songUrl
  if (data.songTitle       !== undefined) patch.song_title       = data.songTitle
  const { error } = await supabase.from('documents').update(patch).eq('id', id)
  if (error) throw error
}

export async function deleteDocument(id: string): Promise<void> {
  const { error } = await supabase.from('documents').delete().eq('id', id)
  if (error) throw error
}

// ── Sticky Notes ──────────────────────────────────────────────────

export async function getProjectStickyNotes(projectId: string): Promise<StickyNote[]> {
  const { data, error } = await supabase
    .from('sticky_notes')
    .select('*')
    .eq('project_id', projectId)
    .order('created_at', { ascending: true })
  if (error) throw error
  return (data ?? []).map(mapStickyNote)
}

export async function createStickyNote(
  data: Omit<StickyNote, 'id' | 'createdAt' | 'updatedAt'>
): Promise<StickyNote> {
  const userId = await uid()
  const { data: row, error } = await supabase
    .from('sticky_notes')
    .insert({
      project_id: data.projectId,
      content:    data.content,
      color:      data.color,
      x:          data.x,
      y:          data.y,
      width:      data.width,
      user_id:    userId,
    })
    .select()
    .single()
  if (error) throw error
  return mapStickyNote(row)
}

export async function updateStickyNote(id: string, data: Partial<StickyNote>): Promise<void> {
  const patch: Record<string, unknown> = { updated_at: new Date().toISOString() }
  if (data.content !== undefined) patch.content = data.content
  if (data.color   !== undefined) patch.color   = data.color
  if (data.x       !== undefined) patch.x       = data.x
  if (data.y       !== undefined) patch.y       = data.y
  if (data.width   !== undefined) patch.width   = data.width
  const { error } = await supabase.from('sticky_notes').update(patch).eq('id', id)
  if (error) throw error
}

export async function deleteStickyNote(id: string): Promise<void> {
  const { error } = await supabase.from('sticky_notes').delete().eq('id', id)
  if (error) throw error
}
