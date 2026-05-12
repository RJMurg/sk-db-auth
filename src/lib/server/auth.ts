import { betterAuth } from 'better-auth';
import { prismaAdapter } from 'better-auth/adapters/prisma';
import { svelteKitHandler } from 'better-auth/svelte-kit';
import { genericOAuth } from 'better-auth/plugins';
import { prisma } from './prisma';
import { building } from '$app/environment';
import type { Handle } from '@sveltejs/kit';
import { env } from '$env/dynamic/private';

const plugins = [];
const enabledMethods = env.AUTH_METHODS?.toLowerCase().split(',') ?? [];

if (enabledMethods.includes('murgid')) {
	plugins.push(
		genericOAuth({
			config: [
				{
					providerId: 'MurgID',
					clientId: env.MURGID_CLIENT_ID!,
					clientSecret: env.MURGID_CLIENT_SECRET,
					discoveryUrl: env.MURGID_CLIENT_DISCOVERY_URL
				}
			]
		})
	);
}

export const authHandler: Handle = async ({ event, resolve }) => {
	const auth = betterAuth({
		database: prismaAdapter(prisma, { provider: 'postgresql' }),
		experimental: { joins: true },
		plugins: plugins
	});

	return svelteKitHandler({ event, resolve, auth, building });
};
