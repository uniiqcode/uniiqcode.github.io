# 検索対策（SEO）

2026-11-08。`uniiqcode/claude-skills` の `seo-uniiqcode` スキル（uniiqcode のアプリ共通のルール）に沿って入れた。業スー酒場（`uniiqcode/gyosu-sakaba`、`docs/seo.md`）と同じ手順。

このリポジトリはビルドの無い静的なページなので、スキルの「ビルドで作る」ところは HTML に直接書く。

## 対象のページと正式な URL

| ページ | 正式な URL | title | JSON-LD |
|---|---|---|---|
| トップ（メニュー） | `https://uniiqcode.com/` | Uniiqcode｜小さく作る、ちょっと珍しいウェブアプリ | `WebSite` ＋ `ItemList`（アプリの一覧） |
| ゲーム（メニュー） | `https://uniiqcode.com/games/` | ゲーム｜広告のない無料ゲーム | `ItemList`（4つのゲーム） |
| ソリティア | `https://uniiqcode.com/games/solitaire/` | ソリティア｜無料・広告なしのクロンダイク | `WebApplication`（GameApplication） |
| フリーセル | `https://uniiqcode.com/games/freecell/` | フリーセル｜無料・広告なしのトランプゲーム | 同上 |
| 数独 | `https://uniiqcode.com/games/sudoku/` | 数独（ナンプレ）｜無料・広告なし | 同上 |
| 蘇州 | `https://uniiqcode.com/games/suzhou/` | 蘇州｜無料・広告なしの麻雀牌パズル | 同上 |
| ここの天気 | `https://uniiqcode.com/weather/` | ここの天気｜今いる場所の雨と気温 | `WebApplication`（UtilitiesApplication） |
| 業スー酒場 | `https://uniiqcode.com/gyosu-sakaba/` | （別のリポジトリ。`uniiqcode/gyosu-sakaba` の `docs/seo.md`） | `ItemList` |
| コンビニ24H | `https://uniiqcode.com/konbini-24h/`（日本語・韓国語・繁体字・英語） | （別のリポジトリ。`uniiqcode/konbini-24h` の `docs/seo.md`） | `ItemList`＋`VideoObject` |

## 入れたもの（スキルの手順との対応）

| スキルの手順 | このリポジトリでのやり方 |
|---|---|
| 1. 正式な URL | 上の表。`canonical`・`og:url`・サイトマップ・JSON-LD はすべて `https://uniiqcode.com/...`（末尾の `/` まで）。`uniiqcode.github.io` では書かない |
| 2. 中身を HTML に | トップはアイコンのリンク（`alt` 付き）が HTML にある。ゲームのメニューは、JavaScript で描くカードと同じ一覧（名前・リンク・説明）を `<main id="list">` の中に HTML でも書いた（JavaScript が動くと絵と記録付きのカードに描き直す）。天気は見出し（h1・h2）と説明が HTML にあり、予報の数字は現在地で変わるので JavaScript のまま |
| 3. 基本の META | 各ページに title（30文字くらいまで）・description（80〜120文字）・canonical・`<html lang="ja">`。h1 はページに1つ。ゲームの4ページは画面に見出しが無いので、h1 を見えない形（`clip`）で入れた。トップのアイコンに `width`・`height` |
| 4. 共有した時の表示 | OGP と X のカード（`og:title`・`og:description`・`og:url`・`og:image`（絶対 URL、1200×630）・`og:locale`）。ゲームの4ページはゲームのメニューと同じ絵（`games/icons/og-image.png`） |
| 5. サイトマップ・robots.txt | `sitemap.xml`（このリポジトリのページ）と `robots.txt`（ドメイン全体。各アプリのサイトマップを列挙）をリポジトリの一番上に置いた |
| 6. 構造化データ | 上の表。中身に合う型だけ。評価（★）や価格など、ページに無い情報は書かない（無料なのは本当なので `offers` の price 0 は書いた） |
| 7. 速さ | 大きな絵は無い。Google Fonts も使っていない。今のところ対応は不要 |

ホーム画面に追加した時の名前（`apple-mobile-web-app-title`・manifest）は短いまま（「ゲーム」「ここの天気」など）。検索用には title と description だけを長くした（スキルの記録3）。

## ページを足す・変える時の決まり

1. `<head>` に、title・description・canonical・OGP・JSON-LD を入れる（上の表と同じ形。いちばん簡単なのは、近いページからコピーして書き換える）
2. メニュー（トップ・ゲームのメニュー）に足す時は、HTML の一覧・JSON-LD の `ItemList` の両方に足す。ゲームのメニューは JavaScript の `GAMES` にも足す
3. `sitemap.xml` に `<url>` を1行足す。中身を変えたページは、その行の `<lastmod>` をその日にする
4. 別のリポジトリで新しいアプリを公開したら、`robots.txt` に `Sitemap: https://uniiqcode.com/<リポジトリ名>/sitemap.xml` を足し、トップの一覧と `ItemList` にも足す
5. Service Worker があるフォルダ（`games/`・`weather/`）の HTML を変えたら、その `sw.js` の `CACHE_NAME` の番号を上げる（上げないと古い HTML が出続ける）
6. 公開後、Search Console でサイトマップを送信する（下）

## 公開後に人がすること（スキルの手順8）

`uniiqcode.com` のドメインプロパティは登録済み（業スー酒場の時）。

1. Google Search Console（https://search.google.com/search-console ）→「サイトマップ」で `https://uniiqcode.com/sitemap.xml` を送信する
2. 「URL 検査」で `https://uniiqcode.com/` を調べ、「インデックス登録をリクエスト」（ゲームのメニュー・天気も同じようにしてよい）
3. 数日後、サイトマップが「成功しました」になっているかを見る

## 確かめ方

- 各ページの HTML（JavaScript を切った状態）に、title・description・canonical・OGP・JSON-LD があり、JSON-LD がエラーなく読める（2026-11-08、Playwright で7ページを確認済み）
- Google の「リッチリザルト テスト」（https://search.google.com/test/rich-results ）に URL を入れて、エラーがない
- X か LINE に URL を貼り、絵とタイトルが出る
