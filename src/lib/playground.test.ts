import { describe, expect, it, vi } from 'vitest';
import { createOrder } from '#lib/api.ts';
import {
	playgroundModel,
	requestBodyIsComplete,
	requestBodySchema,
	runOperation
} from '#lib/playground.ts';

describe('playground client', () => {
	it('builds a model from the OpenAPI document', () => {
		const model = playgroundModel(createOrder.operationId);
		expect(model?.path).toBe('/payment/orders');
		expect(model?.bodyText).toContain('"orgId"');
		expect(model?.samples.map((tab) => tab.label)).toEqual([
			'cURL',
			'Node.js',
			'PHP',
			'Python',
			'Java'
		]);
		expect(model?.samples[0].code).toContain('$API_BASE_URL/payment/orders');
		expect(model?.samples[0].code).not.toContain('elixirpay.org');
	});

	it('treats the documented create-order sample as complete and rejects missing fields', () => {
		const schema = requestBodySchema(createOrder.operationId);
		const body = JSON.parse(playgroundModel(createOrder.operationId)!.bodyText);
		expect(requestBodyIsComplete(body, schema)).toBe(true);
		const { orgId: _orgId, ...incomplete } = body;
		expect(requestBodyIsComplete(incomplete, schema)).toBe(false);
		expect(
			requestBodyIsComplete({ ...body, customer: { ...body.customer, email: '' } }, schema)
		).toBe(false);
	});

	it('does not call the API when the body is invalid JSON', async () => {
		const fetch = vi.fn();
		const result = await runOperation(
			{
				operationId: createOrder.operationId,
				headers: [{ name: 'Content-Type', value: 'application/json' }],
				bodyText: '{not json'
			},
			{ fetch }
		);
		expect(result).toEqual({ kind: 'invalid-json' });
		expect(fetch).not.toHaveBeenCalled();
	});

	it('returns a real non-2xx status and body from the docs server', async () => {
		const fetch = vi.fn().mockResolvedValue(
			new Response(
				JSON.stringify({
					kind: 'http',
					status: 401,
					ok: false,
					body: '{"message":"unauthorized"}',
					json: { message: 'unauthorized' }
				}),
				{ status: 200, headers: { 'content-type': 'application/json' } }
			)
		);

		const result = await runOperation(
			{
				operationId: createOrder.operationId,
				headers: [
					{ name: 'Content-Type', value: 'application/json' },
					{ name: 'X-Client-Key', value: 'ck' },
					{ name: 'X-Client-Secret', value: 'secret' }
				],
				bodyText: '{}'
			},
			{ fetch }
		);

		expect(result).toEqual({
			kind: 'http',
			status: 401,
			ok: false,
			body: '{"message":"unauthorized"}',
			json: { message: 'unauthorized' }
		});
	});

	it('reports a network failure when the docs server cannot be reached', async () => {
		const fetch = vi.fn().mockRejectedValue(new TypeError('Failed to fetch'));
		const result = await runOperation(
			{
				operationId: createOrder.operationId,
				headers: [{ name: 'Content-Type', value: 'application/json' }],
				bodyText: '{}'
			},
			{ fetch }
		);
		expect(result).toEqual({
			kind: 'network',
			message: 'The docs server could not be reached.'
		});
	});
});
