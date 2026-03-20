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

`~/.claude/settings.json` に以下を追記:

```json
{
  "mcpServers": {
    "helpcrunch": {
      "command": "npx",
      "args": ["-y", "github:tokita/helpcrunch-mcp"],
      "env": {
        "HELPCRUNCH_API_KEY": "your-api-key-here"
      }
    }
  }
}
```

Claude Code を再起動すれば使えるようになります。
