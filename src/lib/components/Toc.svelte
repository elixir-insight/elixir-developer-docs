<script lang="ts">
	interface Props {
		items: { id: string; title: string }[];
	}

	let { items }: Props = $props();

	let active = $state<string>();
	const current = $derived(active ?? items[0]?.id);

	$effect(() => {
		const sections = items
			.map((item) => document.getElementById(item.id))
			.filter((el): el is HTMLElement => el !== null);

		// The active section is the last one whose top has scrolled past the reading line.
		function update() {
			const line = 140;
			let id = sections[0]?.id;
			for (const section of sections) {
				if (section.getBoundingClientRect().top - line <= 0) id = section.id;
			}
			const atBottom =
				window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 2;
			active = atBottom ? sections.at(-1)?.id : id;
		}

		update();
		window.addEventListener('scroll', update, { passive: true });
		window.addEventListener('resize', update);
		return () => {
			window.removeEventListener('scroll', update);
			window.removeEventListener('resize', update);
		};
	});
</script>

<nav class="toc" aria-labelledby="toc-heading">
	<p id="toc-heading">On this page</p>
	<ul>
		{#each items as item (item.id)}
			<li>
				<a
					href="#{item.id}"
					class:active={item.id === current}
					aria-current={item.id === current ? 'location' : undefined}
				>
					{item.title}
				</a>
			</li>
		{/each}
	</ul>
</nav>

<style>
	.toc {
		position: sticky;
		top: calc(var(--header-height) + 48px);
		display: flex;
		flex-direction: column;
		width: 220px;
		flex-shrink: 0;
		padding-top: 4px;
	}

	p {
		padding-bottom: 12px;
		color: var(--color-ink);
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
		display: block;
		padding: 5px 0 5px 12px;
		border-left: 2px solid var(--color-line);
		color: var(--color-body);
		font-size: var(--text-small);
		line-height: 20px;
		transition:
			color 120ms ease,
			border-color 120ms ease;
	}

	a:hover {
		color: var(--color-ink);
	}

	a.active {
		border-left-color: var(--color-primary);
		color: var(--color-primary);
		font-weight: 500;
	}

	a:focus-visible {
		border-radius: 0;
	}
</style>
