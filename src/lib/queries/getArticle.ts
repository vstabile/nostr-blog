import { get, writable } from 'svelte/store';
import ndk from '$lib/stores/ndk';
import type { NDKEvent, NDKSubscription, NDKUserProfile } from '@nostr-dev-kit/ndk';
import { nip19 } from 'nostr-tools';
import type { AddressPointer } from 'nostr-tools/nip19';

export type Article = {
	naddr: string;
	pubkey: string;
	profile: NDKUserProfile | null;
	draft: boolean;
	title: string;
	summary?: string;
	content: string;
	published_at?: Date;
	created_at: number;
};

let subscription: NDKSubscription | undefined;

export default function getArticle(naddr: string) {
	const { subscribe, set, update } = writable<Article | null>(null);

	const $ndk = get(ndk)!;
	const pointer = nip19.decode(naddr).data as AddressPointer;

	if (subscription) subscription.stop();

	subscription = $ndk.subscribe(
		{
			authors: [pointer.pubkey],
			kinds: [30023, 30024 as number, 5],
			'#d': [pointer.identifier]
		},
		{ groupable: false }
	);

	const receivedEvents: Map<string, NDKEvent> = new Map();
	const deletedArticles: Map<string, number> = new Map();

	subscription.on('event', (e) => {
		const dedupKey = e.deduplicationKey();
		const existingEvent = receivedEvents.get(dedupKey);
		if (!e.created_at || (existingEvent && e.created_at < existingEvent.created_at!)) {
			return;
		}

		receivedEvents.set(dedupKey, e);

		const dtag = e.tagValue('d');

		// Ignore articles that were already deleted
		const deletedAt = dtag ? deletedArticles.get(dtag) : undefined;
		if (deletedAt && deletedAt > e.created_at) return;

		// Handle deletions
		if (e.kind === 5) return set(null);

		const title = e.tagValue('title') || 'Untitled';
		let published_at = e.tagValue('published_at');

		update((article) => {
			if (article) {
				if (e.created_at! < article.created_at) return article;

				article.draft = e.kind === 30024;
				article.title = title;
				article.summary = e.tagValue('summary');
				article.content = e.content;
				article.published_at = published_at
					? new Date(parseInt(published_at) * 1000)
					: article.published_at;
				article.created_at = e.created_at || 0;

				return article;
			}

			article = {
				naddr,
				profile: null,
				pubkey: e.pubkey,
				draft: e.kind === 30024,
				title: e.tagValue('title') || 'Untitled',
				summary: e.tagValue('summary'),
				content: e.content,
				published_at: published_at ? new Date(parseInt(published_at) / 1000) : undefined,
				created_at: e.created_at || 0
			};

			$ndk
				.getUser({ pubkey: article.pubkey })
				.fetchProfile()
				.then((p) =>
					update((article) => {
						article!.profile = p;
						return article;
					})
				);

			return article;
		});
	});

	return {
		subscribe
	};
}
