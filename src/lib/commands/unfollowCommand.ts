import ndk from '$lib/stores/ndk';
import session from '$lib/stores/session';
import follows from '$lib/stores/follows';
import { NDKEvent } from '@nostr-dev-kit/ndk';
import { nip19 } from 'nostr-tools';
import { get } from 'svelte/store';

const unfollowCommand = async (pubkey: string) => {
	const $ndk = get(ndk);
	const $session = get(session);
	const $follows = get(follows);

	// Validations
	if (!$ndk || !$session) return Promise.reject(new Error('User not connected'));
	if (!$follows.find((f) => f.pubkey === pubkey))
		return Promise.reject(new Error('You are not following this user'));

	const event = new NDKEvent($ndk, {
		kind: 3,
		content: '',
		pubkey: $session.pubkey,
		created_at: Math.floor(Date.now() / 1000),
		tags: $follows.map((f) => ['p', f.pubkey]).filter((t) => t[1] !== pubkey)
	});

	await event.publish();

	return Promise.resolve(event.encode());
};

export default unfollowCommand;
