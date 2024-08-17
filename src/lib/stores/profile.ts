import { derived } from 'svelte/store';
import ndk from './ndk';
import session from './session';
import getProfile, { type Profile } from '$lib/queries/getProfile';

let unsubscribe: any;

const profile = derived<[typeof ndk, typeof session], Profile | null>(
	[ndk, session],
	([$ndk, $session], set, update) => {
		if (!$ndk || !$session) return;

		const { pubkey } = $session;

		if (unsubscribe) unsubscribe();

		const { subscribe } = getProfile(pubkey);

		unsubscribe = subscribe((p: Profile | null) => set(p));
	},
	null
);

export default profile;
