#!/usr/bin/env node

import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";
import { HelpCrunchClient } from "./helpcrunch-client.js";

const apiKey = process.env.HELPCRUNCH_API_KEY;
if (!apiKey) {
  console.error("Error: HELPCRUNCH_API_KEY environment variable is required.");
  console.error("Get your API key from HelpCrunch Settings → Developers → Public API");
  process.exit(1);
}

const client = new HelpCrunchClient(apiKey);

const server = new McpServer({
  name: "helpcrunch",
  version: "1.0.0",
});

// Tool: list_chats
server.tool(
  "list_chats",
  "最近のチャット一覧を取得する。ステータスやメールでフィルタ可能。",
  {
    status: z
      .enum(["new", "opened", "pending", "onhold", "closed"])
      .optional()
      .describe("チャットのステータスでフィルタ"),
    customer_email: z
      .string()
      .optional()
      .describe("顧客メールアドレスで部分一致検索"),
    limit: z
      .number()
      .min(1)
      .max(100)
      .optional()
      .describe("取得件数（デフォルト20、最大100）"),
    offset: z
      .number()
      .min(0)
      .optional()
      .describe("オフセット（ページネーション用）"),
  },
  async ({ status, customer_email, limit, offset }) => {
    try {
      const result = await client.searchChats({
        status,
        customerEmail: customer_email,
        limit: limit ?? 20,
        offset: offset ?? 0,
      });

      return {
        content: [{ type: "text" as const, text: JSON.stringify(result, null, 2) }],
      };
    } catch (e: any) {
      return {
        content: [{ type: "text" as const, text: `Error: ${e.message}` }],
        isError: true,
      };
    }
  }
);

// Tool: get_chat_messages
server.tool(
  "get_chat_messages",
  "特定のチャットのメッセージ履歴を取得する。",
  {
    chat_id: z.number().describe("チャットID"),
    limit: z
      .number()
      .min(1)
      .max(100)
      .optional()
      .describe("取得件数（デフォルト50、最大100）"),
    offset: z
      .number()
      .min(0)
      .optional()
      .describe("オフセット（ページネーション用）"),
  },
  async ({ chat_id, limit, offset }) => {
    try {
      const result = await client.getChatMessages(chat_id, {
        limit: limit ?? 50,
        offset: offset ?? 0,
      });
      return {
        content: [{ type: "text" as const, text: JSON.stringify(result, null, 2) }],
      };
    } catch (e: any) {
      return {
        content: [{ type: "text" as const, text: `Error: ${e.message}` }],
        isError: true,
      };
    }
  }
);

// Tool: search_customers
server.tool(
  "search_customers",
  "顧客をメールアドレスまたは名前で検索する。",
  {
    email: z
      .string()
      .optional()
      .describe("メールアドレスで部分一致検索"),
    name: z
      .string()
      .optional()
      .describe("名前で部分一致検索"),
    limit: z
      .number()
      .min(1)
      .max(100)
      .optional()
      .describe("取得件数（デフォルト20、最大100）"),
    offset: z
      .number()
      .min(0)
      .optional()
      .describe("オフセット（ページネーション用）"),
  },
  async ({ email, name, limit, offset }) => {
    try {
      if (!email && !name) {
        return {
          content: [
            { type: "text" as const, text: "Error: email または name のどちらかを指定してください。" },
          ],
          isError: true,
        };
      }
      const result = await client.searchCustomers({
        email,
        name,
        limit: limit ?? 20,
        offset: offset ?? 0,
      });
      return {
        content: [{ type: "text" as const, text: JSON.stringify(result, null, 2) }],
      };
    } catch (e: any) {
      return {
        content: [{ type: "text" as const, text: `Error: ${e.message}` }],
        isError: true,
      };
    }
  }
);

// Tool: get_customer
server.tool(
  "get_customer",
  "顧客IDから顧客の詳細情報を取得する。",
  {
    customer_id: z.number().describe("顧客ID"),
  },
  async ({ customer_id }) => {
    try {
      const result = await client.getCustomer(customer_id);
      return {
        content: [{ type: "text" as const, text: JSON.stringify(result, null, 2) }],
      };
    } catch (e: any) {
      return {
        content: [{ type: "text" as const, text: `Error: ${e.message}` }],
        isError: true,
      };
    }
  }
);

async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error("HelpCrunch MCP server started");
}

main().catch((e) => {
  console.error("Fatal error:", e);
  process.exit(1);
});
