<script lang="ts">
    import type { PageData } from "./$types";
    import { afterNavigate, goto } from "$app/navigation";
    import { onMount } from "svelte";
    import Calendar from "lucide-svelte/icons/calendar";
    import Folder from "lucide-svelte/icons/folder";
    import Tag from "lucide-svelte/icons/tag";
    import ChevronRight from "lucide-svelte/icons/chevrons-right";
    import ChevronLeft from "lucide-svelte/icons/chevrons-left";
    import Message from "lucide-svelte/icons/message-square-more";
    import * as Pagination from "$lib/components/ui/pagination/index.js";
    import { mediaQuery } from "svelte-legos";
    import { API_URL } from "$lib/params/base";
    import axios from "axios";
    import type { Category } from "$lib/model";

    export let data: PageData | any;
    let posts = data.posts;
    let pagination = data.pagination;

    // 翻页
    // const isDesktop = mediaQuery("(min-width: 768px)");
    const isDesktop = true;

    let count = pagination.itemsCount;
    let perPage = pagination.pageSize;
    // let siblingCount = $isDesktop ? 1 : 0;
    let siblingCount = 1;

    function updatePaginationData() {
        count = pagination.itemsCount;
        perPage = pagination.pageSize;
        // siblingCount = $isDesktop ? 1 : 0;
        siblingCount = 1;
    }

    $: updatePaginationData();

    afterNavigate(() => {
        updatePaginationData();
    });

    let categories: Category[] = [];

    onMount(() => {
        // 读取分类列表
        // 非核心内容，应该在页面加载后（onMount）再加载
        // TODO 分页功能？
        axios
            .get(API_URL + "/categories", {
                params: {
                    pageIndex: 1,
                    pageSize: 100,
                },
            })
            .then((rsp) => {
                if (rsp.data.success) {
                    categories = rsp.data.items;
                } else {
                    console.log("加载分类列表失败.", rsp.data.message);
                }
            })
            .catch((err) => {
                console.error("加载分类列表失败.", err);
            });
    });

    const onPageChange = async (page: number) => {
        if (page === 1) {
            await goto("/");
        }
        await goto(`/page/${page}`);
    };
</script>

<main class="flex-1 p-6 overflow-y-auto h-screen">
    <div class="pl-2 pr-2">
        {#each posts as post}
            <article
                class="overflow-hidden border-solid border-b border-gray-200"
            >
                <div class="p-6">
                    <h2 class="text-xl font-bold mb-2">
                        <a
                            href="/posts/{post.id}"
                            target="_blank"
                            class="text-slate-900 hover:text-blue-800"
                            >{post.title}</a
                        >
                    </h2>

                    <!-- 文章摘要 -->
                    <!-- 如果abstract字段长度为0，提取除掉图片标记的text前120字作为摘要 -->
                    <p
                        class="text-gray-600 mb-4 font-normal text-gray-400 leading-relaxed"
                    >
                        {#if post.abstract && post.abstract.length > 0}
                            {post.abstract}
                        {:else}
                            {(() => {
                                let text = post.text.replace(
                                    /!\[.*?\]\(.*?\)/g,
                                    "",
                                );
                                return (
                                    text.slice(0, 120) +
                                    (text.length > 120 ? "..." : "")
                                );
                            })()}
                        {/if}
                    </p>
                    <!-- 文章摘要 End -->

                    <div class="flex flex-wrap text-sm text-gray-500 space-x-4">
                        <span class="mr-4 flex items-center">
                            <Calendar class="w-4 h-4 mr-1" />
                            &nbsp;{new Date(
                                post.createdAt,
                            ).toLocaleDateString()}
                        </span>
                        <span class="mr-4 flex items-center space-x-1">
                            <Folder class="w-4 h-4 mr-1" />
                            {#if post.category.title.length === 0}
                                &nbsp;无分类
                            {:else}
                                &nbsp;{post.category.title}
                            {/if}
                        </span>
                        {#if post.tags.length !== 0}
                            <span class="mr-4 flex items-center">
                                <Tag class="w-4 h-4 mr-1" />
                                {#each post.tags as tag, index}
                                    {tag.text}{#if index < post.tags.length - 1}、{/if}
                                {/each}
                            </span>
                        {/if}
                        <span class="mr-4 flex items-center">
                            <Message class="w-4 h-4 mr-1" />
                            {post.commentsNum} 评论
                        </span>
                        <span class="mr-4 flex items-center">
                            <i class="fas fa-file-alt w-4 h-4 mr-1"></i>
                        </span>
                    </div>
                </div>
            </article>
        {/each}
    </div>

    <div class="flex mt-6">
        <Pagination.Root
            {count}
            {perPage}
            {siblingCount}
            let:pages
            let:currentPage
            {onPageChange}
            class="items-center"
        >
            <Pagination.Content>
                <Pagination.Item>
                    <Pagination.PrevButton>
                        <ChevronLeft class="h-4 w-4" />
                        <span class="hidden sm:block">上一页</span>
                    </Pagination.PrevButton>
                </Pagination.Item>
                {#each pages as page (page.key)}
                    {#if page.type === "ellipsis"}
                        <Pagination.Item>
                            <Pagination.Ellipsis />
                        </Pagination.Item>
                    {:else}
                        <Pagination.Item>
                            <Pagination.Link
                                {page}
                                isActive={currentPage === page.value}
                            >
                                {page.value}
                            </Pagination.Link>
                        </Pagination.Item>
                    {/if}
                {/each}
                <Pagination.Item>
                    <Pagination.NextButton>
                        <span class="hidden sm:block">下一页</span>
                        <ChevronRight class="h-4 w-4" />
                    </Pagination.NextButton>
                </Pagination.Item>
            </Pagination.Content>
        </Pagination.Root>
    </div>
</main>

<aside
    class="w-64 p-6 bg-gray-50 border-l border-gray-100 h-screen overflow-y-auto"
>
    <h2 class="text-base font-semibold mb-4">热力图</h2>
    <div class="mb-6 text-gray-500"></div>

    <div class="mb-6">
        <h2 class="text-base font-semibold">分类</h2>
        {#if categories && categories.length > 0}
            <ul class="my-4 ml-6 list-disc [&>li]:mt-2 text-gray-600">
                {#each categories as category}
                    <li>{category.title}</li>
                {/each}
            </ul>
        {/if}
    </div>
    <div class="mb-6">
        <h2 class="text-base font-semibold mb-4">标签</h2>
        <!-- Add latest comments content here -->
    </div>
    <div class="mb-6">
        <h2 class="text-base font-semibold mb-4">最新评论</h2>
        <!-- Add latest comments content here -->
    </div>
</aside>
