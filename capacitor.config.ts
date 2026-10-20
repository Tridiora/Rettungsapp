import type { CapacitorConfig } from '@capacitor/cli'

const serverUrl = process.env.MEDLEARN_APP_URL
if (serverUrl) {
  const url = new URL(serverUrl)
  const local = ['localhost', '127.0.0.1', '10.0.2.2'].includes(url.hostname)
  if (url.protocol !== 'https:' && !(local && process.env.MEDLEARN_NATIVE_DEV === '1')) {
    throw new Error('MEDLEARN_APP_URL muss HTTPS verwenden. Lokale Emulator-Adressen sind nur mit MEDLEARN_NATIVE_DEV=1 erlaubt.')
  }
}
const config: CapacitorConfig = {
  appId: 'de.medlearn.app',
  appName: 'MedLearn',
  webDir: 'mobile/www',
  server: serverUrl ? { url: serverUrl, cleartext: serverUrl.startsWith('http:'), errorPath:'offline.html' } : undefined,
  android: { backgroundColor: '#102438' },
}
export default config
