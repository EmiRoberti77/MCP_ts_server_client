import {server} from '../../server.js';
import { z } from 'zod';

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