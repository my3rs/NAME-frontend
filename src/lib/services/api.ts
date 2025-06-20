import { httpClient, handleApiResponse, handleApiError } from './http';
import { PAGINATION_CONFIG } from '$lib/config';
import type { 
    ApiResponse, 
    PaginatedResponse, 
    PostData, 
    CommentData, 
    TagData, 
    CategoryData,
    BatchOperationRequest,
    BatchOperationResponse,
    RequestConfig 
} from '$lib/types/api';

// 通用分页参数接口
interface PaginationParams {
    pageIndex?: number;
    pageSize?: number;
    orderBy?: string;
}

// API服务基类
class BaseApiService {
    protected async request<T>(
        method: 'GET' | 'POST' | 'PUT' | 'DELETE',
        url: string,
        data?: any,
        config?: RequestConfig
    ): Promise<T> {
        try {
            const response = await httpClient.request({
                method,
                url,
                data,
                params: method === 'GET' ? data : undefined,
            });
            
            return handleApiResponse<T>(response);
        } catch (error) {
            throw handleApiError(error);
        }
    }

    protected async get<T>(url: string, params?: any, config?: RequestConfig): Promise<T> {
        return this.request<T>('GET', url, params, config);
    }

    protected async post<T>(url: string, data?: any, config?: RequestConfig): Promise<T> {
        return this.request<T>('POST', url, data, config);
    }

    protected async put<T>(url: string, data?: any, config?: RequestConfig): Promise<T> {
        return this.request<T>('PUT', url, data, config);
    }

    protected async delete<T>(url: string, data?: any, config?: RequestConfig): Promise<T> {
        return this.request<T>('DELETE', url, data, config);
    }
}

// 文章API服务
class PostApiService extends BaseApiService {
    async getPosts(params: PaginationParams = {}): Promise<PaginatedResponse<PostData>> {
        const queryParams = {
            pageIndex: params.pageIndex || 1,
            pageSize: params.pageSize || PAGINATION_CONFIG.defaultPageSize,
            orderBy: params.orderBy || 'created_at desc',
        };
        
        return this.get<PaginatedResponse<PostData>>('/posts', queryParams);
    }

    async getPostById(id: number | string, includeContent = true): Promise<PostData> {
        const params = includeContent ? { include: 'content' } : {};
        return this.get<PostData>(`/posts/${id}`, params);
    }

    async createPost(post: Omit<PostData, 'id'>): Promise<PostData> {
        return this.post<PostData>('/posts', post);
    }

    async updatePost(id: number, post: Partial<PostData>): Promise<PostData> {
        return this.put<PostData>(`/posts/${id}`, post);
    }

    async deletePost(id: number): Promise<void> {
        return this.delete<void>(`/posts/${id}`);
    }

    async deletePosts(ids: number[]): Promise<BatchOperationResponse> {
        const request: BatchOperationRequest = {
            ids,
            action: 'delete'
        };
        return this.post<BatchOperationResponse>('/posts/batch', request);
    }

    async publishPost(id: number): Promise<PostData> {
        return this.put<PostData>(`/posts/${id}/publish`);
    }

    async archivePost(id: number): Promise<PostData> {
        return this.put<PostData>(`/posts/${id}/archive`);
    }
}

// 评论API服务
class CommentApiService extends BaseApiService {
    async getComments(params: PaginationParams & { postId?: number } = {}): Promise<PaginatedResponse<CommentData>> {
        const queryParams = {
            pageIndex: params.pageIndex || 1,
            pageSize: params.pageSize || PAGINATION_CONFIG.defaultPageSize,
            orderBy: params.orderBy || 'created_at desc',
            ...(params.postId && { contentID: params.postId }),
        };
        
        return this.get<PaginatedResponse<CommentData>>('/comments', queryParams);
    }

    async getCommentById(id: number): Promise<CommentData> {
        return this.get<CommentData>(`/comments/${id}`);
    }

    async createComment(comment: Omit<CommentData, 'id'>): Promise<CommentData> {
        return this.post<CommentData>('/comments', comment);
    }

    async updateComment(id: number, comment: Partial<CommentData>): Promise<CommentData> {
        return this.put<CommentData>(`/comments/${id}`, comment);
    }

    async deleteComment(id: number): Promise<void> {
        return this.delete<void>(`/comments/${id}`);
    }

    async deleteComments(ids: number[]): Promise<BatchOperationResponse> {
        const request: BatchOperationRequest = {
            ids,
            action: 'delete'
        };
        return this.post<BatchOperationResponse>('/comments/batch', request);
    }

    async approveComment(id: number): Promise<CommentData> {
        return this.put<CommentData>(`/comments/${id}/approve`);
    }

    async rejectComment(id: number): Promise<CommentData> {
        return this.put<CommentData>(`/comments/${id}/reject`);
    }
}

// 标签API服务
class TagApiService extends BaseApiService {
    async getTags(params: { search?: string } = {}): Promise<TagData[]> {
        return this.get<TagData[]>('/tags', params);
    }

    async getTagById(id: number): Promise<TagData> {
        return this.get<TagData>(`/tags/${id}`);
    }

    async createTag(tag: Omit<TagData, 'id'>): Promise<TagData> {
        return this.post<TagData>('/tags', tag);
    }

    async updateTag(id: number, tag: Partial<TagData>): Promise<TagData> {
        return this.put<TagData>(`/tags/${id}`, tag);
    }

    async deleteTag(id: number): Promise<void> {
        return this.delete<void>(`/tags/${id}`);
    }

    async deleteTags(ids: number[]): Promise<BatchOperationResponse> {
        const request: BatchOperationRequest = {
            ids,
            action: 'delete'
        };
        return this.post<BatchOperationResponse>('/tags/batch', request);
    }
}

// 分类API服务
class CategoryApiService extends BaseApiService {
    async getCategories(params: { includeChildren?: boolean } = {}): Promise<CategoryData[]> {
        return this.get<CategoryData[]>('/categories', params);
    }

    async getCategoryById(id: number): Promise<CategoryData> {
        return this.get<CategoryData>(`/categories/${id}`);
    }

    async createCategory(category: Omit<CategoryData, 'id'>): Promise<CategoryData> {
        return this.post<CategoryData>('/categories', category);
    }

    async updateCategory(id: number, category: Partial<CategoryData>): Promise<CategoryData> {
        return this.put<CategoryData>(`/categories/${id}`, category);
    }

    async deleteCategory(id: number): Promise<void> {
        return this.delete<void>(`/categories/${id}`);
    }

    async deleteCategories(ids: number[]): Promise<BatchOperationResponse> {
        const request: BatchOperationRequest = {
            ids,
            action: 'delete'
        };
        return this.post<BatchOperationResponse>('/categories/batch', request);
    }
}

// 元数据API服务
class MetaApiService extends BaseApiService {
    async getMeta(): Promise<{
        posts_count: number;
        pages_count: number;
        categories_count: number;
        tags_count: number;
        comments_count: number;
    }> {
        return this.get('/meta');
    }
}

// 导出API服务实例
export const postApi = new PostApiService();
export const commentApi = new CommentApiService();
export const tagApi = new TagApiService();
export const categoryApi = new CategoryApiService();
export const metaApi = new MetaApiService();

// 统一导出
export const api = {
    posts: postApi,
    comments: commentApi,
    tags: tagApi,
    categories: categoryApi,
    meta: metaApi,
};

// 工具函数
export const formatDate = (timestamp: number): string => {
    const date = new Date(timestamp);
    const Y = date.getFullYear();
    const M = (date.getMonth() + 1).toString().padStart(2, '0');
    const D = date.getDate().toString().padStart(2, '0');
    const h = date.getHours().toString().padStart(2, '0');
    const m = date.getMinutes().toString().padStart(2, '0');
    const s = date.getSeconds().toString().padStart(2, '0');
    return `${Y}-${M}-${D} ${h}:${m}:${s}`;
};

export const formatDateWithoutTime = (timestamp: number): string => {
    const date = new Date(timestamp);
    const Y = date.getFullYear();
    const M = (date.getMonth() + 1).toString().padStart(2, '0');
    const D = date.getDate().toString().padStart(2, '0');
    return `${Y}年${M}月${D}日`;
};