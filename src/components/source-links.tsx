'use client'

export function SourceLinks({ source }: { source?: string | string[] }) {
  if (!source) return null
  const text = Array.isArray(source) ? source.join(' · ') : source
  const urls = [...new Set(text.match(/https:\/\/[^\s·]+/g) || [])].filter(url => { try { return !!new URL(url).hostname } catch { return false } })
  return <span className="block text-xs text-muted mt-3 break-words" onClick={e => e.stopPropagation()}>
    {urls.length ? <>Quellen: {urls.map((url, i) => <a key={url} href={url} target="_blank" rel="noreferrer" className="inline-block underline text-accent-ink mr-3 py-1">{i + 1}. {new URL(url).hostname.replace(/^www\./, '')}</a>)}</> : text}
  </span>
}
