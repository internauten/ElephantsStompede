# Elephants Stompede

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
- Sequentielles Verschwinden mit Schrumpf-Animation.
- Reihenfolge: Vordergrund zuerst (reverse Einfügereihenfolge via `z-index`).
- Neustart per Button `Neu starten`.
- Installierbare PWA inkl. Manifest und Favicon.

## Wichtige Dateien

- `src/main.ts`: App-Logik, Positionierung, Verschwinden, Neustart.
- `src/style.css`: Layout, Button-Styling, Shrink-Animation.
- `vite.config.ts`: Vite- und PWA-Konfiguration.
- `public/elephant.gif`: Bildquelle für alle Elefanten.
- `public/favicon.ico`: Favicon für Browser/PWA.
- `scripts/generate-favicon.mjs`: Konvertierung GIF -> ICO.

## Konfiguration

Die wichtigsten Parameter findest du in `src/main.ts` und kannst sie direkt dort anpassen:

- `TOTAL_ELEPHANTS`: Anzahl der angezeigten Bilder.
- `SHRINK_DURATION_MS`: Dauer pro Bild bis zum vollständigen Verschwinden (in Millisekunden).
- `ELEPHANT_IMAGE_PATH`: Pfad zur verwendeten Bilddatei.

Beispiele:

- `SHRINK_DURATION_MS = 5000` entspricht 5 Sekunden.
- `TOTAL_ELEPHANTS = 20` zeigt 20 Bilder.

Hinweis: Die CSS-Animation übernimmt die Dauer automatisch aus `SHRINK_DURATION_MS`
und bleibt dadurch mit dem Entfernen der Bilder synchron.

## Entwicklung starten

```bash
npm install
npm start
```

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

## Hinweise

- Das Projekt referenziert das Favicon bereits in `index.html` und im PWA-Manifest (`vite.config.ts`).
- Wenn du nur einmalig konvertierst, kannst du die Tools danach wieder entfernen:

```bash
npm uninstall --save-dev sharp png-to-ico
```
