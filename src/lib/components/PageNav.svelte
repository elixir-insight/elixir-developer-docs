<script lang="ts">
	import { resolve } from '$app/paths';
	import { page } from '$app/state';
	import { siblings } from '#lib/nav.ts';

	// One card per page: "Next" while there is one, otherwise "Previous" on the last page.
	const link = $derived.by(() => {
		const { previous, next } = siblings(page.url.pathname);
		if (next) return { ...next, direction: 'Next' as const };
		if (previous) return { ...previous, direction: 'Previous' as const };
		return undefined;
	});
</script>

{#if link}
	<nav class="pager" class:next={link.direction === 'Next'} aria-label="Pagination">
		<a href={resolve(link.href)} rel={link.direction === 'Next' ? 'next' : 'prev'}>
			<span class="direction">{link.direction}</span>
			<span class="title">{link.title}</span>
		</a>
	</nav>
{/if}

<style>
	.pager {
		display: flex;
		padding-top: 56px;
	}

	.pager.next {
		justify-content: flex-end;
	}

	a {
		display: flex;
		flex-direction: column;
		gap: 4px;
		width: 280px;
		max-width: 100%;
		padding: 16px 18px;
		border: 1px solid var(--color-line);
		border-radius: var(--radius-md);
		transition:
			border-color 120ms ease,
			background-color 120ms ease;
	}

	.next a {
		align-items: flex-end;
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
</style>
