import type { PageLoad } from './$types';
import { browser } from '$app/environment';
import { get } from 'svelte/store';
import { isAuthenticated } from '$lib/stores/auth';
import { goto } from '$app/navigation';

export const load: PageLoad = async () => {
    if (!browser) {
        return {};
    }

    // 使用 store 中的认证状态，避免重复检查
    const authenticated = get(isAuthenticated);
    if (authenticated) {
        console.debug('Already authenticated, redirecting to admin');
        await goto('/admin');
        return {};
    }

    return {};
};
