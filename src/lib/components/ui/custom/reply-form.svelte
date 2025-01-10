<script lang="ts">
    import type { Comment, User } from '$lib/model';
    import {browser} from "$app/environment";
    import {isLoggedIn} from "axios-jwt";
    import {axiosInstance} from "$lib/api";
    import {API_URL} from "$lib/params/base";
    import {getUser} from "$lib/login";
    import {onMount} from "svelte";

    export let parentID: number
    export let contentID: number
    let replyText: string
    let user : User
    let loggedIn = isLoggedIn()

    onMount(()=>{
        getUser().then((u) => {
            if (u) {
                user = u
            }
        })
    })



    const toggleReplyForm = (e : Event) => {
        if (browser) {
            let ReplyForm = document.getElementById(e.target.getAttribute('data-target'))
            ReplyForm.classList.toggle("d-none");
        }
    }

    const replyComment = async (parentID: number) =>  {
        try {
            let response
            getUser().then(async (user) => {
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
                        authorName: user.name,
                        mail: user.mail,
                        url: user.url,
                        text: replyText,
                        parentID: parentID,
                    })
                }
            })



            if (response.status === 200) {
                console.log("succeed to reply")
            } else {
                console.log("failed to reply")
            }


        } catch (e) {
            console.log("failed to reply: ", e)
        }

    }


</script>

<form method="POST" class="reply-form d-none" id="comment-{parentID}-reply-form">
    <div class="pure-g">
        <div class="pure-u-1 pure-u-md-1-3">
            <input bind:value={user.name} type="text" id="name" class="pure-u-23-24" required placeholder="称呼（必填）" />
        </div>

        <div class="pure-u-1 pure-u-md-1-3">
            <input bind:value={user.mail} type="email" id="email" class="pure-u-23-24" required placeholder="电子邮箱（必填）" />
        </div>
        <div class="pure-u-1 pure-u-md-1-3">
            <input bind:value={user.url} type="text" id="url" class="pure-u-23-24" placeholder="网站（选填）" />
        </div>
    </div>

    <textarea bind:value={replyText} placeholder="在这里输入你的回复..." rows="4"></textarea>
    <button on:click={replyComment(parentID)} type="button">提交</button>
    <button type="button" data-toggle="reply-form" data-target="comment-{parentID}-reply-form" on:click={toggleReplyForm}>取消</button>
</form>