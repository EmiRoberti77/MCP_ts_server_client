import path from 'node:path';
import { pathToFileURL } from 'node:url';
import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';

export function registerAllUsersResource(server:McpServer){
    server.registerResource(
        'users',
        "users://all",
        {
            description:'get all users data from the JSON file',
            title:"Users",
            mimeType:"application/json"
        }, async uri => {
            const root = process.cwd();
            const json_path = path.join(root, 'users.json');
            const json_url = pathToFileURL(json_path).href;
            const json_users = await import(json_url, {with:{type:'json'}} )
            const user_json = json_users.default;
            return {
                contents:[{uri:uri.href, text:JSON.stringify(user_json)}]
            }
        } 
    )
}