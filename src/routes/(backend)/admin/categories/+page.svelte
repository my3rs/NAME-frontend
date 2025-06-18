<script lang="ts">
    import {fade, slide} from 'svelte/transition';
    import axios from "axios";
    import {API_URL, DEBUG} from "$lib/params/base";
    import {PaginationType, Category} from "$lib/model";
    import type { PageData } from './$types';
    import Edit from "lucide-svelte/icons/square-pen";
    import TrashCan from "lucide-svelte/icons/trash-2";
    import * as Sidebar from "$lib/components/ui/sidebar/index.js";
    import { Separator } from "$lib/components/ui/separator/index.js";
    import * as Breadcrumb from "$lib/components/ui/breadcrumb/index.js";
    import { deleteCategories, createCategory, updateCategory} from "$lib/api";
    import { axiosInstance } from '$lib/stores/auth';
    import AddLarge from "lucide-svelte/icons/circle-plus";
    import {
        Button,
        buttonVariants
    } from "$lib/components/ui/button/index.js";
    import { onMount } from "svelte";
    import * as Dialog from "$lib/components/ui/dialog/index.js";
    import { Input } from "$lib/components/ui/input/index.js";
    import { Label } from "$lib/components/ui/label/index.js";
    import {error} from "@sveltejs/kit";
    import CategoryNew from "lucide-svelte/icons/circle-plus";
    import { Checkbox } from "$lib/components/ui/checkbox/index.js";
    import { Toaster } from "$lib/components/ui/sonner/index.js";
    import { toast } from "svelte-sonner";
    import DataTable from "$lib/components/ui/custom/table.svelte";
    import { columns } from "./columns";

    
    let { children, data } = $props<{ data: PageData }>();

    let meta = axios.get(API_URL + "/meta");

    // 当前页面的分类和分页数据
    let categories = $state(data.data);
    let pagination = $state(data.page);

    let id = $state(0);
    let text = $state('');
    let slug = $state('');

    let errorMessage = $derived(!text || !slug ? '请填写所有必填字段*' : null);

    // 弹窗开关
    let showNewCategoryModal = $state(false);

    // 打开新增分类对话框时重置表单
    function handleNewCategoryModalOpen() {
        text = '';
        slug = '';
        showNewCategoryModal = true;
    }

    function handlePaginationChange(e: CustomEvent<PaginationState>) {
        pagination = e.detail;
        reloadCategories();
    }

    function handleDeleteSuccess() {
        reloadCategories();
        toast.success('删除成功');
    }

    // 重新从后端读取分类数据

    function handleRefresh() {
        console.log("父组件收到：handleRefresh");
        reloadCategories();
    }

    function reloadCategories() {

        axiosInstance.get(API_URL + '/categories',
            {
                params: {
                    pageIndex: pagination ? pagination.pageIndex : 1,
                    pageSize: pagination ? pagination.pageSize : 20,
                    orderBy: "created_at desc"
                }
            })
            .then((rsp)=>{
                if (rsp.data.success == true) {
                    categories = rsp.data.data.map((item : Category) => {
                        const category = new Category();
                        Object.assign(category, item);
                        return category;
                    });
                    pagination = rsp.data.page;

                    categories.forEach((c : Category) => c.checked = false);

                    console.log("重新加载数据成功！")
                }
            })
            .catch((error)=>{
                console.log(error)
            });
    }

    // 创建新分类
    function onNewCategorySubmit() {
        if (!errorMessage) {
            let tmpCategory = new Category();
            tmpCategory.text = text;
            tmpCategory.slug = slug;

            createCategory(tmpCategory)
                .then((rsp) => {
                    if (rsp.data.success) {
                        reloadCategories();
                        toast.success("创建成功！", {
                            description: "成功创建一个新分类",
                        });
                    } else {
                        toast.error("创建失败！", {
                            description: rsp.data.message,
                        })
                        
                    }
                })
                .catch((err) => {
                    toast.error("创建失败！", {
                        description: err,
                    });
                });
        } else {
            toast.error("创建失败！", {
                        description: "请填写所有必填字段",
                    });
            console.log("新建分类：请填写所有必填字段");
        }

    }

    // 编辑分类
    function onEditCategorySubmit() {
        if (!errorMessage) {
            let editCategory = new Category();
            editCategory.id = id;
            editCategory.text = text;
            editCategory.slug = slug;

            updateCategory(editCategory)
                .then((rsp) => {
                    if (rsp.data.success) {
                        reloadCategories();
                        toast.success("编辑成功！", {
                            description: "成功编辑一个分类",
                        });
                    } else {
                        toast.error("编辑失败！", {
                            description: rsp.data.message,
                        })
                    }
                })
                .catch((error) => {
                    toast.error("编辑失败！", {
                        description: error,
                    });
                });
        } else {
            toast.error("编辑失败！", {
                            description: "请填写所有必填字段",
                        });
            console.log("新建分类：请填写所有必填字段");
        }
    }

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
{@render children?.()}

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
                    <Breadcrumb.Page>分类</Breadcrumb.Page>
                </Breadcrumb.Item>
                
            </Breadcrumb.List>
        </Breadcrumb.Root>
    </div>
</header>

<div class="flex-1 p-6   w-full">
    

    <!-- 工具栏 BEGIN -->
    <div class="flex items-center p-4 mb-4 bg-gray-50 rounded space-x-4 w-full">
        <!-- 创建分类 BEGIN -->
        <Dialog.Root bind:open={showNewCategoryModal}>
            <Dialog.Trigger>
                <Button onclick={handleNewCategoryModalOpen}>
                    <AddLarge class="mr-2 h-4 w-4"></AddLarge>
                    创建分类
                </Button>
            </Dialog.Trigger>
            <Dialog.Content class="sm:max-w-[425px]">
                <Dialog.Header>
                    <Dialog.Title>创建分类</Dialog.Title>
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
                        <Input id="name" bind:value={text} class="col-span-3" />
                    </div>
                    <div class="grid grid-cols-4 items-center gap-4">
                        <Label for="username" class="text-right">缩略名*</Label>
                        <Input id="username" bind:value={slug} class="col-span-3" />
                    </div>
                </div>
                <Dialog.Footer>
                    <Dialog.Close>
                        <Button onclick={onNewCategorySubmit} disabled={!text || !slug}>创建</Button>
                    </Dialog.Close>
                </Dialog.Footer>
            </Dialog.Content>
        </Dialog.Root>
        <!-- 创建分类 END -->

    </div>
    <!-- 工具栏 END -->
        <DataTable 
            data={categories}
            columns={columns}
            pagination={pagination}

            onDelete={(id : (number | string)) => {
                console.log(`删除分类：${id}`);
                handleRefresh();
            }}
            onUpdate={(category : Category) => {
                console.log(`更新分类：${category}`);
                handleRefresh();
            }}
        />
</div>
