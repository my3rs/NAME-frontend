<script lang="ts">

    export let text = "";
    export let depth = 1;
</script>

{#if depth === 1}
    <h1 class="scroll-m-20 text-4xl font-extrabold tracking-tight lg:text-5xl">{text}</h1>
{:else if depth === 2}
    <h2 class="mt-10 scroll-m-20 border-b pb-2 text-3xl font-semibold tracking-tight transition-colors first:mt-0">{text}</h2>
{:else if depth === 3}
    <h3 class="mt-8 scroll-m-20 text-2xl font-semibold tracking-tight">{text}</h3>
{:else if depth === 4}
    <h4 class="scroll-m-20 text-xl font-semibold tracking-tight">{text}</h4>
{:else if depth === 5}
    <h5 class="text-lg font-semibold mb-2 mt-2">{text}</h5>
{:else if depth === 6}
    <h6 class="text-lg font-semibold mb-2 mt-2">{text}</h6>
{/if}

