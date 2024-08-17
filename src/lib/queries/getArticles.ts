import { get, writable } from 'svelte/store';
import ndk from '$lib/stores/ndk';
import type { NDKEvent, NDKSubscription, NDKUserProfile } from '@nostr-dev-kit/ndk';

export type ArticleItem = {
	naddr: string;
	dtag: string;
	pubkey: string;
	draft: boolean;
	profile: NDKUserProfile | null;
	title: string;
	summary?: string;
	published_at?: Date;
	created_at: number;
};

let subscription: NDKSubscription | undefined;

export default function getArticles(pubkey: string) {
	const { subscribe, set, update } = writable<ArticleItem[] | []>([]);

	const $ndk = get(ndk)!;

	if (subscription) subscription.stop();

	subscription = $ndk.subscribe(
		{
			authors: [pubkey],
			kinds: [30023, 30024 as number, 5]
		},
		{ groupable: false }
	);

	const receivedEvents: Map<string, Map<string, NDKEvent>> = new Map();
	const deletedArticles: Map<string, number> = new Map();

	subscription.on('event', (e) => {
		const dedupKey = e.deduplicationKey();
		const dtag = e.tagValue('d');

		if ([30023, 30024].includes(e.kind!)) {
			const nestedMap = receivedEvents.get(dtag!);
			const existingEvent = nestedMap?.get(dedupKey);

			// Ignore older versions of articles
			if (!e.created_at || (existingEvent && e.created_at < existingEvent.created_at!)) {
				return;
			}

			nestedMap ? nestedMap.set(dedupKey, e) : receivedEvents.set(dtag!, new Map([[dedupKey, e]]));

			// Ignore articles that were already deleted
			const deletedAt = deletedArticles.get(dtag!);
			if (deletedAt && deletedAt > e.created_at) return;
		}

		// Handle deletions
		if (e.kind === 5) {
			return update((articles) => {
				const dtags = e.tags.filter((t) => t[0] === 'a').map((t) => t[1].split(':')[2]);
				dtags.forEach((dtag) => {
					const deletedAt = deletedArticles.get(dtag!);
					if (!deletedAt || e.created_at! > deletedAt) deletedArticles.set(dtag, e.created_at!);
				});
				return articles.filter((article) => !dtags.includes(article.dtag));
			});
		}

		const naddr = e.encode();
		const title = e.tagValue('title') || 'Untitled';
		let published_at = e.tagValue('published_at');

		update((articles) => {
			const article = articles.find((a) => a.dtag === e.tagValue('d'));

			if (article) {
				if (e.created_at! < article.created_at) return articles;

				article.draft = e.kind === 30024;
				article.title = title;
				article.summary = e.tagValue('summary');
				article.published_at = published_at
					? new Date(parseInt(published_at) * 1000)
					: article.published_at;
				article.created_at = e.created_at || 0;

				return articles.map((a) => {
					if (a.dtag === dtag) return article;
					return a;
				});
			}

			articles = [
				...articles,
				{
					naddr: naddr,
					dtag: dtag!,
					profile: null,
					draft: e.kind === 30024,
					pubkey: e.pubkey,
					title: e.tagValue('title') || 'Untitled',
					summary: e.tagValue('summary'),
					published_at: published_at ? new Date(parseInt(published_at) * 1000) : undefined,
					created_at: e.created_at || 0
				}
			];

			return articles;
		});
	});

	return {
		subscribe
	};
}
