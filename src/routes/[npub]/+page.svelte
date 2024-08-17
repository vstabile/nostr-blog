<script lang="ts">
	import { page } from '$app/stores';
	import ndk from '$lib/stores/ndk';
	import session from '$lib/stores/session';
	import { nip19 } from 'nostr-tools';
	import Skeleton from '$lib/components/ui/skeleton/skeleton.svelte';
	import getArticles, { type ArticleItem as ArticleItemType } from '$lib/queries/getArticles';
	import getProfile, { type Profile } from '$lib/queries/getProfile';
	import ArticleItem from '$lib/components/ArticleItem.svelte';
	import ArticleItemSkeleton from '$lib/components/ArticleItemSkeleton.svelte';
	import Button from '$lib/components/ui/button/button.svelte';
	import { onDestroy } from 'svelte';

	let profile: Profile | null;
	let articles: ArticleItemType[] = [];

	let unsubscribeArticles: any;
	let unsubscribeProfile: any;

	// Get author npub from the url
	$: npub = $page.params.npub;
	// Decode the npub into a hex pubkey
	$: pubkey = nip19.decode(npub).data as string;

	// Subscribe to the getArticles query
	$: if (pubkey && $ndk) {
		if (unsubscribeArticles) unsubscribeArticles();
		if (unsubscribeProfile) unsubscribeProfile();

		const articlesQuery = getArticles(pubkey);
		const profileQuery = getProfile(pubkey);

		unsubscribeArticles = articlesQuery.subscribe((a: ArticleItemType[]) => {
			articles = a.filter((a) => !a.draft);
		});

		unsubscribeProfile = profileQuery.subscribe((p: Profile | null) => {
			profile = p;
		});
	}

	onDestroy(() => {
		if (unsubscribeArticles) unsubscribeArticles();
		if (unsubscribeProfile) unsubscribeProfile();
	});
</script>

<div class="flex justify-between">
	<h1 class="flex font-semibold text-2xl mb-6 items-center">
		{#if profile}
			<img
				src={profile.picture}
				alt="{profile.name} Profile"
				class="flex h-8 w-8 rounded-full mr-3 object-cover"
			/>
			{#if profile.name}
				<span>{profile.name}</span>
			{:else}
				<span class="text-base">{profile.pubkey}</span>
			{/if}
		{:else}
			<Skeleton class="flex h-8 w-8 rounded-full mr-3 object-cover" />
			<Skeleton class="h-8 w-52 rounded" />
		{/if}
	</h1>

	{#if $session && pubkey === $session?.pubkey}
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
