import ndk from '$lib/stores/ndk';
import session from '$lib/stores/session';
import follows from '$lib/stores/follows';
import { NDKEvent } from '@nostr-dev-kit/ndk';
import { nip19 } from 'nostr-tools';
import { get } from 'svelte/store';

const followCommand = async (npub: string) => {
	const $ndk = get(ndk);
	const $session = get(session);
	const $follows = get(follows);

	if (!$ndk || !$session) return Promise.reject(new Error('User not connected'));

	let valid = false;
	let pubkey = '';
	try {
		const result = nip19.decode(npub);
		valid = result.type === 'npub';
		pubkey = result.data as string;
	} catch (e) {
		valid = false;
	}

	// Validations
	if (!valid) return Promise.reject(new Error('Npub is not valid'));
	if ($follows.find((f) => f.pubkey === pubkey))
		return Promise.reject(new Error('Already following'));

	const event = new NDKEvent($ndk, {
		kind: 3,
		content: '',
		pubkey: $session.pubkey,
		created_at: Math.floor(Date.now() / 1000),
		tags: [...$follows.map((f) => ['p', f.pubkey]), ['p', pubkey]]
	});

	await event.publish();

	return Promise.resolve(event.encode());
};

export default followCommand;
