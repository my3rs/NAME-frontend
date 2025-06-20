import type { PageLoad } from './$types'
import { postApi } from '$lib/services/api'
import { PAGINATION_CONFIG, DEBUG_CONFIG } from '$lib/config'

export const load: PageLoad = async () => {
    try {
        const result = await postApi.getPosts({
            pageIndex: 1,
            pageSize: PAGINATION_CONFIG.defaultPageSize,
            orderBy: "created_at desc"
        });

        if (DEBUG_CONFIG.logApiCalls) {
            console.log("预加载数据成功.", result.pagination?.totalCount || 0);
        }
        
        return {
            posts: result.data || [],
            pagination: result.pagination,
        };
    } catch (error) {
        console.error('Failed to load posts:', error);
        return {
            posts: [],
            pagination: null,
        };
    }
}