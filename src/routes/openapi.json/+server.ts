import { document } from '#lib/openapi.ts';

// Prerendered, so the build writes build/openapi.json and Netlify serves it as a static file.
export const prerender = true;

export function GET() {
	return new Response(JSON.stringify(document, null, '\t'), {
		headers: { 'content-type': 'application/json; charset=utf-8' }
	});
}
