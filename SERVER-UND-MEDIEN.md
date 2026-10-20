# Server, Redaktion, Medien und native Projekte – 20.10.2026

## Zentrale Redaktion und Klassen

`/verwaltung` ist das Browserportal für Lernsets, Karten, Quiz, Textunterlagen, Anatomiestrukturen, Atlasmedien und das zentrale Glossar. `/verwaltung/medien` verwaltet PDF-/Bilddateien und Konten. In der nativen App werden Verwaltungsnavigation und Verwaltungsseiten ausgeblendet beziehungsweise gesperrt; die serverseitige Rechteprüfung gilt für jede Anfrage unabhängig von der Oberfläche.

Alle Lerninhalte liegen jetzt in SQLite. Der Editor unterstützt verschachtelte Abschnitte, Fragen und Antworten, Hinzufügen, Entfernen, Umsortieren, beide Sprachfassungen, Quellen, Bildauswahl, Entwurf, Prüfung, Veröffentlichung und Archivierung. Der Versionsverlauf kann ältere Inhalte als neuen Entwurf wiederherstellen. Gleichzeitige Änderungen werden durch Versionsnummern erkannt.

Die Administration verwaltet Kontorollen, Rechtegruppen und Klassenmitgliedschaften. Administration und Moderation bearbeiten alle Inhalte; nur Administration verwaltet Konten und Rechte. Die vorbereitete Gruppe „Lehrer“ erlaubt eigene Inhalte und Klassenfreigaben; globale Veröffentlichungen benötigen gesonderte Rechte. „Schüler“ hat nur Leserechte. Gruppen beginnen ohne Mitglieder. Klasseninhalte sind nur für Mitglieder und berechtigte Redaktion zugänglich. Ein Rechteentzug greift bei der nächsten Serveranfrage. Bereits gelesene oder heruntergeladene Inhalte können dadurch nicht zurückgerufen werden.

Ein markiertes Wort im Textfeld kann als zentrale Erklärung angelegt werden. Nach Freigabe werden Begriff und weitere Schreibweisen in den unterstützten Lerntexten automatisch anklickbar, einschließlich weiterer Begriffe in Erklärungen. Wortgrenzen und längste Treffer vermeiden Teilwortverknüpfungen; rekursive Erklärungen sind gegen Schleifen begrenzt. Alle 50 vorhandenen Glossarbegriffe haben ausführlichere Fassungen. Klassenbezogene Erklärungen können globale Erklärungen für ihre Mitglieder ergänzen.

Originaldateien können ersetzt werden. Die neue Version wird wieder zum Entwurf; bisherige private PDF-Markierungen gehören weiterhin zur alten Dateiversion. Der eingebettete Text einer fremden PDF und Rasterbildbeschriftungen werden nicht automatisch umgeschrieben oder mit Glossarlinks versehen. Der Editor bearbeitet Lerninhalte und Medienmetadaten, nicht sämtliche fest programmierten Texte der Benutzeroberfläche.

## Medienverwaltung mit Serverkonten

- `/verwaltung/medien`: PDF-, PNG- und JPEG-Uploads bis 20 MB, Quellen, Lizenz, Quellenstand und zwei Begleittexte. Dateien beginnen als Entwurf. Redaktion kann Prüfung, Veröffentlichung, Archivierung und Wiederherstellung pflegen. Veröffentlichen erfordert beide Texte und die Bestätigung der Prüfung für Deutschland.
- `/medien`: veröffentlichte Dateien für alle. Persönliche Rechteckmarkierungen und Notizen nach Anmeldung; echte PDF-Seiten, auswählbarer Text, Seitenwechsel, Zoom und Download.
- SQLite speichert Konten, Sitzungen, Metadaten, private Markierungen und Änderungsprotokoll. Originaldateien liegen außerhalb von `public`. Unveröffentlichte Dateien sind nur für Redaktion und Administration zugänglich. Änderungen verwenden Versionsnummern gegen gegenseitiges Überschreiben.
- Administration kann Lern-, Redaktions- und Administrationskonten anlegen. Passwörter sind gehasht, Sitzungen verwenden HttpOnly-Cookies. Rollen aus dem Browserprofil haben hier keine Wirkung. Herkunftsprüfung schützt schreibende Aufrufe; Loginversuche sind begrenzt.
- Erstzugang wird beim ersten Start zufällig erzeugt und ausschließlich in `.data/ERSTER-ADMIN.txt` gespeichert. Die Datei enthält ein Passwort und darf nicht veröffentlicht werden. `.data` ist von Versionsverwaltung und Build-Dateiverfolgung ausgeschlossen.
- Die nichtmedizinische Bedienungsprobe mit zwei Seiten liegt als **Entwurf** vor. Sie wurde im Browser hochgeladen und mit einer privaten Markierung auf Seite zwei getestet.

## Anatomie und deutsche Medien

Elf Lernbereiche mit 43 Strukturen bleiben als Grundlagenauswahl vorhanden. Neu sind eine deutsche CC0-Vektorzeichnung des Gehirns mit anklickbaren Erklärpunkten, eine gemeinfreie historische Skeletttafel und ein deutscher Herzfilm von ZDF/3sat (CC BY 4.0). Quellen und Lizenzen stehen direkt am Medium und unter `public/anatomie/QUELLEN.md`. Dateien sind lokal gespeichert.

Die Tafeln lassen sich vergrößern und verschieben. Die bisherigen schematischen Flächen werden nicht mehr als physiologische Animation abgespielt; dort gibt es einen benannten Strukturen-Rundgang. Anatomische Tafel/Erklärfilm und Übungsschema sind getrennt wählbar. Die aktuelle Auswahl ist **kein vollständiger medizinischer Atlas**. Weitere detailreiche Tafeln, Muskulatur, Fortpflanzungsorgane und viele Unterstrukturen fehlen noch. Die historische Skeletttafel hat begrenzte Rasterauflösung.

## Sprache und Lernkern

Fachsprache und verständliche Fassung sind gemeinsam umschaltbar. Bekannte Fachbegriffe öffnen eine Quellen-Erklärung. PDF-Begleittexte sind umschaltbar; fremde Original-PDFs werden nicht automatisch umgeschrieben.

Karten, Quiz, Textunterlagen und Anatomie lesen die zentral veröffentlichten und für das angemeldete Konto berechtigten Inhalte. `/verwaltung/lernmaterial` öffnet dasselbe zentrale Portal. Lernfortschritt und Anatomienotizen sind weiterhin lokal im Browserprofil; PDF-Markierungen sind bereits serverseitig dem Konto zugeordnet. Frühere lokale Eigenbeiträge werden nicht gelöscht, jedoch noch nicht automatisch in die zentrale Redaktion importiert. Ein Wechsel des lokalen Browserprofils ist keine Serveranmeldung.

## Android / iOS

Native Capacitor-Projekte liegen unter `android` und `ios`; Konfiguration und Anleitung unter `capacitor.config.ts` und `mobile/README.md`. Sie binden die servergestützte Lernoberfläche in eine native WebView ein. Ohne konfigurierte Serveradresse zeigen sie einen Einrichtungsbildschirm.

Noch keine APK/AAB/IPA gebaut: Android SDK/JDK fehlen auf diesem Rechner; iOS-Builds benötigen macOS, Xcode und Signierung. Offline-Lernpakete, Gerätesynchronisation, Store-Vorbereitung und echte Geräteprüfungen sind noch offen. Die native Hülle allein macht die Webanwendung nicht offline-fähig.

## Prüfung und Betrieb

- `npm test`: zehn Tests, darunter Klassenisolation, Rechteentzug, globale Freigaberechte, Wortgrenzen, ausführliche Glossarfassungen, fremde Herkunft, versteckte Entwürfe, Versionskonflikte, Dateisignaturen, Dateiaustausch, Sitzungsende und private Notizen.
- TypeScript und Produktionsbuild geprüft. Neue Komponenten separat mit ESLint geprüft; native/verteilte Drittanbieterdateien sind ausgeschlossen.
- Browser: echte Anmeldung, Upload, PDF-Seitenwechsel, Zoomen, private Markierung und Sprachwechsel; Gehirn-Hotspot öffnet passende Erklärung.
- Produktionsabhängigkeiten: `npm audit --omit=dev` meldet keine bekannten Schwachstellen. Der Entwicklungs-Linter hat fünf transitive Meldungen in der braces/fast-glob-Kette; kein erzwungenes Downgrade der Next-Konfiguration vorgenommen.
- Produktiver Betrieb benötigt HTTPS, dauerhaftes Datenvolume, gesicherte Backups von Datenbank **und** Dateien, Kontowiederherstellung sowie fachliche Redaktion. SQLite ist aktuell für eine einzelne Serverinstallation vorgesehen. Inhalte gelten nicht allein durch eine Checkbox als medizinisch unabhängig geprüft.
