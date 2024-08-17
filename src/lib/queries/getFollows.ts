import { get, writable } from 'svelte/store';
import ndk from '$lib/stores/ndk';
import { nip19 } from 'nostr-tools';
import type { NDKEvent, NDKSubscription } from '@nostr-dev-kit/ndk';

export type Follow = {
	pubkey: string;
	npub: string;
};

let subscription: NDKSubscription | undefined;

export default function getFollows(pubkey: string) {
	const { subscribe, set } = writable<Follow[] | []>([]);

	const $ndk = get(ndk)!;

	if (subscription) subscription.stop();

	console.log('pubkey', pubkey);

	subscription = $ndk.subscribe(
		{
			authors: [pubkey],
			kinds: [3]
		},
		{ groupable: false }
	);

	const receivedEvents: Map<string, NDKEvent> = new Map();

	subscription.on('event', (e) => {
		const dedupKey = e.deduplicationKey();
		const existingEvent = receivedEvents.get(dedupKey);
		if (!e.created_at || (existingEvent && e.created_at < existingEvent.created_at!)) {
			return;
		}

		receivedEvents.set(dedupKey, e);

		const follows = e.tags
			.filter((t) => t[0] === 'p')
			.map((t) => ({
				pubkey: t[1],
				npub: nip19.npubEncode(t[1])
			}));

		set(follows);
	});

	return {
		subscribe
	};
}
