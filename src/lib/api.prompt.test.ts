import { describe, expect, it } from 'vitest';
import { createOrder, endpointMarkdown, endpointPrompt, upiIntent } from '#lib/api.ts';

describe('Copy for AI / Copy page payloads', () => {
	it('builds a non-empty AI prompt for create order with request JSON and responses', () => {
		const prompt = endpointPrompt(createOrder);

		expect(prompt.startsWith('Use this ElixirPay API reference')).toBe(true);
		expect(prompt).toContain('API_BASE_URL');
		expect(prompt).toContain('X-Client-Key');
		expect(prompt).toContain('X-Client-Secret');
		expect(prompt).toContain('## Example request body');
		expect(prompt).toContain('"orgId"');
		expect(prompt).toContain('## Responses');
		expect(prompt).toContain('### 201 — Order created');
		expect(prompt).toContain('### 400 — Bad Request');
		expect(prompt).toContain('"message": "Invalid Payload"');
		expect(prompt).not.toContain('exceptionCode');
		expect(prompt).not.toContain('undefined');
		expect(prompt).not.toContain('[object Object]');
	});

	it('keeps Copy page markdown aligned with the AI prompt body', () => {
		const markdown = endpointMarkdown(upiIntent);
		const prompt = endpointPrompt(upiIntent);

		expect(prompt.endsWith(markdown)).toBe(true);
		expect(markdown).toContain('## Example request body');
		expect(markdown).toContain('paymentMethod');
		expect(markdown).toContain('### CREATED — Payment link created');
	});
});
