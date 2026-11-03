import { findOperation, JSON_CONTENT_TYPE } from '#lib/openapi.ts';
import type { ExecuteRequest, ExecuteResult, HeaderInput } from '#lib/playground.ts';
import type { Json } from '#lib/samples.ts';

/**
 * Performs one documented request on behalf of the inline playground.
 *
 * This is not a proxy. The caller names an `operationId` from the OpenAPI document and
 * nothing else: there is no target URL in the request shape, the path comes from the
 * document, and the host comes from API_BASE_URL on the server. No credential is added or
 * stored here — whatever the reader typed is forwarded once and then forgotten — and
 * neither headers nor bodies are ever logged.
 */

export const MAX_BODY_BYTES = 32 * 1024;
export const DEFAULT_TIMEOUT_MS = 20_000;

export interface ExecuteOptions {
	/** API_BASE_URL as configured on the server. Undefined when the server is unconfigured. */
	baseUrl: string | undefined;
	fetch?: typeof globalThis.fetch;
	timeoutMs?: number;
}

const rejected = (message: string): ExecuteResult => ({ kind: 'rejected', message });

/** Narrows an untrusted JSON payload to the request shape. */
export function parseExecuteRequest(payload: unknown): ExecuteRequest | undefined {
	if (typeof payload !== 'object' || payload === null) return undefined;
	const { operationId, headers, bodyText } = payload as Record<string, unknown>;
	if (typeof operationId !== 'string' || typeof bodyText !== 'string') return undefined;
	if (!Array.isArray(headers)) return undefined;

	const parsed: HeaderInput[] = [];
	for (const header of headers) {
		if (typeof header !== 'object' || header === null) return undefined;
		const { name, value } = header as Record<string, unknown>;
		if (typeof name !== 'string' || typeof value !== 'string') return undefined;
		parsed.push({ name, value });
	}
	return { operationId, headers: parsed, bodyText };
}

function resolveBaseUrl(baseUrl: string | undefined, path: string): URL | string {
	if (!baseUrl) {
		return 'The docs server has no API base URL configured, so requests cannot be sent. Set API_BASE_URL and restart it.';
	}
	let url: URL;
	try {
		url = new URL(baseUrl.replace(/\/+$/, '') + path);
	} catch {
		return 'The configured API base URL is not a valid URL, so requests cannot be sent.';
	}
	if (url.protocol !== 'https:' && url.protocol !== 'http:') {
		return `The configured API base URL must use http or https, not ${url.protocol.replace(':', '')}.`;
	}
	return url;
}

/** Media type without parameters, so "application/json; charset=utf-8" still matches. */
function mediaType(value: string) {
	return value.split(';')[0].trim().toLowerCase();
}

function collectHeaders(inputs: HeaderInput[], allowed: string[]): Headers | string {
	const allow = new Set(allowed.map((name) => name.toLowerCase()));
	const headers = new Headers();
	for (const { name, value } of inputs) {
		const lower = name.trim().toLowerCase();
		if (!allow.has(lower)) {
			return `The header "${name.trim()}" is not part of this operation's contract, so it was not sent. Allowed headers: ${allowed.join(', ')}.`;
		}
		headers.set(lower, value.trim());
	}

	for (const name of allowed) {
		const value = headers.get(name.toLowerCase());
		if (!value) {
			return `The header "${name}" is required and must not be empty.`;
		}
	}

	const contentType = headers.get('content-type');
	if (!contentType || mediaType(contentType) !== JSON_CONTENT_TYPE) {
		return `This operation requires Content-Type: ${JSON_CONTENT_TYPE}.`;
	}
	return headers;
}

export async function executeOperation(
	request: ExecuteRequest,
	{ baseUrl, fetch = globalThis.fetch, timeoutMs = DEFAULT_TIMEOUT_MS }: ExecuteOptions
): Promise<ExecuteResult> {
	const documented = findOperation(request.operationId);
	if (!documented) {
		return rejected(
			`"${request.operationId}" is not a documented POST operation, so nothing was sent.`
		);
	}

	const url = resolveBaseUrl(baseUrl, documented.path);
	if (typeof url === 'string') return rejected(url);

	const headers = collectHeaders(request.headers, documented.allowedHeaders);
	if (typeof headers === 'string') return rejected(headers);

	const body = new TextEncoder().encode(request.bodyText);
	if (body.byteLength > MAX_BODY_BYTES) {
		return rejected(
			`The request body is ${body.byteLength} bytes, over the ${MAX_BODY_BYTES} byte limit.`
		);
	}

	try {
		JSON.parse(request.bodyText);
	} catch {
		return { kind: 'invalid-json' };
	}

	let response: Response;
	try {
		response = await fetch(url, {
			method: 'POST',
			headers,
			body,
			signal: AbortSignal.timeout(timeoutMs),
			redirect: 'manual'
		});
	} catch (error) {
		const timedOut = error instanceof Error && error.name === 'TimeoutError';
		const cause =
			error instanceof Error
				? error.cause instanceof Error
					? error.cause.message
					: error.message
				: String(error);
		return {
			kind: 'network',
			message: timedOut
				? `The API did not respond within ${Math.round(timeoutMs / 1000)}s.`
				: `The docs server could not reach the API (${cause}).`
		};
	}

	const text = await response.text();
	let json: Json | null = null;
	try {
		json = JSON.parse(text) as Json;
	} catch {
		// Not every error page is JSON; the raw body is still shown verbatim.
	}

	return { kind: 'http', status: response.status, ok: response.ok, body: text, json };
}
