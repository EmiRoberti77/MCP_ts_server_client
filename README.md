# MCP Sample Agent Tutorial

A Model Context Protocol (MCP) server that exposes tools for creating and fetching users. This tutorial explains the project structure, how tools are built, and how to integrate with Cursor.

## Prerequisites

- Node.js 18+
- npm or pnpm

## Quick Start

```bash
npm install
npm run dev          # Run the MCP server
npm run inspect      # Test in MCP Inspector
```

---

## Project Structure

```
tc_mcp_III/
├── src/
│   ├── index.ts              # Entry point: starts server + registers tools
│   ├── server.ts             # MCP server instance and capabilities
│   ├── entities/
│   │   └── user.entity.ts     # Zod schemas and types for users
│   ├── users/
│   │   └── userHandler.ts    # Business logic: create, fetch users
│   └── tools/
│       └── users/
│           ├── createUserTool.ts   # MCP tool: create-user
│           └── fetchUsersTool.ts   # MCP tool: fetch-users
├── users.json                # JSON "database" for users
├── .cursor/
│   └── mcp.json              # Cursor MCP configuration
├── package.json
└── tsconfig.json
```

### Layer Responsibilities

| Layer | Purpose |
|-------|---------|
| **index.ts** | Bootstraps the server, imports tool modules, connects transport |
| **server.ts** | Creates `McpServer` with name, version, and capabilities |
| **entities/** | Shared schemas (Zod) and TypeScript types |
| **users/** | Domain logic (CRUD) independent of MCP |
| **tools/** | MCP tool definitions: wire schema + handler to the server |

---

## How the Code is Structured

### 1. Entry Point (`src/index.ts`)

The entry point does three things:

1. Imports the server
2. **Imports tool modules** (critical: tools register on import)
3. Connects the server to stdio transport

```typescript
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { server } from './server.js'

// Import tools so they register with the server
import './tools/users/createUserTool.js';
import './tools/users/fetchUsersTool.js';

async function main() {
    const transport = new StdioServerTransport();
    await server.connect(transport);
}

main();
```

**Important:** Tool files must be imported before `connect()`. They call `server.registerTool()` at load time.

---

### 2. Server (`src/server.ts`)

The server is created with metadata and capabilities:

```typescript
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";

export const server = new McpServer(
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
```

- **First argument:** Server info (name, version)
- **Second argument:** Options including `capabilities` (what the server supports)

---

### 3. Entities (`src/entities/user.entity.ts`)

Zod schemas define and validate tool input:

```typescript
import { z } from 'zod';

export const userSchema = z.object({
    id: z.number().optional(),
    name: z.string(),
    email: z.string(),
    phone: z.string(),
    address: z.string().optional()
});

export type User = z.infer<typeof userSchema>;

export const fetchUserSchema = z.object({
    name: z.string(),
    email: z.string(),
    phone: z.string()
});

export type UserFetchRequest = z.infer<typeof fetchUserSchema>;
```

- Schemas are reused for validation and TypeScript types
- `userSchema` → create-user tool
- `fetchUserSchema` → fetch-users tool

---

### 4. User Handler (`src/users/userHandler.ts`)

Business logic lives here, separate from MCP:

- `createUser(user)` – adds a user to `users.json`
- `fetchUses(params)` – filters users by name, email, or phone

This keeps MCP tools thin: they validate input, call the handler, and format the response.

---

### 5. Tool Structure (`src/tools/users/*.ts`)

Each tool file:

1. Imports the server, schema, and handler
2. Calls `server.registerTool(name, config, handler)`

**Example: create-user**

```typescript
import { userSchema } from '../../entities/user.entity.js';
import { server } from '../../server.js';
import { createUser } from '../../users/userHandler.js';

server.registerTool(
    'create-user',
    {
        title: 'create-user-tool',
        description: 'create a new user in the database',
        inputSchema: userSchema,
        annotations: {
            title: 'Create a new user',
            readOnlyHint: false,
            destructiveHint: false,
            idempotentHint: false,
        }
    },
    async (user) => {
        try {
            const result = await createUser(user);
            return {
                content: [{ type: 'text', text: result.msg ?? 'User created' }]
            };
        } catch {
            return {
                content: [{ type: 'text', text: 'Error: failed to save user' }]
            };
        }
    }
);
```

**Tool config fields:**

| Field | Purpose |
|-------|---------|
| `title` | Human-readable name |
| `description` | Shown to the AI; should explain when to use the tool |
| `inputSchema` | Zod schema for validation |
| `annotations` | Hints (readOnly, destructive, idempotent) |

**Handler return format:** MCP expects `{ content: [{ type: 'text', text: string }] }`.

---

## Adding the Server to Cursor

### 1. Project-level config (`.cursor/mcp.json`)

Create `.cursor/mcp.json` in your project root:

```json
{
  "mcpServers": {
    "tc_mcp_iii": {
      "command": "npx",
      "args": ["tsx", "./src/index.ts"],
      "cwd": "C:\\code\\MCP\\tc_mcp_III"
    }
  }
}
```

**Notes:**

- Use `npx tsx` (or `node` with built output) instead of `npm run dev` to avoid npm output on stdout
- `cwd` must be the project directory (use an absolute path)
- On Windows, escape backslashes: `C:\\code\\MCP\\tc_mcp_III`

### 2. Enable in Cursor

1. Open **Cursor Settings** (Ctrl+,)
2. Search for **MCP**
3. Ensure your server is listed and **enabled**
4. Restart Cursor if you changed config

### 3. Use in Chat

In Cursor Chat or Composer, ask the AI to use your tools, e.g.:

- *"Create a user named John with email john@example.com and phone +1234567890"*
- *"Fetch users with email emi@emi.com"*

---

## Testing with MCP Inspector

```bash
npm run inspect
```

This opens the MCP Inspector in your browser. You can:

1. Connect to the server
2. Call tools manually with JSON input
3. Inspect requests and responses

**Tip:** Run `npx tsx ./src/index.ts` directly (not via `npm run dev`) so no extra output goes to stdout.

---

## Available Tools

| Tool | Description | Required params |
|------|-------------|-----------------|
| `create-user` | Create a new user | name, email, phone (address optional) |
| `fetch-users` | Search users | name, email, phone |

---

## Troubleshooting

| Issue | Solution |
|-------|----------|
| Tools not showing in Inspector | Ensure tool files are imported in `index.ts` before `connect()` |
| "Unexpected token '>'" / JSON parse error | Use `npx tsx ./src/index.ts` instead of `npm run dev` |
| Cursor not connecting | Check `.cursor/mcp.json`, enable server in Settings, restart Cursor |
| `process` not found | Add `"types": ["node"]` to `tsconfig.json` |

---

## References

- [Model Context Protocol](https://modelcontextprotocol.io/)
- [MCP TypeScript SDK](https://github.com/modelcontextprotocol/typescript-sdk)
- [Cursor MCP Docs](https://docs.cursor.com/guides/tutorials/building-mcp-server)
