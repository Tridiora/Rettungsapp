# MedLearn – Rettungsapp

Lernplattform für die Notfallsanitäter-Ausbildung und Weiterbildung im deutschen Rettungswesen. Entwicklungsstand, noch kein vollständig redaktionell geprüfter Lehratlas.

## Lokal starten

Voraussetzung: Node.js 22 LTS und npm.

```sh
npm ci
npm run dev
```

App: http://localhost:3000 · Browserverwaltung: http://localhost:3000/verwaltung

Beim ersten Serverstart wird ein Administrationskonto angelegt. Seine zufälligen Zugangsdaten stehen ausschließlich lokal in `.data/ERSTER-ADMIN.txt`. Die Datei und sämtliche Konten, Uploads und Sitzungen sind vom Repository ausgeschlossen. Auf jeder neuen Installation wird ein eigener Erstzugang erstellt.

## Enthalten

- Karten, Quiz und Textunterlagen mit umschaltbarer Fachsprache und verständlicher Fassung.
- Zentrale Begriffserklärungen mit weiteren Schreibweisen und anklickbaren Begriffen in Lerntexten.
- Browserredaktion mit verschachteltem Inhaltseditor, Freigaben, Archiv und Versionsverlauf.
- Kontorollen, Rechtegruppen, Klassen und serverseitig geprüfte Sichtbarkeit.
- PDF-/Bild-Upload, Dateiaustausch, PDF-Leser und private Markierungen.
- Anatomische Übungsschemata, lizenzierte Detailmedien und deutscher Erklärfilm.
- Responsive Lernoberfläche sowie Capacitor-Projekte für Android und iOS. Verwaltung bleibt im Browser.

## Prüfen und bauen

```sh
npm test
npm run build
npm start
```

SQLite und Originaldateien benötigen ein dauerhaftes, gesichertes Servervolume. Das Projekt verwendet keine reine statische Auslieferung. Produktiver Betrieb benötigt HTTPS sowie Backups der gesamten `.data`-Struktur. Eine einzelne Serverinstanz wird unterstützt.

## Dokumentation und Grenzen

[Server, Rechte und Medien](SERVER-UND-MEDIEN.md) · [Android und iOS](mobile/README.md) · [Medienquellen und Lizenzen](public/anatomie/QUELLEN.md)

Lernfortschritt und Anatomienotizen sind noch browserlokal; PDF-Markierungen liegen bereits beim Serverkonto. Frühere lokale Eigenbeiträge werden noch nicht automatisch importiert. Original-PDFs lassen sich ersetzen, ihr eingebetteter Text wird nicht im Inhaltseditor umgeschrieben. Der Anatomieumfang ist noch kein vollständiger Atlas. Native Projekte sind vorbereitet, APK/IPA und reale Geräteprüfungen stehen noch aus.

Die Quellenangaben und Lizenzbedingungen der enthaltenen Fremdmedien gelten weiterhin; sie werden durch dieses Repository nicht aufgehoben.
