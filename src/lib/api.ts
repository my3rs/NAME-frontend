// 兼容性API层 - 保持向后兼容的同时使用新的服务架构
// 这个文件作为过渡层，让现有代码可以继续工作，同时新代码可以使用新的服务

import { Category, type Post, type Tag } from "$lib/model";
import { User } from "$lib/model";
import { api, formatDate as newFormatDate, formatDateWithoutTime as newFormatDateWithoutTime } from "$lib/services/api";
import { httpClient } from "$lib/services/http";
import { API_BASE_URL } from "$lib/config";

// 导出新的HTTP客户端作为axiosInstance以保持兼容性
export const axiosInstance = httpClient;
export const BASE_URL = API_BASE_URL;

// 兼容性token存储
export const tokenStorage = {
    getItem: (key: string) => {
        if (typeof window !== 'undefined') {
            return localStorage.getItem(key);
        }
        return null;
    },
    setItem: (key: string, value: string) => {
        if (typeof window !== 'undefined') {
            localStorage.setItem(key, value);
        }
    },
    removeItem: (key: string) => {
        if (typeof window !== 'undefined') {
            localStorage.removeItem(key);
        }
    }
};

// 向后兼容的API函数
export const getPostByID = (id: number | string, params?: string) => {
    const url = `/posts/${id}${params ? `?${params}` : ''}`;
    return httpClient.get(url);
};

export const getPosts = async (
    pageIndex: number | string,
    pageSize: number | string,
) => {
    try {
        const result = await api.posts.getPosts({
            pageIndex: Number(pageIndex) - 1, // 前端从1开始，后端从0开始
            pageSize: Number(pageSize),
        });
        
        // 转换后端格式到前端期望的格式
        return {
            data: {
                success: result.success,
                data: result.data,
                page: {
                    pageIndex: result.page.currentPage + 1, // 转换回前端的1开始计数
                    pageSize: result.page.pageSize,
                    total: result.page.totalCount,
                    totalPages: result.page.totalPages,
                }
            },
            status: 200,
        };
    } catch (error) {
        throw error;
    }
};

export const getComments = async (
    pageIndex: number | string,
    pageSize: number | string,
    params?: Object,
) => {
    try {
        const result = await api.comments.getComments({
            pageIndex: Number(pageIndex),
            pageSize: Number(pageSize),
            ...(params || {}),
        });
        
        return {
            data: result,
            status: 200,
        };
    } catch (error) {
        throw error;
    }
};

export const deleteBatchComments = async (ids: number[]) => {
    return api.comments.deleteComments(ids);
};

export const deleteComment = async (id: number) => {
    return api.comments.deleteComment(id);
};

export const getTags = async (params?: Object) => {
    try {
        const result = await api.tags.getTags(params || {});
        return {
            data: { data: result },
            status: 200,
        };
    } catch (error) {
        throw error;
    }
};

export const deletePostByIDs = async (ids: number[]) => {
    return api.posts.deletePosts(ids);
};

// 日期格式化函数
export const getFormattedDate = newFormatDate;
export const formatDate = newFormatDate;
export const getFormattedDateWithoutTime = newFormatDateWithoutTime;

// ********************************************************
// *********************** Post ***************************
// ********************************************************

export const createPost = async (post: Post) => {
    // 转换Post模型到PostData
    const postData = {
        title: post.title,
        slug: post.slug,
        text: post.text,
        summary: post.abstract, // abstract 映射到 summary
        type: post.type as 'post' | 'page',
        status: post.status as 'draft' | 'published' | 'archived',
        allowComment: true, // 默认允许评论
        authorID: Number(post.authorID),
        categoryID: post.category?.id || undefined,
        tagIDs: post.tags?.map(tag => tag.id).filter(id => id) || [],
    };
    
    return api.posts.createPost(postData);
};

export const updatePost = async (post: Post) => {
    if (!post.id) throw new Error('Post ID is required for update');
    
    const postData = {
        title: post.title,
        slug: post.slug,
        text: post.text,
        summary: post.abstract, // abstract 映射到 summary
        type: post.type as 'post' | 'page',
        status: post.status as 'draft' | 'published' | 'archived',
        allowComment: true, // 默认允许评论
        authorID: Number(post.authorID),
        categoryID: post.category?.id || undefined,
        tagIDs: post.tags?.map(tag => tag.id).filter(id => id) || [],
    };
    
    return api.posts.updatePost(post.id, postData);
};

export const deletePosts = async (ids: (number | string | undefined)[]) => {
    const validIds = ids.filter((id): id is number => 
        id !== undefined && !isNaN(Number(id))
    ).map(id => Number(id));
    
    return api.posts.deletePosts(validIds);
};

// ********************************************************
// *********************** Tag ***************************
// ********************************************************

export const createTag = async (tag: Tag) => {
    const tagData = {
        name: tag.text, // text 映射到 name
        description: tag.slug || '', // slug 映射到 description
    };
    
    return api.tags.createTag(tagData);
};

export const updateTag = async (tag: Tag) => {
    if (!tag.id) throw new Error('Tag ID is required for update');
    
    const tagData = {
        name: tag.text, // text 映射到 name  
        description: tag.slug || '', // slug 映射到 description
    };
    
    return api.tags.updateTag(tag.id, tagData);
};

export const deleteTags = async (ids: (number | undefined)[]) => {
    const validIds = ids.filter((id): id is number => id !== undefined);
    return api.tags.deleteTags(validIds);
};

// ********************************************************
// *********************** Category ***************************
// ********************************************************

export const createCategory = async (category: Category) => {
    const categoryData = {
        name: category.text, // text 映射到 name
        description: category.slug || '', // slug 映射到 description
        parentID: undefined, // Category模型中没有parentID
    };
    
    return api.categories.createCategory(categoryData);
};

export const updateCategory = async (category: Category) => {
    if (!category.id) throw new Error('Category ID is required for update');
    
    const categoryData = {
        name: category.text, // text 映射到 name
        description: category.slug || '', // slug 映射到 description  
        parentID: undefined, // Category模型中没有parentID
    };
    
    return api.categories.updateCategory(category.id, categoryData);
};

export const deleteCategories = async (ids: (number | undefined | string)[]) => {
    const validIds = ids.filter((id): id is number => 
        id !== undefined && !isNaN(Number(id))
    ).map(id => Number(id));
    
    return api.categories.deleteCategories(validIds);
};

// ********************************************************
// *********************** 用户验证 ************************
// ********************************************************

// 获取当前用户信息
export async function requestCurrentUser() {
    try {
        const response = await httpClient.get('/users/me');
        if (response.data.success) {
            const userData = response.data.data;
            const user = new User();
            user.id = userData.id;
            user.username = userData.name;
            user.email = userData.mail;
            user.url = userData.url;
            user.avatar = userData.avatar;  
            user.createdAt = userData.createdAt;
            user.updatedAt = userData.updatedAt;
            user.activated = userData.activated;
            user.role = userData.role;
            return user;
        }
        throw new Error("Failed to get user data");
    } catch (error) {
        console.error("[API] 获取用户信息失败:", error);
        throw error;
    }
}
