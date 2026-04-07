# helpcrunch-mcp

HelpCrunch の MCP サーバーです。Claude Code から HelpCrunch のチャット・顧客情報を検索・閲覧できます。

## 提供ツール

| ツール | 説明 |
|--------|------|
| `list_chats` | チャット一覧の取得（ステータス・メールでフィルタ可） |
| `get_chat_messages` | 特定チャットのメッセージ履歴を取得 |
| `search_customers` | メールアドレスまたは名前で顧客を検索 |
| `get_customer` | 顧客IDから詳細情報を取得 |

## セットアップ

### 1. APIキーの取得

HelpCrunch 管理画面 → Settings → Developers → Public API からAPIキーを取得してください。

### 2. Claude Code に設定を追加

事前に AWS Secrets Manager にシークレットを作成してください。プレーンテキストまたは JSON 形式（`{"HELPCRUNCH_API_KEY":"xxx"}`）に対応しています。

```json
{
  "mcpServers": {
    "helpcrunch": {
      "command": "npx",
      "args": ["-y", "github:ktokita-bengo4/helpcrunch-mcp"],
      "env": {
        "HELPCRUNCH_SECRET_NAME": "helpcrunch/api-key",
        "AWS_REGION": "ap-northeast-1",
        "AWS_PROFILE": "your-sso-profile"
      }
    }
  }
}
```

| 環境変数 | 説明 | デフォルト |
|---------|------|-----------|
| `HELPCRUNCH_SECRET_NAME` | Secrets Manager のシークレット名 | `helpcrunch/api-key` |
| `AWS_REGION` | AWS リージョン | `ap-northeast-1` |
| `AWS_PROFILE` | AWS SSO プロファイル名 | - |

事前に `aws sso login --profile your-sso-profile` でログインが必要です。

Claude Code を再起動すれば使えるようになります。
