<script lang="ts">
	import type { Snippet } from 'svelte';
	import PageNav from './PageNav.svelte';
	import Toc from './Toc.svelte';

	interface Props {
		/** Page header and anything that should stay above the code column on narrow screens. */
		intro: Snippet;
		children: Snippet;
		/** Code column shown beside the article (API reference pages). */
		samples?: Snippet;
		/** "On this page" entries, shown beside the article on wide screens. */
		toc?: { id: string; title: string }[];
		/** Let the article use the full width (Quickstart). */
		wide?: boolean;
	}

	let { intro, children, samples, toc, wide = false }: Props = $props();
</script>

<div class="page" class:with-samples={samples} class:with-toc={toc} class:wide>
	<div class="intro">{@render intro()}</div>
	{#if samples}
		<div class="samples">{@render samples()}</div>
	{/if}
	<article class="body">
		{@render children()}
		<PageNav />
	</article>
	{#if toc}
		<div class="toc"><Toc items={toc} /></div>
	{/if}
</div>

<style>
	.page {
		display: grid;
		width: 100%;
		box-sizing: border-box;
		grid-template-columns: minmax(0, 680px);
		grid-template-areas:
			'intro'
			'body';
		align-items: start;
		padding: 48px 40px 64px 56px;
	}

	.intro {
		grid-area: intro;
	}

	.body {
		grid-area: body;
		min-width: 0;
	}

	.toc {
		display: none;
		grid-area: toc;
		align-self: stretch;
	}

	.wide {
		grid-template-columns: minmax(0, 1fr);
	}

	.wide .intro {
		max-width: 620px;
	}

	/* Article + "On this page" */
	@media (min-width: 1240px) {
		.with-toc {
			grid-template-columns: 680px 220px;
			grid-template-rows: auto 1fr;
			grid-template-areas:
				'intro toc'
				'body toc';
			column-gap: 72px;
		}

		.with-toc .toc {
			display: block;
		}
	}

	/* Article + code column */
	.samples {
		grid-area: samples;
		display: flex;
		flex-direction: column;
		gap: 16px;
		min-width: 0;
		padding-top: 24px;
		padding-bottom: 8px;
	}

	.with-samples {
		grid-template-areas:
			'intro'
			'samples'
			'body';
		grid-template-columns: minmax(0, 1fr);
	}

	@media (min-width: 1300px) {
		.with-samples {
			/* Fill the main pane: article grows a bit faster than the playground. */
			grid-template-columns: minmax(0, 1.25fr) minmax(360px, 1fr);
			grid-template-rows: auto 1fr;
			grid-template-areas:
				'intro samples'
				'body samples';
			column-gap: 40px;
			padding-right: 48px;
		}

		.samples {
			padding-top: 44px;
			padding-bottom: 0;
		}
	}

	@media (min-width: 1600px) {
		.with-samples {
			grid-template-columns: minmax(0, 1.3fr) minmax(400px, 1fr);
			column-gap: 48px;
			padding-inline: 56px 56px;
		}
	}

	@media (max-width: 900px) {
		.page {
			padding: 32px 24px 48px;
		}
	}

	@media (max-width: 560px) {
		.page {
			padding: 24px 16px 40px;
		}
	}
</style>
