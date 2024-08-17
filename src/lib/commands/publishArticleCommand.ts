import ndk from '$lib/stores/ndk';
import session from '$lib/stores/session';
import { NDKEvent } from '@nostr-dev-kit/ndk';
import { nip19 } from 'nostr-tools';
import { get } from 'svelte/store';
import { v4 as uuidv4 } from 'uuid';

const publishArticleCommand = async (
	article: { title?: string; summary?: string; content?: string },
	naddr?: string
) => {
	const $ndk = get(ndk);
	const $session = get(session);

	// Validations
	if (!$ndk || !$session) return Promise.reject(new Error('User not connected'));
	if (!article.title || article.title.length === 0)
		return Promise.reject(new Error('Title cannot be empty'));
	if (!article.content || article.content.length === 0)
		return Promise.reject(new Error('Content cannot be empty'));

	let dtag;
	if (naddr) {
		dtag = (nip19.decode(naddr).data as nip19.AddressPointer).identifier;
	} else {
		dtag = uuidv4();
	}

	const event = new NDKEvent($ndk, {
		kind: 30023,
		content: article.content,
		pubkey: $session.pubkey,
		created_at: Math.floor(Date.now() / 1000),
		tags: [
			['d', dtag],
			['title', article.title],
			['summary', article?.summary || ''],
			['published_at', Math.floor(Date.now() / 1000).toString()]
		]
	});

	await event.publish();

	return Promise.resolve(event.encode());
};

export default publishArticleCommand;
