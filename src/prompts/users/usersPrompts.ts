import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from 'zod';

export function registerFetchUserPrompt(server:McpServer){
    server.registerPrompt(
        'fetch-user-prompt',
        {
            title:'fetch a user prompt',
            description:'generate a prompt to fetch a user by id',
            argsSchema:{
                id:z.coerce.number(),
                name:z.string().optional()
            }
        },
        async ({id}) =>{
            return {
                messages:[
                    {
                        role:'user',
                        content:{
                            type:'text',
                            text:`go and get me a user based on this id ${id}`
                        }
                    }
                ]
            }
        }
    )
}