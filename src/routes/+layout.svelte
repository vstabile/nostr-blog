<script lang="ts">
	import '../app.css';
	import { onMount } from 'svelte';
	import ndk from '$lib/stores/ndk';
	import session from '$lib/stores/session';
	import Navbar from '$lib/components/Navbar.svelte';
	import { Toaster } from '$lib/components/ui/sonner';

	onMount(async () => {
		await ndk.connect(1000);

		const { init: initNostrLogin } = await import('nostr-login');

		// Nostr Login event listener
		document.addEventListener('nlAuth', (e: any) => {
			if (e.detail.type === 'login' || e.detail.type === 'signup') {
				// Initialize the user session
				session.signIn(e);
			} else {
				// Clear the user session
				session.signOut();
			}
		});

		// Initialize Nostr Login
		initNostrLogin({ noBanner: true });
	});
</script>

<div class="min-h-screen">
	<Navbar />

	<div class="h-full w-full px-8 py-6">
		<slot />
	</div>

	<Toaster />
</div>
