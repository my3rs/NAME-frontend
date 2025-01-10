<script lang="ts">
    export let ordered : boolean = false;
    export let start : number | null |undefined;
</script>

{#if ordered}
<ol {start} class="my-6 ml-6 list-disc [&>li]:mt-2">
    <slot />
</ol>
{:else}
<ul class="my-6 ml-6 list-disc [&>li]:mt-2">
    <slot />
</ul>
{/if}