<script lang="ts">
	import Skeleton from './ui/skeleton/skeleton.svelte';
	import Label from './ui/label/label.svelte';
</script>

<Label for="title">Title</Label>
<Skeleton class="mb-2 h-8 w-full" />
<Label for="summary">Summary</Label>
<Skeleton class="mb-2 h-8 w-full" />
<Label for="content">Content</Label>
<Skeleton class="mb-2 h-96 w-full" />
