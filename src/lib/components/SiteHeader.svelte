<script lang="ts">
	import { resolve } from '$app/paths';
	import mark from '#lib/assets/logo-mark.svg';

	interface Props {
		menuOpen: boolean;
		onToggleMenu: () => void;
	}

	let { menuOpen, onToggleMenu }: Props = $props();
</script>

<header class="site-header">
	<button
		type="button"
		class="menu"
		aria-label={menuOpen ? 'Close navigation' : 'Open navigation'}
		aria-expanded={menuOpen}
		aria-controls="sidebar"
		onclick={onToggleMenu}
	>
		<svg width="20" height="20" viewBox="0 0 20 20" aria-hidden="true">
			{#if menuOpen}
				<path d="M5 5l10 10M15 5L5 15" />
			{:else}
				<path d="M3 6h14M3 10h14M3 14h14" />
			{/if}
		</svg>
	</button>

	<a class="brand" href={resolve('/')}>
		<img src={mark} alt="" width="16" height="23" />
		<span class="wordmark">ElixirPay</span>
		<span class="pill">Developer Docs</span>
	</a>
</header>

<style>
	.site-header {
		position: sticky;
		top: 0;
		z-index: 30;
		display: flex;
		align-items: center;
		height: var(--header-height);
		padding-inline: 20px 32px;
		background: var(--color-surface);
		border-bottom: 1px solid var(--color-line);
	}

	.brand {
		display: flex;
		align-items: center;
	}

	img {
		display: block;
		width: 16px;
		height: 23px;
		margin-right: 10px;
	}

	.wordmark {
		padding-right: 10px;
		color: var(--color-ink);
		font-size: 19px;
		font-weight: 700;
		letter-spacing: -0.02em;
		line-height: 24px;
	}

	.pill {
		padding: 3px 9px;
		background: var(--color-primary-tint);
		border-radius: var(--radius-pill);
		color: var(--color-primary);
		font-size: var(--text-label);
		font-weight: 600;
		line-height: 16px;
	}

	.menu {
		display: none;
		align-items: center;
		justify-content: center;
		width: 40px;
		height: 40px;
		margin-left: -10px;
		margin-right: 4px;
		border-radius: var(--radius-sm);
		color: var(--color-ink);
	}

	.menu:hover {
		background: var(--color-surface-2);
	}

	.menu svg {
		fill: none;
		stroke: currentColor;
		stroke-width: 1.8;
		stroke-linecap: round;
	}

	@media (max-width: 900px) {
		.site-header {
			padding-inline: 16px;
		}

		.menu {
			display: inline-flex;
		}
	}
</style>
