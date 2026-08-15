# Graph Report - src  (2026-08-15)

## Corpus Check
- cluster-only mode — file stats not available

## Summary
- 127 nodes · 115 edges · 14 communities
- Extraction: 100% EXTRACTED · 0% INFERRED · 0% AMBIGUOUS
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `b8915b32`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- Community 0
- Community 1
- Community 2
- Community 3
- Community 4
- Community 5
- Community 6
- Community 7
- Community 8
- Community 9
- Community 10
- Community 11
- Community 12

## God Nodes (most connected - your core abstractions)
1. `compilerOptions` - 11 edges
2. `Install per platform` - 10 edges
3. `Intelliverse Conversational Avatar` - 7 edges
4. `Deploy Desktop App (IVX Agency)` - 7 edges
5. `Scaffold Game Backend (Nakama)` - 7 edges
6. `Intelliverse Router MCP server + Agent Skills` - 6 edges
7. `Intelliverse Router MCP` - 6 edges
8. `Intelliverse NL App Builder` - 6 edges
9. `files` - 4 edges
10. `scripts` - 4 edges

## Surprising Connections (you probably didn't know these)
- None detected - all connections are within the same source files.

## Import Cycles
- None detected.

## Communities (14 total, 0 thin omitted)

### Community 0 - "Community 0"
Cohesion: 0.10
Nodes (20): bin, intelliverse-router-mcp, description, files, license, main, mcpName, name (+12 more)

### Community 1 - "Community 1"
Cohesion: 0.12
Nodes (15): Agent Skills, ChatGPT, Claude Code, Claude Desktop, Cline, Continue, Cursor, Development (+7 more)

### Community 2 - "Community 2"
Cohesion: 0.14
Nodes (13): src, compilerOptions, declaration, esModuleInterop, module, moduleResolution, outDir, rootDir (+5 more)

### Community 3 - "Community 3"
Cohesion: 0.22
Nodes (9): dotenv, @modelcontextprotocol/sdk, dependencies, dotenv, @modelcontextprotocol/sdk, node-fetch, zod, node-fetch (+1 more)

### Community 4 - "Community 4"
Cohesion: 0.22
Nodes (8): description, name, packages, repository, source, url, $schema, version

### Community 5 - "Community 5"
Cohesion: 0.25
Nodes (7): Billing, Honesty, Intelliverse Conversational Avatar, Links, The wiring (verified endpoints, do not invent others), When to use, Workflow

### Community 6 - "Community 6"
Cohesion: 0.25
Nodes (7): Deploy Desktop App (IVX Agency), Honesty, Links, Platforms (honest scope), Verified MCP tools, When to use, Workflow

### Community 7 - "Community 7"
Cohesion: 0.25
Nodes (7): Example RPC stub (TypeScript), Honest scope, Links, Scaffold Game Backend (Nakama), Verified MCP tools, When to use, Workflow

### Community 8 - "Community 8"
Cohesion: 0.29
Nodes (7): devDependencies, tsx, @types/node, typescript, tsx, @types/node, typescript

### Community 9 - "Community 9"
Cohesion: 0.29
Nodes (6): 60-second loop, Intelliverse Router MCP, Links, One-block MCP config, Verified tools (mcp/dist/index.js), When to use

### Community 10 - "Community 10"
Cohesion: 0.29
Nodes (6): Honesty, Intelliverse NL App Builder, Links, Verified MCP tools (do not invent others), When to use, Workflow

### Community 11 - "Community 11"
Cohesion: 0.29
Nodes (3): Json, server, transport

### Community 12 - "Community 12"
Cohesion: 0.40
Nodes (4): Agent instructions, Code memory (Graphify) — use this before grepping, Ops, Without MCP (primary for this tier)

## Knowledge Gaps
- **87 isolated node(s):** `name`, `version`, `description`, `type`, `intelliverse-router-mcp` (+82 more)
  These have ≤1 connection - possible missing edges or undocumented components.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `dependencies` connect `Community 3` to `Community 0`?**
  _High betweenness centrality (0.031) - this node is a cross-community bridge._
- **Why does `devDependencies` connect `Community 8` to `Community 0`?**
  _High betweenness centrality (0.024) - this node is a cross-community bridge._
- **What connects `name`, `version`, `description` to the rest of the system?**
  _87 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `Community 0` be split into smaller, more focused modules?**
  _Cohesion score 0.09523809523809523 - nodes in this community are weakly interconnected._
- **Should `Community 1` be split into smaller, more focused modules?**
  _Cohesion score 0.125 - nodes in this community are weakly interconnected._
- **Should `Community 2` be split into smaller, more focused modules?**
  _Cohesion score 0.14285714285714285 - nodes in this community are weakly interconnected._