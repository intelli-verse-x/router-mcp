# Intelliverse Router MCP server + Agent Skills

Run the whole [Intelliverse platform](https://router.intelli-verse-x.ai) from any
MCP-capable agent: create App IDs, mint tier API keys, ingest and search per-app
knowledge bases, send email, generate media, check credits, and chat — without
ever naming an LLM.

```bash
npx -y github:intelli-verse-x/router-mcp
```

Verified 2026-07-12: `initialize` + `tools/list` over stdio, 15 tools.
Full setup guide with copy-paste configs: <https://router.intelli-verse-x.ai/skills>

## Tools (15)

| Tool | Auth | What it does |
|---|---|---|
| `chat` | API key | Chat completion; `model` optional (Intelliverse default routes at your plan tier) |
| `list_models` | API key | Tier aliases your key can call |
| `get_credits` | API key | LLM daily budget + per-App-ID media credit wallets |
| `create_app` / `list_apps` | management | App IDs — entry point for KB, wallets, per-app costs |
| `create_api_key` / `list_api_keys` / `revoke_api_key` | management | Tier-gated key administration |
| `kb_ingest` / `kb_search` / `kb_chat` / `kb_documents` | API key | App-scoped pgvector knowledge base |
| `send_email` | API key | Per-App-ID email via the platform engine (Pro+, `email.send10` SKU, hold → settle) |
| `generate_media` / `media_job_status` | API key | Credit-metered image/video/voice/audio/3D jobs |

Env vars: `ROUTER_API_KEY` (Workspace → API Keys), `ROUTER_MANAGEMENT_KEY`
(Account → Management Keys; needed for app/key admin tools),
`ROUTER_WORKSPACE_ID` (default workspace for admin tools). Optional overrides:
`EDGE_BASE_URL`, `KB_BASE_URL`. Keys are free —
[sign up](https://router.intelli-verse-x.ai), no card.

## Install per platform

The JSON body is identical everywhere; only the file location / wrapper differs.

### Cursor

One-click: [Add to Cursor](cursor://anysphere.cursor-deeplink/mcp/install?name=intelliverse-router&config=eyJjb21tYW5kIjoibnB4IiwiYXJncyI6WyIteSIsImdpdGh1YjppbnRlbGxpLXZlcnNlLXgvcm91dGVyLW1jcCJdLCJlbnYiOnsiUk9VVEVSX0FQSV9LRVkiOiIiLCJST1VURVJfTUFOQUdFTUVOVF9LRVkiOiIiLCJST1VURVJfV09SS1NQQUNFX0lEIjoiIn19)
— or `.cursor/mcp.json` (project) / `~/.cursor/mcp.json` (global):

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

### Claude Desktop

Same JSON as Cursor, in `claude_desktop_config.json`
(macOS: `~/Library/Application Support/Claude/`, Windows: `%APPDATA%\Claude\`).

### Claude Code

```bash
claude mcp add intelliverse-router \
  --env ROUTER_API_KEY=iv-r-v1-... \
  --env ROUTER_MANAGEMENT_KEY=ivm-... \
  --env ROUTER_WORKSPACE_ID=your-workspace-uuid \
  -- npx -y github:intelli-verse-x/router-mcp
```

### VS Code (GitHub Copilot)

`.vscode/mcp.json`:

```json
{
  "servers": {
    "intelliverse-router": {
      "type": "stdio",
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

### Windsurf

Same JSON as Cursor, in `~/.codeium/windsurf/mcp_config.json`.

### Cline

Same JSON as Cursor, via the MCP Servers panel → Configure MCP Servers
(`cline_mcp_settings.json`).

### Continue

`~/.continue/config.yaml`:

```yaml
mcpServers:
  - name: intelliverse-router
    command: npx
    args: ["-y", "github:intelli-verse-x/router-mcp"]
    env:
      ROUTER_API_KEY: iv-r-v1-...
      ROUTER_MANAGEMENT_KEY: ivm-...
      ROUTER_WORKSPACE_ID: your-workspace-uuid
```

### OpenAI Codex CLI

```bash
codex mcp add intelliverse-router \
  --env ROUTER_API_KEY=iv-r-v1-... \
  --env ROUTER_MANAGEMENT_KEY=ivm-... \
  --env ROUTER_WORKSPACE_ID=your-workspace-uuid \
  -- npx -y github:intelli-verse-x/router-mcp
```

### ChatGPT

ChatGPT developer-mode apps connect only to *remote* MCP servers over HTTPS;
this server is stdio-only today, so there is no ChatGPT path yet (hosted
streamable-HTTP endpoint is on the roadmap). In the OpenAI ecosystem use the
Codex CLI above.

## Agent Skills

`skills/` ships SKILL.md playbooks that drive these tools end-to-end — copy them
into your agent's skills folder (`~/.cursor/skills/` for Cursor,
`~/.claude/skills/` for Claude Code):

| Skill | What it does |
|---|---|
| `intelliverse-router` | Platform wiring — the 60-second create_app → key → KB loop |
| `nl-app-builder` | Scaffold web/mobile apps wired to an App ID |
| `scaffold-game` | Honest-scope Nakama game-backend stubs |
| `deploy-desktop` | Electron/Tauri desktop apps delegating to IVX Agency |
| `conversational-avatar` | Real-time voice + lip-sync avatars over LiveKit |

```bash
git clone https://github.com/intelli-verse-x/router-mcp
cp -r router-mcp/skills/* ~/.cursor/skills/   # or ~/.claude/skills/
```

## The 60-second loop

1. `create_app` — describe your app; get an App ID and recommended tier.
2. `create_api_key` — mint a key bound to that app.
3. `kb_ingest` — feed it docs or URLs.
4. `chat` / `kb_chat` — start building. No model names, ever.
5. `send_email` — tell your users it's live.

## Development

```bash
npm install && npm run build && node dist/index.js
```

`server.json` at the repo root is the payload published to the official
[MCP Registry](https://registry.modelcontextprotocol.io) as
`io.github.intelli-verse-x/router-mcp` (MCPB bundle from the GitHub release).
