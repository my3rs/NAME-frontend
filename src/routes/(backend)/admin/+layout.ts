import { goto } from '$app/navigation';
import type { LayoutLoad } from './$types';
import { isLoggedIn } from 'axios-jwt';
import { browser } from '$app/environment';
import { get } from 'svelte/store';
import { isAuthenticated } from '$lib/stores/auth';

export const load: LayoutLoad = async ({ url }) => {
    // Only check auth on client-side and when not on login page
    if (browser && !url.pathname.includes('/login')) {
        // 使用 store 中的认证状态，避免重复检查
        const authenticated = get(isAuthenticated);
        if (!authenticated) {
            console.debug('Not authenticated, redirecting to login page');
            // Store the current URL to redirect back after login
            const returnUrl = url.pathname + url.search;
            await goto(`/login?returnUrl=${encodeURIComponent(returnUrl)}`);
            return {};
        }
    }
    
    return {};
};
