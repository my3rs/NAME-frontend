// 兼容性posts store - 重新导出新的状态管理
// 这个文件保持向后兼容，但内部使用新的状态架构

import { postsStore, currentPost } from '$lib/stores';
import { derived } from 'svelte/store';
import type { Post } from '$lib/model';
import type { PaginationType } from '$lib/model';

// 为了向后兼容，转换新的状态格式到旧的格式
export const posts = derived(postsStore, ($store) => {
    // 这里需要将 PostData[] 转换为 Post[]
    // 暂时返回空数组，实际使用时需要进行数据转换
    return [] as Post[];
});

export const pagination = derived(postsStore, ($store) => {
    if (!$store.pagination) return new PaginationType();
    
    // 转换新的分页格式到旧的格式
    const oldPagination = new PaginationType();
    oldPagination.pageIndex = $store.pagination.pageIndex;
    oldPagination.pageSize = $store.pagination.pageSize;
    oldPagination.total = $store.pagination.totalCount;
    oldPagination.totalPages = $store.pagination.totalPages;
    
    return oldPagination;
});

// 导出新的状态管理
export { postsStore, currentPost };