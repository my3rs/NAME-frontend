import { z } from "zod";

// 评论表单
export const commentFormSchema = z.object({
    username: z.string().min(2).max(50),
    email: z.string().email(),
    url: z.string(),
});

// 文章表单
export const postFormScheme = z.object({
    title: z.string().min(2).max(50),
})

export type CommentFormSchema = typeof commentFormSchema;