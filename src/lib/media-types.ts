export type ServerRole = 'learner' | 'moderator' | 'admin'
export type Account = { id: string; name: string; email: string; role: ServerRole }
export type MediaRecord = {
  id: string; title: string; filename: string; mime: string; size: number;
  category: string; source: string; rights: string; sourceDate: string;
  technical: string; simple: string; country: 'DE';
  status: 'draft' | 'review' | 'published' | 'archived';
  createdAt: string; updatedAt: string; revision: number; authorId: string;
  scope?:'global'|'class';classId?:string;
  blobId?:string;fileRevision?:number;
}
export type MediaNote = { id: string; page: number; x: number; y: number; width: number; height: number; color: string; text: string }
