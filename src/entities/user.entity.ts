import { z } from 'zod';

const getAllUsersResponseSchema = z.object({
    success: z.boolean(),
    todos: z.array(z.any()).optional(),  // or z.array(todoSchema) if you have it
    err: z.string().optional(),
});

export type GetAllUsersResponse = z.infer<typeof getAllUsersResponseSchema>;

export const userSchema = z.object({
    id:z.number().optional(),
    name:z.string(),
    email:z.string(),
    phone:z.string(),
    address:z.string().optional()
})

export type User = z.infer<typeof userSchema>

export const fetchUserSchema = z.object({
    name:z.string(),
    email:z.string(),
    phone:z.string()
})

export type UserFetchRequest = z.infer<typeof fetchUserSchema>