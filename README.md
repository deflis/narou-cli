# narou-cli

[小説家になろう](https://syosetu.com/)のAPIを操作するCLIツール。

## インストール

### リリースバイナリを使う

[GitHub Releases](https://github.com/deflis/narou-cli/releases) から、環境に合うバイナリをダウンロードして実行できます。Bunのインストールは不要です。

| OS | CPU | バイナリ |
| --- | --- | --- |
| Linux | x64 | `narou-linux-x64` |
| Linux | arm64 | `narou-linux-arm64` |
| macOS | Intel | `narou-darwin-x64` |
| macOS | Apple Silicon | `narou-darwin-arm64` |
| Windows | x64 | `narou-windows-x64.exe` |

macOS / Linuxでは、ダウンロード後に実行権限を付けてください。

```bash
chmod +x ./narou-*
./narou-darwin-arm64 search 異世界
```

必要に応じて `narou` にリネームし、PATHの通ったディレクトリへ配置するとそのまま実行できます。

```bash
mv ./narou-darwin-arm64 /usr/local/bin/narou
narou search 異世界
```

### 開発環境から使う

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

## Skills

このリポジトリには、エージェントから `narou` CLIを使って分析用データを準備するためのSkillを同梱しています。

- `skills/narou-analysis-prep`: 小説検索、ランキング、殿堂入り履歴、ユーザ検索のJSON取得、ページング、フィールド選択、raw/derivedデータの分離、再現用manifest作成を支援するSkill

利用時は、プロンプトで `$narou-analysis-prep` を指定します。

```text
Use $narou-analysis-prep to prepare 小説家になろう data for later analysis.
```

このSkillは分析前のデータ取得・整形までを対象とし、ランキングの解釈、作品評価、モデル作成、可視化などは対象外です。
