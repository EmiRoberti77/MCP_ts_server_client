import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { z } from 'zod';

export function registerFetchPrompt(server:McpServer){
    server.registerPrompt(
        'fetch-todo-item',
        {
            title:'fetch single todo item',
            description:'generate a prompt to fetch a todo item based on id',
            argsSchema:{id:z.coerce.number()} 
        },
        async ({id}) => {
            return {
                messages:[
                    {
                        role:'user',
                        content:{
                            type:'text',
                            text:`go and get a todo item based on ${id}`
                        }
                    }
                ]
            }
        }
    )
}