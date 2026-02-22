import axios from 'axios';
import { z } from 'zod';
import type { Todo } from '../../entities/todo.entity.js';
import type { GetAllUsersResponse } from '../../entities/user.entity.js';

const todoEndPoint = 'https://dummyjson.com/todos'

export class TodoHandler{
    endpoint:string | undefined = undefined;
    constructor(endpoint:string){
        this.endpoint = endpoint
    }

    async getTodoById(id:number):Promise<Todo | undefined>{
        const todoResponse = await axios.get<{todo:Todo}>(
            `${this.endpoint}/${id}`,
            {
                headers:{
                    "Content-Type":"application/json"
                }
            }
        )
        return todoResponse.data.todo ?? undefined;
    }

    async GetAllUsers():Promise<GetAllUsersResponse>{
        try {
            const response = await axios.get<{todos: Todo[]}>(todoEndPoint, {
                headers:{
                    "Content-Type":'application/json'
                }
            });
    
            if(response.data){
                const todoResponse:GetAllUsersResponse = {
                    success:true,
                    todos:response.data.todos
                };

                return todoResponse;
            } else {
                const todoResponse:GetAllUsersResponse = {
                    success:false,
                    todos:[],
                    err:'No todos found'
                }

                return todoResponse;
            }
        } catch(err:any) {
            const todoResponse:GetAllUsersResponse = {
                success:false,
                todos:[],
                err:err.message
            }

            return todoResponse;
        }
    }
}