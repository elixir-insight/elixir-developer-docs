import { describe, expect, it } from 'vitest';
import { createOrder, upiIntent } from '#lib/api.ts';
import { document, findOperation, responseExamples } from '#lib/openapi.ts';

describe('OpenAPI document', () => {
	it('loads each documented POST operation by operationId', () => {
		const order = findOperation(createOrder.operationId);
		expect(order).toMatchObject({
			operationId: createOrder.operationId,
			method: 'POST',
			path: createOrder.path
		});

		const upi = findOperation(upiIntent.operationId);
		expect(upi).toMatchObject({
			operationId: upiIntent.operationId,
			path: upiIntent.path
		});
	});

	it('never resolves inbound webhook operations', () => {
		expect(findOperation('receivePaymentWebhook')).toBeUndefined();
	});

	it('omits servers so the host is never published', () => {
		expect(document).not.toHaveProperty('servers');
	});

	it('sorts documented success examples ahead of error examples', () => {
		const order = findOperation(createOrder.operationId)!;
		const examples = responseExamples(order.operation);
		expect(examples[0]?.status).toBe('201');
		expect(examples.some((example) => example.status === '201')).toBe(true);
		expect(examples.at(-1)?.status).toMatch(/^[45]/);
	});

	it('publishes the create-order status catalogue', () => {
		const order = findOperation(createOrder.operationId)!;
		expect(Object.keys(order.operation.responses).sort()).toEqual([
			'201',
			'400',
			'401',
			'404',
			'409',
			'422',
			'500',
			'502'
		]);
	});
});
