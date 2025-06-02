#!/bin/bash

set -e

echo "🚀 Claude Code History CLI インストールスクリプト"
echo ""

# Denoがインストールされているか確認
if ! command -v deno &> /dev/null; then
    echo "❌ Denoがインストールされていません"
    echo "以下のコマンドでインストールしてください:"
    echo ""
    echo "  curl -fsSL https://deno.land/install.sh | sh"
    echo ""
    exit 1
fi

echo "✓ Denoが見つかりました"

# コンパイル
echo "📦 バイナリをコンパイル中..."
deno compile --allow-read --allow-env --output cch src/main.ts

# インストール先を決定
INSTALL_DIR="$HOME/.local/bin"
if [[ ":$PATH:" == *":$INSTALL_DIR:"* ]]; then
    echo "✓ $INSTALL_DIR はPATHに含まれています"
else
    echo "⚠️  $INSTALL_DIR はPATHに含まれていません"
    echo "以下をシェルの設定ファイルに追加してください:"
    echo ""
    echo "  export PATH=\"\$HOME/.local/bin:\$PATH\""
    echo ""
fi

# ディレクトリを作成
mkdir -p "$INSTALL_DIR"

# バイナリを移動
echo "📁 バイナリをインストール中..."
mv cch "$INSTALL_DIR/"

echo ""
echo "✅ インストール完了!"
echo ""
echo "使い方:"
echo "  cch projects                    # プロジェクト一覧"
echo "  cch sessions <project>          # セッション一覧"
echo "  cch show <project> <session>    # 会話履歴表示"
echo "  cch search <keyword>            # キーワード検索"
echo ""

# PATHに含まれていない場合の追加手順
if [[ ":$PATH:" != *":$INSTALL_DIR:"* ]]; then
    echo "⚠️  cchコマンドを使用するには、新しいターミナルを開くか、以下を実行してください:"
    echo ""
    echo "  export PATH=\"\$HOME/.local/bin:\$PATH\""
    echo ""
fi