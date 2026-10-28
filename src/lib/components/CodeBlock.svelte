<script lang="ts" module>
	export interface CodeTab {
		label: string;
		code: string;
	}
</script>

<script lang="ts">
	import CopyButton from './CopyButton.svelte';
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

	const activeLabel = $derived.by(() => {
		if (!tabs?.length) return undefined;
		const wanted = syncLanguage ? language.current : localTab;
		return tabs.some((t) => t.label === wanted) ? wanted : tabs[0].label;
	});

	const current = $derived(
		tabs ? (tabs.find((t) => t.label === activeLabel)?.code ?? '') : shown && revealed ? revealed : code
	);
	const copyText = $derived(tabs ? current : (revealed ?? code));

	function select(tab: string) {
		if (syncLanguage) setLanguage(tab);
		else localTab = tab;
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
</script>

<section class="panel" aria-label={label ?? filename ?? caption}>
	<header class:tabbed={tabs}>
		{#if tabs}
			<div class="tabs" role="tablist" aria-label={label ?? 'Code samples'}>
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
		tabindex="0"><code>{current}</code></pre>
</section>

<style>
	.panel {
		display: flex;
		flex-direction: column;
		min-width: 0;
		background: var(--color-code);
		border-radius: var(--radius-lg);
		overflow: hidden;
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

	.tabs {
		display: flex;
		gap: 2px;
		min-width: 0;
		overflow-x: auto;
		scrollbar-width: none;
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
		background: var(--color-code-line);
		color: #ffffff;
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
