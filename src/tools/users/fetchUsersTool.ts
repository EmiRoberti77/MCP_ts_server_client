import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { fetchUserSchema } from '../../entities/user.entity.js'
import { fetchUses } from '../../users/userHandler.js'

export function registerFetchUserTool(server:McpServer){
    server.registerTool(
        'fetch-users',
        {
            title:'fetch users from emi_mcp_server',
            description:'use this tool to extract users from the database',
            inputSchema:fetchUserSchema,
            annotations: {
                readOnlyHint:true,
                destructiveHint:false,
                idempotentHint:false
            }
        },
        async (userSearch) => {
            const foundUsers = await fetchUses(userSearch);
            return {
                content:[
                    {
                        type:"text", text:JSON.stringify(foundUsers)
                    }
                ]
            }
        }
    )
}