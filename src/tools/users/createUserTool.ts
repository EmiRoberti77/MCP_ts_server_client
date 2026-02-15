import { userSchema } from '../../entities/user.entity.js';
import {server} from '../../server.js'
import { createUser } from '../../users/userHandler.js';


server.registerTool(
    'create-user',
    {
        title:'create-user-tool',
        description:'create a new user in the database',
        inputSchema:userSchema,
        annotations:{
            title:'Create a new user',
            readOnlyHint:false,
            destructiveHint:false,
            idempotentHint:false,
        }
    }, async (user) =>{
        try {
            const userId = await createUser(user);
            return {
                content: [
                    {type:"text", text:`Success: new user created (id=${userId})`}
                ] 
            }
        } catch {
            return {
                content: [
                    { type:'text', text:'Error: failed to save user'}   
                ]
            }
        }
        
    }
)