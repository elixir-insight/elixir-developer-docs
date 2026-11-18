import { defineEnvVars } from '@sveltejs/kit/env';

export const variables = defineEnvVars({
	SANDBOX_API_BASE_URL: {
		description:
			'Origin of the ElixirPay sandbox the playground sends requests to, without the /api/v1 prefix. Private and read at run time, so the host never reaches the browser bundle. Optional: without it the playground reports that the server is not configured.',
		schema: (value) => {
			const trimmed = value?.trim();
			// Unset and empty both mean "not configured". The route checks the protocol and
			// reports the problem to the reader rather than failing the build.
			return trimmed ? trimmed.replace(/\/+$/, '') : undefined;
		}
	}
});
