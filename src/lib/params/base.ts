import { readable, get } from "svelte/store";
import { dev } from "$app/environment";

const base_url = dev ? readable("http://localhost:8000") : readable("/");
export const BASE_URL = get(base_url);

const api_url  = readable(BASE_URL + "/api/v1");
export const API_URL = get(api_url);

const login = readable(API_URL + "/auth/login");
export const LOGIN_URL = get(login);

const register_url = readable(API_URL + "/auth/register");
export const REGISTER_URL = get(register_url);

const refresh_token_url = readable(API_URL + "/auth/refresh");
export const REFRESH_TOKEN_URL = get(refresh_token_url);

const post_url = readable(API_URL + "/posts");
export const POST_URL = get(post_url);

const status_url = readable(API_URL + "/status");
export const STATUS_URL = get(status_url);

// 每页文章数量
// TODO: read from database
export const PAGE_SIZE = 10;

export const DEBUG = true;