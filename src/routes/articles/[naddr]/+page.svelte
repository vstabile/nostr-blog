<script lang="ts">
	import { page } from '$app/stores';
	import ndk from '$lib/stores/ndk';
	import Article from '$lib/components/Article.svelte';
	import ArticleSkeleton from '$lib/components/ArticleSkeleton.svelte';
	import getArticle, { type Article as ArticleType } from '$lib/queries/getArticle';
	import { onDestroy } from 'svelte';

	let article: ArticleType | null;

	let unsubscribe: any;

	$: naddr = $page.params.naddr;

	// Subscribe to the getArticle query
	$: if (naddr && $ndk) {
		if (unsubscribe) unsubscribe();

		const { subscribe } = getArticle(naddr);

		unsubscribe = subscribe((a: ArticleType | null) => {
			article = a;
		});
	}

	onDestroy(() => {
		if (unsubscribe) unsubscribe();
	});
</script>

{#if article}
	<Article {article} />
{:else}
	<ArticleSkeleton />
{/if}
