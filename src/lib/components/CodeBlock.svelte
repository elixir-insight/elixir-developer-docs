<script lang="ts" module>
	export type { CodeTab } from '#lib/code-tab.ts';
</script>

<script lang="ts">
	import CopyButton from './CopyButton.svelte';
	import type { CodeTab } from '#lib/code-tab.ts';
	import { highlightCode, highlightJson, tokensToHtml } from '#lib/highlight.ts';
	import { language, setLanguage } from '#lib/language.svelte.ts';

	interface Props {
		/** Single sample. Ignored when `tabs` is set. */
		code?: string;
		tabs?: CodeTab[];
		/** Share the selected tab with every other block that sets this (code languages). */
		syncLanguage?: boolean;
		/** Monospace file name, e.g. "server.js". */
		filename?: string;
		/** Sans-serif caption, e.g. "Callback sent to your server". */
		caption?: string;
		badge?: { text: string; tone: 'success' | 'danger' };
		/** Unmasked version of `code`, shown by a Show/Hide toggle and used for copying. */
		revealed?: string;
		/** Accessible name for the panel. */
		label?: string;
		size?: 'md' | 'sm';
	}

	let {
		code = '',
		tabs,
		syncLanguage = false,
		filename,
		caption,
		badge,
		revealed,
		label,
		size = 'md'
	}: Props = $props();

	const uid = $props.id();

	let localTab = $state<string>();
	let shown = $state(false);
	let tabsEl = $state<HTMLDivElement>();
	let canScrollLeft = $state(false);
	let canScrollRight = $state(false);

	const activeLabel = $derived.by(() => {
		if (!tabs?.length) return undefined;
		const wanted = syncLanguage ? language.current : localTab;
		return tabs.some((t) => t.label === wanted) ? wanted : tabs[0].label;
	});

	const current = $derived(
		tabs ? (tabs.find((t) => t.label === activeLabel)?.code ?? '') : shown && revealed ? revealed : code
	);
	const copyText = $derived(tabs ? current : (revealed ?? code));

	const highlightedHtml = $derived.by(() => {
		const trimmed = current.trimStart();
		const tokens =
			trimmed.startsWith('{') || trimmed.startsWith('[')
				? highlightJson(current)
				: highlightCode(current);
		return tokensToHtml(tokens);
	});

	function updateTabOverflow() {
		const el = tabsEl;
		if (!el) {
			canScrollLeft = false;
			canScrollRight = false;
			return;
		}
		const max = el.scrollWidth - el.clientWidth;
		canScrollLeft = el.scrollLeft > 2;
		canScrollRight = max > 2 && el.scrollLeft < max - 2;
	}

	function select(tab: string) {
		if (syncLanguage) setLanguage(tab);
		else localTab = tab;
		queueMicrotask(() => {
			document.getElementById(`${uid}-tab-${tab}`)?.scrollIntoView({
				inline: 'nearest',
				block: 'nearest',
				behavior: 'smooth'
			});
			updateTabOverflow();
		});
	}

	function scrollTabs(direction: 1 | -1) {
		tabsEl?.scrollBy({ left: direction * Math.max(120, (tabsEl.clientWidth || 0) * 0.6), behavior: 'smooth' });
	}

	function onTabKey(event: KeyboardEvent, index: number) {
		if (!tabs) return;
		const step = event.key === 'ArrowRight' ? 1 : event.key === 'ArrowLeft' ? -1 : 0;
		if (!step) return;
		event.preventDefault();
		const next = tabs[(index + step + tabs.length) % tabs.length];
		select(next.label);
		document.getElementById(`${uid}-tab-${next.label}`)?.focus();
	}

	$effect(() => {
		const el = tabsEl;
		// Re-run when the tab set changes so overflow hints stay accurate.
		void tabs?.length;
		if (!el) return;

		updateTabOverflow();
		const onScroll = () => updateTabOverflow();
		el.addEventListener('scroll', onScroll, { passive: true });

		const observer = new ResizeObserver(updateTabOverflow);
		observer.observe(el);
		for (const child of el.children) observer.observe(child);

		return () => {
			el.removeEventListener('scroll', onScroll);
			observer.disconnect();
		};
	});
</script>

<section class="panel" aria-label={label ?? filename ?? caption}>
	<header class:tabbed={tabs}>
		{#if tabs}
			<div class="tabs-wrap" class:fade-left={canScrollLeft} class:fade-right={canScrollRight}>
				<div
					class="tabs"
					bind:this={tabsEl}
					role="tablist"
					aria-label={label ?? 'Code samples'}
				>
					{#each tabs as tab, index (tab.label)}
						{@const selected = tab.label === activeLabel}
						<button
							type="button"
							role="tab"
							id="{uid}-tab-{tab.label}"
							aria-selected={selected}
							aria-controls="{uid}-panel"
							tabindex={selected ? 0 : -1}
							class:selected
							onclick={() => select(tab.label)}
							onkeydown={(e) => onTabKey(e, index)}
						>
							{tab.label}
						</button>
					{/each}
				</div>
				{#if canScrollLeft}
					<button
						type="button"
						class="scroll-hint left"
						aria-label="Scroll tabs left"
						onclick={() => scrollTabs(-1)}
					>
						<svg width="14" height="14" viewBox="0 0 14 14" aria-hidden="true">
							<path d="M8.5 3.5 5 7l3.5 3.5" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" />
						</svg>
					</button>
				{/if}
				{#if canScrollRight}
					<button
						type="button"
						class="scroll-hint right"
						aria-label="Scroll tabs right"
						onclick={() => scrollTabs(1)}
					>
						<svg width="14" height="14" viewBox="0 0 14 14" aria-hidden="true">
							<path d="M5.5 3.5 9 7l-3.5 3.5" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" />
						</svg>
					</button>
				{/if}
			</div>
		{:else}
			<div class="title">
				{#if badge}
					<span class="badge {badge.tone}">{badge.text}</span>
				{/if}
				{#if filename}
					<span class="filename">{filename}</span>
				{:else if caption}
					<span class="caption">{caption}</span>
				{/if}
			</div>
		{/if}

		<div class="actions">
			{#if revealed && !tabs}
				<button
					type="button"
					class="toggle"
					aria-pressed={shown}
					onclick={() => (shown = !shown)}
				>
					{shown ? 'Hide' : 'Show'}
				</button>
			{/if}
			<CopyButton text={copyText} tone="dark" ariaLabel="Copy {activeLabel ?? filename ?? 'code'}" />
		</div>
	</header>

	<!-- svelte-ignore a11y_no_noninteractive_tabindex: the scroll region must be reachable by keyboard -->
	<pre
		class={size}
		id="{uid}-panel"
		role={tabs ? 'tabpanel' : undefined}
		aria-labelledby={tabs ? `${uid}-tab-${activeLabel}` : undefined}
		tabindex="0"
		><code>{@html highlightedHtml}</code></pre
	>
</section>

<style>
	.panel {
		display: flex;
		flex-direction: column;
		min-width: 0;
		overflow: hidden;
		background: var(--color-code);
		border-radius: 12px;
	}

	.panel :global(.tok-key),
	.panel :global(.tok-plain) {
		color: #e7ece4;
	}

	.panel :global(.tok-string),
	.panel :global(.tok-number),
	.panel :global(.tok-boolean),
	.panel :global(.tok-null),
	.panel :global(.tok-keyword) {
		color: #7dce8a;
	}

	.panel :global(.tok-comment) {
		color: #8b938c;
	}

	header {
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: 12px;
		flex-shrink: 0;
		height: 44px;
		padding-left: 16px;
		padding-right: 10px;
		border-bottom: 1px solid var(--color-code-line);
	}

	header.tabbed {
		height: 48px;
		padding-left: 8px;
	}

	.title {
		display: flex;
		align-items: center;
		gap: 10px;
		min-width: 0;
	}

	.filename {
		color: var(--color-code-muted);
		font-family: var(--font-mono);
		font-size: 12px;
		line-height: 16px;
	}

	.caption {
		color: var(--color-code-label);
		font-size: var(--text-label);
		font-weight: 500;
		line-height: 16px;
	}

	.badge {
		padding: 3px 8px;
		border-radius: var(--radius-sm);
		font-family: var(--font-mono);
		font-size: 12px;
		font-weight: 600;
		line-height: 16px;
	}

	.badge.success {
		background: var(--color-code-success-bg);
		color: var(--color-code-success);
	}

	.badge.danger {
		background: var(--color-code-danger-bg);
		color: var(--color-code-danger);
	}

	.tabs-wrap {
		position: relative;
		flex: 1;
		min-width: 0;
	}

	.tabs {
		display: flex;
		gap: 2px;
		min-width: 0;
		overflow-x: auto;
		scrollbar-width: none;
		-ms-overflow-style: none;
	}

	.tabs::-webkit-scrollbar {
		display: none;
	}

	.tabs-wrap.fade-left::before,
	.tabs-wrap.fade-right::after {
		content: '';
		position: absolute;
		top: 0;
		bottom: 0;
		width: 36px;
		pointer-events: none;
		z-index: 1;
	}

	.tabs-wrap.fade-left::before {
		left: 0;
		background: linear-gradient(to right, var(--color-code), transparent);
	}

	.tabs-wrap.fade-right::after {
		right: 0;
		background: linear-gradient(to left, var(--color-code), transparent);
	}

	.scroll-hint {
		position: absolute;
		top: 50%;
		z-index: 2;
		display: grid;
		place-items: center;
		width: 24px;
		height: 24px;
		border: 1px solid var(--color-code-control);
		border-radius: 999px;
		background: #1c211d;
		color: var(--color-code-label);
		transform: translateY(-50%);
	}

	.scroll-hint.left {
		left: 2px;
	}

	.scroll-hint.right {
		right: 2px;
	}

	.scroll-hint:hover {
		background: #2c332e;
		color: #f3f6f2;
	}

	.tabs button {
		flex-shrink: 0;
		padding: 6px 10px;
		border-radius: var(--radius-sm);
		color: var(--color-code-muted);
		font-size: var(--text-label);
		font-weight: 500;
		line-height: 16px;
	}

	.tabs button:hover {
		color: var(--color-code-label);
	}

	.tabs button.selected {
		background: #2c332e;
		color: #f3f6f2;
		font-weight: 600;
	}

	.actions {
		display: flex;
		gap: 6px;
		flex-shrink: 0;
	}

	.toggle {
		padding: 4px 10px;
		border: 1px solid var(--color-code-control);
		border-radius: var(--radius-sm);
		color: var(--color-code-label);
		font-size: 12px;
		font-weight: 500;
		line-height: 16px;
	}

	.toggle:hover {
		background: var(--color-code-line);
		color: #ffffff;
	}

	pre {
		margin: 0;
		padding: 16px 18px 20px;
		overflow-x: auto;
		color: var(--color-code-ink);
		font-size: 12.5px;
		line-height: 22px;
		white-space: pre;
		overflow-wrap: normal;
		scrollbar-color: var(--color-code-control) transparent;
	}

	pre.sm {
		line-height: 21px;
	}

	pre:focus-visible {
		outline-offset: -2px;
	}
</style>
