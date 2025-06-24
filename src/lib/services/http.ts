import axios, { type AxiosInstance, type AxiosRequestConfig, type AxiosResponse } from 'axios';
import { 
    applyAuthTokenInterceptor, 
    getBrowserLocalStorage,
    clearAuthTokens,
    setAuthTokens,
    getRefreshToken,
    getAccessToken,
    type IAuthTokens,
    type TokenRefreshRequest
} from 'axios-jwt';
import { browser } from '$app/environment';
import { goto } from '$app/navigation';
import { apiConfig, DEBUG_CONFIG } from '$lib/config';
import type { ApiResponse, ApiError } from '$lib/types/api';

// 创建axios实例
export const httpClient: AxiosInstance = axios.create({
    baseURL: apiConfig.baseUrl,
    timeout: apiConfig.timeout,
    headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
    },
});

// Token刷新函数 - 匹配后端的刷新逻辑
const requestRefresh: TokenRefreshRequest = async (
    refreshToken: string,
): Promise<IAuthTokens | string> => {
    console.log('[HTTP] Token refresh triggered with token:', refreshToken?.substring(0, 20) + '...');
    
    if (DEBUG_CONFIG.logAuthEvents) {
        console.debug('[HTTP] Token refresh triggered');
    }

    try {
        const response = await axios.post(
            `${apiConfig.baseUrl}/auth/refresh`,
            {},
            {
                headers: {
                    'X-Refresh-Token': refreshToken,
                },
            },
        );

        // Debug: Log the full response to understand what we're getting
        if (DEBUG_CONFIG.logAuthEvents) {
            console.debug('[HTTP] Token refresh response:', {
                status: response.status,
                headers: response.headers,
                data: response.data
            });
        }

        // Try to get tokens from headers first
        let accessToken = response.headers['authorization'];
        let newRefreshToken = response.headers['x-refresh-token'];

        // If not in headers, try to get from response body
        if (!accessToken && response.data) {
            // Handle different possible response formats
            if (typeof response.data === 'object') {
                accessToken = response.data.accessToken || response.data.access_token || response.data.token;
                newRefreshToken = response.data.refreshToken || response.data.refresh_token;
            }
        }

        // 移除可能包含的引号
        if (accessToken && typeof accessToken === 'string') {
            if (accessToken.startsWith('"') && accessToken.endsWith('"')) {
                accessToken = accessToken.slice(1, -1);
            }
        }
        if (newRefreshToken && typeof newRefreshToken === 'string') {
            if (newRefreshToken.startsWith('"') && newRefreshToken.endsWith('"')) {
                newRefreshToken = newRefreshToken.slice(1, -1);
            }
        }

        // 移除Bearer前缀，因为axios-jwt会自动添加
        if (accessToken && typeof accessToken === 'string' && accessToken.startsWith('Bearer ')) {
            accessToken = accessToken.substring(7);
        }
        if (newRefreshToken && typeof newRefreshToken === 'string' && newRefreshToken.startsWith('Bearer ')) {
            newRefreshToken = newRefreshToken.substring(7);
        }

        if (response.status === 200 && accessToken) {
            if (DEBUG_CONFIG.logAuthEvents) {
                console.debug('[HTTP] Token refresh successful');
            }
            
            return {
                accessToken: accessToken,
                refreshToken: newRefreshToken || refreshToken,
            };
        } else {
            console.error('[HTTP] Token refresh failed: Missing tokens in response');
            throw new Error('Token refresh failed');
        }
    } catch (error) {
        console.error('[HTTP] Token refresh error:', error);
        
        // Log more details about the error for debugging
        if (error?.response) {
            console.error('[HTTP] Response status:', error.response.status);
            console.error('[HTTP] Response headers:', error.response.headers);
            console.error('[HTTP] Response data:', error.response.data);
        }
        
        // 清理认证状态
        if (browser) {
            await clearAuthTokens();
            await goto('/login');
        }
        
        throw error;
    }
};

// 配置认证拦截器
if (browser) {
    applyAuthTokenInterceptor(httpClient, { 
        requestRefresh, 
        header: 'Authorization',
        headerPrefix: 'Bearer ',
        // Add more detailed configuration to help debug
        storage: getBrowserLocalStorage(),
    });
}

// 请求拦截器
httpClient.interceptors.request.use(
    (config) => {
        if (DEBUG_CONFIG.logApiCalls) {
            console.debug('[HTTP] Request:', {
                url: config.url,
                method: config.method,
                params: config.params,
            });
        }
        return config;
    },
    (error) => {
        console.error('[HTTP] Request error:', error);
        return Promise.reject(error);
    }
);

// 响应拦截器
httpClient.interceptors.response.use(
    (response: AxiosResponse) => {
        if (DEBUG_CONFIG.logApiCalls) {
            console.debug('[HTTP] Response:', {
                url: response.config.url,
                status: response.status,
                data: response.data,
            });
        }
        return response;
    },
    async (error) => {
        console.error('[HTTP] Response error:', error);
        
        // 处理401未授权错误
        if (error.response?.status === 401) {
            console.error('[HTTP] Unauthorized access, clearing auth state');
            
            if (browser) {
                await clearAuthTokens();
                await goto('/login');
            }
        }
        
        return Promise.reject(error);
    }
);

// 工具函数：处理API响应
export function handleApiResponse<T>(response: AxiosResponse<ApiResponse<T>>): T {
    if (response.data.success) {
        return response.data.data;
    } else {
        const error: ApiError = {
            code: response.data.code?.toString() || 'UNKNOWN_ERROR',
            message: response.data.message || 'Unknown error occurred',
            statusCode: response.status,
        };
        throw error;
    }
}

// 工具函数：处理API错误
export function handleApiError(error: any): ApiError {
    if (error.response) {
        // 服务器响应错误
        return {
            code: error.response.data?.code || 'SERVER_ERROR',
            message: error.response.data?.message || 'Server error occurred',
            statusCode: error.response.status,
            details: error.response.data,
        };
    } else if (error.request) {
        // 网络错误
        return {
            code: 'NETWORK_ERROR',
            message: 'Network error occurred',
            details: error.message,
        };
    } else {
        // 其他错误
        return {
            code: 'UNKNOWN_ERROR',
            message: error.message || 'Unknown error occurred',
            details: error,
        };
    }
}

// 导出认证相关函数
export {
    setAuthTokens,
    clearAuthTokens,
    getAccessToken,
    getRefreshToken,
};