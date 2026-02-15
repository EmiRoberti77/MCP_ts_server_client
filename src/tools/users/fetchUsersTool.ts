import { fetchUserSchema } from '../../entities/user.entity.js'
import { server } from '../../server.js'
import { fetchUses } from '../../users/userHandler.js'

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