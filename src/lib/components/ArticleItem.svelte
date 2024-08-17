<script lang="ts">
	import session from '$lib/stores/session';
	import * as Card from '$lib/components/ui/card';
	import Button from './ui/button/button.svelte';
	import { type ArticleItem } from '$lib/queries/getArticles';

	export let article: ArticleItem;
</script>

<a href="/articles/{article.naddr}" class="text-lg">
	<Card.Root class="mb-4 overflow-hidden hover:drop-shadow-md">
		<Card.Header class="p-4 pb-1">
			<Card.Title class="flex justify-between">
				<div class="flex items-start">
					{article.title}
					<span class="text-red-500 text-xs ml-2">
						{#if article.draft}
							DRAFT
						{/if}
					</span>
				</div>
				{#if article.pubkey === $session?.pubkey}
					<Button href="/articles/{article.naddr}/edit" variant="outline" class="py-0 h-6 text-xs"
						>Edit</Button
					>
				{/if}
			</Card.Title>
		</Card.Header>
		<Card.Content class="px-4 py-0">
			{#if article.summary}
				<div class="text-sm">
					{article.summary}
				</div>
			{/if}
		</Card.Content>
		<Card.Footer class="text-xs justify-end px-4 pb-4 pt-2">
			<span class="text-gray-500">
				{#if article.published_at}
					{article.published_at.toLocaleString('en-US')}
				{/if}
			</span>
		</Card.Footer>
	</Card.Root>
</a>
