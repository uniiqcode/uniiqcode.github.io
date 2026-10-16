/**
 * uniiqcode.github.io/games/ - シニアゲーム用 Service Worker
 * -----------------------------------------------------------------------
 * 置き場所: games/sw.js。範囲(スコープ)は games/ 全体で、メニュー
 * (games/index.html)とゲーム(games/solitaire/・games/sudoku/)をまとめて扱う。
 * 登録は games/index.html が行う。
 *
 * 方針: stale-while-revalidate
 *   - 保存してあるものがあれば即座に返す(圏外・機内モードでも遊べる)
 *   - 同時にバックグラウンドで最新版を取得し、次回の起動時に反映する
 *
 * ファイルを増やした・変えた時は APP_SHELL に足し、CACHE_NAME の番号を上げる。
 * パスはこのファイルからの相対パス(GitHub Pagesのサブフォルダで動かすため)。
 * 古いキャッシュの削除は、同じ接頭辞のものだけに限る。
 * -----------------------------------------------------------------------
 */

const CACHE_PREFIX = 'uniiqcode-games-';
// v1→v2(2026年10月): メニュー(index.html)からトップへ戻るリンクを外した。
// v2→v3(2026年10月): ソリティアを第4版(カードの数字を大きく)に更新し、
// アイコンを新しい絵(ハートのエースと「ゲーム」)に差し替えた。
// v3→v4(2026年10月): ソリティアを第5版(必ず全部完了できる「かんたん」を追加)に更新。
// v4→v5(2026年10月): アイコンを紫の背景・カード1枚・文字なしの絵に差し替えたため。
const CACHE_NAME = CACHE_PREFIX + 'v5';

const APP_SHELL = [
  './',
  'index.html',
  'manifest.json',
  'icons/icon-192.png',
  'icons/icon-512.png',
  'icons/apple-touch-icon.png',
  'icons/favicon-32.png',
  'icons/favicon-16.png',
  'solitaire/',
  'solitaire/index.html',
  'sudoku/',
  'sudoku/index.html',
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => cache.addAll(APP_SHELL))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(
        keys.filter((k) => k.startsWith(CACHE_PREFIX) && k !== CACHE_NAME)
          .map((k) => caches.delete(k))
      ))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') return;

  event.respondWith(
    caches.open(CACHE_NAME).then((cache) =>
      cache.match(event.request).then((cached) => {
        const networkFetch = fetch(event.request)
          .then((response) => {
            if (response && response.status === 200) cache.put(event.request, response.clone());
            return response;
          })
          .catch(() => cached);
        return cached || networkFetch;
      })
    )
  );
});
