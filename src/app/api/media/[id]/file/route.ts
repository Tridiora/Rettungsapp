import { readFile } from 'node:fs/promises'
import path from 'node:path'
import { dataDirectory } from '@/lib/server/database'
import { readMedia } from '@/lib/server/media'
import { jsonError } from '@/lib/server/security'
export const runtime = 'nodejs'
export async function GET(request: Request, context: {params:Promise<{id:string}>}) {
  try { const media=readMedia((await context.params).id,request), data=await readFile(path.join(dataDirectory(),'files',`${media.blobId||media.id}.bin`)); return new Response(new Uint8Array(data),{headers:{'Content-Type':media.mime,'Content-Length':String(data.length),'Content-Disposition':`inline; filename*=UTF-8''${encodeURIComponent(media.filename)}`,'Cache-Control':'private, no-store','X-Content-Type-Options':'nosniff','Content-Security-Policy':"default-src 'none'; sandbox"}}) } catch(e) { return jsonError(e) }
}
