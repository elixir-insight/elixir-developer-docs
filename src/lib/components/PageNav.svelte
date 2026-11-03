<script lang="ts">
	import { resolve } from '$app/paths';
	import { page } from '$app/state';
	import { siblings } from '#lib/nav.ts';

	const links = $derived(siblings(page.url.pathname));
</script>

{#if links.previous || links.next}
	<nav class="pager" aria-label="Pagination">
		{#if links.previous}
			<a class="prev" href={resolve(links.previous.href)} rel="prev">
				<span class="direction">Previous</span>
				<span class="title">{links.previous.title}</span>
			</a>
		{:else}
			<span class="spacer" aria-hidden="true"></span>
		{/if}
		{#if links.next}
			<a class="next" href={resolve(links.next.href)} rel="next">
				<span class="direction">Next</span>
				<span class="title">{links.next.title}</span>
			</a>
		{/if}
	</nav>
{/if}

<style>
	.pager {
		display: flex;
		justify-content: space-between;
		gap: 16px;
		padding-top: 56px;
	}

	a,
	.spacer {
		display: flex;
		flex-direction: column;
		gap: 4px;
		width: 280px;
		max-width: calc(50% - 8px);
	}

	a {
		padding: 16px 18px;
		border: 1px solid var(--color-line);
		border-radius: var(--radius-md);
		transition:
			border-color 120ms ease,
			background-color 120ms ease;
	}

	.next {
		align-items: flex-end;
		margin-left: auto;
		text-align: right;
	}

	a:hover {
		border-color: var(--color-primary);
		background: var(--color-surface-2);
	}

	.direction {
		color: var(--color-muted);
		font-size: var(--text-label);
		line-height: 16px;
	}

	.title {
		color: var(--color-primary);
		font-size: var(--text-body);
		font-weight: 600;
		line-height: 20px;
	}

	@media (max-width: 560px) {
		.pager {
			flex-direction: column;
		}

		a,
		.spacer {
			width: 100%;
			max-width: none;
		}

		.spacer {
			display: none;
		}

		.next {
			align-items: flex-start;
			margin-left: 0;
			text-align: left;
		}
	}
</style>
