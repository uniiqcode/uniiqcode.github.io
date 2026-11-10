/**
 * Still Here(uniiqcode.com/still-here/) 仕様: docs/still-here.md
 * -----------------------------------------------------------------------
 * 1枚の画面に 時刻・曜日・日付・日の出/日の入り・8時間以内の雨・ラジオ を出す。
 * iOS15 の Safari で動くよう、古めの書き方にとどめる(?. ?? などは使わない)。
 *
 * - 色: COLORS(0〜23時の固定表)から「時」で選ぶ。計算はしない。
 *       ?h=13 を付けると、その時の色で表示する(色の確認用)。
 * - 時刻: 数字だけ travelフォント(numerals/TN-0〜9-v01.svg)。秒は70%の大きさで下揃え。
 * - 雨・日の出/日の入り: Open-Meteo。位置はブラウザの位置情報(約1kmに丸めて送る)。15分ごとに取り直す。
 * - ラジオ: ON/OFF と選局10個。選んだ局は localStorage に記憶。
 * -----------------------------------------------------------------------
 */
(function () {
  'use strict';

  var $ = function (id) { return document.getElementById(id); };
  var pad2 = function (n) { return (n < 10 ? '0' : '') + n; };
  var WEEK = ['日', '月', '火', '水', '木', '金', '土'];
  var params = new URLSearchParams(location.search);

  // ---- 色(0〜23時の固定表) ---------------------------------------------
  // 基準は niisan.tv の Traveler Colors(昼 #F5F3EE / #2B2D30、夜 #12161A / #ECE8DF)。
  // 夜明け(5〜7時)と夕暮れ(16〜18時)をつなぐ色を足している。6〜18時が明るい「昼のグループ」、19〜5時が暗い「夜のグループ」。どの行も文字と背景の差が十分にあること。
  var COLORS = [
    ['#12161A', '#A8A49C'], //  0 深夜(0〜5時は寝室向けに文字を暗くする)
    ['#111519', '#8F8B84'], //  1
    ['#101418', '#86837C'], //  2 いちばん暗い
    ['#11161B', '#8F8B84'], //  3
    ['#151B23', '#A8A49C'], //  4 夜明け前
    ['#1F2A36', '#C9C5BC'], //  5 藍の夜明け
    ['#D8DCE0', '#24282E'], //  6 白む空
    ['#E9E8E3', '#2A2C30'], //  7 朝
    ['#F1EFEA', '#2B2D30'], //  8
    ['#F5F3EE', '#2B2D30'], //  9 昼(基準)
    ['#F5F3EE', '#2B2D30'], // 10
    ['#F5F3EE', '#2B2D30'], // 11
    ['#F6F4EF', '#2B2D30'], // 12
    ['#F5F3EE', '#2B2D30'], // 13
    ['#F4F1EA', '#2B2D30'], // 14
    ['#F1ECE2', '#2C2C2D'], // 15 午後
    ['#EBE1D0', '#2E2B28'], // 16 傾く日
    ['#E2CDB4', '#2F2924'], // 17 夕焼け
    ['#CFAE92', '#2B2420'], // 18 夕暮れ(昼のグループの最後)
    ['#2B2730', '#EFE6DC'], // 19 宵(夜のグループの最初)
    ['#181B21', '#ECE8DF'], // 20
    ['#15191E', '#ECE8DF'], // 21
    ['#13171C', '#ECE8DF'], // 22
    ['#12161A', '#ECE8DF']  // 23
  ];
  function hexRgb(h) { return [1, 3, 5].map(function (i) { return parseInt(h.substr(i, 2), 16); }); }
  function mixHex(a, b, t) {
    var x = hexRgb(a), y = hexRgb(b);
    return '#' + x.map(function (v, i) { var n = Math.round(v + (y[i] - v) * t); return (n < 16 ? '0' : '') + n.toString(16); }).join('');
  }
  function luminance(h) {
    var c = hexRgb(h).map(function (v) { v /= 255; return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4); });
    return 0.2126 * c[0] + 0.7152 * c[1] + 0.0722 * c[2];
  }
  function contrast(a, b) { var x = luminance(a), y = luminance(b); return (Math.max(x, y) + 0.05) / (Math.min(x, y) + 0.05); }
  var forcedHour = params.has('h') ? parseInt(params.get('h'), 10) : NaN;
  var shownHour = -1;
  function applyColor(hour) {
    if (forcedHour >= 0 && forcedHour <= 23) hour = forcedHour;
    if (hour === shownHour) return;
    shownHour = hour;
    var c = COLORS[hour];
    var root = document.documentElement.style;
    root.setProperty('--bg', c[0]);
    root.setProperty('--fg', c[1]);
    // SLEEP ボタン用: 背景色と文字色のちょうど中間の色。その上の文字は、中間色とのコントラストが高い方(文字色か背景色)
    var mid = mixHex(c[0], c[1], 0.5);
    root.setProperty('--mid', mid);
    root.setProperty('--mid-fg', contrast(mid, c[1]) >= contrast(mid, c[0]) ? c[1] : c[0]);
    var meta = document.querySelector('meta[name="theme-color"]');
    if (meta) meta.setAttribute('content', c[0]);
  }

  // ---- 時刻(travelフォント) ---------------------------------------------
  var digitSvg = {}; // '0' → '<svg ...>'
  function loadDigits() {
    var jobs = [];
    for (var d = 0; d <= 9; d++) {
      (function (ch) {
        jobs.push(fetch('numerals/TN-' + ch + '-v01.svg').then(function (r) { return r.text(); }).then(function (t) {
          var vb = /viewBox="([^"]+)"/.exec(t);
          var g = /<g[\s\S]*<\/g>/.exec(t);
          digitSvg[ch] = '<svg viewBox="' + (vb ? vb[1] : '0 0 800 1600') + '" aria-hidden="true">' + (g ? g[0] : '') + '</svg>';
        }));
      })(String(d));
    }
    return Promise.all(jobs);
  }

  var slots = null, lastDigits = '';
  function buildTime() {
    var box = $('time');
    box.innerHTML = '';
    slots = [];
    var mk = function (parent) { var s = document.createElement('span'); s.className = 'slot'; parent.appendChild(s); slots.push(s); };
    mk(box); mk(box);
    var colon = document.createElement('span');
    colon.className = 'slot colon';
    colon.innerHTML = '<i></i><i></i>';
    box.appendChild(colon);
    mk(box); mk(box);
    var sec = document.createElement('span');
    sec.className = 'sec';
    box.appendChild(sec);
    mk(sec); mk(sec);
  }
  function renderTime(now) {
    var s = pad2(now.getHours()) + pad2(now.getMinutes()) + pad2(now.getSeconds());
    $('time').setAttribute('aria-label', now.getHours() + '時' + now.getMinutes() + '分' + now.getSeconds() + '秒');
    if (!slots) buildTime();
    for (var i = 0; i < 6; i++) {
      if (s[i] !== lastDigits[i] && digitSvg[s[i]]) slots[i].innerHTML = digitSvg[s[i]];
    }
    if (digitSvg['0']) lastDigits = s;
  }

  var lastDay = '';
  function renderDate(now) {
    var key = now.getFullYear() + '-' + now.getMonth() + '-' + now.getDate();
    if (key === lastDay) return;
    lastDay = key;
    $('date').textContent = (now.getMonth() + 1) + '月' + now.getDate() + '日 ' + WEEK[now.getDay()] + '曜日';
    if (forecast) renderSun(forecast);
  }

  // ---- 焼き付き対策: 1時間ごとに画面全体を数ピクセルずらす ------------------
  // 同じ配置を何か月も点けっぱなしにすると、有機ELなどで文字の跡が残るため。見た目はほぼ変わらない。
  var SHIFTS = [[0, 0], [4, 2], [-3, 4], [5, -3], [-4, -2], [2, 5], [-5, 1], [3, -4], [-2, -5], [1, 3], [-1, -3], [4, 4]];
  var shiftedHour = -1;
  function applyShift(hour) {
    if (hour === shiftedHour) return;
    shiftedHour = hour;
    var d = SHIFTS[hour % SHIFTS.length];
    document.querySelector('main').style.transform = 'translate(' + d[0] + 'px,' + d[1] + 'px)';
  }

  function tick() {
    var now = new Date();
    applyColor(now.getHours());
    applyShift(now.getHours());
    renderTime(now);
    renderDate(now);
    setTimeout(tick, 1000 - (Date.now() % 1000) + 10);
  }

  // ---- 雨予報・日の出/日の入り(Open-Meteo) ------------------------------
  var STORE_FC = 'still-here-forecast-v1';
  var REFRESH_MS = 15 * 60 * 1000;
  var RAIN_HOURS = 8, RAIN_MIN = 0.1;
  var forecast = null, fetchedAt = 0, refreshTimer = null;

  // Open-Meteo は timezone=auto で現地時刻の文字列を返す。数字だけ取り出して「UTCとして」扱う。
  function parseLocal(s) {
    var p = s.split('T'), d = p[0].split('-'), t = (p[1] || '00:00').split(':');
    return new Date(Date.UTC(+d[0], d[1] - 1, +d[2], +t[0], +t[1]));
  }
  function hmUTC(d) { return d.getUTCHours() + ':' + pad2(d.getUTCMinutes()); }
  // 端末の「いま」を、予報と同じ「現地時刻をUTCとして」の形にする
  function nowLocal(data) {
    var off = (data && typeof data.utc_offset_seconds === 'number') ? data.utc_offset_seconds : -new Date().getTimezoneOffset() * 60;
    return new Date(Date.now() + off * 1000);
  }

  function renderSun(data) {
    var dl = data.daily;
    if (!dl || !dl.time) return;
    var today = nowLocal(data).toISOString().slice(0, 10);
    var i = dl.time.indexOf(today);
    if (i < 0) i = 0;
    $('sunrise').textContent = dl.sunrise && dl.sunrise[i] ? hmUTC(parseLocal(dl.sunrise[i])) : '--:--';
    $('sunset').textContent = dl.sunset && dl.sunset[i] ? hmUTC(parseLocal(dl.sunset[i])) : '--:--';
  }

  // 雨量は「その時刻までの直前の区間の合計」なので、区間の始まりにずらして扱う(weather/app.js と同じ)
  function rainText(data) {
    var now = nowLocal(data);
    var end = new Date(now.getTime() + RAIN_HOURS * 3600000);
    var slotsR = [];
    var m = data.minutely_15;
    if (m && m.time && m.precipitation) {
      slotsR = m.time.map(function (t, i) { var e = parseLocal(t); return { start: new Date(e.getTime() - 900000), end: e, mm: m.precipitation[i] }; })
        .filter(function (s) { return s.mm != null && s.end > now && s.start < end; });
      if (!slotsR.length || slotsR[slotsR.length - 1].end < new Date(end.getTime() - 900000)) slotsR = [];
    }
    if (!slotsR.length) {
      slotsR = data.hourly.time.map(function (t, i) { var e = parseLocal(t); return { start: new Date(e.getTime() - 3600000), end: e, mm: data.hourly.precipitation[i] }; })
        .filter(function (s) { return s.mm != null && s.end > now && s.start < end; });
    }
    if (!slotsR.length) return ['データがありません'];
    var wet = function (s) { return s.mm >= RAIN_MIN; };
    if (wet(slotsR[0])) {
      var dry = slotsR.filter(function (s) { return !wet(s); })[0];
      return dry ? ['いま雨。', hmUTC(dry.start) + 'ごろ止む見込み'] : ['いま雨。', '8時間以内は止まない見込み'];
    }
    var first = slotsR.filter(wet)[0];
    return first ? [hmUTC(first.start) + 'ごろ', '雨が降り始める見込み'] : ['8時間以内は', '雨の予想なし'];
  }

  function renderForecast() {
    if (!forecast) return;
    // 文を意味のかたまりごとに分け、2行になる時はかたまりの切れ目で折り返す
    var box = $('rain-main');
    box.innerHTML = '';
    rainText(forecast).forEach(function (t) {
      var sp = document.createElement('span');
      sp.className = 'chunk';
      sp.textContent = t;
      box.appendChild(sp);
    });
    var f = new Date(fetchedAt);
    $('rain-sub').textContent = f.getHours() + ':' + pad2(f.getMinutes()) + '更新';
    renderSun(forecast);
    alignRight();
  }

  function getPosition() {
    return new Promise(function (resolve, reject) {
      if (!('geolocation' in navigator)) { reject(new Error('この端末では位置情報が使えません')); return; }
      navigator.geolocation.getCurrentPosition(
        function (p) { resolve(p.coords); },
        function (e) { reject(new Error(e.code === 1 ? '雨予報には位置情報の許可が必要です' : '位置を取得できませんでした')); },
        { enableHighAccuracy: false, timeout: 15000, maximumAge: 30 * 60 * 1000 }
      );
    });
  }

  function fetchForecast(lat, lon) {
    var q = new URLSearchParams({
      latitude: lat.toFixed(2), longitude: lon.toFixed(2), timezone: 'auto', forecast_days: '2',
      hourly: 'precipitation', minutely_15: 'precipitation', forecast_minutely_15: '36',
      daily: 'sunrise,sunset'
    });
    return fetch('https://api.open-meteo.com/v1/forecast?' + q.toString()).then(function (r) {
      if (!r.ok) throw new Error('予報を取得できませんでした(' + r.status + ')');
      return r.json();
    });
  }

  function refresh() {
    clearTimeout(refreshTimer);
    refreshTimer = setTimeout(refresh, REFRESH_MS);
    return getPosition().then(function (c) { return fetchForecast(c.latitude, c.longitude); }).then(function (data) {
      forecast = data;
      fetchedAt = Date.now();
      try { localStorage.setItem(STORE_FC, JSON.stringify({ data: data, at: fetchedAt })); } catch (e) {}
      renderForecast();
    }).catch(function (e) {
      if (forecast) {
        $('rain-sub').textContent = $('rain-sub').textContent.replace(/( ・ 更新できません)?$/, ' ・ 更新できません');
      } else {
        $('rain-main').textContent = e.message || '雨予報を取得できませんでした';
      }
    });
  }

  function restoreForecast() {
    try {
      var s = JSON.parse(localStorage.getItem(STORE_FC) || 'null');
      if (s && s.data && Date.now() - s.at < 2 * 3600000) { forecast = s.data; fetchedAt = s.at; renderForecast(); }
    } catch (e) {}
  }

  // ---- ラジオ ------------------------------------------------------------
  // url: 再生するストリーム。pls があれば、起動時にその中身(File1=)を読んで url を置き換える
  // (相手のサイトが許せば。読めなければ url のまま)。
  // label: ボタンに出す名前(stations.txt の小分類)
  var STATIONS = [
    { label: 'Ambient-Chillout', name: 'Groove Salad (SomaFM)', url: 'https://ice1.somafm.com/groovesalad-256-mp3', pls: 'https://somafm.com/groovesalad256.pls' },
    { label: 'Classic-Rock', name: 'Left Coast 70s (SomaFM)', url: 'https://ice1.somafm.com/seventies-320-mp3', pls: 'https://somafm.com/seventies320.pls' },
    { label: 'Classic-Vinyl', name: 'WALM Classic Vinyl HD', url: 'https://icecast.walmradio.com:8443/classic' },
    { label: 'Pop-Europe', name: 'PureClassix Radio', url: 'https://mscp4.live-streams.nl:8142/live.mp3' },
    { label: 'Smooth-Jazz\u00a01', name: 'SmoothJazz.com.pl', url: 'https://bcast.vigormultimedia.com:48888/sjcompl320mp3' },
    { label: 'Smooth-Jazz\u00a02', name: 'RelaxingJazz.com', url: 'https://443-1.autopo.st/171/stream/3/' },
    { label: 'Meditation', name: 'SmoothLounge.com', url: 'https://smoothjazz.cdnstream1.com/2586_320.mp3', pls: 'https://www.smoothjazz.com/streams/smoothlounge_256.pls' },
    { label: 'Bossa-Nova', name: 'Bossa Beyond (SomaFM)', url: 'https://ice1.somafm.com/bossa-256-mp3', pls: 'https://somafm.com/bossa256.pls' },
    { label: 'Classical-Audiophile', name: 'Naim Classical', url: 'https://mscp3.live-streams.nl:8252/class-high.aac' }
  ];
  var STORE_ST = 'still-here-station-v2'; // v2: 局を9局にした(番号の意味が変わったため)
  var audio = $('audio');
  // 先頭のボタンは押すたびに OFF → ON → SLEEP → OFF と変わる。
  // SLEEP: 60分再生して自動で OFF。局を切り替えても残り時間はそのまま。手動で OFF にすると取り消し。
  var SLEEP_MS = 60 * 60 * 1000;
  var selected = 0, mode = 'off', isOn = false, sleepEnd = 0, sleepTimer = null, buttons = [];
  try { var saved = parseInt(localStorage.getItem(STORE_ST), 10); if (saved >= 0 && saved < STATIONS.length) selected = saved; } catch (e) {}

  function resolvePls() {
    STATIONS.forEach(function (st) {
      if (!st.pls) return;
      fetch(st.pls).then(function (r) { return r.ok ? r.text() : ''; }).then(function (t) {
        var m = /^File1=(https:\/\/\S+)/m.exec(t);
        if (m) st.url = m[1];
      }).catch(function () {});
    });
  }

  function setState(text) { $('radio-state').textContent = text; }

  function renderRadio() {
    buttons.forEach(function (b, i) { b.className = i === selected ? 'on' : ''; b.setAttribute('aria-pressed', i === selected ? 'true' : 'false'); });
    var p = $('power');
    if (mode === 'sleep') {
      p.innerHTML = 'SLEEP<small id="sleep-left"></small>';
      renderSleepLeft();
    } else {
      p.textContent = mode === 'on' ? 'ON' : 'OFF';
    }
    p.className = 'power' + (mode === 'on' ? ' on' : mode === 'sleep' ? ' sleep' : '');
    p.setAttribute('aria-pressed', isOn ? 'true' : 'false');
  }
  // 残り時間(分)。秒は四捨五入
  function renderSleepLeft() {
    var el = $('sleep-left');
    if (!el) return;
    var left = Math.max(0, sleepEnd - Date.now());
    el.textContent = Math.round(left / 60000) + ' min';
  }
  function checkSleep() {
    if (mode !== 'sleep') return;
    if (Date.now() >= sleepEnd) setMode('off'); else renderSleepLeft();
  }
  function setMode(m) {
    var wasOn = isOn;
    mode = m;
    isOn = m !== 'off';
    clearInterval(sleepTimer);
    if (m === 'sleep') {
      sleepEnd = Date.now() + SLEEP_MS;
      sleepTimer = setInterval(checkSleep, 1000); // スリープから戻った時も時刻で判定するので、ずれない
    } else {
      sleepEnd = 0;
    }
    renderRadio();
    if (isOn && !wasOn) connect();
    if (!isOn && wasOn) disconnect();
  }

  function connect() {
    var st = STATIONS[selected];
    setState('接続中…');
    audio.src = st.url;
    var pr = audio.play();
    if (pr && pr.catch) pr.catch(function () { if (isOn) setState('つながりませんでした'); });
  }
  function disconnect() {
    audio.pause();
    audio.removeAttribute('src');
    audio.load(); // 接続を切る
    setState('');
  }

  function buildRadio() {
    var box = $('buttons');
    STATIONS.forEach(function (st, i) {
      var b = document.createElement('button');
      b.type = 'button';
      // ハイフンの後ろで折り返せるようにする(長い名前が2行になる)
      b.innerHTML = st.label.replace(/-/g, '-<wbr>');
      b.title = st.name;
      b.addEventListener('click', function () {
        selected = i;
        try { localStorage.setItem(STORE_ST, String(i)); } catch (e) {}
        renderRadio();
        if (isOn) connect(); // 再生中なら、すぐ切り替える
      });
      box.appendChild(b);
      buttons.push(b);
    });
    $('power').addEventListener('click', function () {
      setMode(mode === 'off' ? 'on' : mode === 'on' ? 'sleep' : 'off');
    });
    audio.addEventListener('playing', function () { if (isOn) setState(STATIONS[selected].name); });
    audio.addEventListener('waiting', function () { if (isOn) setState('接続中…'); });
    audio.addEventListener('error', function () { if (isOn && audio.getAttribute('src')) setState('つながりませんでした'); });
    renderRadio();
  }

  // ---- 横向き: 右の列(雨予報+ラジオ)の下端を、日の出・日の入りの下端にそろえる ----
  // 描画された位置を実測し、右の列をまとめて上下にずらす(状態の1行も含めた下端で合わせる)。
  function alignRight() {
    var rain = document.querySelector('.rain'), radio = document.querySelector('.radio');
    rain.style.transform = radio.style.transform = '';
    if (window.innerWidth <= window.innerHeight) return; // 縦向きでは何もしない
    var d = document.querySelector('.sun').getBoundingClientRect().bottom - radio.getBoundingClientRect().bottom;
    var t = 'translateY(' + Math.round(d) + 'px)';
    rain.style.transform = radio.style.transform = t;
  }
  var alignTimer = null;
  function alignSoon() { clearTimeout(alignTimer); alignTimer = setTimeout(alignRight, 100); }
  window.addEventListener('resize', alignSoon);
  window.addEventListener('orientationchange', alignSoon);
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(alignRight);

  // ---- 起動 --------------------------------------------------------------
  applyColor(new Date().getHours());
  buildTime();
  buildRadio();
  restoreForecast();
  loadDigits().then(function () { lastDigits = ''; renderTime(new Date()); });
  tick();
  alignRight();
  setTimeout(function () { document.body.className = 'ready'; }, 50);
  refresh();
  resolvePls();

  // 画面に戻った時、15分より古ければ取り直す(スリープ中は setTimeout が止まるため)
  document.addEventListener('visibilitychange', function () {
    if (document.visibilityState === 'visible' && Date.now() - fetchedAt > REFRESH_MS) refresh();
  });

  if ('serviceWorker' in navigator && location.protocol === 'https:') {
    navigator.serviceWorker.register('sw.js').catch(function () {});
  }
  if (params.get('debug') === '1') {
    var dbg = document.createElement('div');
    dbg.className = 'debug';
    document.body.appendChild(dbg);
    setInterval(function () { dbg.textContent = 'h=' + shownHour + ' st=' + selected + ' ' + (audio.currentSrc || ''); }, 1000);
  }
})();
