<script lang="ts">
    import { Input } from "$lib/components/ui/input/index.js";
    import { Label } from "$lib/components/ui/label/index.js";
    import { Button } from "$lib/components/ui/button";
    import { Textarea} from "$lib/components/ui/textarea";
    import * as Select from "$lib/components/ui/select";
    import * as Sidebar from "$lib/components/ui/sidebar/index.js";
    import { Separator } from "$lib/components/ui/separator/index.js";
    import * as Breadcrumb from "$lib/components/ui/breadcrumb/index.js";
    import type { ComponentProps } from "svelte";
    import {Category, Post} from "$lib/model";
    import { Carta, MarkdownEditor } from 'carta-md';
	import 'carta-md/default.css';
    import type { PageData } from './$types';
    import {onMount} from "svelte"; 
    import { Link } from "$lib/components/ui/pagination";
    import { DEBUG } from "$lib/params/base";
    import { goto } from "$app/navigation";
    import { axiosInstance, createPost } from "$lib/api";
    import { toast } from "svelte-sonner";
    import { Toaster } from "$lib/components/ui/sonner";
    import { currentUser } from '$lib/stores/auth';

    let { data, ref = $bindable(null), ...restProps } = $props<{
        data: PageData;
    } & ComponentProps<typeof Sidebar.Root>>();

    let categories : Category[] = $state(data.categories);

	const carta = new Carta({});
    // let value = '';
    let value = $state('');
    $effect(() => {
        const selectedCategory = categories.find((f) => f.no === value);
        if (selectedCategory) {
            post.category = selectedCategory;
        }
    });

    let post : Post = new Post();

    onMount(()=>{
        categories = data.categories;
    });

    const triggerContent = $derived(
        categories.find((f) => f.no === value)?.text ?? "选择分类"
    );

    async function handlePublish() {
        try {
            // 确保有当前用户
            if (!$currentUser) {
                toast.error("未获取到用户信息");
                return;
            }

            // 更新文章作者ID
            post.author = $currentUser;
            post.authorID = $currentUser.id;

            const response = await createPost(post);
            if (response.data.success) {
                toast.success("发布成功");
                await goto("/admin/posts");
            } else {
                toast.error("发布失败", {
                    description: response.data.message,
                });
            }
        } catch (err) {
            toast.error("发布失败", {
                description: err.toString(),
            });
        }
    }

</script>

<div class="flex flex-col h-screen">
    <header
        class="flex h-16 shrink-0 items-center gap-2 transition-[width,height] ease-linear group-has-[[data-collapsible=icon]]/sidebar-wrapper:h-12"
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
                        <Breadcrumb.Link href="/admin/posts">文章</Breadcrumb.Link>
                    </Breadcrumb.Item>
                    <Breadcrumb.Separator class="hidden md:block" />
                    <Breadcrumb.Item class="hidden md:block">
                        <Breadcrumb.Page>撰写文章</Breadcrumb.Page>
                    </Breadcrumb.Item>
                    
                </Breadcrumb.List>
            </Breadcrumb.Root>
        </div>
    </header>

    <div class="flex flex-1 min-h-0">
        <main class="flex-1 p-6 overflow-y-auto">
            <div class="space-y-4">
                <div class="grid w-full gap-1.5">
                    <Label for="title">标题</Label>
                    <Input id="title" bind:value={post.title} placeholder="请输入标题" />
                </div>
                <div class="grid w-full gap-1.5">
                    <Label for="content">正文</Label>
                    <MarkdownEditor {carta} bind:value={post.text} />
                </div>
                
            </div>
        </main>

        <aside class="w-[300px] border-l p-6 overflow-y-auto flex flex-col">
            <div class="flex-1">
                <div class="mb-6">
                    <h2 class="text-lg font-semibold mb-4">分类</h2>
                    <Select.Root type="single" bind:value={value}>
                        <Select.Trigger class="w-[180px]">
                            {triggerContent}
                        </Select.Trigger>
                        <Select.Content>
                            {#each categories as category}
                            <Select.Item value={category.no}>{category.text}</Select.Item>
                            {/each}
                        </Select.Content>
                    </Select.Root>
                </div>
            </div>
            
            <div class="space-y-4 mt-auto">
                {#if DEBUG}
                <Button class="w-full" onclick={() => console.log(post, value)}>DEBUG</Button>
                {/if}
                <Button class="w-full" variant="outline">保存草稿</Button>
                <Button class="w-full" onclick={handlePublish}>发布文章</Button>
            </div>
        </aside>
    </div>
</div>

<Toaster />

<style>
	/* Set your monospace font (Required to have the editor working correctly!) */
	:global(.carta-font-code) {
		font-family: '...', monospace;
		font-size: 1.1rem;
	}
</style>