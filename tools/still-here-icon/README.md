# Still Here のアイコン

- 元になる絵: `docs/still-here/icon.svg`（図形で描いた線画。色はアプリの昼の色、「12」は travelフォント `still-here/numerals/`）
- 作り直す時:
  1. `python3 tools/still-here-icon/make_icon.py` … 形や線の太さを変えたら、これで `icon.svg` を作り直す
  2. `node tools/still-here-icon/export.js .` … `still-here/icons/` の PNG（512・192・180・32・丸型用・SNS用）を書き出す（Playwright を使う）
  3. `still-here/sw.js` の `CACHE_NAME` を上げる
- 前のアイコン（ChatGPT で作った絵）は `docs/still-here/icon-v1-chatgpt.webp`
