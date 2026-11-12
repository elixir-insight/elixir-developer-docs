import type { CodeTab } from '#lib/code-tab.ts';
import {
	findOperation,
	JSON_CONTENT_TYPE,
	requestExample,
	responseExamples,
	type LabelledExample,
	type Schema
} from '#lib/openapi.ts';
import { requestSamples, toJson, type Json } from '#lib/samples.ts';

/** The wire shape shared by the playground and POST /api/execute. */
export interface HeaderInput {
	name: string;
	value: string;
}

export interface ExecuteRequest {
	operationId: string;
	headers: HeaderInput[];
	bodyText: string;
}

export type ExecuteResult =
	| { kind: 'http'; status: number; ok: boolean; body: string; json: Json | null }
	| { kind: 'network'; message: string }
	| { kind: 'invalid-json' }
	| { kind: 'rejected'; message: string };

export const EXECUTE_ENDPOINT = '/api/execute';

export interface HeaderField extends HeaderInput {
	/** Render masked and never prefill. Credentials are never written to storage. */
	secret: boolean;
}

export interface PlaygroundModel {
	operationId: string;
	method: 'POST';
	path: string;
	headers: HeaderField[];
	bodyText: string;
	samples: CodeTab[];
	examples: LabelledExample[];
}

/**
 * Everything the playground renders for one operation, read from the OpenAPI document so no
 * payload is duplicated. Returns `undefined` for anything that is not a documented POST
 * operation, including inbound webhooks.
 */
export function playgroundModel(operationId: string): PlaygroundModel | undefined {
	const resolved = findOperation(operationId);
	if (!resolved) return undefined;

	const body = requestExample(resolved.operation);
	return {
		operationId,
		method: resolved.method,
		path: resolved.path,
		headers: resolved.headerInputs,
		bodyText: toJson(body),
		samples: requestSamples(resolved.path, body),
		examples: responseExamples(resolved.operation)
	};
}

/** The body to show for a completed request: pretty JSON when the API returned JSON. */
export function responseText(result: Extract<ExecuteResult, { kind: 'http' }>): string {
	return result.json === null ? result.body : toJson(result.json);
}

function isPlainObject(value: unknown): value is Record<string, unknown> {
	return typeof value === 'object' && value !== null && !Array.isArray(value);
}

/** True when every documented required field is present and non-empty. */
export function requestBodyIsComplete(body: unknown, schema: Schema | undefined): boolean {
	if (!schema) return isPlainObject(body);

	if (schema.type === 'object' || schema.properties || schema.required) {
		if (!isPlainObject(body)) return false;
		for (const key of schema.required ?? []) {
			const value = body[key];
			const property = schema.properties?.[key];
			if (value === undefined || value === null) return false;
			if (typeof value === 'string' && value.trim() === '') return false;
			if (property && !requestBodyIsComplete(value, property)) return false;
		}
		return true;
	}

	if (schema.type === 'array') {
		return Array.isArray(body);
	}

	if (typeof body === 'string') return body.trim() !== '';
	return body !== undefined && body !== null;
}

/** Request JSON schema for a documented operation, when one exists. */
export function requestBodySchema(operationId: string): Schema | undefined {
	const resolved = findOperation(operationId);
	return resolved?.operation.requestBody.content[JSON_CONTENT_TYPE]?.schema;
}

export interface RunOptions {
	url?: string;
	fetch?: typeof globalThis.fetch;
}

/**
 * Sends one request through the docs server.
 *
 * Invalid JSON is reported without calling the API at all, so a typo never reaches the
 * network. The result is returned rather than thrown, so every outcome renders in the
 * response area.
 */
export async function runOperation(
	request: ExecuteRequest,
	{ url = EXECUTE_ENDPOINT, fetch = globalThis.fetch }: RunOptions = {}
): Promise<ExecuteResult> {
	try {
		JSON.parse(request.bodyText);
	} catch {
		return { kind: 'invalid-json' };
	}

	let response: Response;
	try {
		response = await fetch(url, {
			method: 'POST',
			headers: { 'content-type': 'application/json' },
			body: JSON.stringify(request)
		});
	} catch {
		return { kind: 'network', message: 'The docs server could not be reached.' };
	}

	let payload: unknown;
	try {
		payload = await response.json();
	} catch {
		return {
			kind: 'network',
			message: `The docs server returned an unreadable response (HTTP ${response.status}).`
		};
	}

	if (
		typeof payload !== 'object' ||
		payload === null ||
		typeof (payload as { kind?: unknown }).kind !== 'string'
	) {
		return {
			kind: 'network',
			message: `The docs server returned an unreadable response (HTTP ${response.status}).`
		};
	}

	return payload as ExecuteResult;
}
