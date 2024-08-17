<script lang="ts">
	import { Textarea } from '$lib/components/ui/textarea';
	import { Button } from '$lib/components/ui/button';
	import saveDraftCommand from '$lib/commands/saveDraftCommand';
	import { toast } from 'svelte-sonner';
	import { goto } from '$app/navigation';
	import Label from '$lib/components/ui/label/label.svelte';
	import Input from '$lib/components/ui/input/input.svelte';
	import publishArticleCommand from '$lib/commands/publishArticleCommand';

	let article = {
		title: '',
		summary: '',
		content: ''
	};

	async function saveDraft() {
		await saveDraftCommand(article)
			.then((naddr) => {
				toast.success('Article saved as draft');
				goto(`/articles/${naddr}/edit`);
			})
			.catch((error) => {
				toast.error(error.message);
			});
	}

	async function publishArticle() {
		await publishArticleCommand(article)
			.then((naddr) => {
				toast.success('Article was published!');
				goto(`/articles/${naddr}`);
			})
			.catch((error) => {
				toast.error(error.message);
			});
	}
</script>

<div class="flex w-full justify-center">
	<div class="flex flex-col w-full max-w-[800px]">
		<h1 class="flex w-full font-semibold text-2xl mb-6">New Article</h1>

		<div class="flex flex-col mb-4 w-full">
			<Label for="title" class="mb-1">Title</Label>
			<Input bind:value={article.title} class="mb-2" />
			<Label for="summary" class="mb-1">Summary</Label>
			<Input bind:value={article.summary} class="mb-2" />
			<Label for="content" class="mb-1">Content</Label>
			<Textarea bind:value={article.content} class="h-96" />
		</div>

		<div class="flex justify-end">
			<Button variant="outline" on:click={saveDraft} class="mr-2">Save Draft</Button>
			<Button on:click={publishArticle}>Publish</Button>
		</div>
	</div>
</div>
