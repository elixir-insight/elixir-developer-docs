import adapter from 'amplify-adapter';
import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig } from 'vitest/config';

export default defineConfig({
	plugins: [
		sveltekit({
			compilerOptions: {
				// Force runes mode for the project, except for libraries. Can be removed in svelte 6.
				runes: ({ filename }) =>
					filename.split(/[/\\]/).includes('node_modules') ? undefined : true
			},

			// AWS Amplify Hosting (amplify-adapter, default options): writes build/ with static/,
			// compute/default (Node 22 server for /api/execute and prerendered pages) and
			// deploy-manifest.json. The default `out: 'build'` must match amplify.yml.
			adapter: adapter()
		})
	],
	test: {
		include: ['src/**/*.test.ts']
	}
});
