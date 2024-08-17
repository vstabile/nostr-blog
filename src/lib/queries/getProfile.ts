import { get, writable } from 'svelte/store';
import ndk from '$lib/stores/ndk';
import { type NDKEvent, type NDKSubscription } from '@nostr-dev-kit/ndk';

export type Profile = {
	pubkey: string;
	name?: string;
	about?: string;
	picture?: string;
};

let subscription: NDKSubscription | undefined;

export default function getProfile(pubkey: string) {
	const { subscribe, set, update } = writable<Profile | null>(null);

	const $ndk = get(ndk)!;
	const placeholderPicture = `https://robohash.org/${pubkey}.png?set=set1&size=96x96`;

	set({
		pubkey,
		picture: placeholderPicture
	});

	if (subscription) subscription.stop();

	subscription = $ndk.subscribe(
		{
			authors: [pubkey],
			kinds: [0]
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

		const content = JSON.parse(e.content);

		set({
			pubkey,
			name: content.name,
			about: content.about,
			picture: content.picture ?? placeholderPicture
		});
	});

	return {
		subscribe
	};
}
