# 立体のUマークを作り直す道具

`assets/logo/uniiqcode-u-3d.png`（白い背景用）と `uniiqcode-u-3d-on-dark.png`（暗い背景用）は、ここの `scene.html` で描いた画像。
形は 2D のUマーク（`assets/logo/uniiqcode-u.svg`）から測った寸法で組み立てているので、作り直しても形は変わらない。

## 作り直し方（Node.js と Playwright が必要）

```bash
cd tools/logo-3d
npm install three@0.169.0
node render.js 'u-3d.png|v=a&elev=0&azim=0&col=0x2b2b2b' 'u-3d-on-dark.png|v=a&elev=0&azim=0&col=0xd6d6d6'
```

- `col` … 色（白い背景用は `0x2b2b2b`、暗い背景用は `0xd6d6d6`）
- `elev` / `azim` … 見る角度（0 / 0 で真正面）
- `ground=1` を足すと床の影が出る
- 出力は 1024×1024・背景透明の PNG
