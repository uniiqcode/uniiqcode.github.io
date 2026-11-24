# ロゴ（Uマーク・文字ロゴ）

2026-11-25 に作り直したロゴ。黒い線と、グレー（#8c8c8c）の点。点のグレーは、白黒で印刷しても黒と見分けられる濃さにしてある。

## ファイル

- `mark-src.svg` … Uマークの元の絵（線で描いたもの。線の太さ 37）
- `wordmark-src.svg` … 文字ロゴ「Uniiqcode」の元の絵（線の太さ 28。e だけはフォント Quicksand Bold の e の形を、太さを合わせて使っている）
- 公開しているのは、線を塗りの形に直したもの（`assets/logo/uniiqcode-u.svg`・`uniiqcode-wordmark.svg`）。印刷所に渡す時もこちらを使う

## 作り直す時

1. 元の絵（`*-src.svg`）を直す
2. 線を塗りの形に直す: `pip install picosvg` → `picosvg tools/logo/mark-src.svg > assets/logo/uniiqcode-u.svg`（文字ロゴも同じ。出てきた `<defs/>` の行は消してよい）
3. `node tools/logo/export.js .` … `favicon.svg`・`apple-touch-icon.png`・`assets/icons/uniiqcode-*.png`・`assets/og-image.png` を書き出す（Playwright を使う）
4. `convert tools/logo/favicon-16.png tools/logo/favicon-32.png favicon.ico` で `favicon.ico` を作り、2つの PNG は消す
5. 形や大きさが変わったら、`index.html` の見出し（`h1`）の数字も合わせる（コメントに測り方がある）

## フォントのライセンス

e の形は Quicksand（SIL Open Font License 1.1、© The Quicksand Project Authors）から。このライセンスでは、フォントから作ったロゴの絵を自由に使える。
