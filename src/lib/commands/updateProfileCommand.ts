import ndk from '$lib/stores/ndk';
import session from '$lib/stores/session';
import { NDKEvent } from '@nostr-dev-kit/ndk';
import { get } from 'svelte/store';

const updateProfileCommand = async (profile: {
	name?: string;
	about?: string;
	picture?: string;
}) => {
	const $ndk = get(ndk);
	const $session = get(session);

	// Validations
	if (!$ndk || !$session) return Promise.reject(new Error('User not connected'));
	if (!profile.name || profile.name.length === 0)
		return Promise.reject(new Error('Name cannot be empty'));

	const event = new NDKEvent($ndk, {
		kind: 0,
		content: JSON.stringify(profile),
		pubkey: $session.pubkey,
		created_at: Math.floor(Date.now() / 1000),
		tags: []
	});

	await event.publish();

	return Promise.resolve(event.encode());
};

export default updateProfileCommand;
