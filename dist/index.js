#!/usr/bin/env node
/**
 * Intelliverse Router MCP server (stdio).
 *
 * Lets any MCP-capable agent (Cursor, Claude, etc.) drive the platform:
 * create experiences, mint tier API keys, ingest/search scoped Knowledge,
 * generate media, check credits, and chat — without ever naming an LLM.
 *
 * Env:
 *   EDGE_BASE_URL           edge proxy (default https://router-api.intelli-verse-x.ai)
 *   KB_BASE_URL             KB service (default https://kb.router.intelli-verse-x.ai)
 *   ROUTER_API_KEY          tier API key (chat, KB, media, credits)
 *   ROUTER_MANAGEMENT_KEY   management key (apps + key administration)
 *   ROUTER_WORKSPACE_ID     default workspace uuid for admin tools
 */
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";
const EDGE = process.env.EDGE_BASE_URL ?? "https://router-api.intelli-verse-x.ai";
const KB = process.env.KB_BASE_URL ?? "https://kb.router.intelli-verse-x.ai";
const API_KEY = process.env.ROUTER_API_KEY ?? "";
const MANAGEMENT_KEY = process.env.ROUTER_MANAGEMENT_KEY ?? "";
const WORKSPACE_ID = process.env.ROUTER_WORKSPACE_ID ?? "";
async function call(base, path, opts) {
    if (!opts.bearer) {
        throw new Error(path.startsWith("/v1/admin")
            ? "ROUTER_MANAGEMENT_KEY is not set. Create a management key in the dashboard (Account → Management Keys)."
            : "ROUTER_API_KEY is not set. Create an API key in the dashboard (Workspace → API Keys).");
    }
    const qs = opts.query
        ? "?" +
            Object.entries(opts.query)
                .filter(([, v]) => v !== undefined && v !== "")
                .map(([k, v]) => `${encodeURIComponent(k)}=${encodeURIComponent(v)}`)
                .join("&")
        : "";
    const res = await fetch(`${base}${path}${qs}`, {
        method: opts.method ?? (opts.body ? "POST" : "GET"),
        headers: {
            Authorization: `Bearer ${opts.bearer}`,
            // Content-Type only when a body is sent: Fastify 400s
            // (FST_ERR_CTP_EMPTY_JSON_BODY) on bodyless DELETEs that claim JSON.
            ...(opts.body ? { "Content-Type": "application/json" } : {})
        },
        body: opts.body ? JSON.stringify(opts.body) : undefined
    });
    const text = await res.text();
    let json;
    try {
        json = text ? JSON.parse(text) : {};
    }
    catch {
        json = { raw: text };
    }
    if (!res.ok) {
        throw new Error(`${res.status} ${path}: ${JSON.stringify(json)}`);
    }
    return json;
}
function ok(data) {
    return { content: [{ type: "text", text: JSON.stringify(data, null, 2) }] };
}
function workspace(explicit) {
    const ws = explicit ?? WORKSPACE_ID;
    if (!ws)
        throw new Error("Provide workspace_id or set ROUTER_WORKSPACE_ID.");
    return ws;
}
const server = new McpServer({ name: "intelliverse-router", version: "0.2.0" });
// ---------------------------------------------------------------------------
// Chat — the product itself. `model` is optional (the Intelliverse default).
// ---------------------------------------------------------------------------
server.registerTool("chat", {
    title: "Chat via Intelliverse Router",
    description: "Send a chat completion. Never name an LLM — omit `model` (the Intelliverse default routes at " +
        "your plan tier) or pass intelliverse/air, intelliverse/pro, intelliverse/pro-max, intelliverse/fusion.",
    inputSchema: {
        prompt: z.string().describe("User message"),
        system: z.string().optional().describe("Optional system prompt"),
        model: z
            .enum(["intelliverse", "intelliverse/air", "intelliverse/pro", "intelliverse/pro-max", "intelliverse/fusion"])
            .optional()
            .describe("Optional tier alias; omit for the Intelliverse default")
    }
}, async ({ prompt, system, model }) => {
    const messages = [
        ...(system ? [{ role: "system", content: system }] : []),
        { role: "user", content: prompt }
    ];
    const res = await call(EDGE, "/v1/chat/completions", {
        bearer: API_KEY,
        body: { ...(model ? { model } : {}), messages }
    });
    const content = res?.choices?.[0]?.message?.content ?? res;
    return ok(content);
});
server.registerTool("list_models", {
    title: "List available tiers",
    description: "List the tier aliases your API key can call. These are the only model strings that exist.",
    inputSchema: {}
}, async () => ok(await call(EDGE, "/v1/models", { bearer: API_KEY })));
server.registerTool("get_credits", {
    title: "Get budget and credit balances",
    description: "LLM daily budget for the API key plus experience-scoped media credit wallets (image, video, voice, audio, audiobook, 3D).",
    inputSchema: { app_id: z.string().uuid().optional() }
}, async ({ app_id }) => ok(await call(EDGE, "/v1/credits", { bearer: API_KEY, query: { app_id } })));
// ---------------------------------------------------------------------------
// Stable apps API — customer display object is Experience.
// ---------------------------------------------------------------------------
server.registerTool("create_app", {
    title: "Create an experience",
    description: "Create an experience with isolated Knowledge, Memory, credentials, wallet, and usage tracking. " +
        "Returns its Experience ID and a recommended tier based on the declared workload.",
    inputSchema: {
        name: z.string().min(1),
        url: z.string().url().optional(),
        category: z.enum(["coding", "productivity", "creative", "entertainment", "other"]).default("other"),
        experience_kind: z.enum(["brand", "app", "game", "agent", "phygital"]).default("app"),
        use_cases: z
            .array(z.enum([
            "chat", "coding", "extraction", "summarization", "reasoning", "rag", "vision",
            "image", "video", "voiceover", "audio", "audiobook", "gen3d"
        ]))
            .min(1),
        req_per_day: z.number().positive().default(1000),
        tokens_per_req: z.number().positive().default(2000),
        latency: z.enum(["strict", "normal", "relaxed"]).default("normal"),
        workspace_id: z.string().uuid().optional()
    }
}, async ({ workspace_id, ...body }) => ok(await call(EDGE, "/v1/admin/apps", {
    bearer: MANAGEMENT_KEY,
    body: { ...body, workspace_id: workspace(workspace_id) }
})));
server.registerTool("list_apps", {
    title: "List experiences",
    description: "List experiences in the workspace with their recommended tiers and routing profiles.",
    inputSchema: { workspace_id: z.string().uuid().optional() }
}, async ({ workspace_id }) => ok(await call(EDGE, "/v1/admin/apps", {
    bearer: MANAGEMENT_KEY,
    query: { workspace_id: workspace(workspace_id) }
})));
// ---------------------------------------------------------------------------
// API keys — mint tier-gated LiteLLM virtual keys.
// ---------------------------------------------------------------------------
server.registerTool("create_api_key", {
    title: "Create an API key",
    description: "Mint a tier API key (air | pro | pro_max), optionally bound to an Experience ID and daily spend limit. " +
        "The raw key is returned exactly once — store it.",
    inputSchema: {
        name: z.string().min(1),
        tier: z.enum(["air", "pro", "pro_max"]),
        app_id: z.string().uuid().optional(),
        spend_limit_usd: z.number().positive().optional(),
        workspace_id: z.string().uuid().optional()
    }
}, async ({ workspace_id, ...body }) => ok(await call(EDGE, "/v1/admin/keys", {
    bearer: MANAGEMENT_KEY,
    body: { ...body, workspace_id: workspace(workspace_id) }
})));
server.registerTool("list_api_keys", {
    title: "List API keys",
    description: "List API keys (prefixes only) with tier, app binding, and spend limits.",
    inputSchema: { workspace_id: z.string().uuid().optional() }
}, async ({ workspace_id }) => ok(await call(EDGE, "/v1/admin/keys", {
    bearer: MANAGEMENT_KEY,
    query: { workspace_id: workspace(workspace_id) }
})));
server.registerTool("revoke_api_key", {
    title: "Revoke an API key",
    description: "Permanently delete an API key by id.",
    inputSchema: { id: z.string().uuid() }
}, async ({ id }) => {
    await call(EDGE, `/v1/admin/keys/${id}`, { method: "DELETE", bearer: MANAGEMENT_KEY });
    return ok({ deleted: true, id });
});
// ---------------------------------------------------------------------------
// Knowledge base — app_id-scoped pgvector memory.
// ---------------------------------------------------------------------------
server.registerTool("kb_ingest", {
    title: "Ingest into an experience's Knowledge base",
    description: "Add documents (raw text or URLs — URLs are scraped) to the app's pgvector knowledge base. " +
        "Chunks are embedded and become searchable Knowledge for that experience.",
    inputSchema: {
        app_id: z.string().uuid(),
        documents: z
            .array(z.object({
            title: z.string().optional(),
            text: z.string().optional(),
            url: z.string().url().optional(),
            metadata: z.record(z.unknown()).optional()
        }))
            .min(1)
    }
}, async ({ app_id, documents }) => ok(await call(KB, "/v1/kb/ingest", { bearer: API_KEY, body: { app_id, documents } })));
server.registerTool("kb_search", {
    title: "Search an experience's Knowledge base",
    description: "Semantic search over the app's chunks. Returns matches with similarity scores.",
    inputSchema: {
        app_id: z.string().uuid(),
        query: z.string().min(1),
        top_k: z.number().int().min(1).max(50).default(8)
    }
}, async ({ app_id, query, top_k }) => ok(await call(KB, "/v1/kb/search", { bearer: API_KEY, body: { app_id, query, top_k } })));
server.registerTool("kb_chat", {
    title: "Chat grounded in an experience's Knowledge base",
    description: "RAG chat: retrieves relevant chunks for the experience and answers with [doc:id] citations.",
    inputSchema: {
        app_id: z.string().uuid(),
        prompt: z.string().min(1)
    }
}, async ({ app_id, prompt }) => ok(await call(KB, "/v1/kb/chat", {
    bearer: API_KEY,
    body: { app_id, messages: [{ role: "user", content: prompt }] }
})));
server.registerTool("kb_documents", {
    title: "List knowledge base documents",
    description: "List documents ingested for an experience.",
    inputSchema: { app_id: z.string().uuid() }
}, async ({ app_id }) => ok(await call(KB, "/v1/kb/documents", { bearer: API_KEY, query: { app_id } })));
// ---------------------------------------------------------------------------
// Comms — experience-scoped email through the platform email engine (Pro+).
// ---------------------------------------------------------------------------
server.registerTool("send_email", {
    title: "Send email from an experience",
    description: "Send transactional/newsletter email through the platform email engine (Pro plan+). Billed at the " +
        "email.send10 SKU from the experience's iv_credits wallet (hold → dispatch → settle); failed sends are " +
        "never charged and partial batches settle on accepted recipients only.",
    inputSchema: {
        app_id: z.string().uuid(),
        to: z.array(z.string().email()).min(1).describe("Recipient email addresses"),
        subject: z.string().min(1).max(200),
        body_text: z.string().optional(),
        body_html: z.string().optional(),
        reply_to: z.string().email().optional()
    }
}, async (input) => ok(await call(EDGE, "/v1/comms/email", { bearer: API_KEY, body: input })));
// ---------------------------------------------------------------------------
// Media — credit-metered generation, charged to the experience's wallet.
// ---------------------------------------------------------------------------
server.registerTool("generate_media", {
    title: "Generate media",
    description: "Generate image | video | voiceover | audio (music/sfx) | gen3d assets. Credits are held from the " +
        "experience's wallet and settled on completion. Returns a job — poll with media_job_status.",
    inputSchema: {
        kind: z.enum(["image", "video", "voiceover", "audio", "gen3d"]),
        app_id: z.string().uuid(),
        prompt: z.string().optional().describe("Prompt (image/video/audio/gen3d)"),
        text: z.string().optional().describe("Text to speak (voiceover)"),
        quality_class: z.enum(["standard", "cinematic", "studio"]).default("standard"),
        audio_kind: z.enum(["music", "sfx"]).optional().describe("Required when kind=audio")
    }
}, async ({ kind, app_id, prompt, text, quality_class, audio_kind }) => {
    const body = { app_id, quality_class };
    if (kind === "voiceover")
        body.text = text ?? prompt;
    else
        body.prompt = prompt;
    if (kind === "audio")
        body.kind = audio_kind ?? "music";
    return ok(await call(EDGE, `/v1/media/${kind}`, { bearer: API_KEY, body }));
});
server.registerTool("media_job_status", {
    title: "Check a media job",
    description: "Get status/output of a media generation job.",
    inputSchema: { id: z.string().uuid() }
}, async ({ id }) => ok(await call(EDGE, `/v1/media/jobs/${id}`, { bearer: API_KEY })));
const transport = new StdioServerTransport();
await server.connect(transport);
