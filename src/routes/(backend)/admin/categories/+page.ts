import type { PageLoad } from './$types';
import {API_URL, DEBUG} from "$lib/params/base";
import axios from "axios";
import {error} from "@sveltejs/kit";

export const ssr = false;


export const load = (async ({ params  }) => {
    try {
        const rsp = await axios.get(API_URL + "/categories/", {
            params: {
                pageIndex: 1,
                pageSize: 10,
                orderBy: "created_at desc"
            }
        });

        if (rsp.data.success) {
            if (DEBUG) {
                console.log("预加载数据成功：", {
                    items: rsp.data.items,
                    pagination: rsp.data.pagination
                })
            }

            return {
                items: rsp.data.items,
                pagination: rsp.data.pagination
            };
        } else {
            throw error(404, "not found")
        }

    } catch (e) {
        throw e;
    }


}) satisfies PageLoad;