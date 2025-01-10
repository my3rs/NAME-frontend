<script lang="ts">
    import Ellipsis from "lucide-svelte/icons/ellipsis";
    import Eye from "lucide-svelte/icons/eye";
    import Trash from "lucide-svelte/icons/trash-2";
    import * as DropdownMenu from "$lib/components/ui/dropdown-menu";
    import { Button } from "$lib/components/ui/button";
    import * as Dialog from "$lib/components/ui/dialog/index.js";
    import * as AlertDialog from "$lib/components/ui/alert-dialog/index.js";
    import { deletePosts } from "$lib/api";
    import { buttonVariants } from "$lib/components/ui/button/index.js";
    import { toast } from "svelte-sonner";
    import { Toaster } from "$lib/components/ui/sonner/index.js";
    import { createEventDispatcher } from "svelte";

    const dispatch = createEventDispatcher();
    let { id }: { id: string } = $props();
    let openDeleteDialog = $state(false);

    async function handleDeleteSubmit(id: string | number) {
        try {
            const response = await deletePosts([id]);
            if (response.data.success) {
                openDeleteDialog = false;
                toast.success("删除成功");
                dispatch('deleteSuccess');
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
                    openDeleteDialog = true;
                }}
            >
                <Trash class="size-4" />
                <span>删除</span>
            </DropdownMenu.Item>

            <DropdownMenu.Item>
                <Eye class="size-4" />
                <a href={`/posts/${id}`} target="_blank"><span>预览</span></a>
            </DropdownMenu.Item>
        </DropdownMenu.Group>
        <DropdownMenu.Separator />
    </DropdownMenu.Content>
</DropdownMenu.Root>

<AlertDialog.Root bind:open={openDeleteDialog}>
    <AlertDialog.Content class="sm:max-w-[425px]">
        <AlertDialog.Header>
            <AlertDialog.Title>警告</AlertDialog.Title>
            <AlertDialog.Description>
                此操作无法撤销，请确认是否要删除该文章？
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

<Toaster />
