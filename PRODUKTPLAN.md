# MedLearn – Lernen im Rettungswesen

## Ziel

Eine zusammenhängende Lernplattform vom Einstieg in die Notfallsanitäterausbildung bis zur beruflichen Fortbildung. Lernkarten sind eine Übungsform, nicht das gesamte Produkt. Der Lernende findet ein Thema, versteht es, übt es und wiederholt es passend zum eigenen Wissensstand.

## Intuitive Bedienung

- Start: „Weiterlernen“, „Heute wiederholen“ und „Thema finden“. Nur tatsächlichen Fortschritt anzeigen; Beispieldaten eindeutig kennzeichnen.
- Themen verbinden Erklärung, Abbildung, Dokumente, Fachbegriffe und passende Übungen. Kein Suchen desselben Themas in fünf getrennten Bereichen.
- Umschalter „Fachlich / Einfach erklärt“ an derselben Stelle; die Auswahl bleibt erhalten. Beide Fassungen werden redaktionell geprüft, nicht ungeprüft automatisch erzeugt.
- Eigene Inhalte zuerst privat als Entwurf erstellen, Vorschau ansehen, dann optional zur gemeinsamen Bibliothek einreichen.
- Status und Rückmeldungen direkt bei den eigenen Inhalten; zurückgegebene Beiträge bearbeiten und erneut einreichen.
- Große Touchflächen, beschriftete Symbole, Tastaturbedienung, verständliche Leerzustände und keine horizontal überlaufenden Formulare.
- Kleine Displays: fokussierte Einspaltenansicht. Tablets, Foldables und Desktop: zusätzliche Inhaltsübersicht neben dem Lernbereich. Orientierung und Größenwechsel dürfen keine Eingaben verlieren.

## Bestehender Stand und erster Ausbau

Der vorhandene Next.js-Prototyp enthält Dashboard, Karteikarten, Quiz, Anatomiegrafiken, Dokumentansicht und Fortschrittsseite. Viele Angaben sind Beispieldaten. Die Dokumentansicht ist noch kein echter PDF-Reader. Notizen liegen lokal im Browser; es gibt keine echte Anmeldung und keine geräteübergreifende Synchronisierung.

Der erste Ausbau verbindet Karteneinreichung, lokale Moderation und Lernsets. Neue Karten enthalten zwei Erklärungen und Quellenangaben. Freigegebene Karten gelangen ins zugehörige Lernset; ausstehende und abgelehnte Beiträge nicht. Die Moderationsrolle ist ausdrücklich eine lokale Simulation. Dies ist keine serverseitige Zugriffskontrolle und keine Veröffentlichung an andere Geräte.

## Entwicklung in zusammenhängenden Etappen

1. Lernkern: Entwürfe, Überarbeitung und erneutes Einreichen; persistenter persönlicher Lernfortschritt; echte Wiederholungstermine; Quiz-Erklärungen und Lernzielverknüpfungen. Abnahme: Ein Thema kann vom Verstehen bis zur späteren Wiederholung vollständig durchlaufen werden.
2. Konten und Datenbank: Anmeldung, Sitzungen, Passwortwiederherstellung, serverseitige Rollen und Rechte, Datenmigration aus der lokalen Vorschau, private Notizen und Synchronisierung. Abnahme: Zwei verschiedene Konten sehen dieselben veröffentlichten Inhalte, aber niemals die privaten Daten des anderen.
3. Redaktion: versionierte Inhalte, Quellenstand, Geltungsbereich, Prüfprotokoll, Änderungsanforderungen, Rücknahme und erneute Prüfung. Änderungen an veröffentlichten Inhalten erzeugen eine neue Prüfversion. Abnahme: Keine ungeprüfte Änderung überschreibt eine freigegebene Fassung.
4. Lernmedien: echter PDF-Reader mit Textauswahl, seitenbezogenen Markierungen und Notizen; zoomfähige, beschriftete Anatomie-SVGs mit Ebenen, Fachbegriffen und Übungen. Abnahme: Markierungen sitzen nach Zoom, Rotation und erneutem Öffnen an derselben Stelle.
5. Lernalltag: Lernziele, Prüfungsvorbereitung, nachvollziehbare Statistiken, Fehlerschwerpunkte, persönliche Sammlungen und fachübergreifende Suche. Berufliche Fortbildung nutzt dieselbe Struktur mit anderen Lernpfaden.
6. Geräte: responsive Web-App, installierbare PWA, kontrollierte Offline-Lernpakete; anschließend native iOS-/Android-Verpackung mit Prüfung von Dateizugriff, Touch, Safe Areas und App-Store-Anforderungen. Eine responsive Website allein ist noch keine fertige Store-App.

## Technisches Zielbild

Die vorhandene Next.js-Oberfläche bleibt erhalten. Die lokale Speicherung wird durch eine zentrale PostgreSQL-Datenbank und einen etablierten Authentifizierungsdienst ergänzt. Die konkrete Hosting- und Auth-Anbindung wird vor Provisionierung anhand von Betrieb, Region und Kosten entschieden; dafür werden keine Dienste automatisch gekauft oder veröffentlicht.

Alle Schreibzugriffe gehen über validierte Server-Endpunkte. Identität und Rolle stammen aus der geprüften Sitzung, niemals aus dem Browserzustand. Ein separates Repository für Inhalte, Lernfortschritt und Notizen hält die Oberfläche vom Speichersystem unabhängig. Dokumentdateien liegen in einem Objektspeicher mit kontrollierten Zugriffsrechten. Private Daten werden nicht in gemeinsame Offline-Caches geschrieben.

Zentrale Datensätze:

| Bereich | Daten und Regeln |
| --- | --- |
| Benutzer | Konto, Rolle, Lernprofil, Einstellungen; Rollen nur durch berechtigte Verwaltung vergeben |
| Themen | Fachbereich, Lernziele, Berufs-/Ausbildungsstufe, Beziehungen |
| Inhalte | Typ, Autor, Thema; versionierte fachliche und einfache Erklärung |
| Quellen | Titel, Herausgeber, URL, Ausgabe, Datum, Geltungsbereich |
| Prüfung | Version, Einreichender, Prüfender, Entscheidung, Rückmeldung, Zeitstempel |
| Übungen | Karten, Quizfragen, Zuordnungen und bildbezogene Aufgaben |
| Fortschritt | Benutzer, Aufgabe, Antworten, Wiederholungsintervall und nächste Fälligkeit |
| Dateien | Version, Dateityp, Speicherort, Lizenz und Rechte |
| Annotationen | Benutzer, Dateiversion, Seite/SVG-Koordinaten, Farbe, Text; nur Eigentümerzugriff |

## Verifikation vor einem echten Pilotbetrieb

Getrennte Konten und Rollen einschließlich direkter API-Aufrufe testen. Private Notizen dürfen auch über erratene IDs nicht lesbar sein. Prüfstatus, Inhaltsversionen und Synchronisierung bei konkurrierenden Änderungen testen. Lernfortschritt muss Neustarts und Gerätewechsel überstehen. Layout und Bedienung auf kleinen Smartphones, Tablet, Foldable und Desktop prüfen; Tastatur, Zoom und Screenreader einbeziehen. Bestehende medizinische Beispieldaten benötigen vor Veröffentlichung eine fachliche Prüfung und belastbare Quellen. Dieser Ausbau bestätigt deren Richtigkeit nicht.
