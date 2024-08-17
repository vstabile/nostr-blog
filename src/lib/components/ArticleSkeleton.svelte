<script lang="ts">
	import * as Card from '$lib/components/ui/card';
	import Skeleton from './ui/skeleton/skeleton.svelte';
</script>

<Card.Root class="mb-4 overflow-hidden">
	<Card.Header>
		<Card.Title>
			<Skeleton class="h-8 w-72" />
		</Card.Title>
		<span class="flex font-normal text-base items-center">
			<Skeleton class="flex h-5 w-5 rounded mr-2" />
			<Skeleton class="h-5 w-32 rounded" />
		</span>
		<Card.Description class="text-xs"><Skeleton class="h-3 w-32" /></Card.Description>
	</Card.Header>
	<Card.Content>
		<Skeleton class="h-96 w-4/5" />
	</Card.Content>
</Card.Root>
