# MCP Sample Agent Tutorial

A Model Context Protocol (MCP) server that exposes tools, resources, and prompts for users and todos. Supports both **stdio** (local) and **Streamable HTTP** (cloud-ready) transports. This tutorial explains the project structure, how tools, resources, and prompts are built, and how to integrate with Cursor.

## Prerequisites

- Node.js 18+
- npm or pnpm

## Quick Start

```bash
npm install
npm run dev          # Run the MCP server (Streamable HTTP on port 3000)
npm run inspect      # Test in MCP Inspector
```

---

## Project Structure

```
tc_mcp_III/
├── src/
│   ├── index.ts              # Entry point: Express + Streamable HTTP transport
│   ├── server.ts             # MCP server factory (createMCPServer)
│   ├── entities/
│   │   ├── user.entity.ts    # Zod schemas and types for users
│   │   └── todo.entity.ts    # Zod schemas and types for todos
│   ├── users/
│   │   └── userHandler.ts    # Business logic: create, fetch users
│   ├── tools/
│   │   └── users/
│   │       ├── createUserTool.ts   # MCP tool: create-user
│   │       └── fetchUsersTool.ts   # MCP tool: fetch-users
│   ├── resources/
│   │   ├── users/
│   │   │   └── usersResources.ts   # MCP resource: users (read-only)
│   │   └── todo/
│   │       ├── todoResources.ts   # MCP resources: todos, single-todo (template)
│   │       └── todoHandler.ts     # Fetches todos from dummyjson.com
│   └── prompts/
│       └── todos/
│           └── todosPrompts.ts    # MCP prompt: fetch-todo-item
├── users.json                # JSON "database" for users
├── .cursor/
│   └── mcp.json              # Cursor MCP configuration
├── package.json
└── tsconfig.json
```

### Layer Responsibilities

| Layer | Purpose |
|-------|---------|
| **index.ts** | Bootstraps Express, creates server per request, connects Streamable HTTP transport |
| **server.ts** | Factory `createMCPServer()` for stateless per-request servers |
| **entities/** | Shared schemas (Zod) and TypeScript types |
| **users/** | Domain logic (CRUD) independent of MCP |
| **tools/** | MCP tool definitions: wire schema + handler via `registerXxx(server)` |
| **resources/** | MCP resource definitions: read-only data exposed via URI |
| **prompts/** | MCP prompt templates for AI interactions |

---

## Transport: Streamable HTTP

The server uses **Streamable HTTP** transport, making it suitable for cloud deployment (e.g., GCP Cloud Run). Each HTTP request gets a fresh MCP server instance (stateless pattern).

### How It Works

1. Express app listens on `PORT` (default 3000)
2. All MCP traffic goes to the `/mcp` endpoint
3. For each request: create server → register tools/resources/prompts → connect transport → handle → close

```typescript
// src/index.ts (simplified)
function getServer() {
    const server = createMCPServer();
    registerCreateUserTool(server);
    registerFetchUserTool(server);
    registerAllUsersResource(server);
    registerAllTodoResources(server);
    registerSingleTodoResource(server);
    registerFetchPrompt(server);
    return server;
}

app.all('/mcp', async (req, res) => {
    const server = getServer();
    const transport = new StreamableHTTPServerTransport();
    await server.connect(transport);
    await transport.handleRequest(req, res, req.body ?? {});
    res.on('close', () => {
        server.close();
        transport.close();
    });
});
```

---

## Server Factory (`src/server.ts`)

The server is created per request to support stateless HTTP:

```typescript
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";

export function createMCPServer() {
    return new McpServer(
        { name: 'emi_mcp_server', version: '1.0.0' },
        {
            capabilities: {
                tools: {},
                prompts: {},
                resources: {},
                tasks: {}
            }
        }
    );
}
```

---

## Registration Pattern

Tools, resources, and prompts use **registration functions** that accept a server instance. This allows a new server to be created per request and configured before use.

**Example: fetch-users tool**

```typescript
import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';

export function registerFetchUserTool(server: McpServer) {
    server.registerTool(
        'fetch-users',
        { title: '...', description: '...', inputSchema: fetchUserSchema },
        async (userSearch) => ({ content: [{ type: 'text', text: JSON.stringify(foundUsers) }] })
    );
}
```

---

## Resources

### Static Resources

| Resource | URI | Description |
|----------|-----|-------------|
| `users` | `users://all` | All users from `users.json` |
| `todos` | `todos://all` | All todos from dummyjson.com API |

### Resource Templates

| Resource | URI Template | Description |
|----------|--------------|-------------|
| `single-todo` | `todos://{id}/single` | Fetch a single todo by ID |

Resource templates appear in the **Templates** section of the MCP Inspector. To read a single todo, request e.g. `todos://5/single`.

**Return format:** `{ contents: [{ uri: string, text: string }] }`

---

## Prompts

Prompts are reusable templates for AI interactions. In Cursor, type `/` in the chat to see available prompts.

| Prompt | Args | Description |
|--------|------|-------------|
| `fetch-todo-item` | `id` (number) | Generates a prompt to fetch a todo by ID |

**Example:** `/fetch-todo-item` with `id: 1` → *"go and get a todo item based on 1"*

---

## Adding the Server to Cursor

### Option A: Local (stdio via mcp-remote)

If running the HTTP server locally, use `mcp-remote` to proxy:

```json
{
  "mcpServers": {
    "tc_mcp_iii": {
      "command": "npx",
      "args": ["-y", "mcp-remote", "http://localhost:3000/mcp"],
      "cwd": "C:\\code\\MCP\\tc_mcp_III"
    }
  }
}
```

### Option B: Direct URL (if Cursor supports it)

```json
{
  "mcpServers": {
    "tc_mcp_iii": {
      "url": "http://localhost:3000/mcp"
    }
  }
}
```

### Option C: Cloud deployment

For a server deployed on Cloud Run or similar:

```json
{
  "mcpServers": {
    "tc_mcp_iii": {
      "command": "npx",
      "args": ["-y", "mcp-remote", "https://YOUR-SERVICE.run.app/mcp"]
    }
  }
}
```

---

## Testing with MCP Inspector

### Connect via URL (Streamable HTTP)

1. **Terminal 1** – Start the server:
   ```bash
   npm run dev
   ```

2. **Terminal 2** – Launch Inspector and connect to URL:
   ```bash
   npx @modelcontextprotocol/inspector --connect http://localhost:3000/mcp
   ```

3. In the Inspector UI, select **streamable-http** as the transport and enter `http://localhost:3000/mcp` if prompted.

### Connect via stdio (legacy)

The `npm run inspect` script spawns the server as a child process. For Streamable HTTP testing, use the two-terminal approach above.

---

## Available Tools

| Tool | Description | Required params |
|------|-------------|-----------------|
| `create-user` | Create a new user | name, email, phone (address optional) |
| `fetch-users` | Search users | name, email, phone |

## Available Resources

| Resource | URI | Description |
|----------|-----|-------------|
| `users` | `users://all` | All users from `users.json` |
| `todos` | `todos://all` | All todos from dummyjson.com |
| `single-todo` | `todos://{id}/single` | Single todo by ID (template) |

## Available Prompts

| Prompt | Args | Description |
|--------|------|-------------|
| `fetch-todo-item` | id (number) | Generate a prompt to fetch a todo by ID |

---

## Cloud Deployment (GCP Cloud Run)

The server is ready for cloud deployment:

1. **Build & deploy:**
   ```bash
   gcloud run deploy tc-mcp-server --source .
   ```

2. **Environment:** Set `PORT` (Cloud Run uses 8080 by default).

3. **Client config:** Point Cursor or Inspector to `https://YOUR-SERVICE.run.app/mcp`.

4. **Auth:** Use `gcloud run services proxy` for local clients, or OIDC/IAM for production.

See [Host MCP servers on Cloud Run](https://cloud.google.com/run/docs/host-mcp-servers) for details.

---

## Troubleshooting

| Issue | Solution |
|-------|----------|
| Tools not showing | Ensure all `registerXxx(server)` are called in `getServer()` |
| "Already connected to a transport" | Use per-request server pattern: create server in handler, call `server.close()` on response close |
| Inspector URL not connecting | Start server with `npm run dev` first, then `--connect http://localhost:3000/mcp` |
| Prompts not in Cursor | Type `/` in chat; ensure server is configured and connected |
| Single-todo not in Resources list | It's a template—check the **Templates** section, or read `todos://1/single` directly |
| `Transport` type error | Use `transport as Transport` with `exactOptionalPropertyTypes` |

---

## References

- [Model Context Protocol](https://modelcontextprotocol.io/)
- [MCP TypeScript SDK](https://github.com/modelcontextprotocol/typescript-sdk)
- [Host MCP servers on Cloud Run](https://cloud.google.com/run/docs/host-mcp-servers)
- [Cursor MCP Docs](https://docs.cursor.com/guides/tutorials/building-mcp-server)
