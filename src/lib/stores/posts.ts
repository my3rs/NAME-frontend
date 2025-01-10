import { writable } from "svelte/store";
import type { Post } from "$lib/model";
import type { PaginationType } from "$lib/model";


export const posts = writable<Post[]>([]);
export const pagination = writable<PaginationType>();