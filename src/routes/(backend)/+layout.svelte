<script lang="ts">
    import * as Sidebar from "$lib/components/ui/sidebar/index.js";
    import AppSidebar from "$lib/components/app-sidebar.svelte";
    import { page } from "$app/stores";

    let { children } = $props();
    
    const isNewPostPage = $derived($page.url.pathname === "/admin/posts/new");
</script>

<svelte:head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>NAME控制台</title>
</svelte:head>

<Sidebar.Provider class="flex h-screen">
    <AppSidebar />

    <div class="flex flex-1 overflow-hidden">
        <main class="flex-1 overflow-y-auto">
            {@render children?.()}
        </main>
    </div>
</Sidebar.Provider>
