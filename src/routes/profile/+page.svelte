<script lang="ts">
	import { get } from 'svelte/store';
	import { browser } from '$app/environment';
	import { goto } from '$app/navigation';
	import session from '$lib/stores/session';
	import profile from '$lib/stores/profile';
	import follows from '$lib/stores/follows';
	import { Input } from '$lib/components/ui/input';
	import Button from '$lib/components/ui/button/button.svelte';
	import Label from '$lib/components/ui/label/label.svelte';
	import { toast } from 'svelte-sonner';
	import updateProfileCommand from '$lib/commands/updateProfileCommand';
	import followCommand from '$lib/commands/followCommand';
	import unfollowCommand from '$lib/commands/unfollowCommand';
	import { nip19 } from 'nostr-tools';

	// Redirect to home if not logged in
	$: if (browser && $session === undefined) goto('/');

	const myProfile = get(profile);

	let npub = $session?.pubkey ? nip19.npubEncode($session.pubkey) : null;
	let name = myProfile?.name;
	let about = myProfile?.about;
	let picture = myProfile?.picture;
	let followNpub: string = '';

	async function updateProfile() {
		await updateProfileCommand({ name, about, picture })
			.then(() => {
				toast.success('Profile was updated!');
			})
			.catch((error) => {
				toast.error(error.message);
			});
	}

	async function follow() {
		await followCommand(followNpub)
			.then(() => {
				toast.success(`Following ${followNpub}`);
			})
			.catch((error) => {
				toast.error(error.message);
			});
	}

	async function unfollow(pubkey: string) {
		await unfollowCommand(pubkey)
			.then(() => {
				toast.success(`${nip19.npubEncode(pubkey)} unfollowed`);
			})
			.catch((error) => {
				toast.error(error.message);
			});
	}
</script>

<div class="text-sm mb-4">
	<span class="font-semibold">npub:</span> <span>{npub}</span>
</div>

<div class="flex flex-row">
	<img src={$profile?.picture} alt="Profile" class="rounded-lg h-64 mr-4" />
	<div class="flex flex-col w-72 h-64 justify-between">
		<Label for="name">Name</Label>
		<Input id="name" bind:value={name} />
		<Label for="about">About</Label>
		<Input id="about" bind:value={about} />
		<Label for="picture">Picture</Label>
		<Input id="picture" bind:value={picture} />
		<Button on:click={updateProfile}>Save</Button>
	</div>
</div>

<div class="flex flex-col mt-8">
	<div class="flex w-[560px]">
		<Input id="follow" bind:value={followNpub} class="mr-2" />
		<Button on:click={follow}>Follow</Button>
	</div>

	{#if $follows.length > 0}
		<div class="flex flex-col">
			<span class="flex font-semibold mt-6 mb-4">Following:</span>
			<div class="flex flex-col text-sm">
				{#each $follows as follow}
					<div class="flex justify-between w-[600px]">
						<a href="/{follow.npub}" target="_blank" class="flex">{follow.npub}</a>
						<button on:click={() => unfollow(follow.pubkey)} class="flex text-blue-500"
							>unfollow</button
						>
					</div>
				{/each}
			</div>
		</div>
	{/if}
</div>
