# Still Here 仕様

古いスマートフォンを、置きっぱなしの時計・雨予報・ラジオとして活かすためのアプリ。
niisan.tv と uniiqcode で作ってきたもののダイジェスト版にあたる。

- 公開URL: https://uniiqcode.com/still-here/
- 置き場所: このリポジトリの `still-here/`
- 状態: 試作版を作成（2026-11-09）。まだトップページ・サイトマップには載せていない

## 1. 前提

- **できるだけ古い環境で動かす。iOS15 の Safari で動くこと。**
  - JS は iOS15 で動く書き方にとどめる。CSS は `:has()`・`dvh`・コンテナクエリなど、iOS15 で使えないものを使わない。
- 画面は1枚。ページの切り替えはない。
- レスポンシブ。縦向きと横向きで配置を変える（§3）。
- 外部のサーバーは使わない。uniiqcode.com（GitHub Pages）の静的ファイルと、ブラウザから直接呼ぶ公開APIだけで動かす。

## 2. 色

- niisan.tv の Traveler Colors（`niisan-tv` の `frontend/js/nii/color.js`）を参考にする。
  - 昼の基準: 背景 `#F5F3EE`（サンドベージュ）、文字 `#2B2D30`（濃墨）
  - 夜の基準: 背景 `#12161A`（深墨）、文字 `#ECE8DF`（生成り）
- **計算はしない。0時〜23時の24色の固定表を持ち、「時」が変わった時に切り替える。**
  - 表は `still-here/app.js` の `COLORS`。1行が背景色と文字色の組。夜明け（5〜7時）と夕暮れ（16〜18時）をつなぐ色を足した（たたき台）。
  - 色見本: `docs/still-here/colors.png`（各色の文字と背景のコントラスト比つき。どれも 9:1 以上）
  - 確認用に、URL に `?h=17` を付けるとその時の色で表示する。
  - 切り替わる時は2秒かけて変わる。
- 雨予報・ラジオの部分も、背景色と文字色は他の表示とそろえる。別の色の箱にはしない。

## 3. 画面の配置

clock01.html（niisan.tv の「時①」）のレイアウトをもとにする。丸時計と地名（住所）は使わない。

### 縦向き

上から順に並べる。

1. 時刻
2. 曜日
3. 日付
4. 日の出・日の入り
5. 雨予報
6. ラジオ（ボタン10個と状態の1行）… **画面の下に置く**。1〜5 は、その上の空きの中央に置く。

### 横向き

| 左側 | 右側 |
|---|---|
| 時刻・曜日・日付・日の出・日の入り | 雨予報・ラジオ（右の列の中央） |

### 文字の大きさ

- 遠くから読めるよう、travelフォントの時刻以外の文字はすべて、最初の試作の **150%**（CSS の `--k: 1.5`）。
- ラジオのボタンの名前だけは、5列のボタンに入りきらない時（Classical-Audiophile・Meditation など）に、その名前だけ字を小さくして収める（`app.js` の `fitLabels`）。単語の途中では折り返さない。

## 4. 時刻・曜日・日付・日の出・日の入り

- 時刻は `HH:MM` と秒。**秒の数字だけ時分の70%の大きさにして、時分と下揃えにする。** 分と秒の間にコロンは入れない。
- **数字だけ travelフォントの SVG を使う**（`niisan-tv` の `frontend/assets/numerals/TN-0〜9-v01.svg`。`fill="currentColor"` なので文字色が効く）。
  - 数字ごとに横幅が違うため、桁ごとに固定幅の枠に入れて中央にそろえる（clock01 と同じ方式）。コロンは点2つで描く。
- 曜日・日付・日の出・日の入り・雨予報・ラジオなど、時刻の数字以外の文字はすべて clock01.html と同じ **Shippori Mincho**（`still-here/fonts/`。niisan.tv の `frontend/assets/shippori-mincho/` を複製。OFL）。日本語用は約1.4MBあるが、`sw.js` で端末に保存するので読み込みは初回だけ。
- 日の出・日の入りは、雨予報と同じ Open-Meteo の応答（`daily` の `sunrise` / `sunset`）から出す。自前の計算はしない。

## 5. 雨予報

- **8時間以内の雨の予想を、文字だけで出す。** 図やアイコンは使わない。
- 中身は uniiqcode.com の天気アプリ（`weather/app.js` の「8時間以内の雨」）と同じ。
  - 降っていない時は、降り始めの時刻（15分刻み）を出す。
  - 降っている時は、止む時刻を出す。
  - 8時間以内に雨の予想がなければ、そう書く。
- データは Open-Meteo から取る。位置はブラウザの位置情報を使う。
- **15分ごとに取り直す。表示に「何時何分更新」と書く。**
- 位置情報が使えない時は、その旨を文字で出す。
- 予報へ送る位置は小数2桁（約1km）に丸める。前回の予報は localStorage に置き、次に開いた時はまずそれを出す（2時間より古ければ出さない）。
- スリープから戻った時、15分より古ければすぐ取り直す。

## 6. ラジオ

### 操作

- ボタンは **10個**。先頭が **ON/OFF**、残りの9個が局。独立した ON/OFF ボタンは置かない。
- 局のボタンを押すと、その局を記憶する（その端末のブラウザに保存）。
- ON にすると、記憶している局につないで再生する。まだ一度も選んでいなければ先頭の局（Ambient-Chillout）を流す。
- OFF にすると、再生を止めて接続を切る。
- 再生中に別の局のボタンを押したら、すぐその局に切り替える。

### 画面

- 10個のボタンはすべて同じ大きさで、横に5つ・2段に並べる。縦向きでは、余白を除いた画面幅いっぱいを使う。
- 局のボタンには、局の名前ではなく **stations.txt の小分類** を出す。番号は出さない。Smooth-Jazz は2局あるので「Smooth-Jazz 1」「Smooth-Jazz 2」とする。
- ON/OFF ボタンは、ON の時と選ばれている局のボタンだけ、文字色と背景色を反転する。
- ボタンの下に状態（接続中… / 再生中 小分類(局名) / つながりませんでした）を出す。

### 局（当面9局）

niisan.tv の `stations.txt` から選んだ。https の局だけを使う（uniiqcode.com は https なので、`http://` の局はブラウザが再生を止める）。FLAC の局は、iPhone で再生できないことが多く通信量も大きいので使わない。

| ボタン | 局 | 大分類 | URL（stations.txt） |
|---|---|---|---|
| Ambient-Chillout | Groove Salad（SomaFM） | Electronic | `https://somafm.com/groovesalad256.pls` |
| Classic-Rock | Left Coast 70s（SomaFM） | Pop-Rock | `https://somafm.com/seventies320.pls` |
| Classic-Vinyl | WALM Classic Vinyl HD | Pop | `https://icecast.walmradio.com:8443/classic` |
| Pop-Europe | PureClassix Radio | Pop | `https://mscp4.live-streams.nl:8142/live.mp3` |
| Smooth-Jazz 1 | SmoothJazz.com.pl | Jazz | `https://bcast.vigormultimedia.com:48888/sjcompl320mp3` |
| Smooth-Jazz 2 | RelaxingJazz.com | Jazz | `https://443-1.autopo.st/171/stream/3/` |
| Meditation | SmoothLounge.com | New-Age-Healing | `https://www.smoothjazz.com/streams/smoothlounge_256.pls` |
| Bossa-Nova | Bossa Beyond（SomaFM） | World-Music | `https://somafm.com/bossa256.pls` |
| Classical-Audiophile | Naim Classical | Classical | `https://mscp3.live-streams.nl:8252/class-high.aac` |

- `.pls` はストリームそのものではなくプレイリストなので、`<audio>` では直接再生できない。アプリには候補のストリームURLを直接書き、起動時に `.pls` が読めればその中身（`File1=`）で置き換える（相手のサイトが許可していなければ読めないので、候補URLのまま）。候補URLは未確認（§8）。
  - SomaFM: `https://ice1.somafm.com/{groovesalad-256-mp3, seventies-320-mp3, bossa-256-mp3}`
  - SmoothLounge: `https://smoothjazz.cdnstream1.com/2586_320.mp3`

## 6.5 ホーム画面に追加

- `manifest.json`（standalone）、アイコン（`icons/`。travelフォントの「12」と琥珀の点）、`apple-touch-icon` を用意した。
- オフライン用の `sw.js` は自分のファイルだけを保存する。ファイルを変えたら `CACHE_NAME` を上げる。
- 「ホーム画面に追加」ボタンは共通部品 `assets/a2hs.js` を使う。

## 7. 決めたこと（経緯）

- 名前は「Still Here」。古い機種がまだ使える、置きっぱなしで流し続ける、の意味を込めた。
- 色は1時間ごとの固定色にした（連続的な計算はしない）。
- 時刻は数字だけ travelフォントにした。
- ラジオは https の局だけ。FLAC は外した。SmoothJazz.com Global も外して9局。
- ラジオのボタンは ON/OFF を含めて10個、小分類の名前で出す。
- 秒を出す。秒の数字は70%の大きさで下揃え。
- ホーム画面に追加して使う。

## 8. 未決

- 24色の表の中身（たたき台を確認してもらう）。
- `.pls` の4局（Ambient-Chillout・Classic-Rock・Meditation・Bossa-Nova）の候補URLが実機で鳴るか。開発環境からは somafm.com・smoothjazz.com に接続できず未確認。
- 画面を点けっぱなしにする仕組み（Wake Lock）は iOS15 では使えないので、端末の自動ロックの設定で対応する想定。
- トップページへのアイコン追加と `sitemap.xml`（実機確認のあとに）。
