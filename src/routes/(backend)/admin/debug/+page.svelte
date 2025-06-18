<script lang="ts">
    import { Input } from "$lib/components/ui/input/index.js";
    import { Label } from "$lib/components/ui/label/index.js";
    import { Button } from "$lib/components/ui/button";
    import * as Sidebar from "$lib/components/ui/sidebar/index.js";
    import { Separator } from "$lib/components/ui/separator/index.js";
    import * as Breadcrumb from "$lib/components/ui/breadcrumb/index.js";
    import type { ComponentProps } from "svelte";
    import { onMount } from "svelte";
    import { DEBUG } from "$lib/params/base";
    import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "$lib/components/ui/card";
    import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "$lib/components/ui/table";
    import { isLoggedIn, getAccessToken, getRefreshToken } from 'axios-jwt';
    import { browser } from "$app/environment";
    import { tokenStorage } from "$lib/api";
    import { currentUser, isAuthenticated, updateAuthState } from "$lib/stores/auth";

    let accessToken = '未设置';
    let refreshToken = '未设置';
    let accessTokenExpiry = '未知';
    let refreshTokenExpiry = '未知';
    let storageType = '未知';
    let accessTokenPayload = '未知';
    let refreshTokenPayload = '未知';
    let loginState = '检查中...';
    let mounted = false;

    function parseJwt(token: string) {
        try {
            const base64Url = token.split('.')[1];
            const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
            const jsonPayload = decodeURIComponent(atob(base64).split('').map(function(c) {
                return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
            }).join(''));

            return JSON.parse(jsonPayload);
        } catch (e) {
            console.error('Error parsing token:', e);
            return null;
        }
    }

    function formatTokenInfo(token: string | null | undefined, type: 'access' | 'refresh') {
        if (!token) return { expiry: '未设置', payload: '未设置' };
        
        try {
            const decoded = parseJwt(token);
            if (!decoded) return { expiry: '解析失败', payload: '解析失败' };

            const payload = JSON.stringify(decoded, null, 2);
            
            if (decoded.exp) {
                const expiryDate = new Date(decoded.exp * 1000);
                const now = Math.floor(Date.now() / 1000);
                const timeLeft = decoded.exp - now;
                
                if (timeLeft < 300) {
                    console.warn(`${type === 'access' ? 'Access' : 'Refresh'} token will expire soon:`, {
                        expiresIn: timeLeft,
                        expiry: expiryDate.toLocaleString()
                    });
                }
                
                return {
                    expiry: expiryDate.toLocaleString(),
                    payload: payload
                };
            }
            
            return {
                expiry: '无过期时间',
                payload: payload
            };
        } catch (e) {
            console.error(`Error processing ${type} token:`, e);
            return {
                expiry: '处理失败',
                payload: '处理失败'
            };
        }
    }

    async function updateTokenInfo() {
        if (!browser || !mounted) {
            console.debug('Skipping token check - not in browser or not mounted');
            return;
        }

        try {
            if (!tokenStorage) {
                console.error('Token storage not initialized');
                loginState = '存储未初始化';
                return;
            }

            if (import.meta.env.DEV) {
                try {
                    const rawAccessToken = localStorage.getItem('accessToken');
                    const rawRefreshToken = localStorage.getItem('refreshToken');
                    console.debug('Raw storage check:', {
                        hasAccessToken: !!rawAccessToken,
                        hasRefreshToken: !!rawRefreshToken,
                        storage: 'localStorage',
                        storageLength: localStorage.length
                    });
                } catch (e) {
                    console.error('Error accessing localStorage:', e);
                }
            }

            const [newAccessToken, newRefreshToken, isUserLoggedIn] = await Promise.all([
                getAccessToken().catch(e => { console.error('Error getting access token:', e); return null; }),
                getRefreshToken().catch(e => { console.error('Error getting refresh token:', e); return null; }),
                isLoggedIn().catch(e => { console.error('Error checking login status:', e); return false; })
            ]);
            
            loginState = isUserLoggedIn ? '已登录' : '未登录';
            accessToken = newAccessToken || '未设置';
            refreshToken = newRefreshToken || '未设置';

            // Process access token
            const accessInfo = formatTokenInfo(newAccessToken, 'access');
            accessTokenExpiry = accessInfo.expiry;
            accessTokenPayload = accessInfo.payload;

            // Process refresh token
            const refreshInfo = formatTokenInfo(newRefreshToken, 'refresh');
            refreshTokenExpiry = refreshInfo.expiry;
            refreshTokenPayload = refreshInfo.payload;

            console.log('Token Status:', {
                loginState,
                isLoggedIn: isUserLoggedIn,
                hasAccessToken: !!newAccessToken,
                hasRefreshToken: !!newRefreshToken,
                accessTokenLength: newAccessToken?.length || 0,
                refreshTokenLength: newRefreshToken?.length || 0,
                storage: 'localStorage',
                storageAvailable: !!localStorage,
                storageLength: localStorage.length,
                mounted,
                browser,
                env: import.meta.env.DEV ? 'development' : 'production'
            });

        } catch (error) {
            console.error('Error updating token info:', error);
            loginState = '检查失败';
            accessToken = '获取失败';
            refreshToken = '获取失败';
            accessTokenExpiry = '获取失败';
            refreshTokenExpiry = '获取失败';
            accessTokenPayload = '获取失败';
            refreshTokenPayload = '获取失败';
        }
    }

    onMount(async () => {
        mounted = true;
        await updateAuthState();
        console.debug('Debug page mounted, current user:', $currentUser);
        console.debug('Authentication state:', $isAuthenticated);
        await updateTokenInfo();
        
        if (browser) {
            const interval = setInterval(updateTokenInfo, 30000);
            return () => {
                mounted = false;
                clearInterval(interval);
            };
        }
    });
</script>

<div class="flex flex-col h-screen">
    <header class="flex h-16 shrink-0 items-center gap-2 transition-[width,height] ease-linear group-has-[[data-collapsible=icon]]/sidebar-wrapper:h-12">
        <div class="flex items-center gap-2 px-4">
            <Sidebar.Trigger class="-ml-1" />
            <Separator orientation="vertical" class="mr-2 h-4" />
            <Breadcrumb.Root>
                <Breadcrumb.List>
                    <Breadcrumb.Item class="hidden md:block">
                        <Breadcrumb.Link href="/admin">控制台</Breadcrumb.Link>
                    </Breadcrumb.Item>
                    <Breadcrumb.Separator class="hidden md:block" />
                    <Breadcrumb.Item class="hidden md:block">
                        <Breadcrumb.Page>DEBUG</Breadcrumb.Page>
                    </Breadcrumb.Item>
                </Breadcrumb.List>
            </Breadcrumb.Root>
        </div>
    </header>

    <main class="flex-1 p-6 overflow-y-auto">
        <Card class="mb-4">
            <CardHeader>
                <CardTitle>用户信息</CardTitle>
                <CardDescription>显示当前用户的信息</CardDescription>
            </CardHeader>
            <CardContent>
                <div class="space-y-2">
                    <p><span class="font-medium">登录状态：</span>{$isAuthenticated ? '已登录' : '未登录'}</p>
                    {#if $currentUser}
                        <p><span class="font-medium">用户ID：</span>{$currentUser.id}</p>
                        <p><span class="font-medium">用户名：</span>{$currentUser.username}</p>
                        <p><span class="font-medium">邮箱：</span>{$currentUser.email}</p>
                        <p><span class="font-medium">角色：</span>{$currentUser.role}</p>
                    {/if}
                </div>
            </CardContent>
        </Card>

        <Card class="mb-4">
            <CardHeader>
                <CardTitle>Token 信息</CardTitle>
                <CardDescription>显示当前的 Access Token 和 Refresh Token 信息</CardDescription>
            </CardHeader>
            <CardContent>
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>项目</TableHead>
                            <TableHead>值</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        <TableRow>
                            <TableCell>登录状态</TableCell>
                            <TableCell>{loginState}</TableCell>
                        </TableRow>
                        <TableRow>
                            <TableCell>Access Token</TableCell>
                            <TableCell class="font-mono text-xs break-all">{accessToken}</TableCell>
                        </TableRow>
                        <TableRow>
                            <TableCell>Access Token 过期时间</TableCell>
                            <TableCell>{accessTokenExpiry}</TableCell>
                        </TableRow>
                        <TableRow>
                            <TableCell>Access Token 解析</TableCell>
                            <TableCell class="font-mono text-xs whitespace-pre-wrap">{accessTokenPayload}</TableCell>
                        </TableRow>
                        <TableRow>
                            <TableCell>Refresh Token</TableCell>
                            <TableCell class="font-mono text-xs break-all">{refreshToken}</TableCell>
                        </TableRow>
                        <TableRow>
                            <TableCell>Refresh Token 过期时间</TableCell>
                            <TableCell>{refreshTokenExpiry}</TableCell>
                        </TableRow>
                        <TableRow>
                            <TableCell>Refresh Token 解析</TableCell>
                            <TableCell class="font-mono text-xs whitespace-pre-wrap">{refreshTokenPayload}</TableCell>
                        </TableRow>
                    </TableBody>
                </Table>
            </CardContent>
        </Card>
    </main>
</div>
