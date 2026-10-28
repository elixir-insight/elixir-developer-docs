<script lang="ts">
	import '../app.css';
	import { afterNavigate } from '$app/navigation';
	import mark from '#lib/assets/logo-mark.svg';
	import SiteHeader from '#lib/components/SiteHeader.svelte';
	import Sidebar from '#lib/components/Sidebar.svelte';
	import { restoreLanguage } from '#lib/language.svelte.ts';
	import type { LayoutProps } from './$types';

	let { children }: LayoutProps = $props();

	let menuOpen = $state(false);

	$effect(restoreLanguage);
	afterNavigate(() => (menuOpen = false));
</script>

<svelte:head>
	<link rel="icon" href={mark} />
	<meta
		name="description"
		content="Developer documentation for the ElixirPay payment gateway API: hosted checkout orders, UPI intent links with QR codes, and payment webhooks."
	/>
</svelte:head>

<svelte:window onkeydown={(e) => e.key === 'Escape' && (menuOpen = false)} />

<a class="skip" href="#main">Skip to content</a>

<SiteHeader {menuOpen} onToggleMenu={() => (menuOpen = !menuOpen)} />

<div class="shell">
	<aside id="sidebar" class:open={menuOpen}>
		<div class="sidebar-scroll">
			<Sidebar />
		</div>
	</aside>
	{#if menuOpen}
		<button
			type="button"
			class="scrim"
			aria-label="Close navigation"
			tabindex="-1"
			onclick={() => (menuOpen = false)}
		></button>
	{/if}

	<main id="main">
		{@render children()}
	</main>
</div>

<style>
	.skip {
		position: absolute;
		left: 16px;
		top: -48px;
		z-index: 50;
		padding: 8px 12px;
		background: var(--color-ink);
		border-radius: var(--radius-sm);
		color: #ffffff;
		font-size: var(--text-small);
	}

	.skip:focus {
		top: 12px;
	}

	.shell {
		display: flex;
		min-height: calc(100vh - var(--header-height));
	}

	aside {
		flex-shrink: 0;
		width: var(--sidebar-width);
		background: var(--color-surface-2);
		border-right: 1px solid var(--color-line);
	}

	.sidebar-scroll {
		position: sticky;
		top: var(--header-height);
		max-height: calc(100vh - var(--header-height));
		overflow-y: auto;
	}

	main {
		flex: 1;
		min-width: 0;
	}

	.scrim {
		display: none;
	}

	@media (max-width: 900px) {
		aside {
			position: fixed;
			top: var(--header-height);
			bottom: 0;
			left: 0;
			z-index: 20;
			width: min(var(--sidebar-width), 85vw);
			transform: translateX(-100%);
			visibility: hidden;
			transition:
				transform 200ms ease,
				visibility 0s linear 200ms;
		}

		aside.open {
			transform: none;
			visibility: visible;
			transition: transform 200ms ease;
			box-shadow: 0 12px 32px rgb(15 23 42 / 0.12);
		}

		.sidebar-scroll {
			position: static;
			max-height: 100%;
			height: 100%;
		}

		.scrim {
			display: block;
			position: fixed;
			inset: var(--header-height) 0 0 0;
			z-index: 10;
			background: rgb(15 23 42 / 0.32);
		}
	}

	@media (prefers-reduced-motion: reduce) {
		aside,
		aside.open {
			transition: none;
		}
	}
</style>
