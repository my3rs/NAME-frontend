<script lang="ts">
	import * as Sidebar from "$lib/components/ui/sidebar/index.js";
	import Plus from "lucide-svelte/icons/plus";
	import type { ComponentProps } from "svelte";
    import { metaApi } from "$lib/services/api";
	import { Label } from "$lib/components/ui/label/index.js";

    let meta = metaApi.getMeta();

</script>

<Sidebar.Root side="right" class="w-64 border-l">
    <Sidebar.Header class="h-16 px-6 flex items-center border-b">
        <h2 class="text-base font-medium">博客统计</h2>
    </Sidebar.Header>

    <Sidebar.Content class="px-6">
        {#await meta}
            <div class="space-y-4 py-4">
                <div class="h-4 bg-gray-100 rounded animate-pulse"></div>
                <div class="h-4 bg-gray-100 rounded animate-pulse"></div>
                <div class="h-4 bg-gray-100 rounded animate-pulse"></div>
            </div>
        {:then data}
            <div class="space-y-6 py-4">
                <div class="grid grid-cols-2 gap-4">
                    <div class="space-y-1">
                        <div class="text-xs text-muted-foreground">文章</div>
                        <div class="text-base font-medium">{data.posts_count}</div>
                    </div>
                    <div class="space-y-1">
                        <div class="text-xs text-muted-foreground">页面</div>
                        <div class="text-base font-medium">{data.pages_count}</div>
                    </div>
                    <div class="space-y-1">
                        <div class="text-xs text-muted-foreground">分类</div>
                        <div class="text-base font-medium">{data.categories_count}</div>
                    </div>
                    <div class="space-y-1">
                        <div class="text-xs text-muted-foreground">标签</div>
                        <div class="text-base font-medium">{data.tags_count}</div>
                    </div>
                </div>

                <div class="space-y-1">
                    <div class="text-xs text-muted-foreground">评论</div>
                    <div class="text-base font-medium">{data.comments_count}</div>
                </div>
            </div>
        {:catch error}
            <div class="py-4 text-red-500 text-sm">
                加载统计信息失败
            </div>
        {/await}
        
        <Sidebar.Separator class="my-6" />
        
    </Sidebar.Content>
    <Sidebar.Footer>
        
    </Sidebar.Footer>
</Sidebar.Root>