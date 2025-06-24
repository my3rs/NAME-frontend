import type { PageLoad } from './$types'
import { postApi } from '$lib/services/api'
import { PAGINATION_CONFIG, DEBUG_CONFIG } from '$lib/config'

export const load: PageLoad = async () => {
    try {
        const result = await postApi.getPosts({
            pageIndex: 0, // 后端从0开始
            pageSize: PAGINATION_CONFIG.defaultPageSize,
            orderBy: "id desc"
        });

        if (DEBUG_CONFIG.logApiCalls) {
            console.log("预加载数据成功.", result.page?.totalCount || 0);
        }
        
        return {
            posts: result.data || [],
            pagination: {
                pageIndex: (result.page?.currentPage || 0) + 1, // 转换为前端的1开始计数
                pageSize: result.page?.pageSize || PAGINATION_CONFIG.defaultPageSize,
                total: result.page?.totalCount || 0,
                totalPages: result.page?.totalPages || 0,
            },
        };
    } catch (error) {
        console.error('Failed to load posts:', error);
        return {
            posts: [],
            pagination: null,
        };
    }
}