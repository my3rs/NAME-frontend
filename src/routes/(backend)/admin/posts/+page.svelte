<script lang="ts">
    import {getPosts, getFormattedDate, formatDate} from "$lib/api";
    import {PaginationType, type Post} from "$lib/model";
    import * as Sidebar from "$lib/components/ui/sidebar/index.js";
    import { Separator } from "$lib/components/ui/separator/index.js";
    import * as Breadcrumb from "$lib/components/ui/breadcrumb/index.js";
    import {onMount, tick} from "svelte";
    import type { PageData } from './$types';
    import {
        Button,
        buttonVariants
    } from "$lib/components/ui/button/index.js";
    import {API_URL, DEBUG, PAGE_SIZE} from "$lib/params/base";
    import axios from "axios";
    import Pen from "lucide-svelte/icons/square-pen";
    import Edit from "lucide-svelte/icons/square-pen";
    import View from "lucide-svelte/icons/eye";
    import TrashCan from "lucide-svelte/icons/trash-2";
    import * as Dialog from "$lib/components/ui/dialog/index.js";
    import { Checkbox } from "$lib/components/ui/checkbox/index.js";
    import ChevronLeft from "svelte-radix/ChevronLeft.svelte";
    import ChevronRight from "svelte-radix/ChevronRight.svelte";
    import * as Pagination from "$lib/components/ui/pagination/index.js";
    import { Toaster } from "$lib/components/ui/sonner";
    import { toast } from "svelte-sonner";
    import { deletePosts } from "$lib/api";
    import DataTable from "$lib/components/ui/custom/table.svelte";
    import { columns } from "./columns";
    import { postsStore } from "$lib/stores";
    import type { PaginationState } from "@tanstack/table-core";
    import { on } from "svelte/events";
    import SidebarInfo from "$lib/components/sidebar-info.svelte";
    

    export let data : PageData;

    let pagination : PaginationType = data.pagination;
    let meta = axios.get(API_URL + "/meta");

    let selectedPosts : Post[] = [];
    let currentPosts : Post[] = [];

    // 刷新文章列表
    async function refreshPosts() {
        try {
            const response = await getPosts(pagination.pageIndex , pagination.pageSize);
            if (response.data.success) {
                currentPosts = response.data.data;
                pagination = response.data.pagination;
            }
        } catch (error) {
            console.error('Failed to refresh posts:', error);
            toast.error('刷新列表失败');
        }
    }

    // 处理删除成功事件
    async function handleDeleteSuccess() {
        await refreshPosts();
    }

    onMount(async () => {
        if (data.posts) {
            currentPosts = data.posts;
            // Convert Post[] to PostData[] and set with pagination
            const postData = data.posts.map(post => ({
                id: post.id,
                title: post.title,
                content: post.content,
                slug: post.slug,
                status: post.status,
                tags: post.tags,
                categories: post.categories,
                createdAt: post.createdAt,
                updatedAt: post.updatedAt
            }));
            postsStore.setData(postData, data.pagination);
        }
    });


    async function handlePaginationChange(event: CustomEvent<PaginationState>) {
        const newPagination = event.detail;
        console.debug('New pagination state:', newPagination);
        await getPosts(newPagination.pageIndex, PAGE_SIZE)
            .then((rsp) => {
                const items = rsp.data.data;
                currentPosts = items;
                // Convert and update posts store
                const postData = items.map(post => ({
                    id: post.id,
                    title: post.title,
                    content: post.content,
                    slug: post.slug,
                    status: post.status,
                    tags: post.tags,
                    categories: post.categories,
                    createdAt: post.createdAt,
                    updatedAt: post.updatedAt
                }));
                postsStore.setData(postData, rsp.data.page);
                pagination = rsp.data.page;
            });
    }

    function handleSelectionChange(event: CustomEvent<Row<Post>[]>) {
        selectedPosts = event.detail.map(row => row.original);
    }

    // 批量删除
    let selectedIDs : string[] = [];
    function addPost(id : string) {
        if (!selectedIDs.includes(id)) {
            selectedIDs = [...selectedIDs, id];
        }
    }

    function updatePosts(posts_array : Post[]) {
        // Convert Post[] to PostData[] and update the store
        const postData = posts_array.map(post => ({
            id: post.id,
            title: post.title,
            content: post.content,
            slug: post.slug,
            status: post.status,
            tags: post.tags,
            categories: post.categories,
            createdAt: post.createdAt,
            updatedAt: post.updatedAt
        }));
        postsStore.setData(postData, pagination);
        currentPosts = posts_array;
    }

    function removePost(id : string) {
        selectedIDs = selectedIDs.filter(selectedId => selectedId !== id);
    }
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
                            <Breadcrumb.Link href="/admin">控制台</Breadcrumb.Link>
                        </Breadcrumb.Item>
                        <Breadcrumb.Separator class="hidden md:block" />

                        <Breadcrumb.Item class="hidden md:block">
                            <Breadcrumb.Page>文章</Breadcrumb.Page>
                        </Breadcrumb.Item>
                    </Breadcrumb.List>
                </Breadcrumb.Root>
            </div>
        </header>

        <div class="p-6">
            <!-- 工具栏 BEGIN -->
            <div class="flex items-center p-4 mb-4 bg-gray-50 rounded space-x-4">
                <Button href="/admin/posts/new" target="_blank">
                    <Pen class="mr-2 h-4 w-4" size={32} />
                    撰写文章
                </Button>
            </div>
            <!-- 工具栏 END -->

            <div class="w-full overflow-x-auto">
                    <DataTable 
                        data={currentPosts}
                        columns={columns}
                        pagination={pagination}
                        on:paginationChange={handlePaginationChange}
                        on:deleteSuccess={handleDeleteSuccess}
                    />
            </div>
        </div>
    </div>

    <SidebarInfo />
</div>