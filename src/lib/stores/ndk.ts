import NDK from '@nostr-dev-kit/ndk';
// import NDKCacheAdapterDexie from '@nostr-dev-kit/ndk-cache-dexie';
import { writable } from 'svelte/store';
import { PUBLIC_RELAYS } from '$env/static/public';

function createNDKStore() {
	const { subscribe, set } = writable<NDK | undefined>(undefined);

	// const dexieAdapter = new NDKCacheAdapterDexie({ dbName: 'nostr-blog' });

	const ndk = new NDK({
		explicitRelayUrls: PUBLIC_RELAYS.split(',')
		// cacheAdapter: dexieAdapter
	});

	// Avoid validating every single event
	ndk.initialValidationRatio = 0.3;
	ndk.lowestValidationRatio = 0.05;

	return {
		subscribe,
		connect: async (timeout?: number) => {
			return (
				ndk
					.connect(timeout)
					// Give the relays some time to connect
					.then(() => new Promise((resolve) => setTimeout(resolve, 1000)))
					.then(() => set(ndk))
			);
		}
	};
}

const ndk = createNDKStore();

export default ndk;
