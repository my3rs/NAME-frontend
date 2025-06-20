import { dev } from '$app/environment';

// 环境配置
export const config = {
    // API 配置
    api: {
        baseUrl: dev ? 'http://localhost:8000' : '',
        version: 'v1',
        timeout: 10000,
        retryAttempts: 3,
        retryDelay: 1000,
    },
    
    // 认证配置
    auth: {
        tokenRefreshThreshold: 5 * 60 * 1000, // 5分钟
        tokenStorageKey: 'auth_tokens',
        redirectAfterLogin: '/admin',
        redirectAfterLogout: '/login',
    },
    
    // 分页配置
    pagination: {
        defaultPageSize: 10,
        maxPageSize: 100,
    },
    
    // 开发配置
    debug: {
        logApiCalls: dev,
        logAuthEvents: dev,
        logStateChanges: dev,
    }
} as const;

// 计算得出的配置
export const apiConfig = {
    baseUrl: `${config.api.baseUrl}/api/${config.api.version}`,
    timeout: config.api.timeout,
} as const;

// 导出常用的配置值
export const { 
    API_BASE_URL = apiConfig.baseUrl,
    AUTH_CONFIG = config.auth,
    DEBUG_CONFIG = config.debug,
    PAGINATION_CONFIG = config.pagination,
} = {};