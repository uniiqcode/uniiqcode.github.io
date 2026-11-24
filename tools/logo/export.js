// ロゴからファビコン・アイコン・SNS 画像を書き出す（Playwright を使う）
// 使い方: node tools/logo/export.js .   （リポジトリの一番上で）
const fs = require('fs');
const path = require('path');
const { chromium } = require('playwright');

const root = path.resolve(process.argv[2] || '.');
const read = (p) => fs.readFileSync(path.join(root, p), 'utf8');
const mark = read('assets/logo/uniiqcode-u.svg');
const word = read('assets/logo/uniiqcode-wordmark.svg');
const inner = (svg) => svg.replace(/^[\s\S]*?<svg[^>]*>/, '').replace(/<\/svg>\s*$/, '');

// favicon.svg: 正方形の中に Uマーク。ダークモードでは黒い部分だけ白に（点のグレーはそのまま）
const fav = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 216 216"><style>.k{fill:#000}@media (prefers-color-scheme:dark){.k{fill:#fff}}</style><g transform="translate(27 0)">${inner(mark).replace(/fill="#000"/g, 'class="k"').replace(/\s*\n\s*/g, '')}</g></svg>\n`;
fs.writeFileSync(path.join(root, 'favicon.svg'), fav);

// 白い正方形の真ん中に Uマーク。ratio = 画像の高さに対する Uマークの高さ
const square = (size, ratio) => `<html><body style="margin:0;width:${size}px;height:${size}px;background:#fff;display:flex;align-items:center;justify-content:center"><img src="data:image/svg+xml;base64,${Buffer.from(mark).toString('base64')}" style="height:${size * ratio}px"></body></html>`;
const og = `<html><body style="margin:0;width:1200px;height:630px;background:#fff;display:flex;align-items:center;justify-content:center"><img src="data:image/svg+xml;base64,${Buffer.from(word).toString('base64')}" style="width:750px"></body></html>`;

const jobs = [
  ['apple-touch-icon.png', 180, square(180, 0.59)],
  ['assets/icons/uniiqcode-192.png', 192, square(192, 0.59)],
  ['assets/icons/uniiqcode-512.png', 512, square(512, 0.59)],
  ['assets/icons/uniiqcode-maskable-512.png', 512, square(512, 0.47)],
  ['tools/logo/favicon-32.png', 32, square(32, 0.82)],
  ['tools/logo/favicon-16.png', 16, square(16, 0.88)],
];

(async () => {
  const b = await chromium.launch();
  for (const [out, size, html] of jobs) {
    const p = await b.newPage({ viewport: { width: size, height: size } });
    await p.setContent(html);
    await p.screenshot({ path: path.join(root, out) });
    await p.close();
  }
  const p = await b.newPage({ viewport: { width: 1200, height: 630 } });
  await p.setContent(og);
  await p.screenshot({ path: path.join(root, 'assets/og-image.png') });
  await b.close();
  console.log('done. favicon.ico: convert tools/logo/favicon-16.png tools/logo/favicon-32.png favicon.ico');
})();
