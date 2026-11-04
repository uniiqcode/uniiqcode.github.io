/**
 * ここの天気(uniiqcode.github.io/weather/)
 * -----------------------------------------------------------------------
 * GPSで得た位置から、Open-Meteo の予報を取って4つの欄に表示する。
 *   1. 6時間以内の雨 … 降り始めの時刻(15分刻み)。降っている時は止む時刻
 *   2. 24時間       … 1時間ごとの雨量(mm/h)と気温
 *   3. 2〜3日目     … 3時間ごとの雨量(3時間の平均 mm/h)と気温
 *   4. 4〜7日目     … 1日ごとの天気と最高/最低気温
 *
 * Open-Meteo の雨量(precipitation)は「その時刻までの直前の区間の合計」。
 *   hourly の 15:00 の値 = 14:00〜15:00 に降る量
 *   minutely_15 の 15:00 の値 = 14:45〜15:00 に降る量
 * このため、表示では「区間の始まりの時刻」にずらしている。
 *
 * 日本の15分値は、Open-Meteo が1時間値などから補間したもの。降り始めの分は目安。
 * 送る位置:
 *   - 予報(Open-Meteo・海外)へは、常に小数2桁(約1km)に丸めて送る。予報の細かさは数km四方なので十分
 *   - 地名(国土地理院・国の機関)へは、正確な値(小数5桁=約1m)を送る。町名を正しく出すため。
 *     画面の一番下のスイッチを入れると、地名用も約1kmに丸める(設定は localStorage)
 * 前回の位置と予報は localStorage に置き、
 * 次に開いた時はまずそれを表示してから更新する。
 * -----------------------------------------------------------------------
 */
'use strict';

const STORE_KEY = 'uniiqcode-weather-v1';
const STALE_MS = 10 * 60 * 1000; // 画面に戻った時、これより古ければ取り直す
const RAIN_MIN = 0.1;            // これ以上(mm/区間)を「雨」とみなす

const $ = (id) => document.getElementById(id);

// ---- 天気コード(WMO) → 日本語と絵文字 --------------------------------
const WMO = {
  0: ['快晴', '☀️', '🌙'], 1: ['晴れ', '🌤️', '🌙'], 2: ['晴れ時々くもり', '⛅', '☁️'], 3: ['くもり', '☁️', '☁️'],
  45: ['霧', '🌫️'], 48: ['霧(着氷)', '🌫️'],
  51: ['弱い霧雨', '🌦️'], 53: ['霧雨', '🌦️'], 55: ['強い霧雨', '🌧️'],
  56: ['着氷性の霧雨', '🌧️'], 57: ['着氷性の霧雨', '🌧️'],
  61: ['弱い雨', '🌧️'], 63: ['雨', '🌧️'], 65: ['強い雨', '🌧️'],
  66: ['着氷性の雨', '🌧️'], 67: ['着氷性の強い雨', '🌧️'],
  71: ['弱い雪', '🌨️'], 73: ['雪', '🌨️'], 75: ['強い雪', '❄️'], 77: ['霧雪', '🌨️'],
  80: ['弱いにわか雨', '🌦️'], 81: ['にわか雨', '🌧️'], 82: ['激しいにわか雨', '⛈️'],
  85: ['弱いにわか雪', '🌨️'], 86: ['強いにわか雪', '❄️'],
  95: ['雷雨', '⛈️'], 96: ['雷雨(ひょう)', '⛈️'], 99: ['激しい雷雨(ひょう)', '⛈️'],
};
function wmo(code, isDay = 1) {
  const w = WMO[code] || ['不明', '・'];
  return { label: w[0], icon: (!isDay && w[2]) ? w[2] : w[1] };
}

// ---- 時刻 ----------------------------------------------------------------
// Open-Meteo は timezone=auto で "2026-11-03T15:00" のような現地時刻を返す。
// 端末の時刻帯に関係なく扱えるよう、数字だけを取り出して「UTCとして」Dateにする。
const parseLocal = (s) => {
  const [d, t] = s.split('T'); const [y, m, dd] = d.split('-').map(Number); const [hh, mi] = t.split(':').map(Number);
  return new Date(Date.UTC(y, m - 1, dd, hh, mi));
};
const WEEK = ['日', '月', '火', '水', '木', '金', '土'];
const hm = (d) => `${d.getUTCHours()}:${String(d.getUTCMinutes()).padStart(2, '0')}`;
const dayLabel = (d, today) => {
  const diff = Math.round((Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate()) - today) / 86400000);
  const base = `${d.getUTCMonth() + 1}/${d.getUTCDate()}(${WEEK[d.getUTCDay()]})`;
  return diff === 0 ? `今日 ${base}` : diff === 1 ? `明日 ${base}` : diff === 2 ? `あさって ${base}` : base;
};
const startOfDay = (d) => Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate());

// 予報地点の「いま」(現地時刻をUTCとして表した値)
function localNow(utcOffsetSeconds) {
  return new Date(Date.now() + utcOffsetSeconds * 1000);
}

// ---- 雨量の表示 ------------------------------------------------------------
function rainLevel(mmh) {
  if (mmh < RAIN_MIN) return 0;
  if (mmh < 1) return 1; if (mmh < 5) return 2; if (mmh < 10) return 3; if (mmh < 30) return 4; return 5;
}
function rainBar(mmh) {
  const lv = rainLevel(mmh);
  // 0〜10mm/hを0〜100%に(それ以上は100%)。少しでも降れば最低4pxは見せる
  const w = lv === 0 ? 0 : Math.max(4, Math.min(100, mmh * 10));
  const txt = lv === 0 ? '0' : mmh < 1 ? mmh.toFixed(1) : mmh.toFixed(mmh < 10 ? 1 : 0);
  return `<div class="bar"><div class="fill lv${lv}" style="width:${w}%;max-width:calc(100% - 4.5em)"></div>` +
    `<span class="val${lv ? ' wet' : ''}">${txt}${lv ? ' mm' : ''}</span></div>`;
}
const temp = (t) => (t == null ? '–' : `${Math.round(t)}°`);
const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));

// ---- 各欄の組み立て -------------------------------------------------------

// 1. 6時間以内の雨
function renderRainStart(data, now) {
  const end = new Date(now.getTime() + 6 * 3600000);
  // 区間 [start, end) と雨量 mm の並びを作る。15分値があればそれ、無ければ1時間値
  let slots = [], step = 15;
  const m = data.minutely_15;
  if (m && m.time && m.precipitation) {
    slots = m.time.map((t, i) => ({ end: parseLocal(t), mm: m.precipitation[i] }))
      .map((s) => ({ start: new Date(s.end.getTime() - 15 * 60000), end: s.end, mm: s.mm }))
      .filter((s) => s.mm != null && s.end > now && s.start < end);
    // 15分値が6時間先まで届いていなければ1時間値を使う
    if (!slots.length || slots[slots.length - 1].end < new Date(end.getTime() - 15 * 60000)) slots = [];
  }
  if (!slots.length) {
    step = 60;
    slots = data.hourly.time.map((t, i) => ({ end: parseLocal(t), mm: data.hourly.precipitation[i] }))
      .map((s) => ({ start: new Date(s.end.getTime() - 3600000), end: s.end, mm: s.mm }));
  }
  slots = slots.filter((s) => s.mm != null && s.end > now && s.start < end);
  const box = $('rainstart');
  if (!slots.length) { box.innerHTML = '<div class="msg">データがありません</div>'; return; }

  const wet = (s) => s.mm >= RAIN_MIN;
  const note = step === 15
    ? '15分ごとの予報から。時刻は目安です'
    : '1時間ごとの予報から。時刻は目安です';
  const fmt = (d) => `${hm(d)}`;

  let html;
  if (wet(slots[0])) {
    const dry = slots.find((s) => !wet(s));
    html = dry
      ? `<div class="big wet">いま雨。${fmt(dry.start)}ごろ止む見込み</div>`
      : `<div class="big wet">いま雨。6時間以内は止まない見込み</div>`;
  } else {
    const first = slots.find(wet);
    if (first) {
      const mins = Math.round((first.start - now) / 60000);
      const rel = mins < 60 ? `${Math.max(mins, 0)}分後` : `約${Math.round(mins / 60)}時間後`;
      // 降り始めから1時間の量をmm/hで示す
      const hourMm = slots.filter((s) => s.start >= first.start && s.start < new Date(first.start.getTime() + 3600000))
        .reduce((a, s) => a + s.mm, 0);
      html = `<div class="big wet">${fmt(first.start)}ごろ降り始め</div>` +
        `<div class="note">${rel}。はじめの1時間で ${hourMm.toFixed(1)} mm の見込み</div>`;
    } else {
      html = '<div class="big">6時間以内は降らない見込み</div>';
    }
  }
  box.innerHTML = html + `<div class="note">${note}</div>`;
}

// hourly の並びから「始まりの時刻 → 値」を引けるようにする
function hourlyIndex(data) {
  const h = data.hourly;
  const byTime = new Map();
  h.time.forEach((t, i) => byTime.set(parseLocal(t).getTime(), i));
  return { h, byTime };
}

// 2. 24時間
function renderHourly(data, now) {
  const { h, byTime } = hourlyIndex(data);
  const today = startOfDay(now);
  const first = new Date(Math.floor(now.getTime() / 3600000) * 3600000); // いまの時の始まり
  let html = '', lastDay = null;
  for (let k = 0; k < 24; k++) {
    const s = new Date(first.getTime() + k * 3600000);
    const iStart = byTime.get(s.getTime());
    const iEnd = byTime.get(s.getTime() + 3600000); // 区間 s〜s+1h の雨量・天気
    if (iStart == null || iEnd == null) continue;
    const d = startOfDay(s);
    if (d !== lastDay) { html += `<div class="day">${dayLabel(s, today)}</div>`; lastDay = d; }
    const w = wmo(h.weather_code[iEnd], h.is_day[iStart]);
    html += `<div class="t">${k === 0 ? 'いま' : s.getUTCHours() + '時'}</div>` +
      `<div class="i" title="${esc(w.label)}">${w.icon}</div>` +
      `<div class="temp">${temp(h.temperature_2m[iStart])}</div>` +
      rainBar(h.precipitation[iEnd] ?? 0);
  }
  $('hourly').innerHTML = html || '<div class="msg">データがありません</div>';
}

// 3. 2〜3日目(24時間後〜72時間後)を3時間ごと
function renderThreeHour(data, now) {
  const { h, byTime } = hourlyIndex(data);
  const today = startOfDay(now);
  const from = now.getTime() + 24 * 3600000, to = now.getTime() + 72 * 3600000;
  // 0,3,6…時にそろえる
  let t = Math.ceil(from / (3 * 3600000)) * 3 * 3600000;
  let html = '', lastDay = null;
  for (; t < to; t += 3 * 3600000) {
    const s = new Date(t);
    const iStart = byTime.get(t);
    const ends = [1, 2, 3].map((k) => byTime.get(t + k * 3600000));
    if (iStart == null || ends.some((i) => i == null)) continue;
    const sum = ends.reduce((a, i) => a + (h.precipitation[i] ?? 0), 0);
    // 3時間のうち一番「悪い」天気(コードが大きいほど悪い)を代表にする
    const code = Math.max(...ends.map((i) => h.weather_code[i] ?? 0));
    const d = startOfDay(s);
    if (d !== lastDay) { html += `<div class="day">${dayLabel(s, today)}</div>`; lastDay = d; }
    const w = wmo(code, h.is_day[ends[1]]);
    html += `<div class="t">${s.getUTCHours()}〜${(s.getUTCHours() + 3) % 24 || 24}時</div>` +
      `<div class="i" title="${esc(w.label)}">${w.icon}</div>` +
      `<div class="temp">${temp(h.temperature_2m[iStart])}</div>` +
      rainBar(sum / 3);
  }
  $('threehour').innerHTML = html || '<div class="msg">データがありません</div>';
}

// 4. 4〜7日目
function renderDaily(data, now) {
  const dl = data.daily;
  const today = startOfDay(now);
  let html = '';
  dl.time.forEach((t, i) => {
    const d = parseLocal(t + 'T00:00');
    const n = Math.round((d.getTime() - today) / 86400000);
    if (n < 3 || n > 6) return; // 今日を1日目として4〜7日目
    const w = wmo(dl.weather_code[i]);
    const dow = d.getUTCDay();
    const prob = dl.precipitation_probability_max?.[i];
    const sum = dl.precipitation_sum?.[i];
    const sub = [prob != null ? `${prob}%` : '', sum >= RAIN_MIN ? `${sum.toFixed(sum < 10 ? 1 : 0)} mm` : ''].filter(Boolean).join(' ・ ');
    // 例: 「80% ・ 20 mm」(降水確率と1日の雨量)
    html += `<div class="row"><div class="d${dow === 0 ? ' sun' : dow === 6 ? ' sat' : ''}">${d.getUTCMonth() + 1}/${d.getUTCDate()}(${WEEK[dow]})</div>` +
      `<div class="i">${w.icon}</div>` +
      `<div class="w">${esc(w.label)}${sub ? `<small>${sub}</small>` : ''}</div>` +
      `<div class="mm"><span class="hi">${temp(dl.temperature_2m_max[i])}</span> / <span class="lo">${temp(dl.temperature_2m_min[i])}</span></div></div>`;
  });
  $('daily').innerHTML = html || '<div class="msg">データがありません</div>';
}

function renderAll(state) {
  const { data, place, fetchedAt } = state;
  const now = localNow(data.utc_offset_seconds);
  renderRainStart(data, now);
  renderHourly(data, now);
  renderThreeHour(data, now);
  renderDaily(data, now);
  renderRadarLinks(state);
  $('place').textContent = place || `${state.lat}, ${state.lon}`;
  const f = new Date(fetchedAt);
  $('meta').textContent = `${f.getHours()}:${String(f.getMinutes()).padStart(2, '0')} 取得`;
}

// ---- 雨雲レーダーへのリンク(「6時間以内の雨」の欄の下) ----------------------
// ウェザーニュース: 市区町村ごとのページ /onebox/radar/<都道府県のローマ字>/<市区町村コード>/
//   (例: 東京都荒川区 → /onebox/radar/tokyo/13118/)。コードが無ければ全国のページ。
// tenki.jp: 「現在地の雨雲」のページ。位置は tenki.jp のページ自身が端末に尋ねる。
// 気象庁: 高解像度降水ナウキャスト。URLの # の後ろに緯度経度と縮尺を入れられる。
const PREF_ROMAJI = ['', 'hokkaido', 'aomori', 'iwate', 'miyagi', 'akita', 'yamagata', 'fukushima',
  'ibaraki', 'tochigi', 'gunma', 'saitama', 'chiba', 'tokyo', 'kanagawa', 'niigata', 'toyama', 'ishikawa',
  'fukui', 'yamanashi', 'nagano', 'gifu', 'shizuoka', 'aichi', 'mie', 'shiga', 'kyoto', 'osaka', 'hyogo',
  'nara', 'wakayama', 'tottori', 'shimane', 'okayama', 'hiroshima', 'yamaguchi', 'tokushima', 'kagawa',
  'ehime', 'kochi', 'fukuoka', 'saga', 'nagasaki', 'kumamoto', 'oita', 'miyazaki', 'kagoshima', 'okinawa'];
function renderRadarLinks(st) {
  const pref = st.muniCd ? PREF_ROMAJI[parseInt(st.muniCd.slice(0, 2), 10)] : '';
  const wn = pref ? `https://weathernews.jp/onebox/radar/${pref}/${st.muniCd}/` : 'https://weathernews.jp/onebox/radar/';
  const lat = st.pLat || st.lat, lon = st.pLon || st.lon;
  const jma = `https://www.jma.go.jp/bosai/nowc/#zoom:12/lat:${lat}/lon:${lon}/colordepth:normal/elements:hrpns`;
  const a = (href, label) => `<a href="${esc(href)}" target="_blank" rel="noopener">${label}</a>`;
  $('radar').innerHTML = '雨雲レーダー: ' +
    [a(wn, 'ウェザーニュース'), a('https://tenki.jp/map/', 'tenki.jp'), a(jma, '気象庁')].join(' ・ ');
}

// ---- 取得 -----------------------------------------------------------------
function getPosition() {
  return new Promise((resolve, reject) => {
    if (!('geolocation' in navigator)) { reject(new Error('この端末では位置を取得できません')); return; }
    navigator.geolocation.getCurrentPosition(
      (p) => resolve(p.coords),
      (e) => reject(new Error(e.code === 1 ? '位置情報の利用が許可されていません。ブラウザの設定で許可してください' : '位置を取得できませんでした')),
      { enableHighAccuracy: false, timeout: 15000, maximumAge: 5 * 60 * 1000 }
    );
  });
}

async function fetchForecast(lat, lon) {
  const q = new URLSearchParams({
    latitude: lat, longitude: lon, timezone: 'auto', forecast_days: '7',
    hourly: 'temperature_2m,precipitation,weather_code,is_day',
    minutely_15: 'precipitation', forecast_minutely_15: '32',
    daily: 'weather_code,temperature_2m_max,temperature_2m_min,precipitation_sum,precipitation_probability_max',
  });
  const r = await fetch(`https://api.open-meteo.com/v1/forecast?${q}`);
  if (!r.ok) throw new Error(`予報を取得できませんでした(${r.status})`);
  return r.json();
}

// 国土地理院の市区町村コード表(muni.js)を読み込む。1回だけ。
// 中身は GSI.MUNI_ARRAY["13101"] = '13,東京都,13101,千代田区' のような行の並び。
// 政令市の区は '14,神奈川県,14101,横浜市　鶴見区' のように市と区の間に空白がある。
// fetch ではなく <script> で読むので、相手のサイトのCORS設定に左右されない。
let muniPromise = null;
function loadMuni() {
  if (!muniPromise) {
    muniPromise = new Promise((resolve) => {
      window.GSI = window.GSI || {};
      const sc = document.createElement('script');
      sc.src = 'https://maps.gsi.go.jp/js/muni.js';
      sc.onload = () => resolve(window.GSI.MUNI_ARRAY || null);
      sc.onerror = () => { muniPromise = null; resolve(null); };
      document.head.appendChild(sc);
    });
  }
  return muniPromise;
}
function muniName(table, code) {
  if (!table || !code) return '';
  const row = table[code] || table[String(parseInt(code, 10))] || table[String(code).padStart(5, '0')];
  if (!row) return '';
  return (String(row).split(',')[3] || '').replace(/[\s　]/g, ''); // 都道府県は付けない
}

// 国土地理院の逆ジオコーダで「市区町村+町名」を得る(例: 横浜市鶴見区鶴見中央一丁目)。
// 取れなくても表示は続ける。
const PLACE_VER = 3; // 地名の作り方を変えたら上げる(保存してある古い地名を使わないため)
// 返すのは { name: 表示する地名, muniCd: 市区町村コード5桁(ウェザーニュースへのリンク用) }
async function fetchPlace(lat, lon) {
  try {
    const [r, table] = await Promise.all([
      fetch(`https://mreversegeocoder.gsi.go.jp/reverse-geocoder/LonLatToAddress?lat=${lat}&lon=${lon}`),
      loadMuni(),
    ]);
    if (!r.ok) return { name: '', muniCd: '' };
    const j = await r.json();
    const res = j.results || {};
    const town = res.lv01Nm && res.lv01Nm !== '－' ? res.lv01Nm : '';
    const muniCd = /^\d{4,5}$/.test(res.muniCd || '') ? String(res.muniCd).padStart(5, '0') : '';
    return { name: muniName(table, res.muniCd) + town, muniCd };
  } catch { return { name: '', muniCd: '' }; }
}

function load() { try { return JSON.parse(localStorage.getItem(STORE_KEY)); } catch { return null; } }
function save(s) { try { localStorage.setItem(STORE_KEY, JSON.stringify(s)); } catch { /* 保存できなくても動く */ } }

let state = load();
let busy = false;

async function refresh() {
  if (busy) return;
  busy = true; $('reload').disabled = true;
  $('meta').textContent = state ? '更新しています…' : '位置を取得しています…';
  try {
    let lat, lon, pLat, pLon; // lat/lon: 予報用(約1km)、pLat/pLon: 地名用
    try {
      const c = await getPosition();
      lat = c.latitude.toFixed(2); lon = c.longitude.toFixed(2); // 2桁≒1km
      const digits = roundOn() ? 2 : 5; // 5桁≒1m
      pLat = c.latitude.toFixed(digits); pLon = c.longitude.toFixed(digits);
    } catch (e) {
      if (!state) throw e;
      lat = state.lat; lon = state.lon; // 位置が取れなければ前回の場所で
      pLat = state.pLat || lat; pLon = state.pLon || lon;
    }
    const samePlace = state && state.pLat === pLat && state.pLon === pLon && state.place && state.placeVer === PLACE_VER;
    const [data, place] = await Promise.all([
      fetchForecast(lat, lon),
      samePlace ? Promise.resolve({ name: state.place, muniCd: state.muniCd }) : fetchPlace(pLat, pLon),
    ]);
    state = { lat, lon, pLat, pLon, place: place.name, muniCd: place.muniCd, placeVer: PLACE_VER, data, fetchedAt: Date.now() };
    save(state);
    renderAll(state);
  } catch (e) {
    if (state) {
      renderAll(state);
      $('meta').textContent += ` ・ ${e.message}`;
    } else {
      $('meta').innerHTML = `<span class="err">${esc(e.message)}</span>`;
      $('rainstart').innerHTML = '<div class="msg">表示できる予報がありません</div>';
    }
  } finally {
    busy = false; $('reload').disabled = false;
  }
}

// ---- 地名用の位置も丸めるかどうか(既定はオフ=地名には正確な位置) -----------
const ROUND_KEY = 'uniiqcode-weather-round';
function roundOn() { try { return localStorage.getItem(ROUND_KEY) === '1'; } catch { return false; } }
function showRoundNote() {
  $('roundNote').textContent = roundOn()
    ? 'オン: 地名も約1kmに丸めて送信(町名がずれることがあります)'
    : 'オフ: 地名には正確な位置を国土地理院へ送信(町名も正確)';
}
$('round').checked = roundOn();
showRoundNote();
$('round').addEventListener('change', (e) => {
  try { localStorage.setItem(ROUND_KEY, e.target.checked ? '1' : '0'); } catch { /* 保存できなくても今回は効く */ }
  showRoundNote();
  refresh();
});

$('reload').addEventListener('click', refresh);
document.addEventListener('visibilitychange', () => {
  if (document.visibilityState === 'visible' && (!state || Date.now() - state.fetchedAt > STALE_MS)) refresh();
});

if (state && state.data) { try { renderAll(state); } catch { state = null; } }
refresh();
