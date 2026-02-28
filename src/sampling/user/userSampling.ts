import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from 'zod';

export function registerUserSampling(server: McpServer) {
    server.registerTool(
        'create-random-user',
        {
            title: 'create a random user for our database',
            description: 'this function will create a random user in the users database',
            inputSchema: z.object({}),
            annotations: {
                title: 'create random user',
                readOnlyHint: false,
                destructiveHint: false,
                idempotentHint: false,
                openWorldHint: true,
            }
        },
        async () => {
            try{
                const resp = await server.server.createMessage({
                    messages: [
                        {
                            role: 'user',
                            content: {
                                type: 'text',
                                text: `create a random user, this needs to be as realistic as possible,
                                    name, email, address, phone and return this data as a JSON 
                                    object with no other text or formatting so i can call JSON.parse on it`
                            }
                        }
                    ],
                    maxTokens: 1024,
                    metadata: { response_format: { type: 'json_object' } }
                });
                const text = resp.content.type === 'text' ? resp.content.text : JSON.stringify(resp.content);
                return {
                    content: [
                        {
                            type:'text',
                            text,
                        }
                    ]
                }   
            } catch(err:any){
                const errMsg = err.message;
                return {
                    content:[
                        {
                            type:'text',
                            text: errMsg
                        }
                    ]
                }
            }
        }
    )
}