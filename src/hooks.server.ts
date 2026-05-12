import { sequence } from '@sveltejs/kit/hooks';
import { featureTogglesHandler } from './featureToggles';
import { authHandler } from '$lib/server/auth';

export const handle = sequence(featureTogglesHandler, authHandler);
