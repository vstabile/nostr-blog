<script lang="ts">
	import session from '$lib/stores/session';
	import profile from '$lib/stores/profile';
	import * as DropdownMenu from '$lib/components/ui/dropdown-menu';
	import { nip19 } from 'nostr-tools';

	$: npub = $session?.pubkey ? nip19.npubEncode($session.pubkey) : null;

	function signIn() {
		document.dispatchEvent(new CustomEvent('nlLaunch', { detail: 'welcome' }));
	}

	function signOut() {
		document.dispatchEvent(new Event('nlLogout'));
	}
</script>

<nav class="bg-purple-600 text-white w-full flex items-center justify-between px-8 py-3 h-14">
	<a href="/" class="font-semibold">Nostr Blog</a>
	{#if $session === undefined}
		<button on:click={signIn}>Sign In</button>
	{:else}
		<DropdownMenu.Root>
			<DropdownMenu.Trigger>
				<img src={$profile?.picture} alt="Profile" class="h-8 w-8 rounded bg-white" />
			</DropdownMenu.Trigger>
			<DropdownMenu.Content>
				<DropdownMenu.Group>
					<DropdownMenu.Label>My Account</DropdownMenu.Label>
					<DropdownMenu.Separator />
					<DropdownMenu.Item>
						<a href="/profile">View Profile</a>
					</DropdownMenu.Item>
					<DropdownMenu.Item>
						<a href="/{npub}">My Blog</a>
					</DropdownMenu.Item>
					<DropdownMenu.Item on:click={signOut}>Sign Out</DropdownMenu.Item>
				</DropdownMenu.Group>
			</DropdownMenu.Content>
		</DropdownMenu.Root>
	{/if}
</nav>
