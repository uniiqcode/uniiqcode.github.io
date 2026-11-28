/*
 * 画面右上の「i」ボタン →「ホーム画面に追加するには」の案内（uniiqcode のアプリ共通）
 * 花しらべ（uniiqcode/hana-shirabe）で作ったものを、全アプリで使えるようにした部品。
 *
 * 使い方: アプリのページの </body> の前に1行入れる
 *   <script src="https://uniiqcode.com/assets/home-guide.js" data-app="ゲーム" data-url="https://uniiqcode.com/games/" defer></script>
 *   （uniiqcode.github.io の中のページは相対パスでもよい: ../assets/home-guide.js）
 *
 *   data-app    案内に出すアプリの名前（無ければ <title> の「｜」より前）
 *   data-url    コピーする URL（無ければ今のページのフォルダの URL）
 *   data-target ボタンを置く場所（CSS セレクタ）。無ければページの右上に置く（スクロールすると一緒に動く）
 *   data-where  data-target に対して置く位置: append（中の最後・既定）/ prepend / before / after
 *   data-lang   案内の言葉: ja / en / ko / zh-Hant（無ければ <html lang> から。わからなければ ja）
 *
 * 色はページの CSS で変えられる（:root などに書く。ダークモードの切り替えもページ側で）
 *   --hg-accent     ボタンの線と字・見出し・コピーのボタン（既定 #1d2733）
 *   --hg-btn-bg     ボタンの背景（既定 #fff）
 *   --hg-btn-ink    ボタンの字と線（既定 --hg-accent）
 *   --hg-card       案内の背景（既定 #fff）
 *   --hg-ink        案内の字（既定 #1d2733）
 *   --hg-sub        案内の薄い字（既定 #6b7280）
 *   --hg-line       区切り線・URL の欄の線（既定 rgba(0,0,0,.12)）
 *   --hg-field      URL の欄の背景（既定 #f5f5f5）
 *   --hg-on-accent  コピーのボタンの字（既定 #fff）
 *   --hg-head-font  見出しの字体（既定はページと同じ）
 *   --hg-top / --hg-right  右上に置く時の位置（既定 12px / 12px。上はノッチの分を足す）
 *
 * 動き: ボタンはいつも出す（ホーム画面から開いている時も。URL をコピーして人に教えられるように）。
 *       外側（暗いところ）・×・「閉じる」で閉じる。写真や入力などは何も記録しない。
 */
(function () {
  'use strict';
  var me = document.currentScript;
  function attr(n) { return me ? me.getAttribute(n) : null; }

  var appName = attr('data-app') || document.title.split(/[｜|]/)[0].trim();
  var url = attr('data-url') || (location.origin + location.pathname.replace(/[^/]*$/, ''));

  var lang = (attr('data-lang') || document.documentElement.lang || 'ja').toLowerCase();
  if (/^zh/.test(lang)) lang = 'zh-Hant';
  else if (/^ko/.test(lang)) lang = 'ko';
  else if (/^en/.test(lang)) lang = 'en';
  else lang = 'ja';

  var T = {
    ja: {
      btn: 'ホーム画面に追加する方法',
      title: 'ホーム画面に追加するには',
      inApp: 'LINE・Instagram・X などのアプリからリンクを開いた時は、その画面からは追加できません。下のURLをコピーしてから、<strong>Chrome</strong>（Android）か <strong>Safari</strong>（iPhone）で開き直してください。',
      urlLabel: '{app}のURL',
      copy: 'URLをコピー',
      copied: 'コピーしました。ブラウザのURLの欄に貼り付けてください。',
      failed: 'コピーできませんでした。URLを長押ししてコピーしてください。',
      android: 'Android（Chrome）',
      androidSteps: [
        'Chrome を開き、画面の上のURLの欄を押して、コピーしたURLを貼り付けて開く',
        '右上の「︙」（点が3つ）を押す',
        '「ホーム画面に追加」を押す（「アプリをインストール」と出ることもあります）',
        '「追加」（または「インストール」）を押す'
      ],
      iphone: 'iPhone（Safari）',
      iphoneSteps: [
        'Safari を開き、URLの欄を押して、コピーしたURLを貼り付けて開く',
        '共有ボタン（四角から上向きの矢印）を押す。見当たらない時は、URLの欄の横の「…」を押すと出ます',
        '下にずらして「ホーム画面に追加」を押す',
        '右上の「追加」を押す'
      ],
      end: 'ホーム画面にできた「{app}」のアイコンから、いつでも開けます。',
      close: '閉じる'
    },
    en: {
      btn: 'How to add to your home screen',
      title: 'Add to your home screen',
      inApp: 'If you opened this link inside an app such as LINE, Instagram or X, you can’t add it from there. Copy the URL below, then open it again in <strong>Chrome</strong> (Android) or <strong>Safari</strong> (iPhone).',
      urlLabel: 'URL of {app}',
      copy: 'Copy URL',
      copied: 'Copied. Paste it into your browser’s address bar.',
      failed: 'Couldn’t copy. Press and hold the URL to copy it.',
      android: 'Android (Chrome)',
      androidSteps: [
        'Open Chrome, tap the address bar at the top, paste the URL and open it',
        'Tap “⋮” (three dots) at the top right',
        'Tap “Add to Home screen” (it may say “Install app”)',
        'Tap “Add” (or “Install”)'
      ],
      iphone: 'iPhone (Safari)',
      iphoneSteps: [
        'Open Safari, tap the address bar, paste the URL and open it',
        'Tap the Share button (a square with an arrow pointing up). If you can’t see it, tap “…” next to the address bar',
        'Scroll down and tap “Add to Home Screen”',
        'Tap “Add” at the top right'
      ],
      end: 'You can open “{app}” anytime from the new icon on your home screen.',
      close: 'Close'
    },
    ko: {
      btn: '홈 화면에 추가하는 방법',
      title: '홈 화면에 추가하려면',
      inApp: 'LINE·Instagram·X 등의 앱에서 링크를 열었다면 그 화면에서는 추가할 수 없습니다. 아래 URL을 복사한 뒤 <strong>Chrome</strong>(Android) 또는 <strong>Safari</strong>(iPhone)에서 다시 열어 주세요.',
      urlLabel: '{app} URL',
      copy: 'URL 복사',
      copied: '복사했습니다. 브라우저의 주소창에 붙여 넣어 주세요.',
      failed: '복사하지 못했습니다. URL을 길게 눌러 복사해 주세요.',
      android: 'Android (Chrome)',
      androidSteps: [
        'Chrome을 열고 위쪽 주소창을 눌러 복사한 URL을 붙여 넣어 엽니다',
        '오른쪽 위의 「⋮」(점 3개)를 누릅니다',
        '「홈 화면에 추가」를 누릅니다(「앱 설치」로 표시될 수도 있습니다)',
        '「추가」(또는 「설치」)를 누릅니다'
      ],
      iphone: 'iPhone (Safari)',
      iphoneSteps: [
        'Safari를 열고 주소창을 눌러 복사한 URL을 붙여 넣어 엽니다',
        '공유 버튼(위쪽 화살표가 있는 네모)을 누릅니다. 보이지 않으면 주소창 옆의 「…」을 누르세요',
        '아래로 내려 「홈 화면에 추가」를 누릅니다',
        '오른쪽 위의 「추가」를 누릅니다'
      ],
      end: '홈 화면에 생긴 「{app}」 아이콘으로 언제든지 열 수 있습니다.',
      close: '닫기'
    },
    'zh-Hant': {
      btn: '加入主畫面的方法',
      title: '加入主畫面',
      inApp: '如果是在 LINE、Instagram、X 等 App 裡開啟連結，無法從該畫面加入。請先複製下方的網址，再用 <strong>Chrome</strong>（Android）或 <strong>Safari</strong>（iPhone）重新開啟。',
      urlLabel: '{app}的網址',
      copy: '複製網址',
      copied: '已複製。請貼到瀏覽器的網址列。',
      failed: '無法複製。請長按網址來複製。',
      android: 'Android（Chrome）',
      androidSteps: [
        '開啟 Chrome，點畫面上方的網址列，貼上複製的網址並開啟',
        '點右上角的「⋮」（三個點）',
        '點「加到主畫面」（也可能顯示「安裝應用程式」）',
        '點「新增」（或「安裝」）'
      ],
      iphone: 'iPhone（Safari）',
      iphoneSteps: [
        '開啟 Safari，點網址列，貼上複製的網址並開啟',
        '點分享按鈕（方框加上向上的箭頭）。找不到時，點網址列旁的「…」',
        '往下滑，點「加入主畫面」',
        '點右上角的「新增」'
      ],
      end: '之後可以從主畫面上的「{app}」圖示隨時開啟。',
      close: '關閉'
    }
  }[lang];

  function esc(s) { return String(s).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); }
  function fill(s) { return s.replace(/\{app\}/g, esc(appName)); }
  function list(a) { return '<ol>' + a.map(function (x) { return '<li>' + esc(x) + '</li>'; }).join('') + '</ol>'; }

  var A = 'var(--hg-accent, #1d2733)';
  var css =
    '.u-hg-btn{width:36px;height:36px;border-radius:50%;box-sizing:border-box;padding:0;flex:none;cursor:pointer;' +
    'border:1.5px solid var(--hg-btn-ink,' + A + ');background:var(--hg-btn-bg,#fff);color:var(--hg-btn-ink,' + A + ');' +
    'font:italic 700 18px/1 Georgia,"Times New Roman",serif;display:inline-flex;align-items:center;justify-content:center;' +
    '-webkit-tap-highlight-color:transparent;-webkit-appearance:none;appearance:none}' +
    '.u-hg-btn:active{opacity:.7}' +
    '.u-hg-btn.u-hg-corner{position:absolute;z-index:50;top:calc(env(safe-area-inset-top) + var(--hg-top,12px));right:calc(env(safe-area-inset-right) + var(--hg-right,12px))}' +
    '.u-hg{width:min(440px,calc(100vw - 24px));max-height:calc(100dvh - 24px);box-sizing:border-box;padding:0;border:none;border-radius:16px;' +
    'background:var(--hg-card,#fff);color:var(--hg-ink,#1d2733);box-shadow:0 10px 40px rgba(0,0,0,.28);overscroll-behavior:contain;' +
    'font:15px/1.6 -apple-system,BlinkMacSystemFont,"Hiragino Sans","Noto Sans JP","Noto Sans KR","Noto Sans TC",sans-serif;text-align:left}' +
    '.u-hg:not([open]){display:none}' +
    '.u-hg.u-hg-fallback{position:fixed;inset:0;margin:auto;height:fit-content;z-index:2147483001;overflow:auto}' +
    '.u-hg::backdrop{background:rgba(0,0,0,.45)}' +
    '.u-hg *{box-sizing:border-box}' +
    '.u-hg-body{position:relative;padding:22px 20px 20px;font-size:14.5px}' +
    '.u-hg h2{font-family:var(--hg-head-font,inherit);font-weight:700;font-size:19px;line-height:1.4;margin:0 36px 10px 0;padding:0;border:0;color:var(--hg-ink,#1d2733);letter-spacing:normal;text-align:left}' +
    '.u-hg h3{font-size:15.5px;margin:18px 0 4px;padding:0 0 4px;border-bottom:1px solid var(--hg-line,rgba(0,0,0,.12));color:' + A + ';font-weight:700;letter-spacing:normal}' +
    '.u-hg p{margin:6px 0}.u-hg strong{font-weight:700}' +
    '.u-hg ol{margin:6px 0 0;padding-left:1.4em}.u-hg li{margin:4px 0}' +
    '.u-hg-x{position:absolute;top:10px;right:10px;width:36px;height:36px;border:none;background:transparent;padding:0;' +
    'font-size:26px;line-height:1;color:var(--hg-sub,#6b7280);cursor:pointer}' +
    '.u-hg-url{display:flex;flex-direction:column;gap:8px;margin-top:10px}' +
    '.u-hg-url input{width:100%;padding:10px 12px;margin:0;border:1px solid var(--hg-line,rgba(0,0,0,.12));border-radius:10px;' +
    'background:var(--hg-field,#f5f5f5);color:var(--hg-ink,#1d2733);font-size:16px;font-family:inherit}' +
    '.u-hg-copy,.u-hg-ok{display:block;width:100%;min-height:48px;border-radius:12px;font-family:inherit;font-size:16px;font-weight:700;line-height:1;letter-spacing:normal;cursor:pointer;margin:0;padding:0 12px}' +
    '.u-hg-copy{border:none;background:' + A + ';color:var(--hg-on-accent,#fff)}' +
    '.u-hg-ok{margin-top:12px;border:1.5px solid ' + A + ';background:transparent;color:' + A + '}' +
    '.u-hg-msg{min-height:1.4em;text-align:center;color:' + A + ';font-weight:700;margin:4px 0 0!important}' +
    '.u-hg-end{margin-top:16px!important;color:var(--hg-sub,#6b7280)}';

  function init() {
    var st = document.createElement('style');
    st.textContent = css;
    document.head.appendChild(st);

    var btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'u-hg-btn';
    btn.textContent = 'i';
    btn.setAttribute('aria-label', T.btn);
    btn.setAttribute('aria-haspopup', 'dialog');
    btn.title = T.btn;

    var sel = attr('data-target'), target = sel && document.querySelector(sel);
    if (target) {
      var where = attr('data-where') || 'append';
      if (where === 'before') target.parentNode.insertBefore(btn, target);
      else if (where === 'after') target.parentNode.insertBefore(btn, target.nextSibling);
      else if (where === 'prepend') target.insertBefore(btn, target.firstChild);
      else target.appendChild(btn);
    } else {
      btn.className += ' u-hg-corner';
      document.body.appendChild(btn);
    }

    var dlg = document.createElement('dialog');
    dlg.className = 'u-hg';
    dlg.setAttribute('aria-labelledby', 'u-hg-title');
    dlg.innerHTML =
      '<div class="u-hg-body">' +
      '<button class="u-hg-x" type="button" aria-label="' + esc(T.close) + '">×</button>' +
      '<h2 id="u-hg-title">' + esc(T.title) + '</h2>' +
      '<p>' + T.inApp + '</p>' +
      '<div class="u-hg-url"><input type="text" readonly value="' + esc(url) + '" aria-label="' + fill(T.urlLabel) + '">' +
      '<button class="u-hg-copy" type="button">' + esc(T.copy) + '</button></div>' +
      '<p class="u-hg-msg" role="status" aria-live="polite"></p>' +
      '<h3>' + esc(T.android) + '</h3>' + list(T.androidSteps) +
      '<h3>' + esc(T.iphone) + '</h3>' + list(T.iphoneSteps) +
      '<p class="u-hg-end">' + fill(T.end) + '</p>' +
      '<button class="u-hg-ok" type="button">' + esc(T.close) + '</button>' +
      '</div>';
    document.body.appendChild(dlg);

    var input = dlg.querySelector('input'), msg = dlg.querySelector('.u-hg-msg');
    var bg = null;
    function open() {
      msg.textContent = '';
      if (dlg.showModal) { dlg.showModal(); return; }
      // <dialog> が使えない古い端末
      bg = document.createElement('div');
      bg.style.cssText = 'position:fixed;inset:0;z-index:2147483000;background:rgba(0,0,0,.45)';
      bg.addEventListener('click', close);
      document.body.appendChild(bg);
      dlg.classList.add('u-hg-fallback');
      dlg.setAttribute('open', '');
    }
    function close() {
      if (dlg.close && dlg.open && !dlg.classList.contains('u-hg-fallback')) dlg.close();
      else dlg.removeAttribute('open');
      if (bg) { bg.remove(); bg = null; }
      btn.focus();
    }
    btn.addEventListener('click', open);
    dlg.querySelector('.u-hg-x').addEventListener('click', close);
    dlg.querySelector('.u-hg-ok').addEventListener('click', close);
    dlg.addEventListener('click', function (e) { if (e.target === dlg) close(); });
    dlg.querySelector('.u-hg-copy').addEventListener('click', function () {
      copyText(input.value).then(function (ok) {
        msg.textContent = ok ? T.copied : T.failed;
        if (!ok) { input.focus(); input.select(); }
      });
    });
  }

  function copyText(text) {
    if (navigator.clipboard && window.isSecureContext) {
      return navigator.clipboard.writeText(text).then(function () { return true; }, function () { return legacyCopy(text); });
    }
    return Promise.resolve(legacyCopy(text));
  }
  // 古い端末・アプリ内ブラウザ向け
  function legacyCopy(text) {
    var ta = document.createElement('textarea');
    ta.value = text;
    ta.setAttribute('readonly', '');
    ta.style.cssText = 'position:fixed;top:0;opacity:0';
    document.body.appendChild(ta);
    ta.select(); ta.setSelectionRange(0, text.length);
    var ok = false;
    try { ok = document.execCommand('copy'); } catch (e) { ok = false; }
    document.body.removeChild(ta);
    return ok;
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();
