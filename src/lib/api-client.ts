/** No automatic retries: a failed write may already have reached the server. */
export async function apiJson<T>(url: string, init?: RequestInit): Promise<T> {
  const controller = new AbortController()
  const timeout = setTimeout(() => controller.abort(), 20000)
  try {
    const response = await fetch(url, {...init, credentials: 'same-origin', cache: 'no-store', signal: controller.signal})
    if (!response.headers.get('content-type')?.includes('application/json')) {
      throw new Error('Die Vorschau liefert keine App-Antwort. Öffne Port 3000 erneut über „Ports → Im Browser öffnen“ und prüfe, ob der Codespace läuft.')
    }
    const data = await response.json()
    if (!response.ok) throw new Error(data.error || 'Die Anfrage ist fehlgeschlagen. Bitte erneut versuchen.')
    return data as T
  } catch (error) {
    if (controller.signal.aborted) throw new Error('Der Server antwortet zu langsam. Warte, bis der Codespace gestartet ist, und versuche es erneut.')
    if (error instanceof TypeError || (error instanceof Error && error.name === 'AbortError')) throw new Error('Die Verbindung zur App wurde unterbrochen. Prüfe den Codespace und öffne die Vorschau über Port 3000 erneut.')
    throw error
  } finally { clearTimeout(timeout) }
}
