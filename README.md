# Intelliverse Router MCP server

Drive the whole platform from any MCP-capable agent (Cursor, Claude Desktop/Code, etc.):
create App IDs, mint tier API keys, ingest and search per-app knowledge bases,
generate media, check credits, and chat — without ever naming an LLM.

## Install

No install step — run it straight from GitHub with `npx`
(the prebuilt server is committed under `dist/`):

```bash
npx -y github:intelli-verse-x/router-mcp
```

> `@intelliverse/router-mcp` is not yet published to the public npm registry;
> until it is, the `github:` specifier above is the supported install path.

For local development:

```bash
git clone https://github.com/intelli-verse-x/router-mcp && cd router-mcp
npm install && npm run build
```

## Configure (Cursor example)

`.cursor/mcp.json`:

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

- `ROUTER_API_KEY` — a tier key from **Workspace → API Keys** (chat, KB, media, credits).
- `ROUTER_MANAGEMENT_KEY` — from **Account → Management Keys** with `apps` + `keys` scopes (admin tools).
- `EDGE_BASE_URL` / `KB_BASE_URL` — override for self-hosted or local dev.

## Tools

| Tool | Auth | What it does |
|---|---|---|
| `chat` | API key | Chat completion; `model` optional (Intelliverse default routes at your plan tier) |
| `list_models` | API key | Tier aliases your key can call |
| `get_credits` | API key | LLM daily budget + per-App-ID media credit wallets |
| `create_app` / `list_apps` | management | App IDs — entry point for KB, wallets, per-app costs |
| `create_api_key` / `list_api_keys` / `revoke_api_key` | management | Tier-gated key administration |
| `kb_ingest` / `kb_search` / `kb_chat` / `kb_documents` | API key | App-scoped pgvector knowledge base |
| `generate_media` / `media_job_status` | API key | Credit-metered image/video/voice/audio/3D jobs |

## The 60-second loop

1. `create_app` — describe your app; get an App ID and recommended tier.
2. `create_api_key` — mint a key bound to that app.
3. `kb_ingest` — feed it docs or URLs.
4. `chat` / `kb_chat` — start building. No model names, ever.

See also [`skills/intelliverse-router/SKILL.md`](../skills/intelliverse-router/SKILL.md)
for the drop-in agent skill version of this workflow.

## Planned tools (not yet implemented)

Defined in [docs/business/app-platform-plan.md](../docs/business/app-platform-plan.md);
schemas below are the contract for the app-platform rollout. None of these are
callable yet — the server does not register them.

### End-user wallets (white-label; app-platform-plan §3)

| Tool | Auth | Input schema (zod-style) |
|---|---|---|
| `create_end_user_wallet` | server key | `{ app_id: uuid, external_user_id: string, currencies?: string[] }` — idempotent |
| `credit_end_user` | server key | `{ app_id: uuid, external_user_id: string, currency: string, amount: number>0, reason: string, idempotency_key: string }` |
| `debit_end_user` | server key | same as `credit_end_user`; fails on insufficient available balance |
| `end_user_balance` | server key | `{ app_id: uuid, external_user_id: string }` → balances + active holds |
| `end_user_history` | server key | `{ app_id: uuid, external_user_id: string, cursor?: string, limit?: int<=100 }` |

### Game backend (Nakama resale; app-platform-plan §4)

| Tool | Auth | Input schema |
|---|---|---|
| `provision_leaderboard` | management | `{ app_id: uuid, leaderboard_id: string, sort: "asc"\|"desc", reset?: cron-string }` — idempotent |
| `provision_tournament` | management | `{ app_id: uuid, tournament_id: string, starts_at: iso, ends_at: iso, rewards?: [{rank_min, rank_max, currency, amount}] }` |
| `provision_feature` | management | `{ app_id: uuid, feature: "daily_rewards"\|"achievements"\|"storage"\|"streaks"\|"missions"\|"inventory"\|"store"\|"teams"\|"chat"\|"push"\|"multiplayer"\|"live_ops", config?: object }` |
| `list_app_features` | management | `{ app_id: uuid }` → provisioned features + status |

### Agents (app-platform-plan §5)

| Tool | Auth | Input schema |
|---|---|---|
| `schedule_agent` | management | `{ app_id: uuid, name: string, kind: "scheduled"\|"webhook", schedule_cron?: string, prompt: string, tier?: "air"\|"pro"\|"pro_max", timeout_minutes?: int<=60 }` |
| `list_agents` | management | `{ app_id: uuid }` → agents + last run status |
| `run_agent_now` | management | `{ app_id: uuid, agent_id: uuid }` → run id |
| `agent_run_status` | API key | `{ run_id: uuid }` → status, run_minutes, credits_spent, output ref |

### Observability

| Tool | Auth | Input schema |
|---|---|---|
| `get_spend` | management | `{ app_id?: uuid, period?: "day"\|"week"\|"month" }` → LLM spend, credits by kind, ops, agent minutes |
| `kb_graph` | API key | `{ app_id: uuid, query?: string, depth?: int<=3 }` → chunk/entity graph neighborhood (backs the dashboard KB explorer) |

Rules carried over: tool inputs never accept model names; every tool is scoped
to an `app_id` and persists state under that App-ID.

## Planned tools

Comms & engagement (per-App-ID channels — design in
[`docs/business/comms-offerings.md`](../docs/business/comms-offerings.md), agent
workflow in [`skills/comms/SKILL.md`](../skills/comms/SKILL.md)):

| Tool | Auth | What it will do |
|---|---|---|
| `provision_phone_number` | management | Buy a number (Telnyx) and attach it to an App-ID ($4/mo from the app wallet) |
| `create_voice_agent` | management | **Shipped in web** (see below) — KB-grounded AI phone agent (Fonoster autopilot); inbound/outbound, standard/premium voice, per-minute credits |
| `send_whatsapp_template` | API key | Send an approved WhatsApp template (utility/auth/marketing) — blocked until Meta approval; US marketing refused (Meta pause) |
| `create_newsletter` | management | SES-backed AI newsletter for the app: domain verification, KB-grounded drafting, scheduled sends (credits per 1k recipients) |
| `send_push` | API key | Push to a segment via Nakama notifications (if attached) or AWS SNS (credits per 1k pushes) |

**Voice tools shipped in the web App Console (2026-07-10).** The console chat
(`web/lib/console/tools.ts`) and dashboard API now implement, Pro+ gated and
scoped to one App-ID:

| Tool | Status | Contract |
|---|---|---|
| `create_voice_agent` | shipped (web console) | `{ name: string, direction?: "inbound"\|"outbound"\|"both", persona_prompt?: string, kb_grounded?: bool = true, voice_id?: "aurora"\|"orion"\|"nova"\|"sage", voice_class?: "standard"\|"premium" }` — provisions a Fonoster autopilot app whose LLM rides the LiteLLM gateway at the plan's tier alias and whose `search_knowledge_base` tool hits the app's pgvector KB |
| `list_voice_agents` | shipped (web console) | `{}` → agents + recent calls (never provider refs or raw voice ids) |
| `place_call` | shipped (web console) | `{ agent_id: uuid, to: E.164, max_minutes?: int = 10 }` — holds `max_minutes × per-minute credits` from the app's `iv_credits` wallet, settles to actual minutes on completion; requires explicit user confirmation (rings a real phone) |

MCP-server wiring for these three tools is a **follow-up** (this server does
not register them yet); HTTP equivalents live under
`/api/apps/[id]/voice-agents` in the web app. `provision_phone_number` remains
planned.
