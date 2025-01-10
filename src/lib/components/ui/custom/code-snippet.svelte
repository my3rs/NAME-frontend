<script lang="ts">
    // import HighLight from "svelte-highlight";
    export let lang : string = "";
    export let text : string = "";

    $: snippet = {};
</script>

<section class="space-y-1 w-full max-w-[600px]">
    {@html text}
</section>