import { API_URL } from "$lib/params/base";
import { Category, type Post, type Tag } from "$lib/model";
import {
    getAccessToken,
} from "axios-jwt";
import { axiosInstance } from "$lib/stores/auth";
import { User } from "$lib/model";
import { currentUser } from './stores/auth';

export const BASE_URL = "http://localhost:8000/api/v1";

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
/**
 * 创建标签
 * @param tag 要创建的标签对象
 * @returns Promise 包含创建结果的对象
 */
export const createTag = async (tag: Tag) => {
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
export const deleteCategories = async (ids: (number | undefined | string)[]) => {
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
export async function requestCurrentUser() {
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
            return user;
        }
        throw new Error("Failed to get user data");
    } catch (error) {
        console.error("[API] 获取用户信息失败:", error);
        throw error;
    }
}
