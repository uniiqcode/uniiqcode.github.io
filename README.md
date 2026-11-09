# uniiqcode.github.io

作成したhtmlの一般公開用

公開先: https://uniiqcode.com/ （独自ドメイン。旧URL https://uniiqcode.github.io/ からは自動で転送される）

## ページの追加のしかた

1. HTMLファイルをこのリポジトリの一番上に置く（例: `sample.html`）
2. トップページにアイコンで出す場合は、（検索対策は `docs/seo.md` も見る）`index.html` の `<ul class="apps">` に `<li><a href="sample.html"><img src="アイコン.png" alt="ページの名前" title="ページの名前"></a></li>` を1行足す（アイコンは正方形の画像。別のリポジトリのページのアイコンは `assets/icons/` に置く）
3. `main` に入ると数分で公開される → `https://uniiqcode.com/sample.html`

- 画像などを使うページは、フォルダごと置く（例: `sample/index.html` → `https://uniiqcode.com/sample/`）
- ファイル名は半角英数字とハイフンにする（日本語や空白はURLが崩れる）
- このリポジトリは public なので、中身はすべて誰でも見られる。パスワード・個人情報は置かない
- `.nojekyll` は、ファイルを加工せずそのまま公開するための空ファイル。消さない

## ロゴとアイコン

- `assets/logo/uniiqcode-wordmark.svg` … 文字ロゴ「Uniiqcode」（背景透明・黒1色）
- `assets/logo/uniiqcode-u.svg` … Uマーク（背景透明・黒1色）
- `favicon.svg` / `favicon.ico` / `apple-touch-icon.png` … トップページのアイコン（Uマークから作成）
- `manifest.webmanifest` と `assets/icons/uniiqcode-192.png` / `-512.png` / `-maskable-512.png` … スマホのホーム画面に登録した時のアイコンと名前（Uniiqcode）
- `assets/og-image.png` … SNSでリンクを共有した時に出る画像（1200×630、ワードマーク）
- `assets/logo/uniiqcode-u-3d.png` / `uniiqcode-u-3d-on-dark.png` … 立体のUマーク（1024×1024・背景透明）。白い背景用は黒に近いグレー、暗い背景用は明るいグレー。作り直す時は `tools/logo-3d/README.md`
- `assets/icons/gyosu-sakaba.png` … 業スー酒場のアイコン（`uniiqcode/gyosu-sakaba` の `site/assets/icon-192.png` を複製したもの。向こうで変えたら、こちらも差し替える）
- `assets/icons/konbini-24h.png` … コンビニ24H のアイコン（`uniiqcode/konbini-24h` の `site/assets/icon-192.png` を複製したもの。向こうで変えたら、こちらも差し替える）
- 暗い背景では、CSS の `filter: invert(1)` で白にして使う

## 検索対策（SEO）

- ページを足す・変える時は、`docs/seo.md` の「ページを足す・変える時の決まり」に従う（title・description・canonical・OGP・JSON-LD、`sitemap.xml`、`robots.txt`）
- 共通のルールは `uniiqcode/claude-skills` の `seo-uniiqcode` スキル

## 「ホーム画面に追加」ボタン（アプリ共通）

- `assets/a2hs.js` … アプリのページの下に「「アプリ名」をホーム画面に追加」ボタンを出す部品。Android・パソコンの Chrome/Edge は押すと追加の確認が出る。iPhone・iPad はページから追加できない（Apple の仕様）ので、押すと手順の案内を出す。ホーム画面から開いている時は出ない。「×」で閉じると、そのアプリでは30日間出ない
- アプリのページ（manifest があるページ）の `</body>` の前に1行入れる。`data-app` はボタンに出す名前
  - このリポジトリの中: `<script src="../assets/a2hs.js" data-app="ゲーム" defer></script>`
  - 別のリポジトリのアプリ: `<script src="https://uniiqcode.com/assets/a2hs.js" data-app="業スー酒場" defer></script>`
- 入れているページ: ゲーム（`games/`）、ここの天気（`weather/`）

## 独自ドメイン（uniiqcode.com）

- `CNAME` ファイル … GitHub Pages に独自ドメイン `uniiqcode.com` を使わせるための設定。消さない
- DNS は Cloudflare で管理（2026年11月にお名前.com のレンタルサーバーから移した。ドメインの登録はお名前.com のまま、2027年6月に Cloudflare へ移管予定）
  - `uniiqcode.com` … GitHub Pages の A レコード4つ・AAAA レコード4つ、`www` … `uniiqcode.github.io` への CNAME。いずれも「DNS only」（グレーの雲）。オレンジ（Proxied）にすると GitHub が HTTPS の証明書を出せなくなることがある
- 同じアカウントのほかの GitHub Pages（例: `gyosu-sakaba`）も `https://uniiqcode.com/リポジトリ名/` で公開される
