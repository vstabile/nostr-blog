import ndk from '$lib/stores/ndk';
import session from '$lib/stores/session';
import { NDKEvent } from '@nostr-dev-kit/ndk';
import { nip19 } from 'nostr-tools';
import { get } from 'svelte/store';

const deleteArticleCommand = async (naddr: string) => {
	const $ndk = get(ndk);
	const $session = get(session);

	// Validations
	if (!$ndk || !$session) return Promise.reject(new Error('User not connected'));

	const pointer = nip19.decode(naddr).data as nip19.AddressPointer;

	const event = new NDKEvent($ndk, {
		kind: 5,
		content: '',
		pubkey: $session.pubkey,
		created_at: Math.floor(Date.now() / 1000),
		tags: [
			['a', `30024:${pointer.pubkey}:${pointer.identifier}`],
			['a', `30023:${pointer.pubkey}:${pointer.identifier}`]
		]
	});

	await event.publish();

	return Promise.resolve(event.encode());
};

export default deleteArticleCommand;
