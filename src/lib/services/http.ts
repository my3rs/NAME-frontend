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

// Token刷新函数
const requestRefresh: TokenRefreshRequest = async (
    refreshToken: string,
): Promise<IAuthTokens | string> => {
    if (DEBUG_CONFIG.logAuthEvents) {
        console.debug('[HTTP] Token refresh triggered');
    }

    try {
        const response = await axios.post(
            `${apiConfig.baseUrl}/auth/refresh`,
            {},
            {
                headers: {
                    'Refresh-Token': refreshToken,
                },
            },
        );

        const accessToken = response.headers['authorization'];
        const newRefreshToken = response.headers['refresh-token'];

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