# Claude Code History CLI

Claude Codeの会話履歴を見やすく表示するCLIツール

## インストール

### 前提条件

Denoがインストールされている必要があります：

```bash
# Denoのインストール（未インストールの場合）
curl -fsSL https://deno.land/install.sh | sh

# パスを通す
echo 'export DENO_INSTALL="$HOME/.deno"' >> ~/.zshrc
echo 'export PATH="$DENO_INSTALL/bin:$PATH"' >> ~/.zshrc
source ~/.zshrc
```

### 方法1: 自動インストール（推奨）

```bash
# リポジトリをクローン
git clone https://github.com/YOUR_USERNAME/claude-code-history-cli.git
cd claude-code-history-cli

# インストールスクリプトを実行
./install.sh

# または Deno を使用
deno task install
```

インストールが完了すると、`cch` コマンドが使用可能になります。

### 方法2: 手動インストール

```bash
# バイナリをコンパイル
deno task compile

# バイナリを PATH の通った場所に移動
sudo mv cch /usr/local/bin/
# または
mkdir -p ~/.local/bin
mv cch ~/.local/bin/

# ~/.local/bin を使用する場合は PATH に追加
echo 'export PATH="$HOME/.local/bin:$PATH"' >> ~/.zshrc
source ~/.zshrc
```

## 使い方

インストール後は `cch` コマンドで直接使用できます：

```bash
# プロジェクト一覧を表示
cch projects

# セッション一覧を表示
cch sessions PROJECT_NAME

# 会話履歴を表示
cch show PROJECT_NAME "session-id"

# 検索
cch search "keyword"
cch search -p PROJECT_NAME "keyword"
```

注: PROJECT_NAMEは `cch projects` で表示されるプロジェクト名です。

## 開発モード

開発中は以下のコマンドを使用できます：

```bash
# プロジェクト一覧を表示
deno task dev projects

# セッション一覧を表示
deno task dev sessions PROJECT_NAME

# 会話履歴を表示
deno task dev show PROJECT_NAME "session-id"

# 検索
deno task dev search "keyword"
deno task dev search -p PROJECT_NAME "keyword"
```

## 主な機能

- 📁 プロジェクト一覧表示
- 📝 セッション一覧（開始時刻、メッセージ数付き）
- 💬 会話履歴表示（プレビュー/フル表示）
- 🔍 キーワード検索（全プロジェクト/特定プロジェクト）
- ⏱️ タイムスタンプ表示
- 🎯 プロジェクトフィルタリング

## オプション

### showコマンド
- `-f, --full`: 完全な内容を表示
- `-l, --limit <n>`: 表示するメッセージ数を制限

### searchコマンド
- `-p, --project <name>`: 特定のプロジェクトに限定して検索