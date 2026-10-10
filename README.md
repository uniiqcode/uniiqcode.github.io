# uniiqcode.github.io

作成したhtmlの一般公開用

公開先: https://uniiqcode.github.io/

## ページの追加のしかた

1. HTMLファイルをこのリポジトリの一番上に置く（例: `sample.html`）
2. `index.html` の一覧に `<li><a href="sample.html">ページの名前</a></li>` を1行足す
3. `main` に入ると数分で公開される → `https://uniiqcode.github.io/sample.html`

- 画像などを使うページは、フォルダごと置く（例: `sample/index.html` → `https://uniiqcode.github.io/sample/`）
- ファイル名は半角英数字とハイフンにする（日本語や空白はURLが崩れる）
- このリポジトリは public なので、中身はすべて誰でも見られる。パスワード・個人情報は置かない
- `.nojekyll` は、ファイルを加工せずそのまま公開するための空ファイル。消さない
