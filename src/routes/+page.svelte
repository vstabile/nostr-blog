<script lang="ts">
	import ndk from '$lib/stores/ndk';
	import session from '$lib/stores/session';
	import getArticles, { type ArticleItem as ArticleItemType } from '$lib/queries/getArticles';
	import ArticleItem from '$lib/components/ArticleItem.svelte';
	import ArticleItemSkeleton from '$lib/components/ArticleItemSkeleton.svelte';
	import Button from '$lib/components/ui/button/button.svelte';
	import { onDestroy } from 'svelte';

	let articles: ArticleItemType[] = [];
	let unsubscribe: any;

	$: pubkey = $session?.pubkey;

	// Subscribe to the getArticles query
	$: if (pubkey && $ndk) {
		if (unsubscribe) unsubscribe();

		const { subscribe } = getArticles(pubkey);

		unsubscribe = subscribe((aa: ArticleItemType[]) => {
			articles = aa;
		});
	}

	function signIn() {
		document.dispatchEvent(new CustomEvent('nlLaunch', { detail: 'welcome' }));
	}

	function signUp() {
		session.signUp();
	}

	onDestroy(() => {
		if (unsubscribe) unsubscribe();
	});
</script>

{#if $session}
	<div class="flex justify-between">
		<h1 class="flex font-semibold text-2xl mb-6">My Articles</h1>

		{#if pubkey}
			<Button class="" href="/articles/new">New Article</Button>
		{/if}
	</div>

	{#if articles.length === 0}
		<ArticleItemSkeleton />
	{:else}
		{#each articles as article}
			<ArticleItem {article} />
		{/each}
	{/if}
{:else}
	<div class="text-center">
		<h1 class="text-5xl font-bold mb-4 mt-32 text-purple-900">Welcome to Nostr Blog</h1>
		<p class="text-xl">
			<button on:click={signIn} class="underline">Sign in</button> or
			<button on:click={signUp} class="underline">sign up</button> and start blogging!
		</p>
	</div>
{/if}
