# uniiqcode.github.io で作業する時の決まり

- **作業を始める前に `STATUS.md` を読む。** 状況が変わったら、終わる前に `STATUS.md` を更新する。
- このリポジトリは uniiqcode.com（GitHub Pages）の本体。トップページ・ゲーム（`games/`）・ここの天気（`weather/`）・Still Here（`still-here/`）を公開している。全体の説明は `README.md`。
- `main` に入ると数分で公開される。PR のマージ ＝ 公開。

## このリポジトリだけの決まり

- **public なので、中身はすべて誰でも見られる。** パスワード・個人情報・下書きのメモを置かない。
- `CNAME`（独自ドメイン）と `.nojekyll` は消さない。
- `robots.txt` はドメイン全体のもの（別のリポジトリのアプリの分も、ここに書く）。
- このファイル・`STATUS.md`・`.claude/` も uniiqcode.com で公開される（`robots.txt` で検索には出さない）。誰に読まれても困らないことだけ書く。
- ページを足す・変える時は `README.md` の「ページの追加のしかた」と `docs/seo.md` に従う。共通の手順はスキル `seo-uniiqcode`・`homescreen-uniiqcode`。
- `assets/` には、ほかのリポジトリのアプリも使う共通の部品がある（`.claude/rules/shared-assets.md`）。
- 公開前に、スマホの幅（縦・横）で表示を確かめる。Still Here は iOS15 の Safari で動くこと（`docs/still-here.md` §1）。

## 詳しい説明

| 何を | どこに |
|---|---|
| ページの追加・ロゴ・ドメイン | `README.md` |
| 検索対策 | `docs/seo.md` |
| Still Here の仕様 | `docs/still-here.md` |
| ロゴ・アイコンの作り直し | `tools/*/README.md` |
