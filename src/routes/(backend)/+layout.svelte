<script lang="ts">
    import * as Sidebar from "$lib/components/ui/sidebar/index.js";
    import AppSidebar from "$lib/components/app-sidebar.svelte";
    import SidebarInfo from "$lib/components/sidebar-info.svelte";

    let { children } = $props();
</script>


<svelte:head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>NAME Dashboard</title>
</svelte:head>


<Sidebar.Provider>
    <AppSidebar />

    <Sidebar.Inset>
        {@render children?.()}
    </Sidebar.Inset>

    <!-- <SidebarInfo /> -->
</Sidebar.Provider>


