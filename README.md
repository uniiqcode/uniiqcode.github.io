# uniiqcode.github.io

作成したhtmlの一般公開用

公開先: https://uniiqcode.github.io/

## ページの追加のしかた

1. HTMLファイルをこのリポジトリの一番上に置く（例: `sample.html`）
2. トップページにアイコンで出す場合は、`index.html` の `<ul class="apps">` に `<li><a href="sample.html"><img src="アイコン.png" alt="ページの名前" title="ページの名前"></a></li>` を1行足す（アイコンは正方形の画像。別のリポジトリのページのアイコンは `assets/icons/` に置く）
3. `main` に入ると数分で公開される → `https://uniiqcode.github.io/sample.html`

- 画像などを使うページは、フォルダごと置く（例: `sample/index.html` → `https://uniiqcode.github.io/sample/`）
- ファイル名は半角英数字とハイフンにする（日本語や空白はURLが崩れる）
- このリポジトリは public なので、中身はすべて誰でも見られる。パスワード・個人情報は置かない
- `.nojekyll` は、ファイルを加工せずそのまま公開するための空ファイル。消さない

## ロゴとアイコン

- `assets/logo/uniiqcode-wordmark.svg` … 文字ロゴ「Uniiqcode」（背景透明・黒1色）
- `assets/logo/uniiqcode-u.svg` … Uマーク（背景透明・黒1色）
- `favicon.svg` / `favicon.ico` / `apple-touch-icon.png` … トップページのアイコン（Uマークから作成）
- `assets/icons/gyosu-sakaba.png` … 業スー酒場のアイコン（`uniiqcode/gyosu-sakaba` の `site/assets/icon-192.png` を複製したもの。向こうで変えたら、こちらも差し替える）
- 暗い背景では、CSS の `filter: invert(1)` で白にして使う
