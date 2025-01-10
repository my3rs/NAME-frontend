import type { PageLoad } from './$types'
import axios from 'axios'
import {API_URL, DEBUG, PAGE_SIZE} from '$lib/params/base'

export const load: PageLoad = async () => {
    try {
        const rsp = await axios.get(API_URL + '/posts', {
            params: {
                pageIndex: 1,
                pageSize: PAGE_SIZE,
                orderBy: "created_at desc"
            }
        });

        if (rsp.data.success) {
            if (DEBUG) {
                console.log("预加载数据成功.", rsp.data.pagination.itemsCount);
            }
            return {
                posts: rsp.data.items,
                pagination: rsp.data.pagination,
            };
        } else {
            console.log("Failed to get posts from backend.");
            if (DEBUG) {
                console.error(rsp.data.message);
            }

            return {
                posts: [],
                pagination: null,
            };
        }
    } catch (err) {
        console.error(err);
        return {
            posts: [],
            pagination: null,
        };
    }
}