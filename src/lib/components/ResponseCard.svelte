<script lang="ts">
	import FieldTable, { type Field } from './FieldTable.svelte';

	interface Props {
		status: string;
		tone: 'success' | 'danger';
		title: string;
		fields?: Field[];
		/** Shown on the right instead of a toggle when there are no fields. */
		note?: string;
		open?: boolean;
	}

	let { status, tone, title, fields, note, open = $bindable(false) }: Props = $props();

	const uid = $props.id();
	const expandable = $derived(!!fields?.length);
</script>

<div class="card">
	<div class="head" class:open={expandable && open}>
		<span class="badge {tone}">{status}</span>
		<span class="title" id="{uid}-title">{title}</span>
		{#if expandable}
			<button
				type="button"
				class="toggle"
				aria-expanded={open}
				aria-controls="{uid}-fields"
				aria-describedby="{uid}-title"
				onclick={() => (open = !open)}
			>
				{open ? 'Hide fields' : 'Show fields'}
			</button>
		{:else if note}
			<span class="note">{note}</span>
		{/if}
	</div>
	{#if expandable}
		<div id="{uid}-fields" hidden={!open}>
			<FieldTable fields={fields!} density="compact" attached caption="{title} response fields" />
		</div>
	{/if}
</div>

<style>
	.head {
		display: flex;
		align-items: center;
		gap: 12px;
		padding: 14px 16px;
		border: 1px solid var(--color-line);
		border-radius: var(--radius-md);
	}

	.head.open {
		border-radius: var(--radius-md) var(--radius-md) 0 0;
	}

	.badge {
		flex-shrink: 0;
		min-width: 44px;
		padding: 3px 8px;
		border-radius: var(--radius-sm);
		font-family: var(--font-mono);
		font-size: 12px;
		font-weight: 600;
		line-height: 16px;
		text-align: center;
	}

	.badge.success {
		background: var(--color-success-tint);
		color: var(--color-success);
	}

	.badge.danger {
		background: var(--color-danger-tint);
		color: var(--color-danger);
	}

	.title {
		flex: 1;
		color: var(--color-ink);
		font-size: 15px;
		font-weight: 600;
		line-height: 18px;
	}

	.toggle,
	.note {
		color: var(--color-muted);
		font-size: var(--text-label);
		line-height: 16px;
		text-align: right;
	}

	.toggle:hover {
		color: var(--color-primary);
	}
</style>
