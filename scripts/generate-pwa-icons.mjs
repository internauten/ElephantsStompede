import sharp from 'sharp';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const currentDir = dirname(fileURLToPath(import.meta.url));
const projectRoot = resolve(currentDir, '..');
const source = resolve(projectRoot, 'public', 'elephant.gif');
const output192 = resolve(projectRoot, 'public', 'pwa-192.png');
const output512 = resolve(projectRoot, 'public', 'pwa-512.png');
const appleTouchIcon = resolve(projectRoot, 'public', 'apple-touch-icon.png');
const screenshotMobile = resolve(projectRoot, 'public', 'screenshot-mobile.png');
const screenshotWide = resolve(projectRoot, 'public', 'screenshot-wide.png');

await sharp(source, { animated: true, pages: 1 })
    .resize(192, 192, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } })
    .png()
    .toFile(output192);

await sharp(source, { animated: true, pages: 1 })
    .resize(512, 512, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } })
    .png()
    .toFile(output512);

await sharp(source, { animated: true, pages: 1 })
    .resize(180, 180, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } })
    .png()
    .toFile(appleTouchIcon);

await sharp(source, { animated: true, pages: 1 })
    .resize(750, 1334, { fit: 'contain', background: { r: 15, g: 23, b: 42, alpha: 1 } })
    .png()
    .toFile(screenshotMobile);

await sharp(source, { animated: true, pages: 1 })
    .resize(1280, 720, { fit: 'contain', background: { r: 15, g: 23, b: 42, alpha: 1 } })
    .png()
    .toFile(screenshotWide);

console.log('PWA assets generated:', output192, output512, appleTouchIcon, screenshotMobile, screenshotWide);