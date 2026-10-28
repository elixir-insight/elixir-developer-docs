<script lang="ts">
	import type { Snippet } from 'svelte';

	interface Props {
		eyebrow: string;
		title: string;
		/** Buttons on the right of the eyebrow row (Copy page, Copy for AI). */
		actions?: Snippet;
		/** Larger title and lede, for the landing page. */
		hero?: boolean;
		children: Snippet;
	}

	let { eyebrow, title, actions, hero = false, children }: Props = $props();
</script>

<svelte:head>
	<title>{title} · ElixirPay Developer Docs</title>
</svelte:head>

<header class="page-header" class:hero>
	<div class="top">
		<p class="eyebrow">{eyebrow}</p>
		{#if actions}<div class="actions">{@render actions()}</div>{/if}
	</div>
	<h1 class="page-title">{title}</h1>
	<p class="lede">{@render children()}</p>
</header>

<style>
	.top {
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: 12px;
		min-height: 16px;
		padding-bottom: 14px;
	}

	.actions {
		display: flex;
		gap: 8px;
		margin-block: -7px;
	}

	h1 {
		padding-bottom: 12px;
	}

	.lede {
		padding-bottom: 24px;
	}

	.hero h1 {
		padding-bottom: 14px;
		font-size: 48px;
		letter-spacing: -0.035em;
		line-height: 54px;
	}

	.hero .lede {
		padding-bottom: 28px;
		font-size: 18px;
		line-height: 30px;
	}

	@media (max-width: 640px) {
		.hero h1 {
			font-size: 36px;
			line-height: 42px;
		}
	}
</style>
