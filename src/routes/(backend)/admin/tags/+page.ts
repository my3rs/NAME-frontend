import type { PageLoad } from "./$types";
import { API_URL, DEBUG } from "$lib/params/base";
import axios from "axios";
import { error } from "@sveltejs/kit";

export const ssr = false;

export const load = (async ({ params }) => {
  try {
    const rsp = await axios.get(API_URL + "/tags", {
      params: {
        path: true,
      },
    });

    if (rsp.data.success) {
      if (DEBUG) {
        console.log("预加载数据成功：", {
          items: rsp.data.data,
        });
      }

      return {
        items: rsp.data.data,
      };
    } else {
      throw error(404, "not found");
    }
  } catch (e) {
    throw e;
  }
}) satisfies PageLoad;
