import {StdioServerTransport} from '@modelcontextprotocol/sdk/server/stdio.js'; 
import {server} from './server.js'
import './tools/users/createUserTool.js';
import './tools/users/fetchUsersTool.js';
import './resources/users/usersResources.js';

async function main(){
    const transport = new StdioServerTransport();
    await server.connect(transport);
}

main();
