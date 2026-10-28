<script lang="ts">
	import CopyButton from './CopyButton.svelte';

	interface Props {
		/** Pill on the left: "POST", "CALLBACK"… Omit for a plain text label. */
		method?: string;
		tone?: 'success' | 'primary';
		/** Plain label in place of a pill, e.g. "Base URL". */
		label?: string;
		value: string;
		copyable?: boolean;
	}

	let { method, tone = 'success', label, value, copyable = true }: Props = $props();
</script>

<div class="bar" class:labelled={label}>
	{#if method}
		<span class="method {tone}">{method}</span>
	{:else if label}
		<span class="label">{label}</span>
	{/if}
	<code class="value">{value}</code>
	{#if copyable}
		<CopyButton text={value} ariaLabel="Copy {label ?? 'URL'}" />
	{/if}
</div>

<style>
	.bar {
		display: flex;
		align-items: center;
		gap: 12px;
		min-height: 48px;
		padding: 7px 8px 7px 10px;
		border: 1px solid var(--color-line);
		border-radius: var(--radius-md);
	}

	.bar.labelled {
		gap: 14px;
		min-height: 52px;
		padding-left: 16px;
	}

	.method {
		flex-shrink: 0;
		padding: 5px 9px;
		border-radius: var(--radius-sm);
		font-family: var(--font-mono);
		font-size: 12px;
		font-weight: 600;
		line-height: 16px;
	}

	.method.success {
		background: var(--color-success-tint);
		color: var(--color-success);
	}

	.method.primary {
		background: var(--color-primary-tint);
		color: var(--color-primary);
	}

	.label {
		flex-shrink: 0;
		width: 72px;
		color: var(--color-muted);
		font-size: var(--text-label);
		font-weight: 600;
		line-height: 16px;
	}

	.value {
		flex: 1;
		min-width: 0;
		color: var(--color-ink);
		font-size: var(--text-small);
		line-height: 18px;
	}

	@media (max-width: 560px) {
		.label {
			width: auto;
		}

		.value {
			font-size: 12.5px;
		}
	}
</style>
