<script lang="ts">
    import { browser } from "$app/environment";
    import type {Comment} from "$lib/model";
    import {sha256}  from "js-sha256";
    import { axiosInstance } from "$lib/stores/auth";
    import { getUser } from "$lib/stores/auth";
    import {API_URL} from "$lib/params/base";
    import {isLoggedIn} from "axios-jwt";
    import { ReplyForm } from "$lib/components/ui/custom";
    import type {User} from "$lib/model";
    import {onMount} from "svelte";
    import {getFormattedDate} from "$lib/api";
    import Logout from "lucide-svelte/icons/log-out";
    import { Input } from "$lib/components/ui/input";
    import { Textarea } from "$lib/components/ui/textarea";
    import { Button } from "$lib/components/ui/button";

    let user : User
    let loggedIn = false;
    export let comments : Comment[] = [];

    let replyID : number | undefined;

    const toggleReplyForm = (e : Event) => {
        if (browser) {
            let ReplyForm = document.getElementById(e.target.getAttribute('data-target'))
            ReplyForm.classList.toggle("d-none");
        }
    };

    let replyText : string = ""
    export let contentID : number = 0
    let comment_author_name : string = ""
    let comment_author_email : string = ""
    let comment_author_url : string = ""
    let comment_text : string = ""



    const handleReplySubmit = async (parentID: number) => {
        if (await isLoggedIn()) {

            axiosInstance.post(API_URL + '/comments', {
                contentID: contentID,
                authorID: userid,
                mail: "",
                url: "",
                text: replyText,
                parentID: 0,
            })
        } else {

        }
    }

    const replyComment = async (parentID: number) =>  {
        try {
            let response
            // 已经登录
            if (user && user.id !== 0) {
                response = await axiosInstance.post(API_URL + '/comments', {
                    contentID: contentID,
                    authorID: user.id,
                    text: replyText,
                    parentID: parentID,
                })
            }
            // 没有登录
            else {
                response = await axiosInstance.post(API_URL + '/comments', {
                    contentID: contentID,
                    authorName: user.username,
                    mail: user.email,
                    url: user.url,
                    text: replyText,
                    parentID: parentID,
                })
            }




            if (response.status === 200) {
                console.log("succeed to reply")
            } else {
                console.log("failed to reply")
            }


        } catch (e) {
            console.log("failed to reply: ", e)
        }

    }

    onMount(async ()=>{
        getUser().then((u) => {
            console.log(u)
            if (u) {
                user = u
            }
        })
        loggedIn = await isLoggedIn();
    })

</script>

{#if comments}

    <!-- 最外层评论 -->
    {#each comments as comment}
        <div class="p-4 mb-4 border-b border-solid border-gray-200" >
            <div id="comment-{comment.id}" class="" >

                <div class="flex">
                    <!-- 左侧头像和回复按钮 -->
                    <div class="grid">
                        <div class="flex-shrink-0">
                            <img class="h-10 w-10 rounded-full" src="https://gravatar.com/avatar/{sha256(comment.mail)}" alt="">
                        </div>
                        <div class="text-sm text-center mt-2 font-medium text-gray-900 ">
                            <button on:click={()=>{ replyID = replyID === comment.id ? undefined : comment.id }}>回复</button>
                        </div>
                    </div>

                    <!-- 左侧元信息和评论内容 -->
                    <div id="comment-content-{comment.id}" class="grid ml-4">
                        <div class="text-sm text-dark font-bold text-gray-900">
                            {comment.authorName}
                        </div>
                        <div class="text-sm text-gray-500">
                            {getFormattedDate(comment.createdAt)}
                        </div>

                        <div class="text-lg mt-1">
                            {comment.text}
                        </div>
                    </div>


                </div>
            </div>


            <!-- 回复第一层评论 -->
            {#if replyID === comment.id}
            <div id="reply-form-to-{comment.id}" class="grid mt-4 ml-14  border-solid border-t border-gray-200">
                <h4 class="mb-2 mt-2">回复 {comment.authorName}：</h4>
                {#if loggedIn}
                    {#if user && user.id !== 0}
                    <div class="flex text-bold mb-2.5 mt-2">
                        登录身份：{user.name}. 退出 <Logout />
                    </div>
                    {:else}
                        <div class="flex">
                            <div class="mr-1 w-1/3">
                                <Input bind:value={comment_author_name} labelText="昵称" placeholder="请输入昵称（必填）" />
                            </div>
                            <div class="mr-1 w-1/3">
                                <Input bind:value={comment_author_email} labelText="邮箱" placeholder="请输入邮箱（必填）" />
                            </div>
                            <div class="w-1/3">
                                <Input bind:value={comment_author_url} labelText="网址" placeholder="请输入网址" />
                            </div>
                        </div>
                    {/if}
                {:else}
                    <div class="flex">
                        <Input bind:value={comment_author_name} placeholder="昵称（必填）" />
                    </div>
                {/if}
                <Textarea bind:value={replyText} placeholder="在这里输入你的评论..." rows={5} />
                <div class="mt-2 text-end">
                    <Button  on:click={()=>{replyID = undefined}}>取消</Button>
                    <Button>提交评论</Button>
                </div>

            </div>
            {/if}
            <!-- 回复第一层评论 END -->

            <!-- 2层评论 -->
            {#if comment.children}
                {#each comment.children as comment2}
                    <div class="w-full mt-4 ml-14">
                        <div id="comment-{comment2.id}" class="" >

                            <div class="flex">
                                <!-- 左侧头像和回复按钮 -->
                                <div class="grid">
                                    <div class="flex-shrink-0">
                                        <img class="h-10 w-10 rounded-full" src="https://gravatar.com/avatar/{sha256(comment2.mail)}" alt="">
                                    </div>
                                    <div class="text-sm text-center mt-2 font-medium text-gray-900 ">
                                        <button on:click={()=>{replyID = replyID === comment2.id ? undefined : comment2.id }}>回复</button>

                                    </div>
                                </div>

                                <!-- 左侧元信息和评论内容 -->
                                <div id="comment-content-{comment2.id}" class="grid ml-4">
                                    <div class="text-sm text-dark font-bold text-gray-900">
                                        {comment2.authorName}
                                    </div>
                                    <div class="text-sm text-gray-500">
                                        {getFormattedDate(comment2.createdAt)}
                                    </div>

                                    <div class="text-lg mt-1">
                                        {comment2.text}
                                    </div>
                                </div>
                            </div>
                        </div>

                        <!-- 回复第二层评论 -->
                        {#if replyID === comment2.id}
                            <div id="reply-form-to-{comment2.id}" class="grid mt-4 ml-14  border-solid border-t border-gray-200">
                                <h4 class="mb-2 mt-2">回复 {comment2.authorName}：</h4>
                                {#if loggedIn}
                                    <div class="flex text-bold mb-2.5 mt-2">
                                        登录身份：{user.name}. 退出 <Logout />
                                    </div>
                                {:else}
                                    <div class="flex">
                                        <Input bind:value={comment_author_name} placeholder="昵称（必填）" />
                                    </div>
                                {/if}
                                <Textarea bind:value={replyText} placeholder="在这里输入你的评论..." rows={5} />
                                <div class="mt-2 text-end">
                                    <Button  on:click={()=>{replyID = undefined}}>取消</Button>
                                    <Button>提交评论</Button>
                                </div>

                            </div>
                        {/if}
                        <!-- 回复第二层评论 END -->

                        <!-- 三层评论 -->
                        {#if comment2.children}
                            {#each comment2.children as comment3}

                                <div class="w-full mt-4 ml-14" >
                                    <div id="comment-{comment3.id}" class="" >
                                        <div class="flex">
                                            <!-- 左侧头像和回复按钮 -->
                                            <div class="grid">
                                                <div class="flex-shrink-0">
                                                    <img class="h-10 w-10 rounded-full" src="https://gravatar.com/avatar/{sha256(comment3.mail)}" alt="">
                                                </div>
                                                <div class="text-sm text-center mt-2 font-medium text-gray-900 ">
                                                    <button on:click={()=>{replyID = replyID === comment3.id ? undefined : comment3.id }}>回复</button>

                                                </div>
                                            </div>

                                            <!-- 左侧元信息和评论内容 -->
                                            <div id="comment-content-{comment3.id}" class="grid ml-4">
                                                <div class="text-sm text-dark font-bold text-gray-900">
                                                    {comment3.authorName}
                                                </div>
                                                <div class="text-sm text-gray-500">
                                                    {getFormattedDate(comment3.createdAt)}
                                                </div>

                                                <div class="text-lg mt-1">
                                                    {comment3.text}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <!-- 回复第三层评论 -->
                                {#if replyID === comment3.id}
                                    <div id="reply-form-to-{comment3.id}" class="grid mt-4 ml-14  border-solid border-t border-gray-200">
                                        <h4 class="mb-2 mt-2">回复 {comment3.authorName}：</h4>
                                        {#if loggedIn}
                                            <div class="flex text-bold mb-2.5 mt-2">
                                                登录身份：{user.name}. 退出 <Logout />
                                            </div>
                                        {:else}
                                            <div class="flex">
                                                <Input bind:value={comment_author_name} placeholder="昵称（必填）" />
                                            </div>
                                        {/if}
                                        <Textarea bind:value={replyText} placeholder="在这里输入你的评论..." rows={5} />
                                        <div class="mt-2 text-end">
                                            <Button  on:click={()=>{replyID = undefined}}>取消</Button>
                                            <Button>提交评论</Button>
                                        </div>

                                    </div>
                                {/if}
                                <!-- 回复第三层评论 END -->

                            {/each}
                        {/if}
                        <!-- 三层评论 END -->

                    </div>
                {/each}
            {/if}

            <!-- 2层评论 END -->

        </div>





    {/each}


    <!-- 最外层评论 END -->

{/if}