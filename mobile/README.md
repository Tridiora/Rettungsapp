# Native App-Projekte

Capacitor stellt native Android- und iOS-Projekte für die bestehende Lernoberfläche bereit. Die servergestützte Medienverwaltung benötigt den laufenden Next-Server. Dies ist noch keine veröffentlichungsfertige Store-App und noch kein Offline-Client.

## Android lokal

Benötigt: Android Studio, Android SDK und JDK 21 (hier noch nicht installiert).

PowerShell im Projektverzeichnis:
```powershell
$env:MEDLEARN_APP_URL='http://10.0.2.2:3000'
$env:MEDLEARN_NATIVE_DEV='1'
npx cap sync android
npx cap open android
```
Parallel den Entwicklungsserver starten. `10.0.2.2` ist die Hostadresse aus dem Android-Emulator. Für reale Geräte eine erreichbare HTTPS-Adresse verwenden.

## Serverbetrieb / iOS

`MEDLEARN_APP_URL` auf die eigene HTTPS-Installation setzen und vor dem nativen Build `npx cap sync` ausführen. Ohne Adresse zeigt das Paket ausdrücklich einen Einrichtungsbildschirm statt einer scheinbar funktionsfähigen Lernapp.

iOS benötigt macOS und Xcode. Signierung, APK/AAB bzw. IPA, Store-Abnahme, Geräteprüfung und Offline-Pakete sind noch offen. Keine lokalen Passwörter oder Datenbanken werden in das native Paket kopiert.

Die HTTPS-App bleibt innerhalb einer nativen WebView. Für eine eigenständige Offline-Lernanwendung sind zusätzlich lokale Inhaltspakete, Synchronisation, Downloadverwaltung und Konfliktregeln zu implementieren.
