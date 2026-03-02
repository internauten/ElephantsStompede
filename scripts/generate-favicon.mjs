import sharp from 'sharp';
import pngToIco from 'png-to-ico';
import { unlink, writeFile } from 'node:fs/promises';

const sourceGif = 'public/elephant.gif';
const tempPng = 'public/favicon-64.png';
const targetIco = 'public/favicon.ico';

async function generateFavicon() {
    await sharp(sourceGif, { pages: 1, page: 0 })
        .resize(64, 64, { fit: 'fill' })
        .png()
        .toFile(tempPng);

    const ico = await pngToIco([tempPng]);
    await writeFile(targetIco, ico);
    await unlink(tempPng);

    console.log('favicon.ico aktualisiert');
}

generateFavicon().catch((error) => {
    console.error('Fehler beim Generieren von favicon.ico:', error);
    process.exitCode = 1;
});
