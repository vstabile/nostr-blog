<script lang="ts">
	import * as Card from '$lib/components/ui/card';
	import Skeleton from './ui/skeleton/skeleton.svelte';
</script>

<Card.Root class="mb-4 overflow-hidden">
	<Card.Header class="p-4 pb-2">
		<Card.Title class="flex justify-between">
			<div class="flex items-start">
				<Skeleton class="h-6 w-64" />
			</div>
		</Card.Title>
	</Card.Header>
	<Card.Content class="px-4 py-0">
		<div class="text-sm">
			<Skeleton class="h-5 w-96" />
		</div>
	</Card.Content>
	<Card.Footer class="text-xs justify-end px-4 pb-4">
		<Skeleton class="h-4 w-72" />
	</Card.Footer>
</Card.Root>
