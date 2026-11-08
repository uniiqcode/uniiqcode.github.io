/*
 * 「ホーム画面に追加」ボタン（uniiqcode のアプリ共通）
 *
 * 使い方: アプリのページの </body> の前に1行入れる（data-app はボタンに出すアプリ名）
 *   <script src="https://uniiqcode.com/assets/a2hs.js" data-app="ゲーム" defer></script>
 *   （uniiqcode.github.io の中のページは相対パスでもよい: ../assets/a2hs.js）
 *
 * 動き:
 *   - ホーム画面から開いている時（standalone）は何も出さない
 *   - Android・パソコンの Chrome/Edge: ブラウザが「追加できる」と知らせてきた時だけボタンを出し、
 *     押すとブラウザの追加の確認がそのまま出る（beforeinstallprompt）
 *   - iPhone・iPad: ページから追加はできない（Apple の仕様）ので、押すと手順の案内を出す。
 *     LINE・Instagram などのアプリ内ブラウザでは追加できないので、Safari で開くよう案内する
 *   - それ以外（パソコンの Safari・Firefox など）: 出さない
 *   - ボタンの「×」で閉じると、そのアプリでは30日間出さない（localStorage、アプリの場所ごと）
 * 追加の条件: ページに manifest（名前・アイコン）があり、HTTPS で公開されていること
 */
(function () {
  'use strict';
  var me = document.currentScript;
  var appName = (me && me.getAttribute('data-app')) || document.title.split('｜')[0];
  var KEY = 'uniiqcode-a2hs-closed:' + location.pathname.replace(/[^/]*$/, '');
  var DAYS = 30;

  var standalone = (window.matchMedia && window.matchMedia('(display-mode: standalone)').matches) ||
                   window.navigator.standalone === true;
  if (standalone) return;

  function closedRecently() {
    try { var t = +localStorage.getItem(KEY); return t && Date.now() - t < DAYS * 864e5; } catch (e) { return false; }
  }
  function rememberClosed() { try { localStorage.setItem(KEY, String(Date.now())); } catch (e) {} }
  if (closedRecently()) return;

  var ua = navigator.userAgent;
  var isIOS = /iPhone|iPad|iPod/.test(ua) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
  var inApp = /Line\/|Instagram|FBAN|FBAV|Twitter|MicroMessenger/i.test(ua);
  var iosOther = /CriOS|EdgiOS|FxiOS/.test(ua);   // iPhone 版の Chrome・Edge・Firefox
  var isIPad = /iPad/.test(ua) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);

  var css =
    '.u-a2hs{position:fixed;left:50%;transform:translateX(-50%);bottom:calc(env(safe-area-inset-bottom) + 14px);z-index:2147483000;' +
    'display:flex;align-items:center;gap:2px;max-width:calc(100% - 24px);background:#fff;color:#1d2733;border-radius:999px;' +
    'box-shadow:0 2px 6px rgba(0,0,0,.18),0 6px 18px rgba(0,0,0,.18);font:600 14px/1.2 -apple-system,BlinkMacSystemFont,"Hiragino Sans","Noto Sans JP",sans-serif}' +
    '.u-a2hs button{all:unset;cursor:pointer;-webkit-tap-highlight-color:transparent}' +
    '.u-a2hs .u-go{display:flex;align-items:center;gap:8px;padding:10px 6px 10px 16px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}' +
    '.u-a2hs .u-go svg{flex:none;width:18px;height:18px}' +
    '.u-a2hs .u-x{padding:10px 14px 10px 8px;color:#7a8592;font-size:16px}' +
    '.u-a2hs-bg{position:fixed;inset:0;z-index:2147483001;background:rgba(0,0,0,.45);display:flex;align-items:flex-end;justify-content:center}' +
    '.u-a2hs-sheet{width:100%;max-width:440px;box-sizing:border-box;background:#fff;color:#1d2733;border-radius:18px 18px 0 0;' +
    'padding:20px 20px calc(env(safe-area-inset-bottom) + 18px);font:15px/1.6 -apple-system,BlinkMacSystemFont,"Hiragino Sans","Noto Sans JP",sans-serif}' +
    '.u-a2hs-sheet h2{margin:0 0 10px;font-size:17px}' +
    '.u-a2hs-sheet ol{margin:0;padding-left:1.4em}.u-a2hs-sheet li{margin:6px 0}' +
    '.u-a2hs-sheet .u-ic{display:inline-block;width:20px;height:20px;vertical-align:-4px;margin:0 2px}' +
    '.u-a2hs-sheet .u-ok{display:block;width:100%;margin-top:16px;padding:12px 0;border:0;border-radius:12px;background:#1d2733;color:#fff;font-family:inherit;font-weight:600;font-size:15px;line-height:1;cursor:pointer}';

  var ICON_ADD = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><rect x="3" y="3" width="18" height="18" rx="4"/><path d="M12 8v8M8 12h8"/></svg>';
  var ICON_SHARE = '<svg class="u-ic" viewBox="0 0 24 24" fill="none" stroke="#1f6fd1" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M8 9H6a2 2 0 0 0-2 2v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8a2 2 0 0 0-2-2h-2"/><path d="M12 3v12M8 7l4-4 4 4"/></svg>';

  function esc(s) { return String(s).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); }

  var bar;
  function showButton(onGo) {
    if (bar) return;
    var st = document.createElement('style'); st.textContent = css; document.head.appendChild(st);
    bar = document.createElement('div'); bar.className = 'u-a2hs';
    bar.innerHTML = '<button type="button" class="u-go">' + ICON_ADD + '<span>「' + esc(appName) + '」をホーム画面に追加</span></button>' +
                    '<button type="button" class="u-x" aria-label="閉じる">×</button>';
    bar.querySelector('.u-go').addEventListener('click', onGo);
    bar.querySelector('.u-x').addEventListener('click', function () { rememberClosed(); hideButton(); });
    document.body.appendChild(bar);
  }
  function hideButton() { if (bar) { bar.remove(); bar = null; } }

  function showGuide() {
    var steps;
    if (inApp) {
      steps = '<p>このアプリの中のブラウザからは追加できません。右上や右下のメニューから<b>「Safariで開く」</b>（または「ブラウザで開く」）を選び、Safari で開いてからもう一度このボタンを押してください。</p>';
    } else {
      var where = iosOther ? '画面右上（アドレス欄の右）' : (isIPad ? '画面右上' : '画面下');
      steps = '<ol>' +
        '<li>' + where + 'の共有ボタン ' + ICON_SHARE + ' を押す</li>' +
        '<li>メニューを上にずらして<b>「ホーム画面に追加」</b>を押す（見つからない時は「もっと見る」の中）</li>' +
        '<li>右上の<b>「追加」</b>を押す</li>' +
        '</ol>';
    }
    var bg = document.createElement('div'); bg.className = 'u-a2hs-bg';
    bg.innerHTML = '<div class="u-a2hs-sheet" role="dialog" aria-modal="true" aria-label="ホーム画面に追加する方法">' +
      '<h2>「' + esc(appName) + '」をホーム画面に追加</h2>' + steps +
      '<button type="button" class="u-ok">わかった</button></div>';
    function close() { bg.remove(); }
    bg.addEventListener('click', function (e) { if (e.target === bg) close(); });
    bg.querySelector('.u-ok').addEventListener('click', close);
    document.body.appendChild(bg);
  }

  if (isIOS) {
    showButton(showGuide);
    return;
  }

  var deferred = null;
  window.addEventListener('beforeinstallprompt', function (e) {
    e.preventDefault();
    deferred = e;
    showButton(function () {
      if (!deferred) return;
      deferred.prompt();
      Promise.resolve(deferred.userChoice).then(function (c) {
        if (c && c.outcome === 'accepted') hideButton();
      });
      deferred = null;
    });
  });
  window.addEventListener('appinstalled', hideButton);
})();
