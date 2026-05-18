import { create } from 'zustand'
import type { Project, Document } from '@/types'
import {
  getAllProjects,
  createProject,
  updateProject,
  deleteProject,
  createDocument,
  updateDocument,
  deleteDocument,
  getProjectDocuments,
} from '@/db/database'

interface ProjectState {
  projects: Project[]
  activeProject: Project | null
  documents: Document[]
  loadProjects: () => Promise<void>
  addProject: (data: Omit<Project, 'id' | 'createdAt' | 'updatedAt'>) => Promise<Project>
  editProject: (id: string, data: Partial<Project>) => Promise<void>
  removeProject: (id: string) => Promise<void>
  setActiveProject: (project: Project | null) => Promise<void>
  addDocument: (data: Omit<Document, 'id' | 'createdAt' | 'updatedAt'>) => Promise<Document>
  editDocument: (id: string, data: Partial<Document>) => Promise<void>
  removeDocument: (id: string) => Promise<void>
  reorderDocuments: (docs: Document[]) => Promise<void>
}

export const useProjectStore = create<ProjectState>((set) => ({
  projects: [],
  activeProject: null,
  documents: [],

  loadProjects: async () => {
    const projects = await getAllProjects()
    set({ projects })
  },

  addProject: async (data) => {
    const project = await createProject(data)
    set((s) => ({ projects: [project, ...s.projects] }))
    return project
  },

  editProject: async (id, data) => {
    await updateProject(id, data)
    set((s) => ({
      projects: s.projects.map((p) => (p.id === id ? { ...p, ...data, updatedAt: Date.now() } : p)),
      activeProject: s.activeProject?.id === id ? { ...s.activeProject, ...data, updatedAt: Date.now() } : s.activeProject,
    }))
  },

  removeProject: async (id) => {
    await deleteProject(id)
    set((s) => ({
      projects: s.projects.filter((p) => p.id !== id),
      activeProject: s.activeProject?.id === id ? null : s.activeProject,
    }))
  },

  setActiveProject: async (project) => {
    if (!project) {
      set({ activeProject: null, documents: [] })
      return
    }
    const documents = await getProjectDocuments(project.id)
    set({ activeProject: project, documents })
  },

  addDocument: async (data) => {
    const doc = await createDocument(data)
    set((s) => ({ documents: [...s.documents, doc] }))
    return doc
  },

  editDocument: async (id, data) => {
    await updateDocument(id, data)
    set((s) => ({
      documents: s.documents.map((d) => (d.id === id ? { ...d, ...data, updatedAt: Date.now() } : d)),
    }))
  },

  removeDocument: async (id) => {
    await deleteDocument(id)
    set((s) => ({ documents: s.documents.filter((d) => d.id !== id) }))
  },

  reorderDocuments: async (docs) => {
    const updated = docs.map((d, i) => ({ ...d, order: i }))
    await Promise.all(updated.map((d) => updateDocument(d.id, { order: d.order })))
    set({ documents: updated })
  },
}))
