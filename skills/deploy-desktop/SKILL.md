# Deploy Desktop App (IVX Agency)

Scaffold Windows, macOS, and Ubuntu desktop apps that delegate work to IVX Agency cloud agents.

## When to use

- User asks for Electron/Tauri desktop app on Windows, macOS, or Linux
- User wants "close the laptop" delegation to cloud workers
- Agency angle: one desktop app, multiple client App-ID workspaces

## Platforms (honest scope)

| Platform | Packaging | Status |
|----------|-----------|--------|
| macOS | .dmg (Apple Silicon + Intel) | Scaffold + early-access builds |
| Windows | .msi / installer | Scaffold + early-access builds |
| Ubuntu/Linux | AppImage, .deb, .rpm | Scaffold + early-access builds |

Public download URLs are rolling out — direct users to `/demo` for early access.

## Verified MCP tools

| Tool | Purpose |
|------|---------|
| `create_app` | Per-client or per-product App ID |
| `create_api_key` | Management + tier keys for agent loop |
| `list_apps` | Enumerate agency workspaces |

## Workflow

1. **Clarify** — Electron vs Tauri; single-tenant vs multi-client (agency).
2. **Wire Intelliverse** — env vars: `INTELLIVERSE_API_KEY`, `ROUTER_MANAGEMENT_KEY`, `ROUTER_WORKSPACE_ID`.
3. **Scaffold** — main process + renderer; cloud task queue UI; native notifications (Electron `Notification`).
4. **Delegate pattern** — task describe → cloud worker queue → notify on complete (see `/desktop`).
5. **IVX Agency connectors** — QuestX skill packs and app catalog as optional modules (link-out, not invented APIs).

## Honesty

- Mobile push notifications: **Roadmap** — desktop + chat platforms only today
- Named seats admin panel: **Roadmap** — allowlists + pairing are Live
- Do not print fake download buttons; use `/demo` CTA

## Links

- Desktop product page: https://router.intelli-verse-x.ai/desktop
- Agency workflow: https://router.intelli-verse-x.ai/agency
