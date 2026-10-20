# Funktionsstand – 19.10.2026

**Aktualisierung:** Der folgende Text dokumentiert den früheren lokalen Prototyp. Den aktuellen Stand mit echter Medienverwaltung, PDF-Leser, lizenzierten Anatomiemedien und nativen Projekten beschreibt [SERVER-UND-MEDIEN.md](SERVER-UND-MEDIEN.md). Insbesondere die Aussagen „keine Datenbank“, „keine Anmeldung“ und „kein PDF-Renderer“ gelten für die neuen Medienfunktionen nicht mehr.

## Lokal nutzbar

- Verwaltungsportal unter `/verwaltung`: lokale Vorschaurolle wählen, Lernsets, Lernkarten, Quizfragen und gegliederte Textunterlagen erstellen und bearbeiten. Entwürfe, Veröffentlichung, Archivierung und Wiederherstellung sind mit den Lernansichten verbunden. Veröffentlichungen im Editor verlangen Quelle und bestätigte fachliche Prüfung für Deutschland. Archivierte Lernsets blenden auch ihre Karten aus.
- Einreichungen: Prüfung, Freigabe oder Ablehnung mit Rückmeldung. Die Benachrichtigungen zeigen die tatsächlichen Rückmeldungen im lokalen Profil.
- Suche: veröffentlichte Lernsets, Karten, Quiz, Unterlagen und Anatomie durchsuchen. Das Benutzermenü öffnet Profil und Einstellungen und beendet die lokale Sitzung. Die Profil- und Darstellungseinstellungen werden gespeichert.
- Lernen: Bewertung einer Karte aktualisiert den persönlichen Lernfortschritt. Quiz unterstützt eine oder mehrere richtige Antworten, Vor-/Zurücknavigation, Zeitlimits, Auswertung, Begründungen und erneutes Üben. Ergebnisse sind benutzerbezogen gespeichert; die Übersicht zeigt keine erfundenen Lernstatistiken mehr.
- Anatomie: eigenständige schematische Vektorgrafiken für Herz, Lunge und Bronchien/Lungenbläschen; auswählbare Strukturen, Fachbegriffe, einfache Erklärungen, zuschaltbare Animation, Zoom, Verschieben, Zuordnungsübungen und private strukturbezogene Notizen. Reduzierte Bewegung des Betriebssystems wird berücksichtigt.
- Lernunterlagen: Textauswahl markieren, Notiz hinzufügen, Lesezeichen setzen und Markierungen entfernen. Die Markierung erscheint auch im Text. Dies ist weiterhin ein Textleser, kein echter PDF-Renderer.

## Deutschland und Quellen

Die veröffentlichten Grundlagen stammen aus deutschsprachigen Informationen des IQWiG und des nationalen Gesundheitsportals gesund.bund.de. Die Quellen stehen an den Anatomieansichten und den daraus abgeleiteten Lernkarten. Die Grafiken sind eigene vereinfachte Darstellungen, keine maßstabsgetreuen medizinischen Atlanten und keine Darstellung invasiver Verfahren.

Alte Beispielkarten, Quiz und Unterlagen ohne belastbare Quellen sind als Entwürfe erhalten. Sie sind nicht automatisch als deutsche Ausbildungsunterlagen freigegeben. Neue Fachinhalte benötigen eine fachliche Prüfung, Quellenstand und gegebenenfalls Angaben zu örtlichen Vorgaben.

## Grenzen des lokalen Betriebs

Die Rollen sind eine sichtbare Simulation. Die Anwendung hat noch keine geschützte Anmeldung, zentrale Datenbank, geräteübergreifende Synchronisierung oder Mehrbenutzer-Veröffentlichung. Browserdaten sind keine sichere Zugriffskontrolle. Das Löschen des Browserspeichers entfernt lokale Inhalte und Fortschritte. Vor echtem Betrieb sind Server-Authentifizierung, Berechtigungen, Datensicherung und fachliche Redaktion erforderlich.

## Überprüft

- TypeScript-Prüfung und Produktionsbuild erfolgreich.
- Projektweite ESLint-Prüfung: keine Fehler; verbliebene Hinweise betreffen ungenutzte Bestandsimporte.
- `node --test tests/content-store.test.cjs tests/library-flow.test.cjs`: Einreichen/Prüfen/Wiederherstellen, lokale Admin-Rollenprüfung, Sichtbarkeit von Entwürfen/Archiv, abhängige Karten, Benutzertrennung und eindeutige Quiz-Auswertung.
- Im Browser: Verwaltungsentwurf erstellen, filtern, archivieren und nach Neuladen wiederfinden; Anatomiestruktur auswählen, Erklärung wechseln, Animation starten, Übung beantworten; Quiz vollständig auswerten; globale Suche verwenden.
- Smartphone-Breite 390 px: kein horizontaler Seitenüberlauf in der Anatomie. Vollständige Gerätetests auf iOS, Android und Foldables stehen noch aus.

Ein archivierter Eintrag „Funktionstest – Verwaltungsportal“ entstand beim Bedienungstest. Er ist kein veröffentlichter Lerninhalt.

## Sprachansichten und Fachwort-Hilfe

Anatomie, Kartenantworten, Quizfragen und Auswertungen sowie Dokumentabschnitte verwenden einen gemeinsamen Schalter für Fachsprache und einfach verständliche Fassungen. Die Auswahl bleibt lokal gespeichert. Bekannte Begriffe sind punktiert unterstrichen und öffnen eine Erklärung mit deutscher Quelle. Das Glossar deckt derzeit die vorhandenen anatomischen Grundlagen ab; neue Fachgebiete brauchen weitere redaktionelle Einträge. Im Inhaltseditor können Quiz- und Dokumentfassungen getrennt gepflegt werden. Fehlende einfache Fassungen werden ausdrücklich ausgewiesen und nicht durch Fachtext ersetzt. Neue Veröffentlichungen verlangen beide Fassungen. Dokumentmarkierungen sind an die jeweilige Sprachfassung gebunden.

## Erweiterter Anatomieatlas

Elf Lernbereiche mit 43 auswählbaren Strukturen: Herz, Lunge, Bronchien/Lungenbläschen, Gehirn, Verdauung, Nieren/Harnwege, Skelett, Haut, Auge, Immun-/Lymphorgane und Hormonsystem. Die acht neuen Bereiche haben eigene schematische Vektorgrafiken, beide Sprachfassungen, Glossareinträge, Zuordnungsübungen und einen automatischen Strukturen-Rundgang. Suchbare Vorschaukarten und direkte Bereichslinks erleichtern die Auswahl. Die Lernbibliothek ergänzt dazu Karten und Quizfragen auch in bestehenden Profilen, ohne eigene Texte oder Archivzustände zu überschreiben. Quellen: IQWiG, gesund.bund.de und der Anatomieatlas des Landes Schleswig-Holstein, jeweils am Bereich verlinkt. Dies ist eine Auswahl anatomischer Grundlagen, kein vollständiger medizinischer Atlas; insbesondere Muskulatur, weitere Sinnesorgane und Fortpflanzungsorgane sind noch nicht als eigene Modelle enthalten.
