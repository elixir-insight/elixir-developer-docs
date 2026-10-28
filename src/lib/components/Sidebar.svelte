<script lang="ts">
	import { resolve } from '$app/paths';
	import { page } from '$app/state';
	import { nav } from '#lib/nav.ts';
</script>

<nav class="sidebar" aria-label="Documentation">
	{#each nav as group (group.title)}
		<div class="group">
			<p class="group-title">{group.title}</p>
			<ul>
				{#each group.items as item (item.href)}
					{@const current = page.url.pathname === item.href}
					<li>
						<a
							href={resolve(item.href)}
							class:current
							aria-current={current ? 'page' : undefined}
						>
							<span>{item.title}</span>
							<!-- The design badges request methods only; webhooks keep an empty slot. -->
							<span class="method" aria-hidden={item.method !== 'POST'}>
								{item.method === 'POST' ? item.method : ''}
							</span>
						</a>
					</li>
				{/each}
			</ul>
		</div>
	{/each}
</nav>

<style>
	.sidebar {
		display: flex;
		flex-direction: column;
		gap: 4px;
		padding: 28px 16px;
	}

	.group {
		display: flex;
		flex-direction: column;
		padding-bottom: 20px;
	}

	.group-title {
		padding: 0 10px 8px;
		color: var(--color-muted);
		font-size: var(--text-label);
		font-weight: 600;
		line-height: 16px;
	}

	ul {
		display: flex;
		flex-direction: column;
		gap: 2px;
	}

	a {
		display: flex;
		align-items: center;
		justify-content: space-between;
		height: 34px;
		padding-inline: 10px;
		border-radius: var(--radius-sm);
		color: var(--color-body);
		font-size: 15px;
		line-height: 18px;
	}

	a:hover {
		background: var(--color-line);
		color: var(--color-ink);
	}

	a.current {
		background: var(--color-primary-tint);
		color: var(--color-primary);
		font-weight: 600;
	}

	.method {
		flex-shrink: 0;
		width: 36px;
		color: var(--color-success);
		font-family: var(--font-mono);
		font-size: 11px;
		font-weight: 600;
		line-height: 14px;
		text-align: right;
	}
</style>
