import { redirect } from '@sveltejs/kit';
import { isLoggedIn } from 'axios-jwt';
import type { LayoutLoad } from './$types';

export const ssr = false;

export const load: LayoutLoad = async ({ url }) => {
    const loggedIn = await isLoggedIn();
    
    if (!loggedIn && !url.pathname.startsWith('/login')) {
        throw redirect(307, '/login');
    }

    return {};
};
