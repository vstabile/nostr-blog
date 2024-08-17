import { get, writable } from 'svelte/store';
import ndk from './ndk';
import { NDKNip07Signer, NDKPrivateKeySigner } from '@nostr-dev-kit/ndk';
import { generateSecretKey, getPublicKey } from 'nostr-tools/pure';

type Session = {
	pubkey: string;
	method: string;
};

function createSessionStore() {
	const { subscribe, set, update } = writable<Session | undefined>(undefined);

	return {
		subscribe,
		signIn: (e: CustomEvent<{ method: string; pubkey: string }>) => {
			set({
				pubkey: e.detail.pubkey,
				method: e.detail.method
			});

			if (e.detail.method === 'extension') {
				get(ndk)!.signer = new NDKNip07Signer();
			}
		},
		signUp: () => {
			const sk = generateSecretKey();

			get(ndk)!.signer = new NDKPrivateKeySigner(sk);

			set({
				pubkey: getPublicKey(sk),
				method: 'sk'
			});
		},
		signOut: () => {
			set(undefined);
		}
	};
}

const session = createSessionStore();

export default session;
