<script lang="ts">
    import { page } from '$app/stores'
</script>


<aside class="w-64 p-6 bg-gray-50 border-r border-gray-100  fixed overflow-y-auto h-screen">
    <p class="text-lg font-semibold">seaHi</p>
    <nav class="mt-8">
        <a href="/" class:bg-gray-200={$page.url.pathname  === '/' || $page.url.pathname.startsWith('/page')} class="block px-4 py-2 mt-2 text-sm font-semibold text-gray-900 bg-gray-200 hover:bg-gray-200 rounded">首页</a>
        <a href="/posts" class:bg-gray-200={$page.url.pathname.startsWith('/archives')} class="block px-4 py-2 mt-2 text-sm font-semibold text-gray-600 hover:bg-gray-200 rounded">归档</a>

        <a href="/categories" class:bg-gray-200={$page.url.pathname  === '/categories'} class="block px-4 py-2 mt-2 text-sm font-semibold text-gray-600 hover:bg-gray-200 rounded">分类</a>

        <a href="/tags" class:bg-gray-200={$page.url.pathname  === '/tags'} class="block px-4 py-2 mt-2 text-sm font-semibold text-gray-600 hover:bg-gray-200 rounded">标签</a>
        <a href="/about" class:bg-gray-200={$page.url.pathname  === '/about'} class="block px-4 py-2 mt-2 text-sm font-semibold text-gray-600 hover:bg-gray-200 rounded">关于</a>
    </nav>
</aside>