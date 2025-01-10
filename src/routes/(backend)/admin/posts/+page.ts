import type { PageLoad } from './$types';
import {API_URL, DEBUG, PAGE_SIZE} from "$lib/params/base";
import {axiosInstance} from "$lib/api";
import {error} from "@sveltejs/kit";

export const ssr = false;


export const load = (async ({ params  }) => {
    try {
        const rsp = await axiosInstance.get("/posts/", {
            params: {
                pageIndex: 0,
                pageSize: PAGE_SIZE,
                orderBy: "created_at desc"
            }
        });

        if (rsp.data.success) {
            if (DEBUG) {
                console.log("预加载数据成功：", {
                    posts: rsp.data.data,
                    pagination: rsp.data.page
                })
            }

            return {
                posts: rsp.data.data,
                pagination: rsp.data.page
            };
        } else {
            throw error(404, "not found")
        }

    } catch (e) {
        throw e;
    }


}) satisfies PageLoad;