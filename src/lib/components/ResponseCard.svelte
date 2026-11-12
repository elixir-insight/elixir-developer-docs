<script lang="ts">
	import type { ResponseCase } from '#lib/api.ts';
	import FieldTable, { type Field } from './FieldTable.svelte';

	interface Props {
		status: string;
		tone: 'success' | 'danger';
		title: string;
		fields?: Field[];
		cases?: ResponseCase[];
		/** Shown on the right instead of a toggle when there are no fields or cases. */
		note?: string;
		open?: boolean;
	}

	let { status, tone, title, fields, cases, note, open = $bindable(false) }: Props = $props();

	const uid = $props.id();
	const expandable = $derived(!!fields?.length || !!cases?.length);
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
				aria-controls="{uid}-body"
				aria-describedby="{uid}-title"
				onclick={() => (open = !open)}
			>
				{open ? 'Hide details' : 'Show details'}
			</button>
		{:else if note}
			<span class="note">{note}</span>
		{/if}
	</div>
	{#if expandable}
		<div id="{uid}-body" class="body" hidden={!open}>
			{#if note}
				<p class="guidance">{note}</p>
			{/if}
			{#if fields?.length}
				<FieldTable
					fields={fields}
					density="compact"
					attached={!!cases?.length}
					caption="{title} response fields"
				/>
			{/if}
			{#if cases?.length}
				<div class="cases" class:attached={!!fields?.length}>
					<table>
						<caption class="visually-hidden">{title} response cases</caption>
						<thead>
							<tr>
								<th scope="col">Message</th>
								<th scope="col">When</th>
							</tr>
						</thead>
						<tbody>
							{#each cases as item, i (item.code ? `${item.code}-${item.message}` : `${item.message}-${i}`)}
								<tr>
									<td class="message">{item.message}</td>
									<td class="when">{item.when}</td>
								</tr>
							{/each}
						</tbody>
					</table>
				</div>
			{/if}
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

	.body {
		border: 1px solid var(--color-line);
		border-top: 0;
		border-radius: 0 0 var(--radius-md) var(--radius-md);
		overflow: hidden;
	}

	.body > :global(.wrap) {
		border: 0;
		border-radius: 0;
	}

	.guidance {
		padding: 12px 16px;
		border-bottom: 1px solid var(--color-line);
		color: var(--color-body);
		font-size: var(--text-small);
		line-height: 22px;
	}

	.cases {
		overflow-x: auto;
	}

	.cases.attached {
		border-top: 1px solid var(--color-line);
	}

	table {
		width: 100%;
		border-collapse: collapse;
		table-layout: fixed;
		font-size: var(--text-small);
		line-height: 20px;
	}

	th,
	td {
		padding: 11px 16px;
		border-bottom: 1px solid var(--color-line);
		text-align: left;
		vertical-align: top;
		font-weight: 400;
	}

	tbody tr:last-child > * {
		border-bottom: 0;
	}

	thead th {
		background: var(--color-surface-2);
		color: var(--color-ink);
		font-size: var(--text-label);
		font-weight: 600;
		line-height: 16px;
	}

	.message {
		width: 48%;
		color: var(--color-ink);
		font-weight: 500;
	}

	.when {
		color: #334155;
	}

	@media (max-width: 720px) {
		table,
		thead,
		tbody,
		tr,
		th,
		td {
			display: block;
			width: auto;
		}

		thead {
			display: none;
		}

		tr {
			padding: 12px 16px;
			border-bottom: 1px solid var(--color-line);
		}

		tbody tr:last-child {
			border-bottom: 0;
		}

		th,
		td {
			padding: 0;
			border: 0;
		}

		.message {
			font-weight: 600;
		}

		.when {
			padding-top: 4px;
		}
	}
</style>
