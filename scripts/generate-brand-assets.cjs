// Regenerate raster icons from the approved vector: node scripts/generate-brand-assets.cjs
const fs = require('node:fs');
const { chromium } = require('@playwright/test');
(async () => {
  const svg = fs.readFileSync('public/brand/mtr-roadster.svg', 'utf8');
  const browser = await chromium.launch({ headless: true });
  try {
    const page = await browser.newPage({ deviceScaleFactor: 1 });
    const pngs = [];
    for (const size of [16, 32, 48, 180, 192, 512]) {
      await page.setViewportSize({ width: size, height: size });
      await page.setContent(`<style>html,body{margin:0;width:100%;height:100%;background:${size >= 180 ? '#323437' : 'transparent'}}svg{display:block;width:100%;height:100%}</style>${svg}`);
      const png = await page.screenshot({ omitBackground: size < 180 });
      const name = size === 180 ? 'apple-touch-icon.png' : size < 180 ? `favicon-${size}.png` : `icon-${size}.png`;
      fs.writeFileSync(`public/brand/${name}`, png);
      if (size < 180) pngs.push({ size, png });
    }
    // ICO directory with PNG entries for legacy favicon discovery.
    const header = Buffer.alloc(6 + pngs.length * 16);
    header.writeUInt16LE(1, 2);
    header.writeUInt16LE(pngs.length, 4);
    let offset = header.length;
    pngs.forEach(({ size, png }, i) => {
      const entry = 6 + i * 16;
      header[entry] = header[entry + 1] = size;
      header.writeUInt16LE(1, entry + 4);
      header.writeUInt16LE(32, entry + 6);
      header.writeUInt32LE(png.length, entry + 8);
      header.writeUInt32LE(offset, entry + 12);
      offset += png.length;
    });
    fs.writeFileSync('app/favicon.ico', Buffer.concat([header, ...pngs.map(({ png }) => png)]));
  } finally { await browser.close(); }
})().catch(error => { console.error(error); process.exitCode = 1; });
