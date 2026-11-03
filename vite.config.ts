import adapter from '@sveltejs/adapter-netlify';
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

			// Docs pages are prerendered to ./build; POST /api/execute opts out and runs as a
			// Netlify function. `publish` must match `publish` in netlify.toml.
			adapter: adapter({ publish: 'build' })
		})
	],
	test: {
		include: ['src/**/*.test.ts']
	}
});
