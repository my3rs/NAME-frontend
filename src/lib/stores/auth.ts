import { writable } from 'svelte/store';
import { User, UserRole } from '$lib/model';
import { browser } from '$app/environment';
import { isLoggedIn, getAccessToken, getRefreshToken } from 'axios-jwt';
import { goto } from '$app/navigation';
import { page } from '$app/stores';
import { get } from 'svelte/store';
import { requestRefresh, getCurrentUser } from '$lib/api';

// 用户信息存储
export const currentUser = writable<User | null>(null);
export const isAuthenticated = writable<boolean>(false);

// 处理认证错误的辅助函数
async function handleAuthError() {
    currentUser.set(null);
    isAuthenticated.set(false);
}

// 更新认证状态和用户信息
export async function updateAuthState(forceRedirect: boolean = false) {
    try {
        // 检查登录状态
        const loggedIn = await isLoggedIn();
        console.debug('[Auth] 登录状态检查:', loggedIn);
        isAuthenticated.set(loggedIn);

        // 获取当前路径
        let currentPath = '/';
        if (browser) {
            const currentPage = get(page);
            currentPath = currentPage?.url?.pathname || window.location.pathname;
        }
        console.debug('[Auth] 当前路径:', currentPath);

        if (loggedIn) {
            // 已登录：检查 token 是否即将过期
            const accessToken = await getAccessToken();
            if (accessToken) {
                const jwtParts = accessToken.split('.');
                const payload = JSON.parse(atob(jwtParts[1]));
                const exp = payload.exp;
                const now = Math.floor(Date.now() / 1000);
                if (exp - now < 300) { // token 将在5分钟内过期
                    console.warn("[Auth] Access token 即将过期");
                    const refreshToken = await getRefreshToken();
                    if (refreshToken) {
                        try {
                            console.debug("[Auth] 正在尝试刷新 token");
                            await requestRefresh(refreshToken);
                            console.debug("[Auth] Token 刷新成功");
                        } catch (error) {
                            console.error("[Auth] Token 刷新失败:", error);
                        }
                    } else {
                        console.warn("[Auth] 没有可用的 refresh token");
                    }
                }
            }

            // 获取用户信息
            try {
                const user = await getCurrentUser();
                console.debug('[Auth] 已获取用户信息:', user);
                currentUser.set(user);

                // 只在登录页面时重定向到管理后台
                const isLoginPage = currentPath.includes('/login');
                if (isLoginPage) {
                    console.debug('[Auth] 在登录页面检测到已登录状态，重定向到管理后台');
                    await goto('/admin');
                }
                return;
            } catch (error) {
                console.error('[Auth] 获取用户信息失败:', error);
                await handleAuthError();
            }
        } else {
            // 未登录：清除用户信息并处理重定向
            await handleAuthError();
            // 在非登录页面时重定向到登录页面
            const isLoginPage = currentPath.includes('/login');
            if (browser && !isLoginPage) {
                console.debug('[Auth] 在非登录页面检测到未登录状态，重定向到登录页面');
                await goto('/login');
            }
        }
    } catch (error) {
        console.error('[Auth] 更新用户 token 时出错:', error);
        await handleAuthError();
    }
}

// 在浏览器环境下初始化用户状态
if (browser) {
    console.debug('[Auth] 正在浏览器环境中初始化用户状态');
    // 初始化时不强制重定向
    updateAuthState(false);
}
