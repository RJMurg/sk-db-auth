import { betterAuth } from 'better-auth';
import { prismaAdapter } from 'better-auth/adapters/prisma';
import { svelteKitHandler } from 'better-auth/svelte-kit';
import { genericOAuth } from 'better-auth/plugins';
import { sveltekitCookies } from 'better-auth/svelte-kit';
import { prisma } from './prisma';
import { building } from '$app/environment';
import type { Handle } from '@sveltejs/kit';
import { env } from '$env/dynamic/private';
import { getRequestEvent } from '$app/server';

const plugins = [
	genericOAuth({
		config: [
			{
				providerId: 'murgid',
				clientId: env.MURGID_CLIENT_ID!,
				clientSecret: env.MURGID_CLIENT_SECRET,
				discoveryUrl: env.MURGID_DISCOVERY_URL,
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
		plugins: plugins
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
