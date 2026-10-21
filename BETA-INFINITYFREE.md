# MedLearn – erste Lern-Beta auf InfinityFree

## Enthalten

- Acht große Fachgebiete mit insgesamt 900 Lernfragen und 900 entsprechenden Karten: Anatomie 130, sieben weitere Bereiche je 110. Die 43 bisherigen Anatomie-Strukturkarten bleiben zusätzlich erhalten.
- Lehrjahrfilter für Karten, Quiz und Lernkapitel. Suche und Lehrjahr werden kombiniert. Zuordnung ist eine didaktische Empfehlung, kein verbindlicher Landeslehrplan.
- Pro Quizrunde wahlweise 20, 40 oder alle Fragen des gewählten Lehrjahrs. Kein veröffentlichtes Kurzquiz unter 20 Fragen in der Beta.
- 900 eigene SVG-Erklärschemata zeigen richtige Antwort, Kontext und Abgrenzung zu den Antwortalternativen. Es handelt sich um textgestützte Erklärungsschemata, nicht um 900 medizinische Illustrationen.
- Elf Anatomiebereiche mit auswählbarer Strukturansicht, Funktionsübersicht, steuerbarem Ablaufdiagramm und beschriftetem MP4-Rundgang mit deutschen Untertiteln. Videos sind ohne Ton; Vorlesen ist in der interaktiven Ansicht über die Geräte-Stimme möglich.
- Lernfortschritt und Notizen bleiben im jeweiligen Browserprofil.

## Hosting-Grenze

InfinityFree stellt keinen Node.js-Server bereit. Deshalb wird eine statische Lern-Beta exportiert. Serveranmeldung, zentrale Redaktion, Klassenrechte, Uploads und serverseitige Notizen sind kein Bestandteil dieses Pakets. Die bestehende Next.js-/SQLite-Serverversion bleibt im Repository erhalten.

Ein Browserprofil ist keine geschützte Anmeldung. Browserdaten löschen kann lokale Fortschritte löschen. Keine Patientendaten in die Lernnotizen eingeben.

## Fertiges Paket erstellen

Voraussetzung: Node.js 22 (siehe `.nvmrc`). Die generierten Medien sind im Repository vorhanden. Nur zum erneuten Erzeugen der Videos wird `ffmpeg` benötigt.

```sh
npm ci
npm test
npm run build:beta
```

Ergebnis: `dist-infinityfree/`. Dieser Ordner enthält ausschließlich die öffentliche Lern-Beta. Der Build arbeitet in `.beta-build/`; API-Routen und Serverdaten im eigentlichen Projekt werden nicht verschoben oder gelöscht.

## Auf InfinityFree hochladen

1. Im InfinityFree-Konto eine Website beziehungsweise Domain anlegen und HTTPS einrichten.
2. `dist-infinityfree/` lokal öffnen.
3. **Den gesamten Inhalt**, nicht den übergeordneten Ordner, per FTP in `htdocs` der Website hochladen. Versteckte Datei `.htaccess`, Ordner `_next`, `anatomie`, `erklaerbilder` und `beta-content.json` mitnehmen.
4. Eine eventuell vorhandene Standard-`index.php` von InfinityFree aus dem Zielverzeichnis entfernen, sofern sie zur leeren Platzhalterwebsite gehört. Nicht ungeprüft eine bestehende Website überschreiben.
5. Die Domain über HTTPS öffnen. Unterseiten wie `/quiz/` und `/karteikarten/` auch direkt laden und neu laden.
6. Unter Karteikarten das 2. oder 3. Lehrjahr wählen, eine Karte drehen und deren Antwort vollständig lesen. Unter Quiz eine 20-Fragen-Runde starten. Unter Anatomie Animation und Video testen.

Das Paket ist für die Domainwurzel vorbereitet. Unterverzeichnisse erfordern einen passenden `basePath` und angepasste Medienpfade. ZIP nicht nur hochladen: Der Inhalt muss entpackt in `htdocs` liegen.

## Inhalt aktualisieren

Die acht redaktionellen Quelldateien liegen in `src/lib/curriculum/beta/*.txt`. Je Abschnitt enthält die Kopfzeile Titel, Lehrjahr, Quelle und Kontext; jede Datenzeile enthält Frage, richtige Antwort und zwei Ablenker. `npm run prepare:curriculum` validiert und erzeugt JSON sowie SVG-Dateien. IDs hängen derzeit an der Reihenfolge: bestehende Fragen nicht umsortieren; neue Fragen am Ende ergänzen, damit Lernfortschrittszuordnungen stabil bleiben.

```sh
npm run prepare:curriculum
npm run prepare:anatomy  # nur bei geänderten Anatomieschemata; benötigt ffmpeg
npm test
npm run build:beta
```

Danach die neu erzeugten Dateien hochladen. Der Servermodus ergänzt neue Inhalte mit der Migration `beta-curriculum-v2`. Bereits redaktionell bearbeitete Datensätze werden bewusst nicht überschrieben und können daher weiterhin kleinere Fragenzahlen haben.

## Quellen und Rechte

Siehe `BETA-CONTENT.md` und `public/LIZENZEN-BETA.md`. Eigene neue Schemata und Rundgänge sind ohne fremde Bild-, Musik- oder Filmvorlagen erstellt. Die externe Quellenliteratur wird nur verlinkt. Fremdmedien des früheren Serverstands werden nicht pauschal als lizenzfrei bezeichnet und sind aus dem statischen Beta-Medienpaket ausgenommen.

## Grenzen der ersten Beta

Die Fragen sind Lernmaterial in fachlicher Erprobung. Es liegt keine unabhängige medizinisch-redaktionelle Freigabe aller 900 Fragen vor. Ein Teil der Ablenker ist bewusst einfach; dies ist kein validierter staatlicher Prüfungssimulator. Die Erklärschemata bieten keine vollständigen Einsatz-SOPs oder Medikamentendosierungen. Die elf Anatomiebereiche bilden keinen vollständigen Atlas und keine anatomisch korrekte 3D-Simulation mit beliebigen Blickwinkeln.

Das Paket wurde lokal gebaut. Ein tatsächlicher InfinityFree-Upload und ein Test auf deiner Domain erfordern den Hostingzugang und sind nicht automatisch mit dem GitHub-Commit erfolgt.
