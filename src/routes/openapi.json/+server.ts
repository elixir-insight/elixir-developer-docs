import { document } from '#lib/openapi.ts';

// Prerendered at build time, so /openapi.json is served from the generated file, not computed per request.
export const prerender = true;

export function GET() {
	return new Response(JSON.stringify(document, null, '\t'), {
		headers: { 'content-type': 'application/json; charset=utf-8' }
	});
}
