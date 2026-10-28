<script lang="ts" module>
	export interface Field {
		name: string;
		description: string;
		type?: string;
		required?: boolean;
		/** Draw attention to this row: primary-coloured name. */
		accent?: boolean;
		/** Tint the row, e.g. fields that only this endpoint has. */
		highlight?: boolean;
		children?: Field[];
	}
</script>

<script lang="ts">
	interface Props {
		fields: Field[];
		/** Column headings. Omit to render without a heading row. */
		columns?: [name: string, description: string] | [name: string, type: string, description: string];
		/** "code" renders names in monospace (field names); "label" in semibold sans (setting names). */
		names?: 'code' | 'label';
		density?: 'regular' | 'compact';
		/** Accessible caption. */
		caption?: string;
		/** Keep the bottom border on the last row (when something is attached below). */
		attached?: boolean;
	}

	let { fields, columns, names = 'code', density = 'regular', caption, attached = false }: Props =
		$props();

	const hasType = $derived(
		columns ? columns.length === 3 : fields.some((f) => f.type || f.children?.some((c) => c.type))
	);
</script>

{#snippet name(field: Field)}
	<span class="name {names}" class:accent={field.accent}>
		{field.name}{#if field.required}<span class="required" aria-label="required">&nbsp;*</span>{/if}
	</span>
{/snippet}

<div class="wrap" class:attached>
	<table class={density} class:has-type={hasType}>
		{#if caption}<caption class="visually-hidden">{caption}</caption>{/if}
		<colgroup>
			<col class="col-name" />
			{#if hasType}<col class="col-type" />{/if}
			<col />
		</colgroup>
		{#if columns}
			<thead>
				<tr>
					{#each columns as column (column)}
						<th scope="col">{column}</th>
					{/each}
				</tr>
			</thead>
		{/if}
		<tbody>
			{#each fields as field (field.name)}
				<tr class:highlight={field.highlight} class:parent={field.children}>
					<th scope="row">{@render name(field)}</th>
					{#if hasType}<td class="type">{field.type ?? ''}</td>{/if}
					<td class="desc">{field.description}</td>
				</tr>
				{#each field.children ?? [] as child, i (child.name)}
					<tr
						class="child"
						class:first={i === 0}
						class:last={i === field.children!.length - 1}
						class:highlight={child.highlight}
					>
						<th scope="row">
							<span class="visually-hidden">{field.name}.</span>{@render name(child)}
						</th>
						{#if hasType}<td class="type">{child.type ?? ''}</td>{/if}
						<td class="desc">{child.description}</td>
					</tr>
				{/each}
			{/each}
		</tbody>
	</table>
</div>

<style>
	.wrap {
		border: 1px solid var(--color-line);
		border-radius: var(--radius-md);
		overflow: hidden;
	}

	.wrap.attached {
		border-radius: 0 0 var(--radius-md) var(--radius-md);
		border-top: 0;
	}

	table {
		width: 100%;
		border-collapse: separate;
		border-spacing: 0;
		table-layout: fixed;
		font-size: var(--text-small);
		line-height: 22px;
	}

	th,
	td {
		padding: 13px 16px;
		border-bottom: 1px solid var(--color-line);
		text-align: left;
		vertical-align: top;
		font-weight: 400;
	}

	tr > :not(:first-child) {
		padding-left: 0;
	}

	table.compact th,
	table.compact td {
		padding-block: 11px;
	}

	tbody tr:last-child > * {
		border-bottom: 0;
	}

	/* Column widths: 16 inset + name 200 + 16 gap, type 64 + 16 gap, description fills. */
	.col-name {
		width: 232px;
	}

	.col-type {
		width: 80px;
	}

	thead th {
		padding-block: 10px;
		background: var(--color-surface-2);
		color: var(--color-ink);
		font-size: var(--text-label);
		font-weight: 600;
		line-height: 16px;
	}

	.name {
		color: var(--color-ink);
	}

	.name.code {
		font-family: var(--font-mono);
		font-size: var(--text-label);
		font-feature-settings:
			'calt' 0,
			'liga' 0;
	}

	.name.label {
		font-weight: 600;
	}

	.name.accent {
		color: var(--color-primary);
		font-weight: 500;
	}

	.required {
		color: var(--color-danger);
	}

	.type {
		color: var(--color-muted);
		font-family: var(--font-mono);
		font-size: 12px;
	}

	.desc {
		color: var(--color-body);
	}

	tr.highlight > * {
		background: var(--color-primary-tint);
	}

	/* Nested fields (e.g. customer.*) sit on a tinted band, indented. */
	tr.child > * {
		padding-block: 8px;
		background: var(--color-surface-2);
		border-bottom: 0;
	}

	tr.child > :first-child {
		padding-left: 32px;
	}

	tr.child.first > * {
		padding-top: 12px;
	}

	tr.child.last > * {
		padding-bottom: 18px;
		border-bottom: 1px solid var(--color-line);
	}

	tbody tr.child.last:last-child > * {
		border-bottom: 0;
	}

	@media (max-width: 560px) {
		table,
		tbody,
		tr,
		th,
		td {
			display: block;
			width: auto !important;
		}

		thead {
			display: none;
		}

		tr {
			display: flex;
			flex-wrap: wrap;
			column-gap: 12px;
			padding: 12px 16px;
			border-bottom: 1px solid var(--color-line);
		}

		tbody tr:last-child {
			border-bottom: 0;
		}

		th,
		td,
		table.compact th,
		table.compact td,
		tr.child > *,
		tr.child.first > *,
		tr.child.last > * {
			padding: 0;
			border: 0;
		}

		td.desc {
			flex-basis: 100%;
			padding-top: 4px;
		}

		tr.child {
			padding-left: 32px;
			background: var(--color-surface-2);
		}

		tr.child:not(.last) {
			border-bottom: 0;
		}

		tr.child > :first-child {
			padding-left: 0;
		}

		tr.highlight {
			background: var(--color-primary-tint);
		}
	}
</style>
