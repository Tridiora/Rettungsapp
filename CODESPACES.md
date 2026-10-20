# Rettungsapp direkt auf GitHub starten

[Codespace für dieses Repository erstellen](https://codespaces.new/Tridiora/Rettungsapp)

## Erstes Mal

1. Bei GitHub anmelden und den Link oben öffnen. Alternativ im Repository **Code → Codespaces → Create codespace on main** auswählen.
2. Die Maschine mit **2 Kernen** wählen, sofern GitHub eine Auswahl zeigt. Keine kostenpflichtige Aufstockung aktivieren.
3. Die Einrichtung abwarten. Node.js, Pakete und App werden automatisch eingerichtet und gestartet. Beim ersten Mal kann das mehrere Minuten dauern.
4. Falls kein Vorschaufenster erscheint: im unteren Bereich **Ports → 3000 → Im Browser öffnen** wählen. Die Port-Sichtbarkeit auf **Private** belassen.
5. Für die Verwaltung `/verwaltung` an die Vorschauadresse anhängen. Zugangsdaten stehen in der privaten Datei `.data/ERSTER-ADMIN.txt` im Codespace-Dateibaum. Das ist ein eigener Erstzugang; lokale Konten vom bisherigen Rechner werden nicht übertragen.

## Später wieder öffnen / neuesten Stand laden

Unter https://github.com/codespaces denselben Codespace fortsetzen. Beim Start holt die Konfiguration neue Commits von `main`, installiert bei geändertem Paketstand die Abhängigkeiten und startet die App. Sind im Codespace eigene Änderungen vorhanden oder ist ein anderer Branch ausgewählt, werden diese erhalten und das automatische Git-Update ausgelassen.

Wenn die App bereits läuft und neue Änderungen auf GitHub angekommen sind: den Codespace über das Codespaces-Menü **stoppen** und anschließend wieder öffnen. Nur das Browserfenster zu schließen löst keinen sofortigen Neustart aus. Einen Codespace wiederverwenden, statt für jeden Besuch einen neuen anzulegen.

## Kostenloses Kontingent und Daten

GitHub Free für persönliche Konten enthält derzeit 120 Kernstunden und 15 GB-Monate Speicher pro Monat. Eine Maschine mit 2 Kernen verbraucht pro Laufzeitstunde 2 Kernstunden, also höchstens ungefähr 60 Laufzeitstunden bei sonst ungenutztem Kontingent. Das Speicherkontingent ist zusätzlich zu beachten; gespeicherte Codespaces verbrauchen auch im gestoppten Zustand Speicher.

Ohne hinterlegte Zahlungsmethode wird die Nutzung beim Erreichen eines Limits gesperrt. Bei bereits eingerichtetem Billing im eigenen GitHub-Konto die Budgets prüfen und **Stop usage when budget limit is reached** verwenden. Die Repository-Konfiguration ändert keine Abrechnungseinstellungen und kann kostenlose Nutzung nicht garantieren.

Nach dem Testen den Codespace stoppen. Datenbank und Uploads bleiben beim Stoppen erhalten; beim Löschen des Codespaces – auch durch automatische Aufbewahrungsfristen – gehen nicht extern gesicherte Daten verloren. Commit und Push sichern Programmcode, nicht die ausgeschlossene `.data`-Datenbank. Codespaces ist eine Entwicklungs- und Testumgebung, kein dauerhafter Produktivserver.

Offizielle Informationen: [Abrechnung](https://docs.github.com/en/billing/concepts/product-billing/github-codespaces), [Kontingent sparen](https://docs.github.com/en/codespaces/troubleshooting/troubleshooting-included-usage), [Budgets](https://docs.github.com/en/billing/how-tos/set-up-budgets), [automatische Löschung](https://docs.github.com/en/codespaces/setting-your-user-preferences/configuring-automatic-deletion-of-your-codespaces).

## Wenn der Start scheitert

Die Startausgabe und `.data/codespaces-server.log` zeigen den Fehler. Im Codespace-Terminal kann `node scripts/codespaces-start.cjs` den Start erneut versuchen. Ein belegter Port wird nicht beendet oder durch einen weiteren Server ersetzt. Bei fehlendem Kontingent hilft ein Neustart nicht; zuerst die GitHub-Nutzungsübersicht prüfen.

Prüfstand: lokale Tests und Produktionsbuild; ein echter GitHub-Codespace wurde bei der Einrichtung nicht angelegt. Die tatsächliche Kontingentverfügbarkeit ist erst im GitHub-Konto sichtbar.
