import type { UserFetchRequest, User } from "../entities/user.entity.js"
import fs from 'node:fs/promises';
import * as path from 'path';
import { pathToFileURL } from 'node:url';

const root = process.cwd()
const userFilePath = path.join(root, 'users.json');
const fileUrl = pathToFileURL(userFilePath).href;

export async function createUser(user:User):Promise<{
    success:boolean,
    msg?:string,
    err?:string
}>{
    try {
        const file_module = await import(fileUrl, {with:{type:"json"}})
        const users = file_module.default;
        const id = users.length + 1;
        users.push({id, ...user})
        await fs.writeFile(userFilePath, JSON.stringify(users, null, 2))
        return {
            success:true,
            msg:`created new user: id=${id} name:${user.name}`
        }
    } catch(err:unknown){
        if (err instanceof Error) {
            return {
                success:false,
                err:err.message
            } 
        } else {
            return {
                success:false,
                err:'Error:failed to create user'
            }
        }
    }    
}

export async function fetchUses(params:UserFetchRequest):Promise<{
    success:boolean, err?:string, data?:any
}>{
    try { 
        const users_json = await import(fileUrl, {with: {type:'json'}});
        const users = users_json.default as User[];

        const foundUsers = users.filter(user=> 
            (user.name == params.name && user.email == params.email) || 
            user.phone == params.phone
        )
        return {
            success:true,
            data:foundUsers
        }
    } catch (err){
        if (err instanceof Error){
            return {
                success:false,
                err:err.message
            }
        } else {
            return {
                success:false,
                err:'Error: fetching user'
            }
        }
    }
}