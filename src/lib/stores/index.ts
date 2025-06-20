import { writable, derived, type Readable } from 'svelte/store';
import type { PostData, CommentData, TagData, CategoryData, ApiError } from '$lib/types/api';

// 通用状态接口
interface AsyncState<T> {
    data: T | null;
    loading: boolean;
    error: ApiError | null;
    lastUpdated: number | null;
}

// 分页状态接口
interface PaginatedState<T> extends AsyncState<T[]> {
    pagination: {
        pageIndex: number;
        pageSize: number;
        totalCount: number;
        totalPages: number;
        hasNext: boolean;
        hasPrevious: boolean;
    } | null;
}

// 创建异步状态的工厂函数
function createAsyncState<T>(initialData: T | null = null): {
    subscribe: Readable<AsyncState<T>>['subscribe'];
    setLoading: (loading: boolean) => void;
    setData: (data: T) => void;
    setError: (error: ApiError | null) => void;
    reset: () => void;
} {
    const { subscribe, set, update } = writable<AsyncState<T>>({
        data: initialData,
        loading: false,
        error: null,
        lastUpdated: null,
    });

    return {
        subscribe,
        setLoading: (loading: boolean) => {
            update(state => ({ ...state, loading }));
        },
        setData: (data: T) => {
            update(state => ({
                ...state,
                data,
                loading: false,
                error: null,
                lastUpdated: Date.now(),
            }));
        },
        setError: (error: ApiError | null) => {
            update(state => ({
                ...state,
                error,
                loading: false,
            }));
        },
        reset: () => {
            set({
                data: initialData,
                loading: false,
                error: null,
                lastUpdated: null,
            });
        },
    };
}

// 创建分页状态的工厂函数
function createPaginatedState<T>(): {
    subscribe: Readable<PaginatedState<T>>['subscribe'];
    setLoading: (loading: boolean) => void;
    setData: (data: T[], pagination: PaginatedState<T>['pagination']) => void;
    setError: (error: ApiError | null) => void;
    reset: () => void;
} {
    const { subscribe, set, update } = writable<PaginatedState<T>>({
        data: null,
        loading: false,
        error: null,
        lastUpdated: null,
        pagination: null,
    });

    return {
        subscribe,
        setLoading: (loading: boolean) => {
            update(state => ({ ...state, loading }));
        },
        setData: (data: T[], pagination: PaginatedState<T>['pagination']) => {
            update(state => ({
                ...state,
                data,
                pagination,
                loading: false,
                error: null,
                lastUpdated: Date.now(),
            }));
        },
        setError: (error: ApiError | null) => {
            update(state => ({
                ...state,
                error,
                loading: false,
            }));
        },
        reset: () => {
            set({
                data: null,
                loading: false,
                error: null,
                lastUpdated: null,
                pagination: null,
            });
        },
    };
}

// 文章状态管理
export const postsStore = createPaginatedState<PostData>();
export const currentPost = createAsyncState<PostData>();

// 评论状态管理
export const commentsStore = createPaginatedState<CommentData>();

// 标签状态管理
export const tagsStore = createAsyncState<TagData[]>([]);

// 分类状态管理
export const categoriesStore = createAsyncState<CategoryData[]>([]);

// 应用全局状态
export const appState = writable({
    sidebarOpen: false,
    theme: 'light',
    notifications: [] as Array<{
        id: string;
        type: 'success' | 'error' | 'warning' | 'info';
        message: string;
        timestamp: number;
    }>,
});

// 便捷函数
export const toggleSidebar = () => {
    appState.update(state => ({
        ...state,
        sidebarOpen: !state.sidebarOpen,
    }));
};

export const setTheme = (theme: 'light' | 'dark') => {
    appState.update(state => ({
        ...state,
        theme,
    }));
};

export const addNotification = (
    type: 'success' | 'error' | 'warning' | 'info',
    message: string
) => {
    const notification = {
        id: Date.now().toString(),
        type,
        message,
        timestamp: Date.now(),
    };
    
    appState.update(state => ({
        ...state,
        notifications: [...state.notifications, notification],
    }));
    
    // 自动移除通知
    setTimeout(() => {
        removeNotification(notification.id);
    }, 5000);
};

export const removeNotification = (id: string) => {
    appState.update(state => ({
        ...state,
        notifications: state.notifications.filter(n => n.id !== id),
    }));
};

// 导出认证状态（从auth服务重新导出）
export { currentUser, isAuthenticated, authLoading, authError } from '$lib/services/auth';