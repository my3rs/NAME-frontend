<script lang="ts">
    import { FrontSidebar } from '$lib/components/ui/custom/index';
    // import "$src/app.css"
</script>

<svelte:head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>NAME博客</title>
</svelte:head>



<div class="flex h-full font-sans text-gray-900 bg-white overflow-hidden">
    <FrontSidebar />

    <!-- Main content -->
    <div class="flex flex-1 ml-64">
        <slot />
    </div>

</div>





