import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";

export function createMCPServer(){
    return new McpServer({
            name:'emi_mcp_server',
            version:'1.0.0',
        }, {
            capabilities:{
                tools:{},
                prompts:{},
                resources:{},
                tasks:{}
            }
    })
}



