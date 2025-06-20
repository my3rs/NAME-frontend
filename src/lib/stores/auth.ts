// 兼容性认证存储 - 重新导出新的认证服务
// 这个文件保持向后兼容，但内部使用新的认证架构

import { httpClient } from '$lib/services/http';
import { 
    currentUser, 
    isAuthenticated, 
    authLoading, 
    authError, 
    authService,
    initAuth,
    login as newLogin,
    logout as newLogout,
    requireAuth as newRequireAuth,
    checkAuthStatus as newCheckAuthStatus
} from '$lib/services/auth';
import { User } from '$lib/model';
import { setAuthTokens, clearAuthTokens, getAccessToken, getRefreshToken } from '$lib/services/http';

// 重新导出HTTP客户端以保持兼容性
export const axiosInstance = httpClient;

// 重新导出认证状态
export { currentUser, isAuthenticated, authLoading, authError };

// 兼容性函数
export const getUser = async (): Promise<User | null> => {
    return await authService.fetchCurrentUser();
};

export const updateAuthState = async (): Promise<void> => {
    await authService.initialize();
};

export const saveTokens = async (accessToken: string, refreshToken: string) => {
    await setAuthTokens({ accessToken, refreshToken });
    await authService.fetchCurrentUser();
};

export const checkAndRefreshToken = async (): Promise<boolean> => {
    try {
        return await newCheckAuthStatus();
    } catch (error) {
        console.error('[Auth] Token check failed:', error);
        return false;
    }
};

// 导出token管理函数
export { setAuthTokens, clearAuthTokens, getAccessToken, getRefreshToken };

// 便捷函数重新导出
export const login = newLogin;
export const logout = newLogout;
export const requireAuth = newRequireAuth;
export const checkAuthStatus = newCheckAuthStatus;

// 初始化认证服务
if (typeof window !== 'undefined') {
    initAuth();
}