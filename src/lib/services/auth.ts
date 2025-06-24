import { writable } from 'svelte/store';
import { browser } from '$app/environment';
import { goto } from '$app/navigation';
import { isLoggedIn } from 'axios-jwt';
import { httpClient, setAuthTokens, clearAuthTokens, handleApiResponse, handleApiError, getAccessToken, getRefreshToken } from './http';
import { User } from '$lib/model';
import { AUTH_CONFIG, DEBUG_CONFIG } from '$lib/config';
import type { LoginRequest, LoginResponse, UserData, ApiError, ApiResponse } from '$lib/types/api';

// 认证状态
export const currentUser = writable<User | null>(null);
export const isAuthenticated = writable<boolean>(false);
export const authLoading = writable<boolean>(false);
export const authError = writable<ApiError | null>(null);

class AuthService {
    private initialized = false;

    // 初始化认证状态
    async initialize(): Promise<void> {
        if (this.initialized || !browser) return;
        
        if (DEBUG_CONFIG.logAuthEvents) {
            console.debug('[Auth] Initializing auth service');
        }

        authLoading.set(true);
        
        try {
            const loggedIn = await isLoggedIn();
            if (loggedIn) {
                await this.fetchCurrentUser();
            } else {
                this.clearAuthState();
            }
        } catch (error) {
            console.error('[Auth] Initialization failed:', error);
            this.clearAuthState();
        } finally {
            authLoading.set(false);
            this.initialized = true;
        }
    }

    // 登录
    async login(credentials: LoginRequest): Promise<{ success: boolean; error?: ApiError }> {
        if (DEBUG_CONFIG.logAuthEvents) {
            console.debug('[Auth] Login attempt for user:', credentials.username);
        }

        authLoading.set(true);
        authError.set(null);

        try {
            // 后端登录路径：/auth/login/:username
            const response = await httpClient.post(
                `/auth/login/${credentials.username}`, 
                {
                    username: credentials.username,
                    password: credentials.password
                }
            );
            
            // 从响应头获取token，匹配后端的头名称，并处理可能包含引号的token
            let accessToken = response.headers['authorization'];
            let refreshToken = response.headers['x-refresh-token'];

            // 移除可能包含的引号
            if (accessToken && accessToken.startsWith('"') && accessToken.endsWith('"')) {
                accessToken = accessToken.slice(1, -1);
            }
            if (refreshToken && refreshToken.startsWith('"') && refreshToken.endsWith('"')) {
                refreshToken = refreshToken.slice(1, -1);
            }

            // 移除Bearer前缀，因为axios-jwt会自动添加
            if (accessToken && accessToken.startsWith('Bearer ')) {
                accessToken = accessToken.substring(7);
            }
            if (refreshToken && refreshToken.startsWith('Bearer ')) {
                refreshToken = refreshToken.substring(7);
            }

            if (accessToken && refreshToken) {
                console.log('[Auth] Tokens received - Access:', accessToken.substring(0, 20) + '...');
                console.log('[Auth] Tokens received - Refresh:', refreshToken.substring(0, 20) + '...');
                
                // 保存token
                await setAuthTokens({
                    accessToken,
                    refreshToken,
                });

                // Verify tokens were stored correctly
                const storedAccessToken = await getAccessToken();
                const storedRefreshToken = await getRefreshToken();
                console.log('[Auth] Tokens stored - Access:', storedAccessToken?.substring(0, 20) + '...');
                console.log('[Auth] Tokens stored - Refresh:', storedRefreshToken?.substring(0, 20) + '...');

                // 获取用户信息
                await this.fetchCurrentUser();

                if (DEBUG_CONFIG.logAuthEvents) {
                    console.debug('[Auth] Login successful');
                }

                return { success: true };
            } else {
                throw new Error('No tokens received from server');
            }
        } catch (error) {
            const apiError = handleApiError(error);
            console.error('[Auth] Login failed:', apiError);
            
            authError.set(apiError);
            this.clearAuthState();
            
            return { success: false, error: apiError };
        } finally {
            authLoading.set(false);
        }
    }

    // 登出
    async logout(): Promise<void> {
        if (DEBUG_CONFIG.logAuthEvents) {
            console.debug('[Auth] Logout initiated');
        }

        authLoading.set(true);

        try {
            // 调用后端登出接口
            await httpClient.post('/auth/logout');
        } catch (error) {
            console.error('[Auth] Logout API call failed:', error);
        } finally {
            // 总是清理本地状态
            await this.clearAuthState();
            authLoading.set(false);
            
            if (browser) {
                await goto(AUTH_CONFIG.redirectAfterLogout);
            }
        }
    }

    // 获取当前用户信息
    async fetchCurrentUser(): Promise<User | null> {
        try {
            console.log('[Auth] About to fetch current user info');
            const currentAccessToken = await getAccessToken();
            console.log('[Auth] Current access token before /users/me:', currentAccessToken?.substring(0, 20) + '...');
            
            const response = await httpClient.get<ApiResponse<UserData>>('/users/me');
            const userData = handleApiResponse(response);
            
            const user = new User();
            user.id = userData.id;
            user.username = userData.name;
            user.email = userData.mail;
            user.url = userData.url;
            user.avatar = userData.avatar;
            user.createdAt = userData.createdAt;
            user.updatedAt = userData.updatedAt;
            user.activated = userData.activated;
            user.role = userData.role; // 保持字符串类型

            currentUser.set(user);
            isAuthenticated.set(true);
            authError.set(null);

            if (DEBUG_CONFIG.logAuthEvents) {
                console.debug('[Auth] User info updated:', user.username);
            }

            return user;
        } catch (error) {
            const apiError = handleApiError(error);
            console.error('[Auth] Failed to fetch user info:', apiError);
            
            authError.set(apiError);
            this.clearAuthState();
            
            return null;
        }
    }

    // 检查认证状态
    async checkAuthStatus(): Promise<boolean> {
        if (!browser) return false;

        try {
            const loggedIn = await isLoggedIn();
            if (loggedIn) {
                const user = await this.fetchCurrentUser();
                return user !== null;
            } else {
                this.clearAuthState();
                return false;
            }
        } catch (error) {
            console.error('[Auth] Auth status check failed:', error);
            this.clearAuthState();
            return false;
        }
    }

    // 清理认证状态
    private async clearAuthState(): Promise<void> {
        await clearAuthTokens();
        currentUser.set(null);
        isAuthenticated.set(false);
        authError.set(null);
        
        if (DEBUG_CONFIG.logAuthEvents) {
            console.debug('[Auth] Auth state cleared');
        }
    }

    // 要求认证（用于路由守卫）
    async requireAuth(): Promise<boolean> {
        const authenticated = await this.checkAuthStatus();
        
        if (!authenticated && browser) {
            await goto(AUTH_CONFIG.redirectAfterLogout);
            return false;
        }
        
        return authenticated;
    }
}

// 导出单例实例
export const authService = new AuthService();

// 便捷函数
export const initAuth = () => authService.initialize();
export const login = (credentials: LoginRequest) => authService.login(credentials);
export const logout = () => authService.logout();
export const requireAuth = () => authService.requireAuth();
export const checkAuthStatus = () => authService.checkAuthStatus();