import { anatomyModels } from '@/lib/anatomy-data'

const heartSource = anatomyModels[0].source
const lungSource = anatomyModels[1].source
export const glossary = [
  ...anatomyModels.flatMap(model => model.parts.map(part => ({ term: part.term, aliases: [part.term, part.name], explanation: part.simple, source: model.source }))),
  { term: 'Aorta', aliases: ['Aorta', 'Hauptschlagader'], explanation: 'Die größte Schlagader. Sie führt Blut von der linken Herzkammer in den Körper.', source: heartSource },
  { term: 'Körperkreislauf', aliases: ['Körperkreislauf', 'Körperkreislaufs'], explanation: 'Der Weg des Blutes vom linken Herzen durch den Körper und zurück zum rechten Herzen.', source: heartSource },
  { term: 'Lungenkreislauf', aliases: ['Lungenkreislauf'], explanation: 'Der Weg des Blutes vom rechten Herzen durch die Lunge zum linken Herzen.', source: heartSource },
  { term: 'Lungenvenen', aliases: ['Lungenvenen'], explanation: 'Blutgefäße, die Blut aus der Lunge zum linken Vorhof bringen.', source: heartSource },
  { term: 'Lungenschlagader', aliases: ['Lungenschlagader'], explanation: 'Blutgefäß, das Blut von der rechten Herzkammer zur Lunge führt.', source: heartSource },
  { term: 'Bronchien', aliases: ['Bronchien', 'Hauptbronchien'], explanation: 'Verzweigte Luftwege innerhalb der Lunge. Die beiden großen ersten Abzweigungen heißen Hauptbronchien.', source: lungSource },
  { term: 'Gasaustausch', aliases: ['Gasaustausch', 'Gasaustauschs'], explanation: 'In der Lunge geht Sauerstoff aus der Luft ins Blut. Kohlendioxid geht aus dem Blut in die Luft und wird ausgeatmet.', source: lungSource },
]

// Longest complete term wins; never replace part of another word or render HTML from content.
export function splitTerms(text: string, entries: typeof glossary = glossary) {
  const aliases = entries.flatMap((entry, index) => [...new Set([entry.term,...entry.aliases])].filter(Boolean).map(alias => ({ alias, index }))).sort((a,b) => b.alias.length - a.alias.length)
  if(!aliases.length)return [{text}]
  const escaped = aliases.map(({alias}) => alias.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'))
  const pattern = new RegExp(`(?<![\\p{L}\\p{N}])(${escaped.join('|')})(?![\\p{L}\\p{N}])`, 'giu')
  const pieces: { text: string; index?: number }[] = []
  let start = 0
  for (const match of text.matchAll(pattern)) {
    if (match.index > start) pieces.push({text: text.slice(start, match.index)})
    pieces.push({text: match[0], index: aliases.find(a => a.alias.toLocaleLowerCase('de') === match[0].toLocaleLowerCase('de'))!.index})
    start = match.index + match[0].length
  }
  pieces.push({text: text.slice(start)})
  return pieces
}

