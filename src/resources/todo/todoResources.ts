import { ResourceTemplate } from '@modelcontextprotocol/sdk/server/mcp.js';
import { server } from '../../server.js'
import { TodoHandler } from './todoHandler.js'
const todoHandler = new TodoHandler();
server.registerResource(
    'todos',
    'todos://all',
    {
        description:'get a list of all the todos that have been saved',
        title: 'Todos',
        mimeType:'application/json'
    },
    async uri => {
        const todosResponse = await todoHandler.GetAllUsers()
        console.log(todosResponse)
        return {
            contents:[
                {
                    uri:uri.href,
                    text: JSON.stringify(todosResponse)
                }
            ]
        }
    }
)

server.registerResource(
    'single-todo',
    new ResourceTemplate('todos://{id}/single', {list:undefined}),
    {
        title:'single-todo',
        description:'get the todo item by id',
        mimeType:'application/json'
    },
    async ( uri, {id}) => {
        const singleTodo = await todoHandler.getTodoById(parseInt(id as string))
        return {
            contents:[
                {
                    uri:uri.href,
                    text:JSON.stringify(singleTodo ?? {})
                }
            ]
        }
    }
)