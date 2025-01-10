// @ts-ignore
import type { PageLoad } from './$types';
import axios from 'axios';
import {API_URL} from '$lib/params/base';
import { superValidate } from "sveltekit-superforms";
import { commentFormSchema } from "$lib/scheme";
import { zod } from "sveltekit-superforms/adapters";



export const load : PageLoad = async ({params}) => {

    const postres = await axios.get(API_URL + `/posts/${params.postID}`)
    const commentres = await axios.get(API_URL + `/comments`,{
      params: {
        postID: params.postID,
        pageIndex: 1,
        pageSize: 20,
        contentID: params.postID,
        orderBy: "created_at desc"
      }
    })

    return {
        post: postres.data.data[0],
        comments: commentres.data.data,
        form: await superValidate(zod(commentFormSchema)),
    }

}

