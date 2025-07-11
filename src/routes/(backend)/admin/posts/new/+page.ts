export const ssr = false;

import type { PageLoad } from './$types';
import type { AxiosError } from 'axios';
import {API_URL, DEBUG, PAGE_SIZE} from "$lib/params/base";
import { axiosInstance } from "$lib/stores/auth";
import { error } from "@sveltejs/kit";
import { get } from "svelte/store";
import { goto } from "$app/navigation";
import { browser } from '$app/environment';

export const load = (async () => {
    if (!browser) {
        return { categories: [] };
    }

    try {
        const rsp = await axiosInstance.get(API_URL + "/categories", {
            params: {
                pageIndex: 1,
                pageSize: 100
            }
        });

        if (rsp.data.success) {
            if (DEBUG) {
                console.log("预加载数据成功：", {
                    categories: rsp.data.data,
                    pagination: rsp.data.page
                })
            }

            return {
                categories: rsp.data.data,
            };
        } else {
            console.log("预加载数据失败：", rsp.data);
            throw error(500, rsp.data.message || "加载分类失败");
        }

    } catch (e: unknown) {
        if (e instanceof Error) {
            const axiosError = e as AxiosError;
            if (axiosError.response?.status === 401) {
                console.debug('Token expired or invalid, redirecting to login page');
                await goto('/login');
                return { categories: [] };
            }
            throw error(500, e.message || "加载分类失败");
        }
        throw error(500, "An unknown error occurred");
    }
    
}) satisfies PageLoad;