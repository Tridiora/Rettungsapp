# Fortsetzung · 21.10.2026: InfinityFree-Lern-Beta

900 Hauptfragen und entsprechende Karten/Abschnitte in acht Fachgebieten; zusätzlich 43 bisherige Anatomiekarten. Lehrjahrfilter, flexible Kartenhöhe, 20+-Fragen-Runden, eigene SVG-Erklärschemata und elf interaktive Anatomierundgänge samt MP4/VTT.

Die statische Beta wird mit Node 22 und `npm run build:beta` nach `dist-infinityfree` exportiert. Der Servermodus bleibt erhalten. Upload-Anleitung und Grenzen: BETA-INFINITYFREE.md. Inhaltsstand und noch ausstehende medizinische Prüfung: BETA-CONTENT.md. Keine tatsächliche InfinityFree-Veröffentlichung durchgeführt.

---

# LAST_STATE – 20.10.2026

## Codespaces: wiederholtes Neuladen und Verbindungsfehler

Nutzer meldete fortgesetztes Neuladen und fetch/aborted in der Vorschau. Startskript auf next build + next start statt next dev umgestellt; damit läuft keine HMR-Verbindung im Browser. Nach einem per git pull aktualisierten Startskript wird künftig das neue Skript ausgeführt. Fehlgeschlagener Build startet keinen alten Server.

Gemeinsamer API-Client für Redaktion, Medienverwaltung und Inhaltssynchronisation: 20-Sekunden-Zeitlimit, verständliche Netzwerk-/Proxy-Meldungen, keine automatischen Wiederholungen von Schreibzugriffen. Redaktion bietet bei initialem Fehler Erneut laden. Bereits geladene Inhalte bleiben bei temporären Fehlern bestehen; Sitzungswechsel setzt sie zurück und verwirft verspätete Antworten.

22 Tests, Produktionsbuild und gezielter ESLint-Lauf erfolgreich. Echter lokaler Produktionsserver mit der angegebenen externen Codespaces-Origin geprüft: Login HTTP 200, Secure-Cookie, Admin-Inhalte und Verwaltungsseite ohne HMR. Tests für Startreihenfolge, Buildfehler, aktualisiertes Startskript, Netzwerkfehler, Timeout und verspätete Antworten hinzugefügt. Die entfernte private Vorschau lieferte von hier HTTP 404; direkte Prüfung dort nicht möglich. Ursache des tatsächlichen entfernten Neuladens ist ohne Browser-/Serverlogs nicht abschließend belegt.

Einmalige Übernahme im vorhandenen Codespace: zuerst git pull --ff-only im Terminal, dann Codespace stoppen und wieder öffnen. Dadurch wird bereits beim ersten Neustart das neue Startskript ausgeführt. Auf Meldung „stabiler App-Server“ warten, alte Vorschau schließen und Port 3000 neu öffnen. Keine lokalen Änderungen überschreiben.

## Codespaces-Anmeldung korrigiert

Die Herkunftsprüfung berücksichtigte ausschließlich eine aus Umgebungsvariablen erzeugte Vorschauadresse oder die interne Request-URL. Hinter einer Weiterleitung konnte dadurch die Anmeldung vor der Passwortprüfung mit HTTP 403 scheitern. Die Prüfung nutzt jetzt bei Browseranfragen Sec-Fetch-Site: same-origin; dieser Header ist für Webseiten-JavaScript nicht setzbar. same-site, cross-site, ungültige und fehlende Origins bleiben gesperrt. Ohne Fetch-Metadaten gilt weiterhin der exakte bisherige Origin-Abgleich; Forwarded-Host wird nicht als Vertrauensanker verwendet. Sichere Sitzungscookies richten sich nach der zugelassenen öffentlichen HTTPS-Herkunft.

16 Tests und Produktionsbuild erfolgreich. Neue Regressionstests decken interne localhost-Adresse, externe Codespaces-Adresse ohne passende Umgebungsvariablen, falsches Passwort, erfolgreiche Anmeldung, Sitzung, blockierte fremde Abmeldung und erfolgreichen Logout ab. Kein Zugriff auf den tatsächlichen Nutzer-Codespace; Vorschau-URL wurde inzwischen mitgeteilt; der Test verwendet ihre Origin. Für die Übernahme bestehenden Codespace stoppen und neu starten; bei lokal geändertem Checkout wird das automatische Update bewusst ausgelassen.

## Abgeschlossener Inhaltsausbau

80 unterschiedliche Lernbausteine: je zehn in Anatomie & Physiologie, Notfallmedizin, Pharmakologie, Einsatztaktik, Recht & Ethik, Hygiene, Kommunikation und Pädiatrie. Jeder Baustein enthält Fachtext, einfache Erklärung, Frage und begründete Quizauflösung. Acht Kartensets, acht Quiz mit je zehn Fragen und acht Lesekapitel bilden dieselben 80 Themen in verschiedenen Lernformen ab (104 redaktionelle Datensätze).

Acht eigene SVG-Lernlandkarten, vier auswählbare Themen je Kapitel, optionaler pausierbarer Rundgang mit 15-Sekunden-Wechsel und Berücksichtigung reduzierter Bewegung. Der bestehende lizenzierte Herzfilm ist eingebunden; weitere deutsche Filme und Original-PDFs werden bei ihren Herausgebern verlinkt. Das sind didaktische Übersichten, keine anatomischen Simulationen. Quellen sind in Karten, Quizauflösungen und Kapitelabschnitten anklickbar. Medien und Rundgänge bleiben im Browser-Verwaltungsportal bearbeitbar, einschließlich neu anlegbarer Einträge.

Die einmalige Migration curriculum-de-v1 ergänzt neue Datensätze ohne redaktionelle Bearbeitungen zu überschreiben. Sie wurde auch in der lokalen Produktionsvorschau ausgeführt. Inhalte und Quellenverzeichnis: CONTENT_REVIEW.md. Quellenabgleich durch KI mit deutschen Primärquellen, keine unabhängige medizinische Freigabe. Keine pauschalen Arzneimitteldosierungen oder vollständigen Einsatz-SOPs.

## Prüfstand

- 14 Tests erfolgreich, einschließlich Themenabdeckung, zweier Sprachfassungen, eindeutiger Quizantworten, wiederholbarer Migration und Erhalt redaktioneller Bearbeitungen.
- Produktionsbuild erfolgreich.
- Produktions-API liefert genau 104 neue Datensätze. Neue Karten-/Quizrouten, Dokumente, SVG und Verwaltung antworten mit HTTP 200.
- 80 unterschiedliche Quellen- und Medienlinks geprüft, alle HTTP 200; inhaltlicher Quellenabgleich separat durchgeführt. Erreichbarkeit allein ist keine fachliche Validierung.
- Gezielte ESLint-Prüfung ohne Fehler; eine Empfehlung für next/image statt img bei frei gepflegten Abbildungen.
- SVG-Beispiel gerendert und visuell geprüft. Vollständige interaktive Browserprüfung blockiert: Browser-Werkzeug meldet Transport closed. Kein Android-/iOS-Gerätetest.
- Lokales Erstpasswort gegen gespeicherten Hash geprüft. Keine Zugangsdaten oder Datenbanken im Git-Commit.

## Zugang und Übernahme

Admin-Konto: admin@medlearn.local. Das individuelle Erstpasswort liegt in .data/ERSTER-ADMIN.txt der jeweiligen Installation. Codespace und lokales Projekt besitzen getrennte Datenbanken und Passwörter. Für Codespaces den bestehenden Codespace stoppen und wieder öffnen: sauberes main wird durch das Startskript aktualisiert. Beim ersten Inhaltsabruf wird die Migration automatisch ausgeführt. Anleitung: CODESPACES.md.

Dieser Commit ist der Übergabestand; genaue Revision mit git log -1 bestimmen. Vorheriger veröffentlichter Stand: 933f49d. Nach Commit pushen und Remote-Revision vergleichen; keinen Upload ohne Nachweis behaupten.

## Fortbestehende Produktaufgaben

Unabhängige medizinische Redaktion und vertiefende Ausbildungsinhalte; vollständiger Anatomieatlas mit weiteren lizenzierten Detailzeichnungen; native Android-/iOS-Builds und Geräteprüfung; serverseitiger Lernfortschritt statt Browserprofil; Import früherer lokaler Eigenbeiträge. Der Inhaltseditor bearbeitet weder eingebetteten Original-PDF-Text noch sämtliche fest programmierten UI-Texte. Weitere Details: SERVER-UND-MEDIEN.md.

## Arbeitsregel

Diesen Stand regelmäßig und vor größeren Abschnitten aktualisieren. Geprüfte Änderungen nach Tridiora/Rettungsapp pushen. Bei unvollständiger Arbeit offene Fehler, letzte erfolgreiche Checks und konkrete nächste Schritte festhalten. Keine Passwörter oder Datenbanken committen.
