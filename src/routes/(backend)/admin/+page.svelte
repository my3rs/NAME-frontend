<!-- 后台首页 -->

<script lang="ts">
    import axios from "axios";
    import {API_URL} from "$lib/params/base";
    import * as Sidebar from "$lib/components/ui/sidebar/index.js";
    import { Separator } from "$lib/components/ui/separator/index.js";
    import * as Breadcrumb from "$lib/components/ui/breadcrumb/index.js";
    import SidebarInfo from "$lib/components/sidebar-info.svelte";

    let meta = axios.get(API_URL + "/meta");
</script>

<div class="flex flex-1">
    <div class="flex-1">
        <header
            class="flex h-16 shrink-0 items-center gap-2"
        >
            <div class="flex items-center gap-2 px-4">
                <Sidebar.Trigger class="-ml-1" />
                <Separator orientation="vertical" class="mr-2 h-4" />
                <Breadcrumb.Root>
                    <Breadcrumb.List>
                        <Breadcrumb.Item class="hidden md:block">
                            <Breadcrumb.Page>控制台</Breadcrumb.Page>
                        </Breadcrumb.Item>
                    </Breadcrumb.List>
                </Breadcrumb.Root>
            </div>
        </header>

        <div class="p-6">
            <div class="mb-6">
                <p class="mt-2 text-sm text-gray-600">Welcome to the admin dashboard!</p>
            </div>

            <!-- 状态卡片 BEGIN -->
            <div class="grid gap-6 mb-8 md:grid-cols-2 xl:grid-cols-4">
                <div class="p-4 bg-gray-100 rounded shadow-xs flex flex-col">
                    <h4 class="mb-4 font-semibold text-gray-800">文章</h4>
                    <div class="text-gray-500 flex-grow">
                    {#await meta}
                        ... 篇文章
                    {:then rsp}
                        {rsp.data.posts_count} 篇文章
                    {/await}
                    </div>
                </div>

                <div class="p-4 bg-gray-100 rounded shadow-xs flex flex-col">
                    <h4 class="mb-4 font-semibold text-gray-800">页面</h4>
                    <div class="text-gray-500 flex-grow">
                        {#await meta}
                            ... 个页面
                        {:then rsp}
                            {rsp.data.pages_count} 个页面
                        {/await}
                    </div>
                </div>

                <div class="p-4 bg-gray-100 rounded shadow-xs flex flex-col">
                    <h4 class="mb-4 font-semibold text-gray-800">分类</h4>
                    <div class="text-gray-500 flex-grow">
                        {#await meta}
                            ... 个分类
                        {:then rsp}
                            {rsp.data.categories_count} 个分类
                        {/await}
                    </div>
                </div>

                <div class="p-4 bg-gray-100 rounded shadow-xs flex flex-col">
                    <h4 class="mb-4 font-semibold text-gray-800">标签</h4>
                    <div class="text-gray-500 flex-grow">
                        {#await meta}
                            ... 个标签
                        {:then rsp}
                            {rsp.data.tags_count} 个标签
                        {/await}
                    </div>
                </div>
            </div>
            <!-- END 状态卡片 -->
        </div>
    </div>

    <SidebarInfo />
</div>