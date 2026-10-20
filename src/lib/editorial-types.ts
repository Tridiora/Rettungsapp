export const permissionNames = {
  create: 'Eigene Inhalte erstellen',
  editOwn: 'Eigene Inhalte bearbeiten',
  editAll: 'Alle Inhalte bearbeiten',
  publishClass: 'Für eigene Klassen veröffentlichen',
  publishGlobal: 'Global veröffentlichen',
} as const
export type Permission = keyof typeof permissionNames
export type EditorialGroup = {id:string;name:string;kind:'role'|'class';permissions:Permission[];members:string[]}
export type EditorialRecord = {id:string;kind:string;data:Record<string,unknown>;ownerId:string;scope:'global'|'class';classId:string;status:'draft'|'review'|'published'|'archived';revision:number}
export const kindNames:Record<string,string> = {decks:'Lernsets',cards:'Karteikarten',quizzes:'Quiz',documents:'Textunterlagen',anatomy:'Anatomie',glossary:'Begriffserklärungen',illustrations:'Atlas-Abbildungen'}
