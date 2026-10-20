/** Only trust the Codespaces environment, never a client-supplied forwarded host. */
export function codespaceOrigin(env: NodeJS.ProcessEnv = process.env): string | undefined {
  if (env.CODESPACES !== 'true') return undefined
  const name = env.CODESPACE_NAME, domain = env.GITHUB_CODESPACES_PORT_FORWARDING_DOMAIN
  if (!name || !/^[a-z0-9-]+$/.test(name) || !domain || !/^[a-z0-9]+(?:[.-][a-z0-9]+)*\.[a-z]{2,}$/.test(domain)) return undefined
  return `https://${name}-3000.${domain}`
}
