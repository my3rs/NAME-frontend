<script lang="ts">
    import * as Sidebar from "$lib/components/ui/sidebar/index.js";
    import NavUser from "$lib/components/nav-user.svelte";
    import House from "lucide-svelte/icons/house";
    import Newspaper from "lucide-svelte/icons/newspaper";
    import Search from "lucide-svelte/icons/search";
    import Tag from "lucide-svelte/icons/tag";
    import Folder from "lucide-svelte/icons/folder";
    import Settings from "lucide-svelte/icons/settings";
    import { page } from '$app/stores';
    import { currentUser } from "$lib/stores/auth";
    import { logout } from "$lib/api";
    import { UserRole } from "$lib/model";

    // Menu items.
    const items = [
        {
            title: "首页",
            url: "/admin",
            icon: House,
        },
        {
            title: "文章",
            url: "/admin/posts",
            icon: Newspaper,
        },
        {
            title: "分类",
            url: "/admin/categories",
            icon: Folder,
        },
        {
            title: "标签",
            url: "/admin/tags",
            icon: Tag,
        },
        {
            title: "设置",
            url: "/admin/settings",
            icon: Settings,
        },
        {
            title: "DEBUG",
            url: "/admin/debug",
            icon: Search,
        }
    ];

    let currentPath = $page.url.pathname;
    $: currentPath = $page.url.pathname;

    async function handleLogout() {
        await logout();
    }
</script>

<Sidebar.Root>
    <Sidebar.Header />
    <Sidebar.Content>
        <Sidebar.Group />
            <Sidebar.GroupLabel>常用</Sidebar.GroupLabel>
            <Sidebar.GroupContent>
            <Sidebar.Menu>
                {#each items as item (item.title)}
                    <Sidebar.MenuItem>
                        <Sidebar.MenuButton isActive={item.url === $page.url.pathname}>
                        {#snippet child({ props })}
                            <a href={item.url} {...props}>
                            <item.icon />
                            <span>{item.title}</span>
                            </a>
                        {/snippet}
                        </Sidebar.MenuButton>
                    </Sidebar.MenuItem>
                {/each}
            </Sidebar.Menu>
            </Sidebar.GroupContent>
        <Sidebar.Group />
    </Sidebar.Content>
    <Sidebar.Footer>
        <NavUser user={$currentUser} />
    </Sidebar.Footer>
</Sidebar.Root>