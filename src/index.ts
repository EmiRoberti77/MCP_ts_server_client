

import { StreamableHTTPServerTransport } from '@modelcontextprotocol/sdk/server/streamableHttp.js';
import { createMcpExpressApp } from '@modelcontextprotocol/sdk/server/express.js';
import type { Transport } from '@modelcontextprotocol/sdk/shared/transport.js';
import {createMCPServer} from './server.js'
import dotenv from 'dotenv';
import type { Request, Response } from 'express';
// import './tools/users/createUserTool.js';
// import './tools/users/fetchUsersTool.js';
// import './resources/users/usersResources.js';
// import './resources/todo/todoResources.js';
// import './prompts/todos/todosPrompts.js';
import { registerAllTodoResources, registerSingleTodoResource } from './resources/todo/todoResources.js';
import { registerCreateUserTool } from './tools/users/createUserTool.js';
import { registerFetchUserTool } from './tools/users/fetchUsersTool.js';
import { registerFetchPrompt } from './prompts/todos/todosPrompts.js';
import { registerAllUsersResource } from './resources/users/usersResources.js';
dotenv.config()

const app = createMcpExpressApp({host:'0.0.0.0'})
const port = parseInt(process.env.PORT ?? '3000', 10)

function getServer(){
    const server = createMCPServer();
    registerCreateUserTool(server);
    registerFetchUserTool(server);
    registerAllUsersResource(server);
    registerAllTodoResources(server);
    registerSingleTodoResource(server);
    registerFetchPrompt(server);
    return server
}

app.all('/mcp', async (req:Request, res:Response)=>{
    const server = getServer()
    const transport = new StreamableHTTPServerTransport();
    await server.connect(transport as Transport);
    await transport.handleRequest(req, res, req.body ?? {})
    res.on('close', ()=>{
        server.close()
        transport.close()
    })
})

app.listen(port, () => {
    console.log(`MCP server listening on port ${port}`);
});