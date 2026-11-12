/**
 * The OpenAPI 3.1 document, derived from the documented contract in `#lib/api.ts` so the
 * schemas and payloads here can never drift from the reference pages.
 *
 * It deliberately has no `servers` entry: the base URL lives in the server-only
 * `API_BASE_URL` variable, and every path below is relative to it.
 */
import {
	createOrder,
	paymentWebhook,
	upiIntent,
	type Endpoint,
	type ResponseDef
} from '#lib/api.ts';
import type { Field } from '#lib/field.ts';
import type { Json } from '#lib/samples.ts';

export const JSON_CONTENT_TYPE = 'application/json';

export interface Schema {
	type?: 'object' | 'array' | 'string' | 'number' | 'boolean';
	description?: string;
	properties?: Record<string, Schema>;
	required?: string[];
	items?: Schema;
}

export interface Example {
	summary: string;
	description: string;
	value: Json;
}

interface MediaType {
	schema: Schema;
	examples: Record<string, Example>;
}

export interface Operation {
	operationId: string;
	summary: string;
	description: string;
	security: Record<string, string[]>[];
	requestBody: { required: true; content: Record<string, MediaType> };
	responses: Record<string, { description: string; content: Record<string, MediaType> }>;
}

export interface PathItem {
	post: Operation;
}

interface SecurityScheme {
	type: 'apiKey';
	in: 'header';
	name: string;
	description: string;
}

export interface OpenApiDocument {
	openapi: '3.1.0';
	info: { title: string; version: string; description: string };
	paths: Record<string, PathItem>;
	webhooks: Record<string, PathItem>;
	components: { securitySchemes: Record<string, SecurityScheme> };
}

/** Wording required of every example: a reader must know whether it was observed live. */
const DOCUMENTED = 'Documented sample from the ElixirPay API reference, not an observed live response.';

const securitySchemeByHeader: Record<string, string> = {
	'X-Client-Key': 'clientKey',
	'X-Client-Secret': 'clientSecret'
};

function scalarType(type: string | undefined): Schema['type'] {
	return type === 'number' || type === 'boolean' ? type : 'string';
}

function schemaFromField(field: Field): Schema {
	if (field.children?.length) {
		return { ...schemaFromFields(field.children), description: field.description };
	}
	if (field.type === 'array') {
		// The contract documents the permitted values in the description, so the item schema
		// stays an unconstrained string rather than inventing an enum.
		return { type: 'array', items: { type: 'string' }, description: field.description };
	}
	if (field.type === 'object') {
		return { type: 'object', description: field.description };
	}
	return { type: scalarType(field.type), description: field.description };
}

function schemaFromFields(fields: Field[]): Schema {
	const properties: Record<string, Schema> = {};
	const required: string[] = [];
	for (const field of fields) {
		properties[field.name] = schemaFromField(field);
		if (field.required) required.push(field.name);
	}
	return { type: 'object', properties, ...(required.length ? { required } : {}) };
}

/**
 * Response schemas come from the documented samples, because the reference tables group
 * some response fields for display ("amount · message") and those are not real field names.
 * Documented descriptions are attached only where a name matches exactly.
 */
function schemaFromSample(sample: Json, docs: Field[] = []): Schema {
	if (Array.isArray(sample)) {
		return { type: 'array', items: sample.length ? schemaFromSample(sample[0]) : {} };
	}
	if (sample !== null && typeof sample === 'object') {
		const properties: Record<string, Schema> = {};
		for (const [key, value] of Object.entries(sample)) {
			const documented = docs.find((field) => field.name === key);
			properties[key] = {
				...schemaFromSample(value),
				...(documented ? { description: documented.description } : {})
			};
		}
		return { type: 'object', properties };
	}
	return { type: scalarType(sample === null ? undefined : typeof sample) };
}

/** One documented response, and the HTTP status that carries it. */
interface ResponseSource {
	status: string;
	key: string;
	of: ResponseDef;
}

interface OperationSource {
	operationId: string;
	endpoint: Endpoint;
	requestSummary: string;
	responses: ResponseSource[];
}

function buildOperation({
	operationId,
	endpoint,
	requestSummary,
	responses
}: OperationSource): Operation {
	const grouped = new Map<string, ResponseSource[]>();
	for (const response of responses) {
		grouped.set(response.status, [...(grouped.get(response.status) ?? []), response]);
	}

	return {
		operationId,
		summary: endpoint.title,
		description: endpoint.summary,
		security: [
			Object.fromEntries(
				endpoint.headers
					.map((header) => securitySchemeByHeader[header.name])
					.filter((scheme): scheme is string => !!scheme)
					.map((scheme) => [scheme, []])
			)
		],
		requestBody: {
			required: true,
			content: {
				[JSON_CONTENT_TYPE]: {
					schema: schemaFromFields(endpoint.body),
					examples: {
						default: { summary: requestSummary, description: DOCUMENTED, value: endpoint.sampleBody }
					}
				}
			}
		},
		responses: Object.fromEntries(
			[...grouped].map(([status, group]) => [
				status,
				{
					description: group.map((response) => response.of.title).join(' or '),
					content: {
						[JSON_CONTENT_TYPE]: {
							schema: schemaFromSample(group[0].of.sample, group[0].of.fields),
							examples: Object.fromEntries(
								group.map((response) => [
									response.key,
									{
										summary: response.of.note
											? `${response.of.title} — ${response.of.note}`
											: response.of.title,
										description: DOCUMENTED,
										value: response.of.sample
									}
								])
							)
						}
					}
				}
			])
		)
	};
}

/** Flattens each documented response (and its extra samples) into OpenAPI sources. */
function responseSources(endpoint: Endpoint): ResponseSource[] {
	return endpoint.responses.flatMap((response) => [
		{ status: response.status, key: response.sampleLabel, of: response },
		...(response.extraSamples ?? []).map((extra) => ({
			status: response.status,
			key: extra.key,
			of: {
				...response,
				title: extra.title,
				sampleLabel: extra.key,
				sample: extra.sample,
				note: undefined,
				cases: undefined,
				extraSamples: undefined
			}
		}))
	]);
}

export const document: OpenApiDocument = {
	openapi: '3.1.0',
	info: {
		title: 'ElixirPay API',
		version: '1.0.0',
		description:
			'Payment gateway API for hosted checkout orders, UPI intent links with QR codes, and payment webhooks. Paths are relative to the base URL issued with your credentials, which already includes the version prefix.'
	},
	paths: {
		[createOrder.path]: {
			post: buildOperation({
				operationId: createOrder.operationId,
				endpoint: createOrder,
				requestSummary: 'Create a hosted checkout order',
				responses: responseSources(createOrder)
			})
		},
		[upiIntent.path]: {
			post: buildOperation({
				operationId: upiIntent.operationId,
				endpoint: upiIntent,
				requestSummary: 'Request a UPI intent link and QR code',
				// Both documented bodies arrive on a 200; the payment outcome is in `status`.
				responses: responseSources(upiIntent).map((source) => ({
					...source,
					status: '200'
				}))
			})
		}
	},
	webhooks: {
		payment: {
			post: {
				operationId: paymentWebhook.operationId,
				summary: paymentWebhook.title,
				description: paymentWebhook.summary,
				security: [{ webhookSecret: [] }],
				requestBody: {
					required: true,
					content: {
						[JSON_CONTENT_TYPE]: {
							schema: schemaFromFields(paymentWebhook.payload),
							examples: {
								default: {
									summary: 'Callback sent to your server',
									description: DOCUMENTED,
									value: paymentWebhook.sample
								}
							}
						}
					}
				},
				responses: {
					'200': {
						description: 'Return 200 once you have recorded the update, or ElixirPay retries.',
						content: {}
					}
				}
			}
		}
	},
	components: {
		securitySchemes: {
			clientKey: {
				type: 'apiKey',
				in: 'header',
				name: 'X-Client-Key',
				description: 'Unique client key issued by ElixirPay.'
			},
			clientSecret: {
				type: 'apiKey',
				in: 'header',
				name: 'X-Client-Secret',
				description:
					'Secret paired with your client key. Server-side only — never ship it to a browser or mobile app.'
			},
			webhookSecret: {
				type: 'apiKey',
				in: 'header',
				name: paymentWebhook.secretHeader.name,
				description: paymentWebhook.secretHeader.description
			}
		}
	}
};

export interface ResolvedOperation {
	operationId: string;
	method: 'POST';
	path: string;
	operation: Operation;
	/** Header names the contract requires, Content-Type included. Used as the forward allowlist. */
	allowedHeaders: string[];
	/** Headers the playground offers as editable inputs, in display order. */
	headerInputs: { name: string; secret: boolean; value: string }[];
}

/**
 * Looks an operation up by `operationId`. Only documented POST operations under `paths`
 * resolve: inbound webhooks live under `webhooks` and are never callable.
 */
export function findOperation(operationId: string): ResolvedOperation | undefined {
	for (const [path, item] of Object.entries(document.paths)) {
		if (item.post.operationId !== operationId) continue;

		const schemeNames = item.post.security.flatMap((requirement) => Object.keys(requirement));
		const headerNames = schemeNames
			.map((name) => document.components.securitySchemes[name]?.name)
			.filter((name): name is string => !!name);

		return {
			operationId,
			method: 'POST',
			path,
			operation: item.post,
			allowedHeaders: ['Content-Type', ...headerNames],
			headerInputs: [
				{ name: 'Content-Type', secret: false, value: JSON_CONTENT_TYPE },
				...headerNames.map((name) => ({
					name,
					secret: name.toLowerCase().includes('secret'),
					value: ''
				}))
			]
		};
	}
	return undefined;
}

/** The documented request body example, or `{}` when an operation has none. */
export function requestExample(operation: Operation): Json {
	const examples = operation.requestBody.content[JSON_CONTENT_TYPE]?.examples ?? {};
	return Object.values(examples)[0]?.value ?? {};
}

export interface LabelledExample extends Example {
	/** The status code, or the example key when one status holds several samples. */
	label: string;
	status: string;
}

function isError(status: string) {
	return status.startsWith('4') || status.startsWith('5');
}

/**
 * Every documented response example, labelled for the tab strip.
 *
 * `Object.entries` lists numeric-like keys first, so a spec whose error status sorts ahead
 * of its success status would open on an error sample. Successes are sorted first instead.
 */
export function responseExamples(operation: Operation): LabelledExample[] {
	const examples = Object.entries(operation.responses).flatMap(([status, response]) => {
		const entries = Object.entries(response.content[JSON_CONTENT_TYPE]?.examples ?? {});
		return entries.map(([key, example]) => ({
			...example,
			status,
			label: entries.length > 1 ? key : status
		}));
	});

	return examples.sort((a, b) => Number(isError(a.status)) - Number(isError(b.status)));
}
