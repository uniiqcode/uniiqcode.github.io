---
paths:
  - "assets/**"
---

# 共通の部品（assets/）

- `assets/a2hs.js`（「ホーム画面に追加」ボタン）は、`https://uniiqcode.com/assets/a2hs.js` として**ほかのリポジトリのアプリ（業スー酒場・コンビニ24H など）も読み込んでいる。** 直すと全アプリに効くので、変える前に niisan に伝え、PR に影響するアプリを書く。
- `assets/icons/` のアプリのアイコン（gyosu-sakaba・konbini-24h・yado-kuchikomi）は、それぞれのリポジトリの `site/assets/icon-192.png` を複製したもの。ここで描き直さず、元のリポジトリで変えてから差し替える。
- ロゴ（`assets/logo/`）を変えたら、`favicon.*`・`apple-touch-icon.png`・`assets/icons/uniiqcode-*.png`・`assets/og-image.png` も合わせるか確かめる。
