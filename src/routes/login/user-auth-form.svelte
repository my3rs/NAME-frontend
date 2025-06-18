<script lang="ts">
    import  Github  from "lucide-svelte/icons/github";
    import Spinner from "lucide-svelte/icons/loader";
	import { Button } from "$lib/components/ui/button/index.js";
	import { Input } from "$lib/components/ui/input/index.js";
	import { Label } from "$lib/components/ui/label/index.js";
	import { cn } from "$lib/utils.js";
    import { login } from "$lib/stores/auth";
    import { goto } from "$app/navigation";

	let className: string | undefined | null = undefined;
	export { className as class };

	let username = "";
	let password = "";

	let isLoading = false;
	let errorMessage = "";

	async function onSubmit() {
		isLoading = true;
		errorMessage = "";

		try {
			const result = await login(username, password);
			if (result.success) {
				console.log("登录成功");
				goto("/admin");
			} else {
				errorMessage = result.message || "登录失败：" + result.message;
				console.error("登录失败:", result.message);
			}
		} catch (error) {
			errorMessage = "登录时发生错误，请稍后重试";
			console.error("登录错误:", error);
		} finally {
			isLoading = false;
		}
	}
</script>

<div class={cn("grid gap-6", className)} {...$$restProps}>
	<form on:submit|preventDefault={onSubmit}>
		<div class="grid gap-2">
			<div class="grid gap-1">
				<Label class="sr-only" for="email">用户名</Label>
				<Input
					bind:value={username}
					id="username"
					placeholder="用户名"
					autocapitalize="none"
					autocorrect="off"
					disabled={isLoading}
				/>
			</div>

			<div class="grid gap-1">
				<Label class="sr-only" for="email">密码</Label>
				<Input
					bind:value={password}
					id="password"
					placeholder="密码"
					type="password"
					autocorrect="off"
					disabled={isLoading}
				/>
			</div>

			<Button type="submit" disabled={isLoading}>
				{#if isLoading}
					<Spinner class="mr-2 h-4 w-4 animate-spin" />
				{/if}
				登录
			</Button>
			{#if errorMessage}
				<div class="text-sm text-red-500 mt-2">{errorMessage}</div>
			{/if}
		</div>
	</form>
	<div class="relative">
		<div class="absolute inset-0 flex items-center">
			<span class="w-full border-t" />
		</div>
		<div class="relative flex justify-center text-xs uppercase">
			<span class="bg-background text-muted-foreground px-2"> 或者使用第三方登录 </span>
		</div>
	</div>
	<Button variant="outline" type="button" disabled={isLoading}>
		{#if isLoading}
			<Spinner class="mr-2 h-4 w-4 animate-spin" />
		{:else}
			<Github class="mr-2 h-4 w-4" />
		{/if}
		GitHub
	</Button>
</div>