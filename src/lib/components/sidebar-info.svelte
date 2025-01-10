<script lang="ts">
	import * as Sidebar from "$lib/components/ui/sidebar/index.js";
    import DatePicker from "$lib/components/sidebar-datepicker.svelte";
	import Plus from "lucide-svelte/icons/plus";
	import type { ComponentProps } from "svelte";
    import axios from "axios";
    import {API_URL} from "$lib/params/base";

    let meta = axios.get(API_URL + "/meta");

	// This is sample data.
	const data = {
		user: {
			name: "shadcn",
			email: "m@example.com",
			avatar: "/avatars/shadcn.jpg",
		},
		calendars: [
			{
				name: "My Calendars",
				items: ["Personal", "Work", "Family"],
			},
			{
				name: "Favorites",
				items: ["Holidays", "Birthdays"],
			},
			{
				name: "Other",
				items: ["Travel", "Reminders", "Deadlines"],
			},
		],
	};

	let { ref = $bindable(null), ...restProps }: ComponentProps<typeof Sidebar.Root> = $props();
</script>

<Sidebar.Root
	bind:ref
	collapsible="none"
	class="sticky top-0 hidden h-svh border-l lg:flex"
	{...restProps}
>
	<Sidebar.Header class="border-sidebar-border h-16 border-b">
		<h2 class="text-lg font-semibold mb-4">博客状态</h2>
        
	</Sidebar.Header>
	<Sidebar.Content>
        <div class="mb-6 text-gray-500">
            {#await meta}
                共有 ... 篇文章
            {:then rsp}
                共有 {rsp.data.posts_count} 篇文章
            {/await}
        </div>
        <DatePicker />
		<Sidebar.Separator class="mx-0" />
	</Sidebar.Content>
	<Sidebar.Footer>
		
	</Sidebar.Footer>
</Sidebar.Root>