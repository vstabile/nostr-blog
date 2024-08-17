<script lang="ts">
	import { page } from '$app/stores';
	import { browser } from '$app/environment';
	import { Textarea } from '$lib/components/ui/textarea';
	import { Button } from '$lib/components/ui/button';
	import { nip19 } from 'nostr-tools';
	import ndk from '$lib/stores/ndk';
	import session from '$lib/stores/session';
	import { goto } from '$app/navigation';
	import { toast } from 'svelte-sonner';
	import saveDraftCommand from '$lib/commands/saveDraftCommand';
	import publishArticleCommand from '$lib/commands/publishArticleCommand';
	import unpublishArticleCommand from '$lib/commands/unpublishArticleCommand';
	import deleteArticleCommand from '$lib/commands/deleteArticleCommand';
	import Input from '$lib/components/ui/input/input.svelte';
	import Label from '$lib/components/ui/label/label.svelte';
	import FormSkeleton from '$lib/components/FormSkeleton.svelte';
	import getArticle, { type Article } from '$lib/queries/getArticle';
	import { onDestroy } from 'svelte';

	let article: Article | null;
	let form: { title?: string; summary?: string; content?: string };

	let unsubscribe: any;

	$: naddr = $page.params.naddr;
	$: pointer = naddr ? (nip19.decode(naddr).data as nip19.AddressPointer) : null;
	$: if (browser && $session && pointer && pointer.pubkey !== $session?.pubkey) {
		toast.error('Only the author can edit this article');
		goto(`/articles/${naddr}`);
	}

	// Subscribe to the getArticle query
	$: if (naddr && $ndk) {
		if (unsubscribe) unsubscribe();

		const { subscribe } = getArticle(naddr);

		unsubscribe = subscribe((a: Article | null) => {
			article = a;
			form = { title: a?.title, summary: a?.summary, content: a?.content };
		});
	}

	onDestroy(() => {
		if (unsubscribe) unsubscribe();
	});

	async function saveDraft() {
		await saveDraftCommand(form, naddr)
			.then(() => {
				toast.success('Article saved as draft');
			})
			.catch((error) => {
				toast.error(error.message);
			});
	}

	async function publishArticle() {
		await publishArticleCommand(form, naddr)
			.then(() => {
				toast.success('Article was saved!');
			})
			.catch((error) => {
				toast.error(error.message);
			});
	}

	async function unpublishArticle() {
		await unpublishArticleCommand(form, naddr)
			.then(() => {
				toast.success('Article was unpublished.');
			})
			.catch((error) => {
				toast.error(error.message);
			});
	}

	async function deleteArticle() {
		await deleteArticleCommand(naddr)
			.then((naddr) => {
				toast.success('Article was deleted.');
				goto(`/`);
			})
			.catch((error) => {
				toast.error(error.message);
			});
	}

	function handleInput(event: any) {
		console.log(event);
		form = { ...form, [event.target.name]: event.target.value };
	}
</script>

<div class="flex w-full justify-center">
	<div class="flex flex-col w-full max-w-[800px]">
		<h1 class="flex w-full font-semibold text-2xl mb-6">
			Edit
			{#if article?.draft === true}
				Draft
			{:else if article?.draft === false}
				Article
			{/if}
		</h1>

		<div class="flex flex-col mb-4 w-full">
			{#if article}
				<Label for="title" class="mb-1">Title</Label>
				<Input name="title" value={article.title} class="mb-2" on:input={handleInput} />
				<Label for="summary" class="mb-1">Summary</Label>
				<Input name="summary" value={article.summary} class="mb-2" on:input={handleInput} />
				<Label for="content" class="mb-1">Content</Label>
				<Textarea name="content" value={article.content} class="h-96" on:input={handleInput} />
			{:else}
				<FormSkeleton />
			{/if}
		</div>

		{#if article}
			<div class="flex justify-end w-full">
				<Button variant="outline" href="/articles/{naddr}" class="mr-2">View</Button>
				{#if article.draft}
					<Button variant="outline" on:click={saveDraft} class="mr-2">Save Draft</Button>
				{:else}
					<Button variant="outline" on:click={unpublishArticle} class="mr-2">Unpublish</Button>
				{/if}
				<Button on:click={publishArticle} class="mr-2">
					{#if article.draft}
						Publish
					{:else}
						Save
					{/if}
				</Button>
				<Button variant="destructive" on:click={deleteArticle}>Delete</Button>
			</div>
		{/if}
	</div>
</div>
