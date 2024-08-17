import { derived } from 'svelte/store';
import ndk from './ndk';
import session from './session';
import getFollows, { type Follow } from '$lib/queries/getFollows';

let unsubscribe: any;

const follows = derived<[typeof ndk, typeof session], Follow[]>(
	[ndk, session],
	([$ndk, $session], set, update) => {
		if (!$ndk || !$session) return;

		const { pubkey } = $session;

		if (unsubscribe) unsubscribe();

		const { subscribe } = getFollows(pubkey);

		unsubscribe = subscribe((f: Follow[]) => set(f));
	},
	[]
);

export default follows;
