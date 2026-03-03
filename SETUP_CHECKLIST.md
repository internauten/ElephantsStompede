# ElephantsStompede – Projekt neu aufsetzen (Checkliste)

Diese Checkliste rekonstruiert die wahrscheinlichen Schritte, mit denen das Projekt erstellt wurde.

## Voraussetzungen

- Node.js LTS installiert (inkl. npm)
- Git optional, falls du direkt ein Repository initialisieren willst

## 1) Neues Vite + TypeScript Projekt erstellen

```bash
npm create vite@latest elephantsstompede -- --template vanilla-ts
```

## 2) In den Projektordner wechseln

```bash
cd elephantsstompede
```

## 3) Abhängigkeiten installieren

```bash
npm install
```

## 4) PWA Plugin hinzufügen

```bash
npm install --save-dev vite-plugin-pwa
```

## 5) Tools für Icon/Favicon-Generierung hinzufügen

```bash
npm install --save-dev sharp png-to-ico
```

## 6) Scripts in package.json ergänzen

Folgende Scripts sollten enthalten sein:

```json
{
  "scripts": {
    "start": "vite",
    "dev": "vite",
    "favicon:generate": "node scripts/generate-favicon.mjs",
    "pwa-icons:generate": "node scripts/generate-pwa-icons.mjs",
    "build": "tsc && vite build",
    "preview": "vite preview"
  }
}
```

## 7) PWA-Konfiguration einbauen

- Vite-Konfig um `VitePWA(...)` erweitern
- Manifest + `includeAssets` setzen
- `base` über `process.env.BASE_PATH ?? '/'` unterstützen

## 8) PWA/Asset-Dateien bereitstellen

Im `public`-Ordner typischerweise:

- `elephant.gif`
- `elephant7.gif`
- `eier2min.png`
- `eier4min.png`
- `eier6min.png`
- `favicon.ico`
- `apple-touch-icon.png`
- `pwa-192.png`
- `pwa-512.png`
- `screenshot-mobile.png`
- `screenshot-wide.png`

## 9) Favicon und PWA-Icons generieren

```bash
npm run favicon:generate
npm run pwa-icons:generate
```

## 10) Entwicklung starten

```bash
npm run dev
```

## 11) Produktionsbuild prüfen

```bash
npm run build
npm run preview
```

## 12) (Optional) GitHub Pages vorbereiten

- Workflow-Datei für Pages Deployment anlegen
- `BASE_PATH` im Build je nach User-/Projektseite setzen

## 13) (Optional) Release per Tag

```bash
git tag v1.0.0
git push origin v1.0.0
```

---

## Quick-Start (alles kompakt)

```bash
npm create vite@latest elephantsstompede -- --template vanilla-ts
cd elephantsstompede
npm install
npm install --save-dev vite-plugin-pwa sharp png-to-ico
npm run dev
```
