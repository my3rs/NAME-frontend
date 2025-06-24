// 通用API响应类型
export interface ApiResponse<T = any> {
    success: boolean;
    data: T;
    message?: string;
    code?: number;
}

// 分页响应类型 - 匹配后端 PageResponse 结构
export interface PaginatedResponse<T> {
    success: boolean;
    message: string;
    data: T[];
    page: {
        currentPage: number;
        pageSize: number;
        totalCount: number;
        totalPages: number;
    };
}

// 认证相关类型
export interface LoginRequest {
    username: string;
    password: string;
}

export interface LoginResponse {
    user: UserData;
    tokens: {
        accessToken: string;
        refreshToken: string;
    };
}

export interface RefreshTokenRequest {
    refreshToken: string;
}

export interface RefreshTokenResponse {
    accessToken: string;
    refreshToken: string;
}

// 用户数据类型
export interface UserData {
    id: number;
    name: string;
    mail: string;
    url?: string;
    avatar?: string;
    role: 'admin' | 'reader';
    activated: boolean;
    createdAt: number;
    updatedAt: number;
}

// 文章相关类型
export interface PostData {
    id?: number;
    title: string;
    slug: string;
    text: string;
    summary?: string;
    type: 'post' | 'page';
    status: 'draft' | 'published' | 'archived';
    allowComment: boolean;
    createdAt?: number;
    updatedAt?: number;
    publishedAt?: number;
    authorID: number;
    categoryID?: number;
    tagIDs?: number[];
    viewCount?: number;
    commentCount?: number;
}

// 评论相关类型
export interface CommentData {
    id?: number;
    contentID: number;
    authorID?: number;
    authorName?: string;
    mail?: string;
    url?: string;
    text: string;
    status: 'approved' | 'pending' | 'spam' | 'trash';
    parentID?: number;
    createdAt?: number;
    updatedAt?: number;
    children?: CommentData[];
}

// 标签和分类类型
export interface TagData {
    id?: number;
    name: string;
    description?: string;
    postCount?: number;
}

export interface CategoryData {
    id?: number;
    name: string;
    description?: string;
    parentID?: number;
    postCount?: number;
    children?: CategoryData[];
}

// API错误类型
export interface ApiError {
    code: string;
    message: string;
    details?: any;
    statusCode?: number;
}

// 请求配置类型
export interface RequestConfig {
    showLoading?: boolean;
    showError?: boolean;
    retryOnFailure?: boolean;
}

// 批量操作类型 - 匹配后端 BatchResponse 结构
export interface BatchOperationRequest {
    ids: number[];
    action: string;
    params?: Record<string, any>;
}

export interface BatchOperationResponse {
    success: boolean;
    message: string;
    successList?: number[];
    failedList?: number[];
}