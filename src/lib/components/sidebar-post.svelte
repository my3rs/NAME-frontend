<script lang="ts">
	import * as Sidebar from "$lib/components/ui/sidebar/index.js";
    import DatePicker from "$lib/components/sidebar-datepicker.svelte";
	import type { ComponentProps } from "svelte";
    import axios from "axios";
    import {API_URL} from "$lib/params/base";
	import { Label } from "$lib/components/ui/label/index.js";

    let meta = axios.get(API_URL + "/meta");

	let { ref = $bindable(null), ...restProps }: ComponentProps<typeof Sidebar.Root> = $props();
</script>

<Sidebar.Root
	bind:ref
	collapsible="none"
	class="sticky top-0 hidden h-svh border-l lg:flex"
	{...restProps}
>
	<Sidebar.Header class="border-sidebar-border h-16 border-b">
        <Label for="title">编辑选项</Label>
	</Sidebar.Header>

	<Sidebar.Content>
        <div class="p-4">
            <h3 class="text-sm font-medium mb-2">编辑提示</h3>
            <ul class="text-sm text-gray-500 space-y-2">
                <li>• 标题应该简洁明了</li>
                <li>• 选择合适的分类</li>
                <li>• 添加合适的标签以便搜索</li>
                <li>• 检查文章格式是否正确</li>
            </ul>
        </div>
       
	</Sidebar.Content>
	<Sidebar.Footer>
		
	</Sidebar.Footer>
</Sidebar.Root>