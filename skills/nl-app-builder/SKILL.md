# Intelliverse NL App Builder

Build web and mobile apps from natural language, wired to Intelliverse experiences.

## When to use

- User asks to scaffold a SaaS, dashboard, or mobile companion app
- User wants Next.js, React, or React Native with Intelliverse chat + KB
- User needs create_app → create_api_key → kb_ingest in one agent loop

## Verified MCP tools (do not invent others)

| Tool | Purpose |
|------|---------|
| `create_app` | Create experience with use_cases and tier recommendation |
| `create_api_key` | Mint tier key bound to app_id |
| `kb_ingest` | Ingest docs/URLs into app-scoped memory |
| `kb_chat` | RAG chat with citations |
| `chat` | Tier-routed LLM (omit model or use intelliverse/pro) |
| `get_credits` | Check wallet before media generation |

## Workflow

1. **Clarify scope** — web (Next.js) vs mobile (Expo/React Native). Ask for app name and primary URL if known.
2. **Create experience** — call `create_app` with experience kind `app` and use_cases: chat, coding, rag (add image/video if needed).
3. **Mint key** — `create_api_key` with recommended tier, bind `app_id`.
4. **Scaffold** — generate project files. Use OpenAI SDK pattern:

```typescript
const client = new OpenAI({
  apiKey: process.env.INTELLIVERSE_API_KEY,
  baseURL: "https://router-api.intelli-verse-x.ai/v1",
});
// Omit model — routes at key tier
```

5. **Ingest KB** — if user provided docs URL, call `kb_ingest` before shipping RAG features.
6. **Receipts** — tell the user their Experience ID, key prefix, and link to `/dashboard/apps`.

## Honesty

- Do not claim auto-deploy to Vercel/AWS unless user provides credentials
- Media generation meters iv_credits — surface `get_credits` before batch image jobs
- Model slugs: only intelliverse tier aliases exist

## Links

- Docs: https://router.intelli-verse-x.ai/docs#agent-skills
- MCP config: https://router.intelli-verse-x.ai/docs#mcp
