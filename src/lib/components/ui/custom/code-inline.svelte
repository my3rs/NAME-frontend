<script lang="ts">

    export let raw : string;
    let code = raw.replace(/`/g, '');

</script>

<code class="bg-muted relative rounded px-[0.3rem] py-[0.2rem] font-mono text-sm font-semibold"
>
{code}
</code>

