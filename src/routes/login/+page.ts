import type { PageLoad } from './$types';
import { browser } from '$app/environment';
import { get } from 'svelte/store';
import { goto } from '$app/navigation';
import { currentUser } from '$lib/stores/auth';

export const load: PageLoad = async () => {
    if (!browser) {
        return {};
    }

    let user = get(currentUser);
    if (user != null) {
        console.debug('[Login] Already logged in, redirecting to admin');
        await goto('/admin');
        return {};
    } else {
        console.debug('[Login] Not logged in, user is null');
    }

    return {};
};
