import { describe, expect, it, vi } from 'vitest';
import { createOrder } from '#lib/api.ts';
import { executeOperation, MAX_BODY_BYTES } from '#lib/server/execute.ts';

const validHeaders = [
	{ name: 'Content-Type', value: 'application/json' },
	{ name: 'X-Client-Key', value: 'ck_test' },
	{ name: 'X-Client-Secret', value: 'secret_test' }
];

describe('executeOperation', () => {
	it('rejects unknown operations', async () => {
		const fetch = vi.fn();
		const result = await executeOperation(
			{ operationId: 'notARealOperation', headers: validHeaders, bodyText: '{}' },
			{ baseUrl: 'https://api.example/api/v1', fetch }
		);
		expect(result.kind).toBe('rejected');
		expect(fetch).not.toHaveBeenCalled();
	});

	it('rejects inbound webhook operationIds', async () => {
		const fetch = vi.fn();
		const result = await executeOperation(
			{ operationId: 'receivePaymentWebhook', headers: validHeaders, bodyText: '{}' },
			{ baseUrl: 'https://api.example/api/v1', fetch }
		);
		expect(result.kind).toBe('rejected');
		expect(fetch).not.toHaveBeenCalled();
	});

	it('rejects disallowed headers', async () => {
		const fetch = vi.fn();
		const result = await executeOperation(
			{
				operationId: createOrder.operationId,
				headers: [...validHeaders, { name: 'Authorization', value: 'Bearer x' }],
				bodyText: '{}'
			},
			{ baseUrl: 'https://api.example/api/v1', fetch }
		);
		expect(result).toMatchObject({ kind: 'rejected' });
		expect((result as { message: string }).message).toContain('Authorization');
		expect(fetch).not.toHaveBeenCalled();
	});

	it('rejects a missing base URL', async () => {
		const fetch = vi.fn();
		const result = await executeOperation(
			{ operationId: createOrder.operationId, headers: validHeaders, bodyText: '{}' },
			{ baseUrl: undefined, fetch }
		);
		expect(result).toMatchObject({ kind: 'rejected' });
		expect((result as { message: string }).message).toContain('API_BASE_URL');
		expect(fetch).not.toHaveBeenCalled();
	});

	it('rejects empty auth headers without calling the API', async () => {
		const fetch = vi.fn();
		const result = await executeOperation(
			{
				operationId: createOrder.operationId,
				headers: [
					{ name: 'Content-Type', value: 'application/json' },
					{ name: 'X-Client-Key', value: '' },
					{ name: 'X-Client-Secret', value: '' }
				],
				bodyText: '{}'
			},
			{ baseUrl: 'https://api.example/api/v1', fetch }
		);
		expect(result).toMatchObject({ kind: 'rejected' });
		expect((result as { message: string }).message).toContain('X-Client-Key');
		expect(fetch).not.toHaveBeenCalled();
	});

	it('returns the real status and body for a mocked non-2xx response', async () => {
		const fetch = vi.fn().mockResolvedValue(
			new Response('{"message":"Request rejected."}', {
				status: 400,
				headers: { 'content-type': 'application/json' }
			})
		);

		const result = await executeOperation(
			{
				operationId: createOrder.operationId,
				headers: validHeaders,
				bodyText: '{"orgId":"ORG_2bh"}'
			},
			{ baseUrl: 'https://api.example/api/v1', fetch }
		);

		expect(result).toEqual({
			kind: 'http',
			status: 400,
			ok: false,
			body: '{"message":"Request rejected."}',
			json: { message: 'Request rejected.' }
		});
		expect(fetch).toHaveBeenCalledWith(
			new URL('https://api.example/api/v1/payment/orders'),
			expect.objectContaining({ method: 'POST' })
		);
	});

	it('reports a network failure when fetch throws', async () => {
		const fetch = vi.fn().mockRejectedValue(new TypeError('connect ECONNREFUSED'));
		const result = await executeOperation(
			{
				operationId: createOrder.operationId,
				headers: validHeaders,
				bodyText: '{}'
			},
			{ baseUrl: 'https://api.example/api/v1', fetch }
		);
		expect(result.kind).toBe('network');
		expect((result as { message: string }).message).toContain(
			'The docs server could not reach the API'
		);
	});

	it('rejects bodies over the size limit', async () => {
		const fetch = vi.fn();
		const result = await executeOperation(
			{
				operationId: createOrder.operationId,
				headers: validHeaders,
				bodyText: `"${'x'.repeat(MAX_BODY_BYTES)}"`
			},
			{ baseUrl: 'https://api.example/api/v1', fetch }
		);
		expect(result.kind).toBe('rejected');
		expect(fetch).not.toHaveBeenCalled();
	});
});
