import type { PageLoad } from './$types';
import { browser } from '$app/environment';
import { goto } from '$app/navigation';
import { checkAuthStatus } from '$lib/services/auth';
import { AUTH_CONFIG } from '$lib/config';

export const load: PageLoad = async () => {
    if (!browser) {
        return {};
    }

    // 检查是否已登录
    const isAuthenticated = await checkAuthStatus();
    if (isAuthenticated) {
        console.debug('[Login] Already logged in, redirecting to admin');
        await goto(AUTH_CONFIG.redirectAfterLogin);
        return {};
    } else {
        console.debug('[Login] Not logged in');
    }

    return {};
};
