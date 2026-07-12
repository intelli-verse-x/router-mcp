# Intelliverse Router MCP

Wire any coding agent to the Intelliverse platform in under 60 seconds.

## When to use

- User needs MCP setup for Cursor, Claude Desktop, or other MCP clients
- User wants create_app, keys, KB, media, credits from chat
- First-time onboarding after signup

## One-block MCP config

```json
{
  "mcpServers": {
    "intelliverse-router": {
      "command": "npx",
      "args": ["-y", "github:intelli-verse-x/router-mcp"],
      "env": {
        "ROUTER_API_KEY": "iv-r-v1-...",
        "ROUTER_MANAGEMENT_KEY": "ivm-...",
        "ROUTER_WORKSPACE_ID": "your-workspace-uuid"
      }
    }
  }
}
```

Keys from Dashboard → API Keys and Account → Management Keys.

## Verified tools (mcp/dist/index.js)

| Tool | Scope |
|------|-------|
| `chat` | Tier-routed completions |
| `list_models` | Tier aliases only |
| `get_credits` | Budget + per-app wallets |
| `create_app` | App ID + tier recommendation |
| `list_apps` | Workspace apps |
| `create_api_key` | Mint tier keys |
| `list_api_keys` | Prefixes + limits |
| `revoke_api_key` | Delete key |
| `kb_ingest` | URL/text ingest |
| `kb_search` | Semantic search |
| `kb_chat` | RAG with citations |
| `kb_documents` | List ingested docs |
| `send_email` | Per-App-ID email (Pro+, email.send10 SKU) |
| `generate_media` | image/video/voiceover/audio/gen3d |
| `media_job_status` | Poll async jobs |

## 60-second loop

1. `create_app` — name + use_cases
2. `create_api_key` — bind app_id, pick tier
3. `kb_ingest` — user's docs URL
4. `kb_chat` — verify RAG works
5. Report App ID, key prefix, credits remaining

## Links

- Docs: https://router.intelli-verse-x.ai/docs#mcp
- Agent Skills hub: https://router.intelli-verse-x.ai/docs#agent-skills
