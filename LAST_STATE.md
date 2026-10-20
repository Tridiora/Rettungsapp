# LAST_STATE – 20.10.2026

## Aktueller Arbeitsstand

Codespaces-Vorschau mit automatischer Installation, Start auf Port 3000 und sicherer Aktualisierung von main beim Wiederöffnen eingerichtet. Die konkrete Codespaces-HTTPS-Adresse wird für schreibende Anfragen zugelassen; andere Codespaces und gefälschte Forwarded-Host-Header erhalten keine Berechtigung. Sitzungscookies verwenden in Codespaces Secure. Next.js erlaubt nur die konkrete Vorschau-Domain für Entwicklungsressourcen.

Basiscommit vor dieser Änderung: e4f615b37f47584edfe53cc8e2506f4b1f3b0b13. Der diese Datei enthaltende Commit ist der aktuelle Übergabestand; exakte Revision mit `git log -1` ermitteln.

## Prüfung

- 11 Tests erfolgreich, einschließlich Codespaces-Herkunftsprüfung und bestehenden Rechte-/Medientests.
- Produktionsbuild erfolgreich; Startskript separat syntaktisch geprüft.
- Keine echte Codespaces-Instanz gestartet, keine Gebührenoptionen aktiviert. Containerstart und Browser-Vorschau auf GitHub stehen als reale Prüfung noch aus.
- Anleitung: CODESPACES.md. Admin-Erstzugang entsteht separat im Codespace unter .data/ERSTER-ADMIN.txt.

## Nächster Schritt

Nutzer öffnet einen Codespace auf main mit 2 Kernen und prüft Vorschau, Anmeldung, Speichern und Wiederaufnahme. Bei Problemen zuerst Startausgabe und .data/codespaces-server.log prüfen. Codespace-Ports privat lassen. Keine Passwörter oder Datenbankdateien committen.

## Fortbestehende Produktaufgaben

Vollständiger Anatomieatlas mit weiteren lizenzierten Detailzeichnungen; native Android-/iOS-Builds und Geräteprüfung; serverseitiger Lernfortschritt statt Browserprofil; Import früherer lokaler Eigenbeiträge. Der Inhaltseditor ist kein Editor für eingebetteten Original-PDF-Text oder sämtliche fest programmierten UI-Texte. Weitere Details in SERVER-UND-MEDIEN.md.

## Arbeitsregel

Bei weiteren Arbeiten diesen Stand regelmäßig und vor größeren Abschnitten aktualisieren. Geprüfte Änderungen nach Tridiora/Rettungsapp pushen. Bei unvollständiger Arbeit offene Fehler, letzte erfolgreiche Checks und konkrete nächste Schritte hier festhalten; keinen erfolgreichen Upload oder Test behaupten, wenn er noch aussteht.
