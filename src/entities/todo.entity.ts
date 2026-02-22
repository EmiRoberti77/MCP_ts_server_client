import { z } from 'zod';


export const todoSchema = z.object({
    id:z.number().min(0),
    todo:z.string().min(3).trim(),
    completed:z.boolean().default(false),
    usertId:z.number().min(0)
})

export type Todo = z.infer<typeof todoSchema>;