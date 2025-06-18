<script lang="ts">
    import Ellipsis from "lucide-svelte/icons/ellipsis";
    import Eye from "lucide-svelte/icons/eye";
    import Trash from "lucide-svelte/icons/trash-2";
    import Edit from "lucide-svelte/icons/square-pen";
    import * as DropdownMenu from "$lib/components/ui/dropdown-menu";
    import { Button } from "$lib/components/ui/button";
    import * as Dialog from "$lib/components/ui/dialog/index.js";
    import * as AlertDialog from "$lib/components/ui/alert-dialog/index.js";
    import { deleteCategories } from "$lib/api";
    import { buttonVariants } from "$lib/components/ui/button/index.js";
    import { toast } from "svelte-sonner";
    import { Toaster } from "$lib/components/ui/sonner/index.js";
    import { Label } from "$lib/components/ui/label/index.js";
    import { Input } from "$lib/components/ui/input/index.js";
    import { Category } from "$lib/model";
    import { updateCategory } from "$lib/api";
    import { axiosInstance } from '$lib/stores/auth';
    import {API_URL, DEBUG} from "$lib/params/base";

    // 直接接收回调属性
    let { id, category, onDelete, onUpdate } = $props();

    let openDeleteDialog = $state(false);
    let showEditModal = $state(false);
    let editingCategory = $state(new Category());

    // 打开编辑对话框
    function openEditDialog(category: Category) {
        editingCategory = {...category};
        showEditModal = true;
    }

    // 删除操作
    async function handleDeleteSubmit(id: string | number) {
        try {
            const response = await deleteCategories([id]);
            if (response.data.success) {
                openDeleteDialog = false;
                toast.success("删除成功");
                onDelete?.(id); // 触发父级回调
            } 
            else {
                openDeleteDialog = false;
                toast.error("删除失败", {
                    description: response.data.message,
                });
            }
        } catch (error) {
            openDeleteDialog = false;
            toast.error("删除失败", {
                description: error.toString(),
            });
        }
    }

    // 修改分类
    function handleEditSubmit() {
        if (!editingCategory.text || !editingCategory.slug) {
            toast.error("请填写所有必填字段");
            return;
        }

        updateCategory(editingCategory)
            .then((rsp) => {
                if (rsp.data.success) {
                    showEditModal = false;  // Close the modal first
                    onUpdate?.(editingCategory);    // 触发父级回调
                    toast.success("修改成功！", {
                        description: "成功修改一个分类",
                    });
                } else {
                    toast.error("修改失败！", {
                        description: rsp.data.message,
                    })
                }
            })
            .catch((error) => {
                toast.error("修改失败！", {
                    description: error,
                });
            });
        

        showEditModal = false;
    }
</script>

<DropdownMenu.Root>
    <DropdownMenu.Trigger>
        {#snippet child({ props })}
              <Button
                {...props}
                variant="ghost"
                size="icon"
                class="relative size-8 p-0"
              >
                <span class="sr-only">打开菜单</span>
                <Ellipsis class="size-4" />
              </Button>
        {/snippet}
    </DropdownMenu.Trigger>

    <DropdownMenu.Content>
        <DropdownMenu.Group>
            <DropdownMenu.Label>操作</DropdownMenu.Label>
            <DropdownMenu.Separator />
            <DropdownMenu.Item
                onclick={() => {
                    openEditDialog(category);
                }}
            >
                <Edit class="size-4" />
                <span>修改</span>
            </DropdownMenu.Item>

            <DropdownMenu.Item
                onclick={() => {
                    openDeleteDialog = true;
                }}
            >
                <Trash class="size-4" />
                <span>删除</span>
            </DropdownMenu.Item>

        </DropdownMenu.Group>
        <DropdownMenu.Separator />
    </DropdownMenu.Content>
</DropdownMenu.Root>

<!-- 编辑分类对话框 -->
<Dialog.Root bind:open={showEditModal}>
    <Dialog.Content class="sm:max-w-[425px]">
        <Dialog.Header>
            <Dialog.Title>修改分类</Dialog.Title>
            <Dialog.Description>
                <p class="text-red-600">
                    {!editingCategory.text || !editingCategory.slug ? '请填写所有必填字段*' : ''}
                </p>
            </Dialog.Description>
        </Dialog.Header>
        <div class="grid gap-4 py-4">
            <div class="grid grid-cols-4 items-center gap-4">
                <Label for="name" class="text-right">
                    名称*
                </Label>
                <Input id="name" bind:value={editingCategory.text} class="col-span-3" />
            </div>
            <div class="grid grid-cols-4 items-center gap-4">
                <Label for="username" class="text-right">缩略名*</Label>
                <Input id="username" bind:value={editingCategory.slug} class="col-span-3" />
            </div>
        </div>
        <Dialog.Footer>
            <Dialog.Close>
                <Button type="submit" onclick={handleEditSubmit}>保存修改</Button>
            </Dialog.Close>
        </Dialog.Footer>
    </Dialog.Content>
</Dialog.Root>
<!-- 编辑分类对话框 END -->

<!-- 删除分类对话框 -->
<AlertDialog.Root bind:open={openDeleteDialog}>
    <AlertDialog.Content class="sm:max-w-[425px]">
        <AlertDialog.Header>
            <AlertDialog.Title>警告</AlertDialog.Title>
            <AlertDialog.Description>
                此操作无法撤销，请确认是否要删除该分类？
            </AlertDialog.Description>
        </AlertDialog.Header>
        <AlertDialog.Footer>
            <AlertDialog.Cancel>取消</AlertDialog.Cancel>
            <AlertDialog.Action onclick={async () => {
                await handleDeleteSubmit(id);
            }}>删除</AlertDialog.Action>
        </AlertDialog.Footer>
    </AlertDialog.Content>
</AlertDialog.Root>
<!-- 编辑分类对话框 END -->

<Toaster />
