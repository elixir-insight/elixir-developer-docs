import { API_BASE_URL } from '$app/env/private';
import { error, json } from '@sveltejs/kit';
import { executeOperation, parseExecuteRequest } from '#lib/server/execute.ts';
import type { RequestHandler } from './$types';

// The rest of the site is prerendered; this one has to run on each request.
export const prerender = false;

export const POST: RequestHandler = async ({ request }) => {
	let payload: unknown;
	try {
		payload = await request.json();
	} catch {
		error(400, 'Expected a JSON body.');
	}

	const parsed = parseExecuteRequest(payload);
	if (!parsed) {
		error(400, 'Expected { operationId, headers: [{ name, value }], bodyText }.');
	}

	return json(await executeOperation(parsed, { baseUrl: API_BASE_URL }));
};
