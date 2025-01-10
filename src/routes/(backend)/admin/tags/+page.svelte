<script lang="ts">
    import {onMount} from "svelte";
    import {axiosInstance, getFormattedDate, getPosts, getTags, crateTag} from "$lib/api";
    import Svelecte from 'svelecte';
    import * as Dialog from "$lib/components/ui/dialog/index.js";
    import { Checkbox } from "$lib/components/ui/checkbox/index.js";
    // 动画
    import { slide,fade } from 'svelte/transition';

    // 图标
    import TagGroup from "lucide-svelte/icons/tag";
    import {Tag} from "$lib/model";
    import Eye from "lucide-svelte/icons/eye";
    import AddLarge from "lucide-svelte/icons/circle-plus";
    import Edit from "lucide-svelte/icons/square-pen";
    import axios from "axios";
    import {API_URL} from "$lib/params/base";
    import {Label} from "$lib/components/ui/label";
    import {Input} from "$lib/components/ui/input";
    import {Button} from "$lib/components/ui/button";
    import { Toaster } from "$lib/components/ui/sonner";
    import { toast } from "svelte-sonner";
    import type { PageData } from './$types';

    export let data : PageData;

    let meta = axios.get(API_URL + "/meta");
    let tags: Tag[] = data.items;
    let selectedTags : Tag[] = [];
    let showNewTagModal = false;
    let showEditTagModal = false;
    let parentTags : Tag[] = [];
    let parentTag : string;

    let errorMessage : string = "";

    // 正在被修改的tag
    let editTag: Tag = new Tag();

    // 当前展开的行
    let openRow: number | null; // 一级标签
    let openRow2: number | null; // 二级标签
    let openRow3: number | null; // 三级标签
    let openRow4: number | null; // 四级标签

    let tagsTree : Tag[] = [];

    function reloadTags() {
        axiosInstance.get(API_URL + '/tags', {
            params: {
                path: true,
            }
        })
            .then(rsp => {
                tags = rsp.data.data;
                tags = caclTagDepth(tags);
                tagsTree = tagListToTree(tags);
            })
            .catch(err => {
                console.log("reloadTags:", err);
            })
    }

    // 创建标签
    let newTag : Tag = new Tag();
    $: titleError = !newTag.text && !editTag.text;
    $: slugError = !newTag.no && !editTag.no;
    $: errorMessage = titleError || slugError ? '请填写所有必填字段*' : '';

    function onNewTagSubmit() {
        if (errorMessage.length == 0 || errorMessage === '') {
            postTag(newTag)
                .then(rsp => {
                    if (rsp.data.success) {
                        toast.success("创建成功！", {
                            description: "成功创建一个新标签",
                        });

                        newTag = new Tag();
                        reloadTags();
                    } else {
                        toast.error("创建失败！", {
                            description: rsp.data.message,
                        });
                        reloadTags();
                    }
                })
                .catch(err => {
                    toast.error("创建失败！", {
                        description: err,
                    });
                    reloadTags();
                });
        }
    }

    const toggleRow = (i: number, level: number) => {
        console.log(i, level)
        switch (level) {
            case 1:
                openRow = openRow === i ? null : i;
                openRow2 = openRow3 = openRow4 = null;
                break;
            case 2:
                openRow2 = openRow2 === i ? null : i;
                openRow3 = openRow4 = null;
                break;
            case 3:
                openRow3 = openRow3 === i ? null : i;
                break;
            case 4:
                openRow4 = openRow4 === i ? null : i;
                openRow4 = null;
                break;
        }
    };

    const caclTagDepth  =  (list: Tag[]) => {
        if (!list || list.length === 0) {
            return list;
        }

        const newList = JSON.parse(JSON.stringify(list))

        newList.forEach((tag : Tag) => {
            if (tag.path) {
                tag.depth = tag.path.split('.').length;
            } else {
                tag.depth = 0;
            }
        });

        return newList;
    }

    const  tagListToTree = (list : any[]) : Tag[] => {
        let result: Tag[] = [];

        if (!list || list.length === 0) {
            return result;
        }

        const newList = JSON.parse(JSON.stringify(list))
        const map = new Map();

        if (!newList) {
            return result;
        }

        // 为避免后续【在 map 中查找不到 parent tag】，先初始化 map
        // 另一个解决方法是【保证 list 的排序】
        newList.forEach((tag : Tag) => {
            map.set(tag.id, tag);
        });

        newList.forEach((tag : Tag) => {
            if (tag.parentID) {
                // 楼中楼的评论
                const parent = map.get(tag.parentID);
                tag.depth = parent.deep + 1; // 当前深度是父级节点的深度+1

                if (!parent.children) {
                    parent.children = [];
                }
                tag.parentID = parent.id;
                parent.children.push(tag);

            } else {
                tag.depth = 0;
                result.push(tag);
            }
        });
        return result;
    }

    $: parentTags = tags && tags.length !== 0 ? tags.filter((tag) => {
        return tag.path.length <= 5;
    }) : [];


    let selectedIDs : number[] = [];
    function addTag(id : number) {
        if (!selectedIDs.includes(id)) {
            selectedIDs = [...selectedIDs, id];
        }
    }

    function removeTag(id : number) {
        selectedIDs = selectedIDs.filter(selectedId => selectedId !== id);
    }

</script>


<main class="flex-1 p-6 overflow-y-auto h-screen">
    <div class="mb-6">
        <h1 class="text-2xl font-semibold">标签</h1>
    </div>

    <!-- 工具栏 -->
    <div class="flex items-center p-4 mb-4 bg-gray-50 rounded space-x-4">
        <!-- 新建标签  BEGIN -->
        <Dialog.Root bind:open={showNewTagModal}>
            <Dialog.Trigger>
                <Button>
                    <AddLarge class="mr-2 h-4 w-4"></AddLarge>
                    创建标签
                </Button>
            </Dialog.Trigger>
            <Dialog.Content class="sm:max-w-[425px]">
                <Dialog.Header>
                    <Dialog.Title>创建标签</Dialog.Title>
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
                        <Input id="name" bind:value={newTag.text} class="col-span-3" />
                    </div>
                    <div class="grid grid-cols-4 items-center gap-4">
                        <Label for="username" class="text-right">缩略名*</Label>
                        <Input id="username" bind:value={newTag.no} class="col-span-3" />
                    </div>

                    <div class="grid grid-cols-4 items-center gap-4">
                        <Label for="name" class="text-right">
                            父标签
                        </Label>
                        <div class="z-50 col-span-3">
                            <Svelecte
                                    options={tags}
                                    name="parent-tag"
                                    bind:value={parentTag}
                                    clearable
                                    labelField="text"
                                    valueField="no"
                            />
                        </div>

                    </div>
                </div>
                <Dialog.Footer>
                    <Dialog.Close>
                        <Button on:click={onNewTagSubmit}>创建</Button>
                    </Dialog.Close>

                </Dialog.Footer>
            </Dialog.Content>
        </Dialog.Root>
        <!-- 新建标签  END -->

        <!-- 批量删除 BEGIN -->
        <Dialog.Root>
            <Dialog.Trigger>
                <Button
                        variant="ghost"
                        disabled={selectedIDs.length === 0}>批量删除</Button>
            </Dialog.Trigger>
            <Dialog.Content class="sm:max-w-[425px]">
                <Dialog.Header>
                    <Dialog.Title>确认删除</Dialog.Title>
                    <Dialog.Description>
                        <div class="mt-2">已选中{selectedIDs.length}个标签</div>
                    </Dialog.Description>
                </Dialog.Header>
                <div class="grid gap-4 py-4">
                    <p>确定要删除吗？</p>
                    <p>当前功能不可用！</p>
                </div>
                <Dialog.Footer>
                    <Button variant="destructive">确定</Button>
                </Dialog.Footer>
            </Dialog.Content>
        </Dialog.Root>
        <!-- 批量删除 END -->

    </div>

    <!-- 工具栏 -->


    <div class="w-full overflow-x-auto">
        {#if tags}
            <table class="w-full whitespace-no-wrap">
                <thead>
                <tr class="text-xs font-semibold tracking-wide text-left text-gray-500 uppercase bg-gray-50 border-b">
                    <th class="px-4 py-3 w-1"></th>
                    <th class="px-4 py-3">ID</th>
                    <th class="px-4 py-3">缩写</th>
                    <th class="px-4 py-3">名称</th>
                    <th class="px-4 py-3">标签层级</th>
                    <th class="px-4 py-3">操作</th>
                </tr>
                </thead>
                <tbody class="bg-white divide-y">
                <!-- Repeat this TR for each article -->
                {#each tags as tag}
                    <tr class="text-gray-700 hover:bg-gray-100 h-12"  on:click={() => {toggleRow(tag.id, 1)}} >
                        <td class="px-4 py-2">
                            <Checkbox
                                    onCheckedChange={(v)=>{
                                    if (v && tag.id) {
                                          addTag(tag.id);
                                    } else if (tag.id) {
                                          removeTag(tag.id);
                                    } else {
                                        console.log("当前标签的信息有误：", tag);
                                    }
                                }}
                            />

                        </td>
                        <td class="px-4 py-2">
                            {tag.id}
                        </td>
                        <td class="px-4 py-2">
                            <div class="flex items-center text-sm">
                                <div>
                                    <p class="font-semibold">{tag.no}</p>
                                </div>
                            </div>
                        </td>
                        <td class="px-4 py-2 text-sm">{tag.readablePath}</td>

                        <td class="px-4 py-2 text-sm">
                            {#if tag.depth === 1}
                                1
                            {:else if tag.depth === 2}
                                2
                            {:else if tag.depth === 3}
                                3
                            {:else if tag.depth === 4}
                                4
                            {/if}
                        </td>

                        <td class="px-4 py-2 text-sm">
                            <div class="flex items-center space-x-4 text-sm">
                                <button title="编辑" on:click={() => {showEditTagModal = !showEditTagModal; editTag = tag;}}>
                                    <Edit class="h-4 w-4"/>
                                </button>
                                <a href="/posts/" target="_blank" title="预览">
                                    <Eye class="h-4 w-4"/>
                                </a>

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
            共有 ... 个标签
        {:then rsp}
            共有 {rsp.data.tags_count} 个标签
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






<!-- 修改标签的Modal -->
{#if showEditTagModal}
    <div class="fixed z-10 inset-0 overflow-y-auto" transition:fade>
        <div class="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            <div class="fixed inset-0 transition-opacity" aria-hidden="true">
                <div class="absolute inset-0 bg-gray-500 opacity-75"></div>
            </div>

            <div class="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
                <div class="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                    <div class="sm:flex sm:items-start">
                        <div class="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left">
                            <h3 class="text-lg leading-6 font-medium text-gray-900" id="modal-title">
                                修改标签
                            </h3>

                            <div class="mt-2">
                                <div class="z-50 mb-2">
                                    <Svelecte
                                            options={tags}
                                            name="parent-tag"
                                            bind:value={parentTag}
                                            clearable
                                            placeholder="父标签（可选）"
                                            labelField="text"
                                            valueField="no"
                                    />
                                </div>

                                <input bind:value={editTag.no} type="text" class="w-full px-2 py-1 border border-gray-300 rounded mb-2" placeholder="标签缩略名">
                                <input bind:value={editTag.text} class="w-full px-2 py-1 border border-gray-300 rounded" placeholder="标签名称">


                            </div>

                        </div>
                    </div>
                </div>

                <div class="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                    <button type="button" class="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-blue-600 text-base font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:ml-3 sm:w-auto sm:text-sm" >
                        保存修改
                    </button>
                    <button type="button" class="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:mt-0 sm:w-auto sm:text-sm" on:click={() => showEditTagModal = false}>
                        取消
                    </button>
                </div>
            </div>
        </div>
    </div>

{/if}
