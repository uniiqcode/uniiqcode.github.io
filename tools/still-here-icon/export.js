// docs/still-here/icon.svg から、アプリで使う全サイズの PNG を書き出す
const { chromium } = require('playwright'); const fs = require('fs');
(async () => {
  const root = process.argv[2], svg = fs.readFileSync(root + '/docs/still-here/icon.svg', 'utf8');
  const bg = '#F5F3EE', out = root + '/still-here/icons/';
  const b = await chromium.launch();
  const shot = async (name, w, h, html) => {
    const p = await b.newPage({ viewport: { width: w, height: h } });
    await p.setContent(`<html><body style="margin:0;background:${bg}">${html}</body></html>`);
    await p.screenshot({ path: out + name }); await p.close();
  };
  const sized = n => svg.replace('<svg ', `<svg width="${n}" height="${n}" style="display:block" `);
  for (const [name, n] of [['icon-512.png', 512], ['icon-192.png', 192], ['apple-touch-icon.png', 180], ['favicon-32.png', 32]]) await shot(name, n, n, sized(n));
  // 丸く切られる用: 中央80%の円に収まるよう、絵を78%に縮めて地の色の上に置く
  for (const [name, n] of [['icon-maskable-512.png', 512], ['icon-maskable-192.png', 192]]) {
    const s = Math.round(n * 0.78), m = (n - s) / 2;
    await shot(name, n, n, `<div style="padding:${m}px">${sized(s)}</div>`);
  }
  // SNSで共有した時の画像(1200×630)
  await shot('og-image.png', 1200, 630, `<div style="display:flex;justify-content:center;padding-top:15px">${sized(600)}</div>`);
  await b.close();
})();
