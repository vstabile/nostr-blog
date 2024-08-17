<script lang="ts">
	import session from '$lib/stores/session';
	import * as Card from '$lib/components/ui/card';
	import Markdoc from '@markdoc/markdoc';
	import Skeleton from './ui/skeleton/skeleton.svelte';
	import { nip19 } from 'nostr-tools';
	import Button from './ui/button/button.svelte';
	import { type Article } from '$lib/queries/getArticle';

	export let article: Article;

	let npub = nip19.npubEncode(article.pubkey);

	// Parse and render the markdown content
	let ast = Markdoc.parse(article.content);
	let content = Markdoc.transform(ast);
	let html = Markdoc.renderers.html(content);
</script>

<Card.Root class="mb-4 overflow-hidden">
	<Card.Header>
		<Card.Title class="flex justify-between">
			<div class="flex items-start">
				<a href="/articles/{article.naddr}" class="text-2xl">
					{article.title}
				</a>
				{#if article.draft}
					<span class="ml-2 text-sm text-red-500">Draft</span>
				{/if}
			</div>
			{#if article.pubkey === $session?.pubkey}
				<Button href="/articles/{article.naddr}/edit" variant="outline">Edit</Button>
			{/if}
		</Card.Title>
		<a href="/{npub}" class="flex font-normal text-base items-center">
			{#if article.profile}
				{#if article.profile.image && article.profile.image !== ''}
					<img
						src={article.profile.image}
						alt="{article.profile.name} Profile"
						class="flex h-5 w-5 rounded mr-2 object-cover"
					/>
				{/if}
				<span>{article.profile.displayName || article.profile.name}</span>
			{:else}
				<Skeleton class="h-6 w-6 rounded mr-2" />
				<Skeleton class="h-6 w-52 rounded" />
			{/if}
		</a>
		{#if article.published_at}
			<Card.Description class="text-xs">
				{article.published_at.toLocaleString('en-US')}
			</Card.Description>
		{/if}
	</Card.Header>
	<Card.Content>
		{#if article.summary}
			<div class="mb-4">
				<span class="font-semibold">TLDR;</span>
				{article.summary}
			</div>
		{/if}
		<div class="markdown">
			{@html html}
		</div>
	</Card.Content>
</Card.Root>
