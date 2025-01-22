import { writable, get } from 'svelte/store';
import { User } from '$lib/model';
import { goto } from '$app/navigation';
import { page } from '$app/stores';
import {
    isLoggedIn,
    setAuthTokens,
    clearAuthTokens,
    getAccessToken,
    getRefreshToken,
    type TokenRefreshRequest, type IAuthTokens, getBrowserLocalStorage, applyAuthTokenInterceptor
} from 'axios-jwt';
import { browser } from "$app/environment";
import {  requestCurrentUser } from '$lib/api';
import axios from "axios";

export const BASE_URL = "http://localhost:8000/api/v1";

// 用户信息和认证状态存储
export const currentUser = writable<User | null>(null);

// Token 过期前的刷新时间（5分钟）
const TOKEN_REFRESH_THRESHOLD = 300;

// 1. Create an axios instance that you wish to apply the interceptor to
export const axiosInstance = axios.create({
    baseURL: BASE_URL,
    // Ensure we can read the auth headers
    headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
    }
});

// Add response interceptor to handle 401 errors globally
axiosInstance.interceptors.response.use(
    (response) => {
        // Log successful token-related responses in development
        if (import.meta.env.DEV && response.config.url?.includes('/auth/')) {
            console.debug('Auth response headers:', response.headers);
        }
        return response;
    },
    async (error) => {
        if (error.response?.status === 401) {
            console.error("拦截到未授权请求，重定向到登录界面");
            // Don't call logout here to avoid infinite loop
            // await clearAuthTokens();
            // currentUser.set(null);
            if (browser) {
                await goto("/login");
            }
        }
        return Promise.reject(error);
    }
);

// 2. Define token refresh function.
export const requestRefresh: TokenRefreshRequest = async (
    refreshToken: string,
): Promise<IAuthTokens | string> => {
    if (import.meta.env.DEV) {
        console.debug('Token refresh triggered with token:', refreshToken?.slice(0, 10) + '...');
    }

    try {
        // Important! Do NOT use the axios instance that you supplied to applyAuthTokenInterceptor
        // because this will result in an infinite loop when trying to refresh the token.
        const response = await axios.post(
            `${BASE_URL}/auth/refresh`,
            {},
            {
                headers: {
                    "X-Refresh-Token": refreshToken,
                },
            },
        );

        // Get tokens from response headers with exact case
        const accessToken = response.headers["authorization"];
        const newRefreshToken = response.headers["x-refresh-token"];

        if (response.status === 200 && accessToken) {
            if (import.meta.env.DEV) {
                console.debug('Token refresh successful:', {
                    hasAccessToken: !!accessToken,
                    hasRefreshToken: !!newRefreshToken,
                    accessTokenLength: accessToken.length,
                    refreshTokenLength: newRefreshToken?.length || 0,
                    headers: response.headers
                });
            }

            return {
                accessToken: accessToken,
                refreshToken: newRefreshToken || refreshToken,
            };
        } else {
            console.error("Token refresh failed: Missing tokens in response headers", {
                status: response.status,
                headers: response.headers,
                accessToken: !!accessToken,
                refreshToken: !!newRefreshToken
            });
            throw new Error("Token refresh failed");
        }
    } catch (error) {
        console.error("Token refresh failed:", error);
        try {
            await clearAuthTokens();
            if (browser) {
                await goto("/login");
            }
        } catch (cleanupError) {
            console.error("Error during cleanup:", cleanupError);
        }
        throw error;
    }
};

// 3. Add interceptor to your axios instance with storage configuration

if (browser) {
    const getStorage = getBrowserLocalStorage

    // Configure axios-jwt with proper storage
    applyAuthTokenInterceptor(axiosInstance, {
        requestRefresh,
        headerPrefix: "",
        header: "Authorization",  // Use exact header case
        getStorage: getStorage         // explicitly pass the storage
    });
}

// 解析 JWT Token
function parseJwtToken(token: string) {
    try {
        const [, payload] = token.split('.');
        return JSON.parse(atob(payload));
    } catch (error) {
        console.error('[Auth] Failed to parse JWT token:', error);
        return null;
    }
}

// 处理认证错误
async function handleAuthError() {
    currentUser.set(null);
    if (browser) {
        // clearAuthTokens();
    }
}

// 检查并刷新 Token
async function checkAndRefreshToken() {
    console.log("[Auth] 检查并刷新 Token...")
    try {
        const accessToken = await getAccessToken();
        if (!accessToken) return false;

        const payload = parseJwtToken(accessToken);
        if (!payload) return false;

        const now = Math.floor(Date.now() / 1000);
        if (payload.exp - now < TOKEN_REFRESH_THRESHOLD) {
            console.log("[Auth] Token将在5分钟内过期")
            const refreshToken = await getRefreshToken();
            if (!refreshToken) return false;

            await requestRefresh(refreshToken);
            return true;
        }
        return true;
    } catch (error) {
        console.error('[Auth] Token refresh failed:', error);
        return false;
    }
}

// 更新认证状态和用户信息
export async function updateAuthState() {
    try {
        if (get(currentUser) == null) {
            console.log("[Auth] currentUser is null")
        }

        // 检查并刷新 token
        const tokenValid = await checkAndRefreshToken();
        if (!tokenValid) {
            await handleAuthError();
            return;
        } else {
            console.debug("[Auth] Token有效")
        }

        // 获取用户信息
        try {
            const user = await requestCurrentUser();
            currentUser.set(user);
        } catch (error) {
            console.error('[Auth] 请求用户信息失败：', error);
            await handleAuthError();
        }
    } catch (error) {
        console.error('[Auth] Failed to update auth state:', error);
        await handleAuthError();
    }
}

// 登录
export async function login(username: string, password: string) {
    try {
        const response = await axios.post(`${BASE_URL}/auth/login/${username}`, {
            username,
            password,
        });

        if (response.status === 200) {
            const accessToken = response.headers["authorization"];
            const refreshToken = response.headers["x-refresh-token"];

            if (accessToken && refreshToken) {
                // First set the tokens
                await setAuthTokens({
                    accessToken,
                    refreshToken,
                });

                // Then try to get user info
                try {
                    const user = await requestCurrentUser();
                    currentUser.set(user);
                    return { success: true };
                } catch (error) {
                    console.error("Failed to get user info after login:", error);
                    // Clear tokens if we can't get user info
                    await clearAuthTokens();
                    currentUser.set(null);
                    return { success: false, message: "登录成功但获取用户信息失败" };
                }
            }
        }
        return { success: false, message: "登录失败" };
    } catch (error: unknown) {
        console.error("Login failed:", error);
        let errorMessage = "登录失败，请稍后重试";
        if (error && typeof error === 'object' && 'response' in error) {
            const axiosError = error as { response?: { data?: { message?: string } } };
            errorMessage = axiosError.response?.data?.message || errorMessage;
        }
        return { 
            success: false, 
            message: errorMessage 
        };
    }
}

// 检查登录状态
export async function checkLoginStatus() {
    if (!browser) return false;

    try {
        const loggedIn = await isLoggedIn();
        if (!loggedIn) return false;

        const accessToken = await getAccessToken();
        if (!accessToken) return false;

        const payload = parseJwtToken(accessToken);
        if (!payload) return false;

        const now = Math.floor(Date.now() / 1000);
        return payload.exp > now;
    } catch (error) {
        console.error('[Auth] Failed to check login status:', error);
        return false;
    }
}

// 登出
export async function logout() {
    try {
        const refreshToken = await getRefreshToken();
        if (refreshToken) {
            // 调用后端注销 token
            await axios.post(`${BASE_URL}/auth/logout`, {}, {
                headers: {
                    "Refresh-Token": refreshToken
                }
            });
        }
    } catch (error) {
        console.error("Logout error:", error);
        // Continue with cleanup even if the server logout fails
    } finally {
        try {
            // 清除本地 token
            await clearAuthTokens();
            // 清除用户信息
            currentUser.set(null);
            if (browser) {
                await goto("/login");
            }
        } catch (error) {
            console.error("Error during cleanup:", error);
            if (browser) {
                await goto("/login");
            }
        }
    }
}
