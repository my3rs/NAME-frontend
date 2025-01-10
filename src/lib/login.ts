import { isLoggedIn, setAuthTokens, clearAuthTokens, getAccessToken, getRefreshToken } from 'axios-jwt'
import { axiosInstance } from '$lib/api'
import {User} from "$lib/model";
import {browser} from "$app/environment";
import { BASE_URL } from '$lib/api';
import { writable } from 'svelte/store';
import {onMount} from "svelte";

// export const isAuthenticated = writable(false);
//
// onMount(async ()=>{
//     const status = await isLoggedIn()
//     isAuthenticated.set(status)
// })


export let username = ""
export let userrole = ""
export let userid = 0

// 4. Post email and password and get tokens in return. Call setAuthTokens with the result.
export const login = async (username: string, password: string) => {
    if (!browser) {
        console.warn('Login attempted in non-browser environment');
        throw new Error('Cannot login in non-browser environment');
    }

    try {
        const response = await axiosInstance.post(`${BASE_URL}/auth/login/${username}`, {
            password: password,
            username: username
        });

        // Check both possible header cases since browsers may normalize header names
        const accessToken = response.headers["authorization"] || response.headers["Authorization"];
        const refreshToken = response.headers["refresh-token"] || response.headers["Refresh-Token"];

        if (!accessToken || !refreshToken) {
            console.error("Login failed: Missing tokens in response headers", {
                headers: response.headers,
                accessToken: !!accessToken,
                refreshToken: !!refreshToken
            });
            throw new Error("Login failed: Missing authentication tokens");
        }

        // save tokens to storage
        await setAuthTokens({
            accessToken: accessToken,
            refreshToken: refreshToken
        });

        // Verify tokens were stored
        const storedAccessToken = await getAccessToken();
        const storedRefreshToken = await getRefreshToken();
        const loggedInStatus = await isLoggedIn();
        
        console.debug("Login status after token storage:", {
            accessToken: !!storedAccessToken,
            refreshToken: !!storedRefreshToken,
            isLoggedIn: loggedInStatus,
            browser: browser
        });

        if (!storedAccessToken || !storedRefreshToken) {
            console.error("Token storage verification failed");
            throw new Error("Failed to store authentication tokens");
        }

        return response;
    } catch (error) {
        console.error("Login error:", error);
        throw error;
    }
}

// 5. Remove the auth tokens from storage
export const logout = () => {
    if (!browser) {
        console.warn('Logout attempted in non-browser environment');
        return;
    }

    console.log("退出登录并清除Token");
    clearAuthTokens();
}

export const getUserName = async () => {
    const accessToken = await getAccessToken();
    if (await isLoggedIn() && accessToken) {
        const jwtParts = accessToken.split(".");
        const payload = JSON.parse(atob(jwtParts[1]));
        return payload.username
    }
}

let user : User = new User()

export const getUser = async ()  => {
    const accessToken = await getAccessToken();
    // 已登录用户
    if (await isLoggedIn() && accessToken) {

        const jwtParts = accessToken.split(".");
        const payload = JSON.parse(atob(jwtParts[1]));
        user.id = payload.id
        user.name = payload.username
        user.role = payload.role

        if (browser) {
            localStorage.setItem("userid", user.id.toString())
            localStorage.setItem("username", user.name)
            localStorage.setItem("userrole", user.role)
        }

        return user
    }

    // 未登录用户，可能是游客
    if (browser) {
        user.id = localStorage.getItem("userid") ? parseInt(localStorage.getItem("userid")!) : 0
        user.name = localStorage.getItem("username") ? localStorage.getItem("username")! : ""
        user.role = localStorage.getItem("userrole") ? localStorage.getItem("userrole")! : ""

        return user
    }

}

export const loginStatus = async () => {
    if (browser) {
        try {
            if (await isLoggedIn()) {
                const accessToken = await getAccessToken();
                if (!accessToken) {
                    console.error("No access token found despite being logged in");
                    return "未登录";
                }

                const jwtParts = accessToken.split(".");
                const payload = JSON.parse(atob(jwtParts[1]));
                const iat = payload.iat;
                const exp = payload.exp;

                // Check if token is about to expire (within next 5 minutes)
                const now = Math.floor(Date.now() / 1000);
                if (exp - now < 300) {
                    console.warn("Access token is about to expire");
                }

                return "已登录";
            } else {
                const refreshToken = await getRefreshToken();
                if (refreshToken) {
                    console.warn("Has refresh token but not logged in - may need token refresh");
                }
                return "未登录";
            }
        } catch (error) {
            console.error("Error checking login status:", error);
            return "未登录";
        }
    }
    return "未登录";
}
