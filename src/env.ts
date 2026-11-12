import { defineEnvVars } from '@sveltejs/kit/env';

export const variables = defineEnvVars({
	API_BASE_URL: {
		description:
			'Base URL of the ElixirPay API, including the version prefix (e.g. https://host.example/api/v1). Private and read at run time, so the host never reaches the browser bundle. Optional: without it the playground reports that the server is not configured.',
		schema: (value) => {
			const trimmed = value?.trim();
			// Unset and empty both mean "not configured". The route checks the protocol and
			// reports the problem to the reader rather than failing the build.
			return trimmed ? trimmed.replace(/\/+$/, '') : undefined;
		}
	}
});
