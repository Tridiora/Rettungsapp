'use client'
import { anatomyModels } from '@/lib/anatomy-data'
import { useEditorialStore } from '@/stores/editorial-store'

export function AnatomyThumbnail({ modelId, activeId }: { modelId: string; activeId?: string }) {
  const records = useEditorialStore(s => s.records)
  const models = records === null ? anatomyModels : records.filter(r => r.kind === 'anatomy').map(r => r.data as unknown as typeof anatomyModels[number])
  const model = models.find(m => m.id === modelId)
  if (!model) return null
  return <svg viewBox="60 60 380 430" role="img" aria-label={`Schematische Abbildung: ${model.title}`} className="w-full h-32 rounded-xl bg-[#101e30]">
    {model.bodyOutline && <path d="M215 110C175 40 325 40 285 110L280 140L330 165L365 290L340 300L310 215L315 350L300 485H270L250 375L230 485H200L185 350L190 215L160 300L135 290L170 165L220 140Z" fill="#1c3147" stroke="#577087" strokeWidth="2" />}
    {model.parts.map(part => <path key={part.id} d={part.path} fill={part.color} fillOpacity={activeId === part.id ? .8 : .35} stroke={activeId === part.id ? '#fff' : part.color} strokeWidth={activeId === part.id ? 5 : 2} />)}
  </svg>
}
