# narou-cli

[小説家になろう](https://syosetu.com/)のAPIを操作するCLIツール。

## インストール

```bash
bun install
```

## 使い方

### 小説を検索

```bash
# キーワード検索
bun run index.ts search 異世界

# 件数・開始位置を指定
bun run index.ts search 転生 -l 5 -s 10

# ジャンル指定（--genre <コード>）
bun run index.ts search --genre 1

# 大ジャンル指定（--big-genre <コード>）
bun run index.ts search --big-genre 1

# Nコード指定
bun run index.ts search --ncode N0000xx

# ユーザID指定
bun run index.ts search --user-id 12345

# 出力順序指定
bun run index.ts search --order weekly

# 小説タイプ指定（t: 連載, r: 短編, er: 連載完結, re: 短編完結, ter: 連載・短編完結）
bun run index.ts search --type t
```

### ランキングを取得

```bash
# デイリーランキング
bun run index.ts ranking

# 週間/月間/四半期
bun run index.ts ranking --type weekly
bun run index.ts ranking --type monthly
bun run index.ts ranking --type quarterly

# 特定日のランキング
bun run index.ts ranking --type daily --date 2024-01-01
```

### 殿堂入りランキング履歴を取得

```bash
bun run index.ts rank-history N0000xx
```

### ユーザを検索

```bash
# キーワード検索
bun run index.ts search-user 作者名

# ユーザID指定
bun run index.ts search-user --user-id 12345
```

### 出力形式

全コマンドで `-o json` または `-o table` を指定できます（デフォルト: table）。

```bash
bun run index.ts search 異世界 -o json
bun run index.ts ranking --type weekly -o json
```

## ビルド

コンパイル済みバイナリを生成:

```bash
bun run build
```

`./narou` が生成され、Bunなしで実行できます。

```bash
./narou search 異世界
```
