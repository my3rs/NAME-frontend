import { API_URL } from "$lib/params/base";
import { Category, type Post, type Tag } from "$lib/model";
import { 
    applyAuthTokenInterceptor, 
    getBrowserLocalStorage,
    clearAuthTokens,
    setAuthTokens,
    getRefreshToken,
    getAccessToken 
} from "axios-jwt";
import type { IAuthTokens, TokenRefreshRequest } from "axios-jwt";
import axios from "axios";
import { browser } from "$app/environment";
import { goto } from "$app/navigation";
import { updateAuthState } from './stores/auth';
import { User } from "$lib/model";
import { currentUser, isAuthenticated } from './stores/auth';

export const BASE_URL = "http://localhost:8000/api/v1";
export const BACKEND_URL = "http://localhost:8000";

// 1. Create an axios instance that you wish to apply the interceptor to
export const axiosInstance = axios.create({ 
    baseURL: BASE_URL,
    // Ensure we can read the auth headers
    headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
    }
});


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
          "Refresh-Token": refreshToken,
        },
      },
    );

    // Get tokens from response headers with exact case
    const accessToken = response.headers["authorization"];
    const newRefreshToken = response.headers["refresh-token"];

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
let storage: any = null;

if (browser) {
    // Create a wrapper around localStorage to add logging
    storage = {
        setItem: (key: string, value: string) => {
            if (import.meta.env.DEV) {
                console.debug(`Setting ${key} in storage:`, value ? 'present' : 'empty');
            }
            return localStorage.setItem(key, value);
        },
        getItem: (key: string) => {
            const value = localStorage.getItem(key);
            if (import.meta.env.DEV) {
                console.debug(`Getting ${key} from storage:`, value ? 'present' : 'empty');
            }
            return value;
        },
        removeItem: (key: string) => {
            if (import.meta.env.DEV) {
                console.debug(`Removing ${key} from storage`);
            }
            return localStorage.removeItem(key);
        }
    };
    
    // Configure axios-jwt with proper storage
    applyAuthTokenInterceptor(axiosInstance, { 
        requestRefresh, 
        header: "Authorization",  // Use exact header case
        headerPrefix: "Bearer ",  // Keep Bearer prefix for regular requests
        storage: storage         // explicitly pass the storage
    });
}

// Export storage for use in other parts of the application
export { storage as tokenStorage };

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
      console.error("Unauthorized access, redirecting to login");
      await logout();
      if (browser) {
        await goto("/login");
      }
    }
    return Promise.reject(error);
  }
);

export const getPostByID = (id: number | string, params?: string) => {
  return axiosInstance.get(API_URL + "/posts/" + id + "?" + params);
};

export const getPosts = async (
  pageIndex: number | string,
  pageSize: number | string,
) => {
  return axiosInstance.get(API_URL + "/posts", {
    params: {
      pageIndex: pageIndex,
      pageSize: pageSize,
      orderBy: "created_at desc",
    },
  });
};

export const getComments = async (
  pageIndex: number | string,
  pageSize: number | string,
  params?: Object,
) => {
  return axiosInstance.get(API_URL + "/comments/", {
    params: Object.assign(
      {
        pageIndex: pageIndex,
        pageSize: pageSize,
        orderBy: "created_at desc",
      },
      params,
    ),
  });
};

export const deleteBatchComments = async (ids: number[]) => {
  let idString = "";
  ids.forEach((id) => {
    idString = idString + id + ",";
  });

  return axiosInstance.delete(API_URL + "/comments/" + idString);
};

export const deleteComment = async (id: number) => {
  return axiosInstance.delete(API_URL + "/comments/" + id);
};

export const getTags = async (params?: Object) => {
  return axiosInstance.get(API_URL + "/tags", {
    params: params,
  });
};

export const deletePostByIDs = async (ids: number[]) => {
  let idString = "";
  ids.forEach((id) => {
    idString = idString + id + ",";
  });

  return axiosInstance.delete(API_URL + "/posts/" + idString);
};

export function getFormattedDate(ms: number) {
  let date = new Date(ms);

  let Y = date.getFullYear();
  let M = (date.getMonth() + 1 < 10 ? "0" + (date.getMonth() + 1) : date.getMonth() + 1);
  let D = date.getDate() < 10 ? "0" + date.getDate() : date.getDate();
  let h = date.getHours() < 10 ? "0" + date.getHours() : date.getHours();
  let m = date.getMinutes() < 10 ? "0" + date.getMinutes() : date.getMinutes();
  let s = date.getSeconds() < 10 ? "0" + date.getSeconds() : date.getSeconds();
  return `${Y}-${M}-${D} ${h}:${m}:${s}`;
}

export const formatDate = getFormattedDate;

export function getFormattedDateWithoutTime(ms: number) {
  let date = new Date(ms);

  let Y = date.getFullYear() + "年";
  let M =
    (date.getMonth() + 1 < 10
      ? "0" + (date.getMonth() + 1)
      : date.getMonth() + 1) + "月";
  let D = (date.getDate() < 10 ? "0" + date.getDate() : date.getDate()) + "日";

  return Y + M + D;
}

// ********************************************************
// *********************** Post ***************************
// ********************************************************

// 创建文章
export const createPost = async (post: Post) => {
  return axiosInstance.post(API_URL + "/posts", post);
};

// 更新文章
export const updatePost = async (post: Post) => {
  return axiosInstance.put(API_URL + "/posts/" + post.id, post);
};

// 删除文章
export const deletePosts = async (ids: (number | string | undefined)[]) => {
  const idString = convertIDList2String(ids);

  return axiosInstance.delete(API_URL + "/posts/" + idString);
};

// ********************************************************
// *********************** Tag ***************************
// ********************************************************

// 创建标签
export const crateTag = async (tag: Tag) => {
  return axiosInstance.post(API_URL + "/tags", tag);
};

// 更新标签
export const updateTag = async (tag: Tag) => {
  return axiosInstance.put(API_URL + "/tags/" + tag.id, tag);
};

// 删除标签
export const deleteTags = async (ids: (number | undefined)[]) => {
  const idString = convertIDList2String(ids);

  return axiosInstance.delete(API_URL + "/tags/" + idString);
};

// ********************************************************
// *********************** Cateogry ***************************
// ********************************************************

// 创建分类
export const createCategory = async (category: Category) => {
  return axiosInstance.post(API_URL + "/categories", category);
};

// 更新分类
export const updateCategory = async (category: Category) => {
  return axiosInstance.put(API_URL + "/categories/" + category.id, category);
};

// 删除分类
export const deleteCategories = async (ids: (number | undefined)[]) => {
  const idString = convertIDList2String(ids);

  return axiosInstance.delete(API_URL + "/categories/" + idString);
};

// 将ID组成的数字数组转换成 `id1,id2,id3` 样式的字符串
function convertIDList2String(ids: (number | string | undefined)[]): string {
  const validIds = ids.filter((id): id is number => id !== undefined);
  return validIds.join(",");
}

// ********************************************************
// *********************** 用户验证 ************************
// ********************************************************

// 获取当前用户信息
export async function getCurrentUser() {
  try {
    const response = await axiosInstance.get(`${BASE_URL}/users/me`);
    if (response.data.success) {
      const userData = response.data.data;
      const user = new User();
      user.id = userData.id;
      user.username = userData.name;
      user.email = userData.mail;
      user.url = userData.url;
      user.avatar = userData.avatar;  
      user.createdAt = userData.createdAt;
      user.updatedAt = userData.updatedAt;
      user.activated = userData.activated;
      user.role = userData.role;
      
      // 更新全局状态
      currentUser.set(user);
      isAuthenticated.set(true);
      
      return user;
    }
    throw new Error('获取用户信息失败');
  } catch (error) {
    console.error('[API] 获取用户信息失败:', error);
    // 清除用户状态
    currentUser.set(null);
    isAuthenticated.set(false);
    throw error;
  }
}

// 登录
export async function login(username: string, password: string) {
  try {
    const response = await axios.post(`${BASE_URL}/auth/login`, {
      username,
      password,
    });

    if (response.status === 200) {
      // 注意：后端返回的header名称是大写的，但axios会将其转换为小写
      const accessToken = response.headers["authorization"];
      const refreshToken = response.headers["refresh-token"];

      if (accessToken && refreshToken) {
        await setAuthTokens({
          accessToken,
          refreshToken,
        });
        
        // 更新用户信息
        await updateAuthState();
        return { success: true };
      }
    }
    return { success: false, message: "登录失败" };
  } catch (error) {
    console.error("Login failed:", error);
    return { 
      success: false, 
      message: error.response?.data?.message || "登录失败，请稍后重试" 
    };
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
  } finally {
    try {
      // 清除本地 token
      await clearAuthTokens();
      // 清除用户信息
      await updateAuthState();
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
