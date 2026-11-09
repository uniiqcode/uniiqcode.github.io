# Still Here 仕様

古いスマートフォンを、置きっぱなしの時計・雨予報・ラジオとして活かすためのアプリ。
niisan.tv と uniiqcode で作ってきたもののダイジェスト版にあたる。

- 公開URL: https://uniiqcode.com/still-here/
- 置き場所: このリポジトリの `still-here/`
- 状態: 仕様の相談中（2026-11-09）

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
  - 表の1行は背景色と文字色の組。昼 → 夕暮れ → 夜 → 夜明け と移る色を、あらかじめ決めて書いておく。
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
6. ラジオ

### 横向き

| 左側 | 右側 |
|---|---|
| 時刻・曜日・日付・日の出・日の入り | 雨予報・ラジオ |

## 4. 時刻・曜日・日付・日の出・日の入り

- 時刻は `HH:MM`（clock01 と同じ）。**数字だけ travelフォントの SVG を使う**（`niisan-tv` の `frontend/assets/numerals/TN-0〜9-v01.svg`。`fill="currentColor"` なので文字色が効く）。
  - 数字ごとに横幅が違うため、桁ごとに固定幅の枠に入れて中央にそろえる（clock01 と同じ方式）。コロンは点2つで描く。
- 曜日・日付・日の出・日の入りは通常の文字で表示する。
- 日の出・日の入りは、ブラウザの位置情報から計算する（niisan.tv の `sun.js` と同じ考え方）。

## 5. 雨予報

- **8時間以内の雨の予想を、文字だけで出す。** 図やアイコンは使わない。
- 中身は uniiqcode.com の天気アプリ（`weather/app.js` の「8時間以内の雨」）と同じ。
  - 降っていない時は、降り始めの時刻（15分刻み）を出す。
  - 降っている時は、止む時刻を出す。
  - 8時間以内に雨の予想がなければ、そう書く。
- データは Open-Meteo から取る。位置はブラウザの位置情報を使う。
- **15分ごとに取り直す。表示に「何時何分更新」と書く。**
- 位置情報が使えない時は、その旨を文字で出す。

## 6. ラジオ

### 操作

- ボタンは **ON/OFF** と **選局10個**。
- 選局ボタンを押すと、その局を記憶する（その端末のブラウザに保存）。
- ON にすると、記憶している局につないで再生する。まだ一度も選んでいなければ1番の局を流す。
- OFF にすると、再生を止めて接続を切る。
- 再生中に別の選局ボタンを押したら、すぐその局に切り替える。

### 局（当面10局）

niisan.tv の `stations.txt` から選んだ。https の局だけを使う（uniiqcode.com は https なので、`http://` の局はブラウザが再生を止める）。FLAC の局は、iPhone で再生できないことが多く通信量も大きいので使わない。

| # | 局 | ジャンル | 形式 | URL（stations.txt） |
|---|---|---|---|---|
| 1 | Groove Salad（SomaFM） | Electronic | MP3 256k | `https://somafm.com/groovesalad256.pls` |
| 2 | Left Coast 70s（SomaFM） | Pop-Rock | MP3 320k | `https://somafm.com/seventies320.pls` |
| 3 | WALM Classic Vinyl HD | Pop | MP3 320k | `https://icecast.walmradio.com:8443/classic` |
| 4 | PureClassix Radio | Pop | MP3 | `https://mscp4.live-streams.nl:8142/live.mp3` |
| 5 | SmoothJazz.com Global | Jazz | MP3 256k | `https://www.smoothjazz.com/streams/smoothjazz_256.pls` |
| 6 | SmoothJazz.com.pl | Jazz | MP3 320k | `https://bcast.vigormultimedia.com:48888/sjcompl320mp3` |
| 7 | RelaxingJazz.com | Jazz | MP3 320k | `https://443-1.autopo.st/171/stream/3/` |
| 8 | SmoothLounge.com | New-Age | MP3 256k | `https://www.smoothjazz.com/streams/smoothlounge_256.pls` |
| 9 | Bossa Beyond（SomaFM） | World | MP3 256k | `https://somafm.com/bossa256.pls` |
| 10 | Naim Classical | Classical | AAC 320k | `https://mscp3.live-streams.nl:8252/class-high.aac` |

- `.pls` はストリームそのものではなくプレイリストなので、`<audio>` では直接再生できない。中に書かれた https のストリームURLを調べて、アプリに直接書く（未確定。§8）。

## 7. 決めたこと（経緯）

- 名前は「Still Here」。古い機種がまだ使える、置きっぱなしで流し続ける、の意味を込めた。
- 色は1時間ごとの固定色にした（連続的な計算はしない）。
- 時刻は数字だけ travelフォントにした。
- ラジオは https の局だけ。FLAC は外した。当面10局。

## 8. 未決

- 24色の表の中身。
- `.pls` の5局（1・2・5・8・9）の本当のストリームURL。
- 秒を表示するか（今は clock01 と同じく出さない想定）。
- ホーム画面に追加した時のアイコン、`manifest.json`、オフライン用の `sw.js` を用意するか。
- SEO まわり（`docs/seo.md` の決まりに従う）とトップページへのアイコン追加。
