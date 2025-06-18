import type { LayoutLoad } from './$types';
import {currentUser, updateAuthState} from '$lib/stores/auth';
import { get } from 'svelte/store';
import { goto } from '$app/navigation';

export const ssr = false;

export const load: LayoutLoad = async ({ url }) => {
    await updateAuthState();
    let user = get(currentUser);
    if (user == null) {
        console.log("[Layout] 未登录，重定向...")
        goto("/login");
    }

    return {};
};
