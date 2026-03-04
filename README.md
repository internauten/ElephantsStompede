# Elephants Stompede (oder Eieruhr)

[![GitHub Sponsors](https://img.shields.io/badge/Sponsor-GitHub%20Sponsors-ea4aaa?logo=githubsponsors&logoColor=white&style=flat-square)](https://github.com/sponsors/internauten) [![GitHub Repo stars](https://img.shields.io/github/stars/internauten/ElephantsStompede?style=flat-square)](https://github.com/internauten/ElephantsStompede/stargazers) [![GitHub release](https://img.shields.io/github/v/release/internauten/ElephantsStompede?style=flat-square)](https://github.com/internauten/ElephantsStompede/releases) [![Deploy to GitHub Pages](https://img.shields.io/github/actions/workflow/status/internauten/ElephantsStompede/deploy-pages.yml?branch=main&style=flat-square&label=deploy)](https://github.com/internauten/ElephantsStompede/actions/workflows/deploy-pages.yml) [![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg?style=flat-square)](LICENSE)

Eine Elefantenherde die sich langsam auflöst. Eine moderne Eieruhr!

## Sponsoring

Wenn dir dieses Projekt hilft oder gefällt, kannst du die Weiterentwicklung über GitHub Sponsors unterstützen:

- https://github.com/sponsors/internauten

## Projektbeschreibung

Diese App zeigt 20 Elefanten-Bilder zufällig über den gesamten Bildschirm verteilt.
Anschließend verschwinden die Bilder nacheinander: Immer das aktuell vorderste Bild
(zuletzt eingefügt) schrumpft über eine definierte Dauer auf 0 und wird entfernt.
Sobald ein Bild weg ist, startet der gleiche Ablauf mit dem nächsten, bis keine
Bilder mehr sichtbar sind. Über den Button **Neu starten** wird die Szene komplett
neu aufgebaut und der Ablauf beginnt von vorne.

Zusätzlich ist das Projekt als PWA konfiguriert und kann im Browser installiert
werden (Standalone-Modus mit Service Worker und Manifest).

## Funktionen

- 20 Bilder werden beim Start zufällig im Viewport positioniert.
- Dynamische Bildgröße basierend auf den echten Maßen von `public/elephant.gif`.
- Zeitsteuerung über Buttons `2 Minuten`, `4 Minuten`, `6 Minuten`.
- Sequentielles Verschwinden mit Schrumpf-Animation.
- Reihenfolge: Vordergrund zuerst (reverse Einfügereihenfolge via `z-index`).
- Neustart per Button `Neu starten`.
- Installierbare PWA inkl. Manifest und Favicon.

## Wichtige Dateien

- `src/main.ts`: App-Logik, Positionierung, Verschwinden, Neustart.
- `src/style.css`: Layout, Button-Styling, Shrink-Animation.
- `vite.config.ts`: Vite- und PWA-Konfiguration.
- `public/elephant.gif`: Bildquelle für alle Elefanten.
- `public/eier2min.png`, `public/eier4min.png`, `public/eier6min.png`: Transparente Icons für die Zeitbuttons.
- `public/favicon.ico`: Favicon für Browser/PWA.
- `scripts/generate-favicon.mjs`: Konvertierung GIF -> ICO.

## Konfiguration

Die wichtigsten Parameter findest du in `src/main.ts` und kannst sie direkt dort anpassen:

- `TOTAL_ELEPHANTS`: Anzahl der angezeigten Bilder.
- `DURATION_OPTIONS_MINUTES`: Auswahl der Gesamtzeit (Buttons).
- `ELEPHANT_IMAGE_PATH`: Pfad zur verwendeten Bilddatei.

Beispiele:

- `DURATION_OPTIONS_MINUTES = [2, 4, 6]` zeigt drei Zeitbuttons.
- `TOTAL_ELEPHANTS = 20` zeigt 20 Bilder.

Hinweis: Die Dauer pro Elefant wird automatisch aus der gewählten Gesamtzeit
berechnet (`Gesamtzeit / TOTAL_ELEPHANTS`). Damit verschwindet der letzte
Elefant exakt nach der ausgewählten Zeit.

## Entwicklung starten

```bash
npm install
npm start
```

## PWA-Installation auf iOS und Android

Voraussetzung: Die App läuft über `https://` (oder lokal über `localhost`).

### iOS (Safari)

1. App in Safari öffnen.
2. Auf **Teilen** tippen.
3. **Zum Home-Bildschirm** auswählen.
4. Optional Namen anpassen und mit **Hinzufügen** bestätigen.

### Android (Chrome)

1. App in Chrome öffnen.
2. Im Browser-Menü auf **App installieren** tippen.
   - Falls nicht sichtbar: **Zum Startbildschirm hinzufügen** wählen.
3. Installation bestätigen.

Hinweis: Nach der Installation startet die App im Standalone-Modus (ohne Browser-Adressleiste).
Für iOS wird zusätzlich ein `apple-touch-icon` verwendet (`public/apple-touch-icon.png`).

### Cache/Service Worker aktualisieren (bei neuen Assets)

Wenn Dateien im Cache fehlen oder nach einem Deploy alte Assets geladen werden:

#### Chrome (Desktop)

1. App öffnen.
2. DevTools öffnen (`F12`) -> **Application**.
3. Unter **Service Workers** auf **Update** klicken.
4. Unter **Storage** auf **Clear site data** klicken.
5. Seite mit `Ctrl+F5` hart neu laden.
6. Unter **Cache Storage** prüfen, ob die erwarteten Dateien enthalten sind.

#### Android (Chrome)

1. In Chrome die App-Seite öffnen.
2. Menü (`⋮`) -> **Website-Einstellungen** -> **Speicher & Cache**.
3. **Löschen** ausführen.
4. Seite neu öffnen und einmal warten, bis der Service Worker wieder aktiv ist.
5. Optional: installierte App vom Homescreen entfernen und erneut installieren.

#### iOS (Safari)

1. Falls installiert: App vom Home-Bildschirm löschen.
2. **Einstellungen -> Safari -> Verlauf und Websitedaten löschen**.
3. Safari neu öffnen und die Seite erneut aufrufen.
4. Erneut über **Teilen -> Zum Home-Bildschirm** installieren.

Hinweis: Das erste Laden nach Cache-Löschung benötigt Internet, danach läuft die PWA wieder offline.

### Troubleshooting (kurz)

- **Alter Service Worker aktiv:** In DevTools unter **Application -> Service Workers** auf **Update** klicken und Seite hart neu laden.
- **Falscher Base-Pfad:** Prüfen, ob `base` in `vite.config.ts` zur Deploy-URL passt (z. B. GitHub Pages Projektpfad).
- **Kein HTTPS:** Installation und SW funktionieren nur mit `https://` (Ausnahme: `localhost`).
- **Assets nicht im Precache:** In `vite.config.ts` unter `VitePWA(... includeAssets ...)` sicherstellen, dass alle benötigten Dateien gelistet sind.
- **Manifest/Icons veraltet:** Nach Icon-Änderungen `npm run pwa-icons:generate` und anschließend `npm run build` ausführen.

### Wenn "App installieren" in Chrome nicht erscheint

- Die Seite muss über `https://` laufen (Ausnahme: `localhost`).
- Für einen realistischen lokalen Test: zuerst `npm run build`, dann `npm run preview` und die Vorschau-URL öffnen.
- Auf Android kann die Option je nach Chrome-Version auch **Zum Startbildschirm hinzufügen** heißen.

## Deployment auf GitHub Pages

Der Workflow ist in `.github/workflows/deploy-pages.yml` hinterlegt.

### Einrichtung (einmalig)

1. Repository auf GitHub öffnen.
2. Unter **Settings > Pages** bei **Source** auf **GitHub Actions** stellen.
3. Sicherstellen, dass der Default-Branch `main` ist (oder den Workflow entsprechend anpassen).

### Deployment auslösen

- Automatisch bei Push auf `main`.
- Oder manuell über den Workflow **Deploy to GitHub Pages**.

Hinweis: Der Build-Pfad (`base`) wird im Workflow automatisch korrekt gesetzt:

- User/Org-Page (`<user>.github.io`) -> `/`
- Projektseite (`<user>.github.io/<repo>`) -> `/<repo>/`

## Release per Git-Tag

Der Release-Workflow liegt in `.github/workflows/release.yml` und wird bei Tag-Push gestartet.

### Gültiges Tag-Format (SemVer)

Erlaubte Beispiele:

- `v1.2.3`
- `v1.2.3-rc.1`
- `v1.2.3+build.5`

Nicht erlaubt sind z. B. `v1`, `v1.2` oder `release-1.2.3`.

### Release auslösen

```bash
git tag v1.0.0
git push origin v1.0.0
```

Der Workflow führt dann automatisch aus:

- `npm ci`
- `npm run build`
- ZIP-Erstellung aus `dist`
- GitHub Release inkl. automatisch generierter Release Notes und ZIP-Asset

## Favicon aus `elephant.gif` neu erzeugen

Ausgangsdatei: `public/elephant.gif`  
Zieldatei: `public/favicon.ico`

### 1) Konvertierungs-Tools installieren

```bash
npm install --save-dev sharp png-to-ico
```

### 2) ICO generieren (aus dem ersten GIF-Frame)

```bash
npm run favicon:generate
```

### 3) Build prüfen

```bash
npm run build
```

### Hinweise

- Das Projekt referenziert das Favicon bereits in `index.html` und im PWA-Manifest (`vite.config.ts`).
- Wenn du nur einmalig konvertierst, kannst du die Tools danach wieder entfernen:

```bash
npm uninstall --save-dev sharp png-to-ico
```

## Projektverlauf

Ca. 90% dieses Code wurde von GPT-5.3-Codex generiert. Insgesammt wurden ca. 4 Stunden aufgewendet.

## Bildnachweise / Third-Party Assets

- Datei: `public/elephant.gif`
- Quelle: [GIPHY Sticker – Canticos](https://giphy.com/stickers/Canticosworld-angry-ugh-canticos-JRVSYAvUeBh820WFtE)
- Hinweis: Rechte und Nutzungsbedingungen für dieses Asset liegen beim jeweiligen Rechteinhaber bzw. Plattformanbieter.
- Details: Siehe `THIRD_PARTY_NOTICES.md`.

## Lizenz

Dieses Projekt steht unter der MIT-Lizenz. Details siehe [`LICENSE`](LICENSE).

Copyright (c) 2026 die.internauten.ch
