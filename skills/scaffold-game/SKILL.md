# Scaffold Game Backend (Nakama)

Honest-scope game backend scaffolding with Nakama — not a Unity editor replacement.

## When to use

- User asks for multiplayer leaderboard, wallet, or RPC stubs
- User mentions Nakama, game server, or IVX game SDK patterns
- User wants iv_credits wallet integration for in-game economy

## Honest scope

| In scope | Out of scope (say so) |
|----------|----------------------|
| Nakama TypeScript/Lua module stubs | Unity/Unreal editor automation |
| Leaderboard RPCs, matchmaker hooks | Full game art/asset pipeline |
| Router wallet hold/settle patterns | Claiming "build a complete game in one prompt" |
| Document Unity client wiring steps | Auto-generating production-ready netcode |

Position like Unity-style **backend** scaffolding: agents produce server modules + integration docs; client wiring is a follow-up task.

## Verified MCP tools

| Tool | Purpose |
|------|---------|
| `create_app` | Game App ID (category: entertainment, use_cases: chat + gen3d if needed) |
| `create_api_key` | Server-side API access |
| `get_credits` | Wallet balance for media/gen3d SKUs |

## Workflow

1. **Clarify game type** — casual leaderboard vs realtime multiplayer vs single-player with economy.
2. **Create App ID** — `create_app` with category `entertainment`, use_cases as needed.
3. **Scaffold Nakama module** — RPCs for leaderboard submit/fetch, wallet debit hooks pointing to router wallet docs.
4. **Document client steps** — "Unity: install Nakama SDK, call RPC X" — do not generate binary assets.
5. **Wallet honesty** — Nakama holds/settle via `nakama/router-wallet`; link to repo README.

## Example RPC stub (TypeScript)

```typescript
// Leaderboard submit — wire to your Nakama runtime
function rpcSubmitScore(ctx: nkruntime.Context, logger: nkruntime.Logger, nk: nkruntime.Nakama, payload: string) {
  // Parse score, validate, write to leaderboard storage
}
```

## Links

- Nakama wallet: repo `nakama/router-wallet/README.md`
- Intelliverse tiers for gen3d/media: https://router.intelli-verse-x.ai/pricing
