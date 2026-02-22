import {describe, it, expect, vi, beforeEach} from 'vitest';
import {TodoHandler} from '../todoResources.js'
import axios from 'axios';
import type { Todo } from '../../../entities/todo.entity.js';
import type { GetAllUsersResponse } from '../../../entities/user.entity.js';
const endpoint = 'https://dummyjson.com/todos';

describe('todoHandler', ()=>{
    let handler: TodoHandler;

    beforeEach(()=>{
        handler = new TodoHandler(endpoint)
    })

    describe('getallUsers', ()=> { 
        it('returns success with todos in the api call', async ()=>{
           const todosResponse: GetAllUsersResponse = await handler.GetAllUsers();
           expect(todosResponse.success).toBe(true);
           expect(todosResponse.todos!.length ?? 0).toBeGreaterThan(0);
        })
    })
})
