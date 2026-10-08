import type { Handle } from '@sveltejs/kit/hooks';
import { betterAuth } from 'better-auth';
import { prismaAdapter } from 'better-auth/adapters/prisma';
import { svelteKitHandler } from 'better-auth/svelte-kit';
import { genericOAuth } from 'better-auth/plugins';
import { sveltekitCookies } from 'better-auth/svelte-kit';
import { prisma } from './prisma';
import { building } from '$app/env';
import { MURGID_CLIENT_ID, MURGID_CLIENT_SECRET, MURGID_DISCOVERY_URL } from '$app/env/private';
import { getRequestEvent } from '$app/server';

const plugins = [
	genericOAuth({
		config: [
			{
				providerId: 'murgid',
				clientId: MURGID_CLIENT_ID!,
				clientSecret: MURGID_CLIENT_SECRET,
				discoveryUrl: MURGID_DISCOVERY_URL,
				scopes: ['openid', 'email', 'profile', 'groups']
			}
		]
	}),
	// This ALWAYS has to be the last plugin
	sveltekitCookies(getRequestEvent)
];

export const authHandler: Handle = async ({ event, resolve }) => {
	const auth = betterAuth({
		database: prismaAdapter(prisma, { provider: 'postgresql' }),
		experimental: { joins: true },
		plugins
	});

	const session = await auth.api.getSession({
		headers: event.request.headers
	});

	if (session) {
		event.locals.session = session.session;
		event.locals.user = session.user;
	}

	return svelteKitHandler({ event, resolve, auth, building });
};
