/**
 * uniiqcode.com/still-here/ - Still Here 用 Service Worker
 * 範囲は still-here/ のみ。自分のファイルだけを stale-while-revalidate で保存する。
 * 予報API(Open-Meteo)とラジオのストリームは別のサイトなので扱わない。
 * ファイルを増やした・変えた時は APP_SHELL に足し、CACHE_NAME の番号を上げる。
 */
const CACHE_PREFIX = 'uniiqcode-still-here-';
// v1(2026年11月): 初版。
// v1→v2(2026年11月): 文字を clock01 と同じ Shippori Mincho にした(fonts/ を追加)。
// v2→v3(2026年11月): ラジオを9局にし、ボタンを ON/OFF+9局の10個(5×2・同じ大きさ・小分類名)にした。
// v3→v4(2026年11月): 縦向きでラジオを画面の下に置き、時刻以外の文字を150%にした。
const CACHE_NAME = CACHE_PREFIX + 'v4';

const APP_SHELL = [
  './', 'index.html', 'app.js', 'manifest.json',
  'icons/icon.svg', 'icons/icon-192.png', 'icons/icon-512.png', 'icons/apple-touch-icon.png',
  'numerals/TN-0-v01.svg', 'numerals/TN-1-v01.svg', 'numerals/TN-2-v01.svg', 'numerals/TN-3-v01.svg',
  'numerals/TN-4-v01.svg', 'numerals/TN-5-v01.svg', 'numerals/TN-6-v01.svg', 'numerals/TN-7-v01.svg',
  'numerals/TN-8-v01.svg', 'numerals/TN-9-v01.svg',
  'fonts/shippori-mincho-latin-400-normal.woff2', 'fonts/shippori-mincho-japanese-400-normal.woff2',
];

self.addEventListener('install', (e) => {
  e.waitUntil(caches.open(CACHE_NAME).then((c) => c.addAll(APP_SHELL)).then(() => self.skipWaiting()));
});

self.addEventListener('activate', (e) => {
  e.waitUntil(caches.keys().then((keys) => Promise.all(
    keys.filter((k) => k.startsWith(CACHE_PREFIX) && k !== CACHE_NAME).map((k) => caches.delete(k))
  )).then(() => self.clients.claim()));
});

self.addEventListener('fetch', (e) => {
  const url = new URL(e.request.url);
  if (e.request.method !== 'GET' || url.origin !== self.location.origin) return;
  e.respondWith(caches.open(CACHE_NAME).then((cache) => cache.match(e.request).then((hit) => {
    const net = fetch(e.request).then((res) => {
      if (res && res.ok) cache.put(e.request, res.clone());
      return res;
    }).catch(() => hit);
    return hit || net;
  })));
});
