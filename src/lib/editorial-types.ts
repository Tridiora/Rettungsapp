export const permissionNames = {
  create: 'Eigene Inhalte erstellen',
  editOwn: 'Eigene Inhalte bearbeiten',
  editAll: 'Alle Inhalte bearbeiten',
  publishClass: 'Für eigene Klassen veröffentlichen',
  publishGlobal: 'Global veröffentlichen',
} as const
export type Permission = keyof typeof permissionNames
export type Milestone = {
  id: string
  title: string
  date: string
  description?: string
  yearLevel?: 1 | 2 | 3
}
export type ClassTimeline = {
  startDate: string
  durationMonths: number
  examDate?: string
  milestones?: Milestone[]
}
export type EditorialGroup = {
  id: string
  name: string
  kind: 'role' | 'class'
  permissions: Permission[]
  members: string[]
  timeline?: ClassTimeline
}
export type EditorialRecord = {id:string;kind:string;data:Record<string,unknown>;ownerId:string;scope:'global'|'class';classId:string;status:'draft'|'review'|'published'|'archived';revision:number}
export const kindNames:Record<string,string> = {decks:'Lernsets',cards:'Karteikarten',quizzes:'Quiz',documents:'Textunterlagen',anatomy:'Anatomie',glossary:'Begriffserklärungen',illustrations:'Atlas-Abbildungen'}
