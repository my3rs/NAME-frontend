// 兼容性配置 - 重新导出新的配置系统
// 这个文件保持向后兼容，但内部使用新的配置架构

import { config, apiConfig, API_BASE_URL, DEBUG_CONFIG, PAGINATION_CONFIG } from '$lib/config';

// 重新导出配置值以保持向后兼容
export const BASE_URL = config.api.baseUrl;
export const API_URL = apiConfig.baseUrl;

// 构建具体的URL
export const LOGIN_URL = `${API_URL}/auth/login`;
export const REGISTER_URL = `${API_URL}/auth/register`;
export const REFRESH_TOKEN_URL = `${API_URL}/auth/refresh`;
export const POST_URL = `${API_URL}/posts`;
export const STATUS_URL = `${API_URL}/status`;

// 分页配置
export const PAGE_SIZE = PAGINATION_CONFIG.defaultPageSize;

// 调试配置
export const DEBUG = DEBUG_CONFIG.logApiCalls;