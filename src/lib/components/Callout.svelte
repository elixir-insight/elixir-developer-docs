<script lang="ts">
	import type { Snippet } from 'svelte';

	let { children }: { children: Snippet } = $props();
</script>

<aside class="callout">
	<svg width="20" height="20" viewBox="0 0 20 20" aria-hidden="true">
		<rect x="4" y="9" width="12" height="8" rx="2" />
		<path d="M7 9V6.5a3 3 0 0 1 6 0V9" />
	</svg>
	<p>{@render children()}</p>
</aside>

<style>
	.callout {
		display: flex;
		align-items: flex-start;
		gap: 12px;
		padding: 14px 16px;
		background: var(--color-warning-tint);
		border-radius: var(--radius-md);
	}

	svg {
		flex-shrink: 0;
		margin-top: 1px;
		fill: none;
		stroke: var(--color-warning-icon);
		stroke-width: 1.6;
	}

	p {
		color: var(--color-warning-ink);
		font-size: var(--text-small);
		line-height: 22px;
	}
</style>
