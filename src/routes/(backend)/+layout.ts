import type { LayoutLoad } from './$types';
import { requireAuth } from '$lib/services/auth';

export const ssr = false;

export const load: LayoutLoad = async ({ url }) => {
    // 使用新的认证检查
    const authenticated = await requireAuth();
    
    if (!authenticated) {
        console.log("[Layout] 认证失败，重定向到登录页");
        return {};
    }

    return {};
};
