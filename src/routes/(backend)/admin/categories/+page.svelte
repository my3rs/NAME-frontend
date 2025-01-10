<script lang="ts">
    import {fade, slide} from 'svelte/transition';
    import axios from "axios";
    import {API_URL, DEBUG} from "$lib/params/base";
    import {PaginationType, Category} from "$lib/model";
    import type { PageData } from './$types';
    import Edit from "lucide-svelte/icons/square-pen";
    import TrashCan from "lucide-svelte/icons/trash-2";
    import {axiosInstance, deleteCategories, createCategory, updateCategory} from "$lib/api";
    import AddLarge from "lucide-svelte/icons/circle-plus";
    import {
        Button,
        buttonVariants
    } from "$lib/components/ui/button/index.js";
    import * as Dialog from "$lib/components/ui/dialog/index.js";
    import { Input } from "$lib/components/ui/input/index.js";
    import { Label } from "$lib/components/ui/label/index.js";
    import {error} from "@sveltejs/kit";
    import CategoryNew from "lucide-svelte/icons/circle-plus";
    import { Checkbox } from "$lib/components/ui/checkbox/index.js";
    import { Toaster } from "$lib/components/ui/sonner";
    import { toast } from "svelte-sonner";

    let meta = axios.get(API_URL + "/meta");

    export let data : PageData;

    // 当前页面的分类和分页数据
    let categories : Category[] = data.items;
    let pagination : PaginationType = data.pagination;


    let editCategory : Category = new Category();


    // 错误信息
    let errorMessage : string;

    $: titleError = !newCategory.title && !editCategory.title;
    $: slugError = !newCategory.slug && !editCategory.slug;
    $: errorMessage = titleError || slugError ? '请填写所有必填字段*' : '';

    // 弹窗开关
    let showNewCategoryModal = false;
    let showEditCategoryModal = false;

    // 全选和取消全选
    $: selectAll = categories.every(c => c.checked);
    $: anySelected = categories.some(c => c.checked);


    function toggleSelectAll() {
        selectAll = !selectAll;

        categories.forEach((c)=>c.checked = selectAll);

        // IMPORTANT! 触发 Svelte 的更新机制
        categories = categories;

        if (DEBUG) {
            console.log(categories);
        }
    }


    // 重新从后端读取分类数据
    function reloadCategories() {
        axiosInstance.get(API_URL + '/categories',
            {
                params: {
                    pageIndex: pagination.pageIndex,
                    pageSize: pagination.pageSize,
                    orderBy: "created_at desc"
                }
            })
            .then((rsp)=>{
                if (rsp.data.success == true) {
                    categories = rsp.data.items;
                    pagination = rsp.data.pagination;

                    categories.forEach(c => c.checked = false);

                    console.log("重新加载数据成功！")
                }
            })
            .catch((error)=>{
                console.log(error)
            });
    }

    // 创建新分类
    let newCategory : Category = new Category();
    function onNewCategorySubmit() {
        if (!titleError && !slugError) {
            postCategory(newCategory)
                .then((rsp) => {
                    if (rsp.data.success) {
                        toast.success("创建成功！", {
                            description: "成功创建一个新分类",
                        });

                        newCategory = new Category();
                        reloadCategories()
                    } else {
                        toast.error("创建失败！", {
                            description: rsp.data.message,
                        })
                        reloadCategories();
                    }
                })
                .catch((err) => {

                    toast.error("创建失败！", {
                        description: err,
                    })
                    reloadCategories();
                    newCategory = new Category();

                });
        } else {
            console.log("新建分类：请填写所有必填字段");
        }

    }

    // 编辑分类
    function onEditCategorySubmit() {
        if (!titleError && !slugError) {
            updateCategory(editCategory)
                .then((rsp) => {
                    if (rsp.data.success) {
                        editCategory = new Category();
                        reloadCategories()
                    } else {
                        toast.error("编辑失败！", {
                            description: rsp.data.message,
                        })
                    }
                })
                .catch((error) => {
                    toast.error("编辑失败！", {
                        description: error,
                    })
                });
        } else {
            console.log("新建分类：请填写所有必填字段");
        }
    }

    // 批量删除
    $: selectedIDs = categories
        .filter(c => c.checked)
        .map(c => c.id);

    function onDeleteCategorySubmit() {
        // const ids : number[] = selectedCategories
        //     .map(category => category.id)
        //     .filter((id): id is number => id !== undefined);
        deleteCategories(selectedIDs)
            .then((rsp)=>{
                if (rsp.data.success) {
                    toast.success("删除成功！", {
                        description: "成功删除 " + selectedIDs.length + " 个分类",
                    });
                } else {
                    toast.error("删除失败！", {
                        description: rsp.data.message,
                    })
                }
                reloadCategories();
            })
            .catch((error)=>{
                toast.error("请求错误！", {
                    description: error
                })
                reloadCategories();
            });

    }





</script>

<Toaster />

<main class="flex-1 p-6 overflow-y-auto h-screen">
    <div class="mb-6">
        <h1 class="text-2xl font-semibold">分类</h1>
    </div>

    <!-- 工具栏 BEGIN -->
    <div class="flex items-center p-4 mb-4 bg-gray-50 rounded space-x-4">
        <!-- 创建分类 BEGIN -->
        <Dialog.Root bind:open={showNewCategoryModal}>
            <Dialog.Trigger>
                <Button>
                    <AddLarge class="mr-2 h-4 w-4"></AddLarge>
                    创建分类
                </Button>
            </Dialog.Trigger>
            <Dialog.Content class="sm:max-w-[425px]">
                <Dialog.Header>
                    <Dialog.Title>新增分类</Dialog.Title>
                    <Dialog.Description>
                        <p class="text-red-600">
                            {errorMessage}
                        </p>
                    </Dialog.Description>
                </Dialog.Header>
                <div class="grid gap-4 py-4">
                    <div class="grid grid-cols-4 items-center gap-4">
                        <Label for="name" class="text-right">
                            名称*
                        </Label>
                        <Input id="name" bind:value={newCategory.title} class="col-span-3" />
                    </div>
                    <div class="grid grid-cols-4 items-center gap-4">
                        <Label for="username" class="text-right">缩略名*</Label>
                        <Input id="username" bind:value={newCategory.slug} class="col-span-3" />
                    </div>
                </div>
                <Dialog.Footer>
                    <Dialog.Close>
                        <Button on:click={onNewCategorySubmit}>保存</Button>
                    </Dialog.Close>
                </Dialog.Footer>
            </Dialog.Content>
        </Dialog.Root>
        <!-- 创建分类 END -->

        <!-- 批量删除 -->
        <Dialog.Root>
            <Dialog.Trigger>
                <Button
                        variant="ghost"
                        disabled={!anySelected}>批量删除</Button>
            </Dialog.Trigger>
            <Dialog.Content class="sm:max-w-[425px]">
                <Dialog.Header>
                    <Dialog.Title>确认删除</Dialog.Title>
                    <Dialog.Description>
                        <div class="mt-2">已选中{selectedIDs.length}个分类</div>
                    </Dialog.Description>
                </Dialog.Header>
                <div class="grid gap-4 py-4">
                    <p>确定要删除吗？</p>
                </div>
                <Dialog.Footer>
                    <Dialog.Close>
                        <Button variant="destructive" on:click={onDeleteCategorySubmit}>确定</Button>
                    </Dialog.Close>
                </Dialog.Footer>
            </Dialog.Content>
        </Dialog.Root>


    </div>
    <!-- 工具栏 END -->

    <div class="w-full overflow-x-auto">
        {#if categories}
            <table class="w-full whitespace-no-wrap">
                <thead>
                <tr class="text-xs font-semibold tracking-wide text-left text-gray-500 uppercase bg-gray-50 border-b">
                    <th class="px-4 py-3 w-1">
                        <Checkbox checked={selectAll} onCheckedChange={toggleSelectAll} />
                    </th>
                    <th class="px-4 py-3">ID</th>
                    <th class="px-4 py-3">缩写</th>
                    <th class="px-4 py-3">名称</th>
                    <th class="px-4 py-3">操作</th>
                </tr>
                </thead>
                <tbody class="bg-white divide-y">
                {#each categories as category, i}
                    <tr class="text-gray-700 hover:bg-gray-100 h-12"   >
                        <td class="px-4 py-2">
                            <Checkbox
                                    id="category-checkbox-{category.id}"
                                    bind:checked={category.checked}
                            />

                        </td>
                        <td class="px-4 py-2">
                            {category.id}
                        </td>
                        <td class="px-4 py-2">
                            <div class="flex items-center text-sm">
                                <div>
                                    <p class="font-semibold">{category.slug}</p>
                                </div>
                            </div>
                        </td>
                        <td class="px-4 py-2 text-sm">{category.title}</td>



                        <td class="px-4 py-2 text-sm">
                            <div class="flex items-center space-x-4 text-sm">

                                <!-- 编辑分类 BEGIN -->
                                <Dialog.Root bind:open={showEditCategoryModal}>
                                    <Dialog.Trigger>
                                        <button title="编辑" on:click={()=>{editCategory = {...category}}}>
                                            <Edit class="h-4 w-4"/>
                                        </button>
                                    </Dialog.Trigger>
                                    <Dialog.Content class="sm:max-w-[425px]">
                                        <Dialog.Header>
                                            <Dialog.Title>修改分类</Dialog.Title>
                                            <Dialog.Description>
                                                <p class="text-red-600">
                                                    {errorMessage}
                                                </p>
                                            </Dialog.Description>
                                        </Dialog.Header>
                                        <div class="grid gap-4 py-4">
                                            <div class="grid grid-cols-4 items-center gap-4">
                                                <Label for="name" class="text-right">
                                                    名称*
                                                </Label>
                                                <Input id="name" bind:value={editCategory.title} class="col-span-3" />
                                            </div>
                                            <div class="grid grid-cols-4 items-center gap-4">
                                                <Label for="username" class="text-right">缩略名*</Label>
                                                <Input id="username" bind:value={editCategory.slug} class="col-span-3" />
                                            </div>
                                        </div>
                                        <Dialog.Footer>
                                            <Dialog.Close>
                                                <Button type="submit"  on:click={onEditCategorySubmit}>保存修改</Button>
                                            </Dialog.Close>
                                        </Dialog.Footer>
                                    </Dialog.Content>
                                </Dialog.Root>
                                <!-- 编辑分类 END -->

                                <!-- 单个删除 BEGIN -->
                                <Dialog.Root>
                                    <Dialog.Trigger>
                                        <button title="删除" on:click={()=>{editCategory = {...category}}}>
                                            <TrashCan class="h-4 w-4" />
                                        </button>
                                    </Dialog.Trigger>
                                    <Dialog.Content class="sm:max-w-[425px]">
                                        <Dialog.Header>
                                            <Dialog.Title>警告</Dialog.Title>

                                        </Dialog.Header>
                                        <div class="grid gap-4 py-4">
                                            确定删除 [{category.title}] 分类？
                                        </div>
                                        <Dialog.Footer>
                                            <Dialog.Close>
                                                <Button
                                                        variant="destructive"
                                                        on:click={()=>{
                                                            category.checked = true;
                                                            onDeleteCategorySubmit();
                                                        }}>
                                                    删除
                                                </Button>
                                            </Dialog.Close>
                                        </Dialog.Footer>
                                    </Dialog.Content>
                                </Dialog.Root>
                                <!-- 单个删除 END -->


                            </div>
                        </td>
                    </tr>

                {/each}
                </tbody>
            </table>

        {/if}


    </div>

</main>

<aside class="w-64 p-6 bg-gray-50 border-l border-gray-100 h-screen overflow-y-auto">
    <h2 class="text-lg font-semibold mb-4">附加信息</h2>
    <div class="mb-6 text-gray-500">
        {#await meta}
            共有 ... 个分类
        {:then rsp}
            共有 {rsp.data.categories_count} 个分类
        {/await}
    </div>

    <div class="mb-6">
        <h3 class="text-md font-medium mb-2">博客状态</h3>
        <!-- Add blog status content here -->
    </div>
    <div class="mb-6">
        <h3 class="text-md font-medium mb-2">最新评论</h3>
        <!-- Add latest comments content here -->
    </div>
    <!-- Add more sections as needed -->
</aside>

