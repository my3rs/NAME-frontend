import { writable } from 'svelte/store';
import { browser } from '$app/environment';
import { goto } from '$app/navigation';
import { isLoggedIn } from 'axios-jwt';
import { httpClient, setAuthTokens, clearAuthTokens, handleApiResponse, handleApiError } from './http';
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
            const response = await httpClient.post<LoginResponse>('/auth/login', credentials);
            
            // 从响应头获取token
            const accessToken = response.headers['authorization'];
            const refreshToken = response.headers['refresh-token'];

            if (accessToken && refreshToken) {
                // 保存token
                await setAuthTokens({
                    accessToken,
                    refreshToken,
                });

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