import ndk from '$lib/stores/ndk';
import session from '$lib/stores/session';
import { NDKEvent } from '@nostr-dev-kit/ndk';
import { nip19 } from 'nostr-tools';
import { get } from 'svelte/store';

const unpublishArticleCommand = async (
	article: { title?: string; summary?: string; content?: string },
	naddr: string
) => {
	const $ndk = get(ndk);
	const $session = get(session);

	// Validations
	if (!$ndk || !$session) return Promise.reject(new Error('User not connected'));
	if (!article.title || article.title.length === 0)
		return Promise.reject(new Error('Title cannot be empty'));
	if (!article.content || article.content.length === 0)
		return Promise.reject(new Error('Content cannot be empty'));

	const pointer = nip19.decode(naddr).data as nip19.AddressPointer;
	const created_at = Math.floor(Date.now() / 1000);

	const event = new NDKEvent($ndk, {
		kind: 30024,
		content: article.content,
		pubkey: $session.pubkey,
		created_at: created_at,
		tags: [
			['d', pointer.identifier],
			['title', article.title],
			['summary', article?.summary || '']
		]
	});

	await event.publish();

	return Promise.resolve(event.encode());
};

export default unpublishArticleCommand;
