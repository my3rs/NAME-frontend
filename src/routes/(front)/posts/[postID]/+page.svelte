<script lang="ts">
    import type { PageData } from './$types';
    import {onMount, onDestroy, tick} from 'svelte';
    import { page } from '$app/stores';
    import { fade } from 'svelte/transition';
    import SvelteMarkdown from 'svelte-markdown';
    import md5 from 'md5';    
    import axios from "axios";
    import {API_URL} from "$lib/params/base";
    import type { Comment } from "$lib/model";
    import {axiosInstance} from "$lib/api";
    import { List,
        Paragraph, 
        CodeInline, 
        CodeSnippet, 
        FrontHeading, 
        FrontImage, 
        CommentThread 
    } from "$lib/components/ui/custom";
    import * as Form from "$lib/components/ui/form";
    import { Input } from "$lib/components/ui/input";
    import { commentFormSchema, type CommentFormSchema } from "$lib/scheme";
    import { Textarea } from "$lib/components/ui/textarea";
    import {
        type SuperValidated,
        type Infer,
        superForm,
    } from "sveltekit-superforms";
    import { zodClient } from "sveltekit-superforms/adapters";
    import { writable } from 'svelte/store';
    import {getUser} from "$lib/login";
    import {isLoggedIn} from "axios-jwt";
    import type {User} from "$lib/model";
    import Message from "lucide-svelte/icons/message-square-more";
    import Calendar from "lucide-svelte/icons/calendar";
    import Folder from "lucide-svelte/icons/folder";
    import Tag from "lucide-svelte/icons/tag";
    import Logout from "lucide-svelte/icons/log-out";





    export let data : PageData;
    let url = $page.url.pathname;
    let user : User | undefined;

    let articleArea : HTMLElement

    let commentsTree : Comment[];
    let reply_text = ""

    let showToasts = false;
    let errorMessage : string;

    const form = superForm(data.form, {
        validators: zodClient(commentFormSchema),
    });

    const { form: formData, enhance } = form;

    let headings: { id: string; text: string; level: number }[] = [];

    let activeHeading = writable<string | null>(null);
    let articleElement: HTMLElement;

    $: if (articleElement) {
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    activeHeading.set(entry.target.id);
                }
            });
        }, { rootMargin: '-100px 0px -80% 0px' });

        headings.forEach(heading => {
            const element = document.getElementById(heading.id);
            if (element) observer.observe(element);
        });

        onDestroy(() => {
            observer.disconnect();
        });
    }

    onMount(async ()=>{
        console.log(data)
        commentsTree = commentListToTree(data.comments)

        getUser().then((u) => {
            console.log(u)
            if (u) {
                user = u
            }
        })


        await tick(); // 等待 DOM 更新
    
        if (articleElement) {
            const headingElements = articleElement.querySelectorAll('h2, h3');
            headings = Array.from(headingElements)
                .filter(el => !el.classList.contains('toc-exclude'))
                .map((el) => {
                    if (!el.id) {
                        el.id = el.textContent?.trim().toLowerCase().replace(/\s+/g, '-') || '';
                    }
                    return {
                        id: el.id,
                        text: el.textContent || '',
                        level: parseInt(el.tagName.charAt(1))
                    };
                })
                .filter(heading => heading.id !== '');
            
            console.log("Headings:", headings);
        } else {
            console.error("Article element not found");
        }

    });



    function smoothScroll(node: HTMLAnchorElement) {
        const handleClick = (event: MouseEvent) => {
            event.preventDefault();
            const targetId = node.getAttribute('href')?.slice(1);
            if (targetId) {
                const targetElement = document.getElementById(targetId);
                if (targetElement) {
                    targetElement.scrollIntoView({ behavior: 'smooth' });
                }
            }
        };

        node.addEventListener('click', handleClick);

        return {
            destroy() {
                node.removeEventListener('click', handleClick);
            }
        };
    }


    const  commentListToTree = (list : any[], maxDepth = 3) : Comment[] => {
        let result: Comment[] = [];

        if (!list || list.length <= 1) {
            return result;
        }

        let newList : Array<Comment>;

        try {
            newList = JSON.parse(JSON.stringify(list))
        } catch (e) {
            console.log("Error parsing comment list: ", e)
            
            return result;
        }

        console.log("newList", newList)

        const map = new Map();

        if (!newList) {
            return result;
        }

        // 为避免后续【在 map 中查找不到 parent comment】，先初始化 map
        // 另一个解决方法是【保证 list 的排序】
        newList.forEach((comment : Comment) => {
            map.set(comment.id, comment);
        });

        newList.forEach((comment : Comment) => {
            // map.set(comment.id, comment);

            if (comment.parentID) {
                // 楼中楼的评论
                const parentComment = map.get(comment.parentID);
                comment.deep = parentComment.deep + 1; // 当前深度是父级节点的深度+1

                if (comment.deep >= maxDepth) {
                    // 若当前节点的深度超过了设定的最大深度
                    // 则该节点不能挂载在其父节点了，
                    // 通过父节点的pid查找父节点挂载在哪个节点上，
                    // 该节点也挂载上面
                    const ancestorComment = map.get(parentComment.parentID);

                    comment.replyNick = parentComment.nick;
                    if (!ancestorComment.children) {
                        ancestorComment.children = [];
                    }

                    // 当前节点挂载的节点
                    comment.parentID = ancestorComment.id;
                    ancestorComment.children.push(comment);
                } else {
                    // 没有超过设定的最大深度
                    // 挂载在其父节点上
                    if (!parentComment.children) {
                        parentComment.children = [];
                    }
                    comment.parentID = parentComment.id;
                    parentComment.children.push(comment);
                }
            } else {
                comment.deep = 0;
                result.push(comment);
            }
        });
        return result;
    }

    function getFormattedDate  (ms : number)  {
        let date = new Date(ms);

        let Y = date.getFullYear() + '-';
        let M = (date.getMonth()+1 < 10 ? '0'+(date.getMonth()+1) : date.getMonth()+1) + '-';
        let D = (date.getDate() < 10 ? '0' + date.getDate() : date.getDate()) + ' ';
        let h = (date.getHours() < 10 ? '0' + date.getHours() : date.getHours()) + ':';
        let m = (date.getMinutes() < 10 ? '0' + date.getMinutes() : date.getMinutes()) + ':';
        let s = date.getSeconds() < 10 ? '0' + date.getSeconds() : date.getSeconds();
        return Y+M+D+h+m+s;
    }


    let comment_author_name : string;
    let comment_author_email : string;
    let comment_author_url : string;
    let comment_text : string;


    const sendComment = async () => {
        try {
            const res = await axios.post(API_URL + '/comments', {
                contentID: data.post.id,
                authorName: comment_author_name,
                mail: comment_author_email,
                url: comment_author_url,
                text: comment_text,
            })

            return res.data

        } catch (e) {
            showToasts  = true;
            errorMessage = e.response.status + ": " + e.response.data;
            console.log("An error occurred while posting a comment: ", e.response.status, e.response.data);

        }
    }


    const refreshComment = async () => {
        try {
            const res = await axios.get(API_URL + '/comments', {
                params: {
                    contentID: data.post.id,
                    orderBy: "created_at desc",
                    pageIndex: 1,
                    pageSize: 20
                }
            })
            commentsTree = commentListToTree(res.data.data)
            console.log("刷新评论成功", res.data)

        } catch (e) {
            console.log("An error occurred while refreshing comments: ", e)
        }


    }

    const handleCommentSubmit = async () => {
        if (await isLoggedIn()) {
            user = await getUser()
            comment_author_email = user.email;
            comment_author_name = user.name;
            comment_author_url = user.url;
        }

        const response = await sendComment();
        // 刷新评论
        await refreshComment();


    }

    

</script>

<svelte:head>
    <title>{data.post.title} - 听海</title>

</svelte:head>

<main class="flex-1 p-6 overflow-y-auto h-screen">
    <article bind:this={articleElement} class="pl-2 pr-2 mb-12 border-solid border-b border-gray-100">
        <h1 class="text-3xl font-bold mb-4">{data.post.title}</h1>

        <!-- 文章信息 BEGIN -->
        <div class="flex flex-wrap text-sm text-gray-500 space-x-4 pb-2 mt-2 mb-2 border-b border-solid border-gray-200">
            <span class="mr-4 flex items-center">
                发表于 {new Date(data.post.createdAt).toLocaleDateString()}
            </span>
            <span class="mr-4 flex items-center space-x-1">
                <Folder class="w-4 h-4 mr-1" />
                {#if data.post.category.title.length === 0}
                &nbsp;无分类
                {:else}
                    &nbsp;{data.post.category.title}
                {/if}
            </span>
            <span class="mr-4 flex items-center">
                <Tag class="w-4 h-4 mr-1" />

            </span>
            <span class="mr-4 flex items-center">
                <Message class="w-4 h-4 mr-1" />
                &nbsp;{data.post.commentsNum} 评论
            </span>
            <span class="mr-4 flex items-center">
                <i class="fas fa-file-alt mr-1"></i>

            </span>
        </div>
        <!-- 文章信息 END -->

        <div class="prose max-w-none">
            <SvelteMarkdown 
                source={data.post.text} 
                renderers={
                    {
                        image: FrontImage, 
                        heading: FrontHeading, 
                        code: CodeSnippet, 
                        codespan: CodeInline, 
                        list: List, 
                        paragraph: Paragraph}
                    }/>
        </div>

    </article>

    <section class="pl-2 pr-2 mt-6">

        <h2 class="text-2xl font-semibold mb-6 toc-exclude">评论</h2>

        {#if data.post.allowComment}
            {#if user && user.id !== 0}
                <div class="flex text-bold mb-2.5 mt-2">
                    登录身份：{user.name}. 退出 <Logout />
                </div>
            {:else}
                <form method="POST" use:enhance class="space-y-2">
                    <div class="flex space-x-4">
                        <Form.Field {form} name="username">
                            <Form.Control let:attrs>
                                <Form.Label>用户名</Form.Label>
                                <Input {...attrs} bind:value={$formData.username} />
                            </Form.Control>
                            <Form.Description>必填</Form.Description>
                            <Form.FieldErrors />
                        </Form.Field>

                        <Form.Field {form} name="email">
                            <Form.Control let:attrs>
                                <Form.Label>邮箱</Form.Label>
                                <Input {...attrs} bind:value={$formData.email} />
                            </Form.Control>
                            <Form.Description>必填</Form.Description>
                            <Form.FieldErrors />
                        </Form.Field>

                        <Form.Field {form} name="url">
                            <Form.Control let:attrs>
                                <Form.Label>网址</Form.Label>
                                <Input {...attrs} bind:value={$formData.url} />
                            </Form.Control>
                            <Form.Description>必填</Form.Description>
                            <Form.FieldErrors />
                        </Form.Field>
                    </div>

                    <Textarea placeholder="在这里输入你的评论." />


                    <Form.Button>提交评论</Form.Button>
                </form>
            {/if}

        {/if}

        <!-- 评论列表 BEGIN -->
        {#if commentsTree && commentsTree.length > 0}

            <CommentThread bind:comments={commentsTree} bind:contentID={data.post.id}></CommentThread>
        {:else}
            <div class="mt-8">
                <h3 class="text-2xl font-semibold mb-6 toc-exclude">暂无评论</h3>
            </div>
        {/if}
        <!-- 评论列表 END -->
    </section>
</main>



<aside class="w-64 p-6 bg-gray-50 border-l border-gray-100 h-screen sticky top-0 overflow-y-auto">
    <h2 class="text-lg font-semibold mb-4 toc-exclude">文章目录</h2>
    <!-- <Toc title="" /> -->
    <nav>
        <ul class="space-y-2">
            {#each headings as heading}
                <li 
                class="text-sm flex rounded-sm items-center" 
                class:bg-gray-200={$activeHeading === heading.id}
                style="margin-left: {(heading.level - 2) * 12}px">
                
                <a 
                        href="#{heading.id}" 
                        use:smoothScroll
                        class="text-gray-600  flex-grow relative z-10 block px-4 py-1.5  text-sm font-semibold text-gray-600 hover:bg-gray-200 hover:text-gray-900  rounded"
                        class:text-gray-900={$activeHeading === heading.id}
                    >
                        {heading.text}
                
                    </a>
                    
                </li>
            {/each}
        </ul>
    </nav>
</aside>



