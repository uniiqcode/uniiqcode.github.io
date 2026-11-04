/**
 * uniiqcode.github.io/weather/ - ここの天気 用 Service Worker
 * -----------------------------------------------------------------------
 * 範囲は weather/ のみ。登録は weather/index.html が行う。
 *
 * 方針: 自分のファイル(画面・app.js・アイコン)だけを stale-while-revalidate で保存する。
 *   予報API(Open-Meteo)と地名API・市区町村表(国土地理院)は別のサイトなので扱わない
 *   (古い予報を出さないため。前回の予報は app.js が localStorage に持っている)。
 *
 * ファイルを増やした・変えた時は APP_SHELL に足し、CACHE_NAME の番号を上げる。
 * -----------------------------------------------------------------------
 */

const CACHE_PREFIX = 'uniiqcode-weather-';
// v1(2026年11月): 初版(アプリ名「ここの天気」、文字入りアイコン)。
// v1→v2(2026年11月): 地名を「市区町村+町名」で出すようにした(app.js)。
// v2→v3(2026年11月): 地名用には正確な位置を送り、予報用は約1kmに丸めたまま(切り替えスイッチ付き)。
// v3→v4(2026年11月): 「6時間以内の雨」に雨雲レーダー(ウェザーニュース・tenki.jp・気象庁)へのリンクを足した。
const CACHE_NAME = CACHE_PREFIX + 'v4';

const APP_SHELL = [
  './',
  'index.html',
  'app.js',
  'manifest.json',
  'icons/icon-192.png',
  'icons/icon-512.png',
  'icons/icon-maskable-512.png',
  'icons/apple-touch-icon.png',
  'icons/favicon-32.png',
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
  if (new URL(event.request.url).origin !== self.location.origin) return; // 外部APIは素通し

  event.respondWith(
    caches.open(CACHE_NAME).then((cache) =>
      cache.match(event.request, { ignoreSearch: true }).then((cached) => {
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
