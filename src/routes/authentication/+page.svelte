<script lang="ts">
	import { resolve } from '$app/paths';
	import Callout from '#lib/components/Callout.svelte';
	import CodeBlock from '#lib/components/CodeBlock.svelte';
	import DocPage from '#lib/components/DocPage.svelte';
	import FieldTable, { type Field } from '#lib/components/FieldTable.svelte';
	import PageHeader from '#lib/components/PageHeader.svelte';
	import { authCurl } from '#lib/snippets.ts';

	const headers: Field[] = [
		{ name: 'X-Client-Key', required: true, description: 'Unique client key issued by ElixirPay' },
		{ name: 'X-Client-Secret', required: true, description: 'Secret paired with your client key' },
		{ name: 'Content-Type', required: true, description: 'Always application/json' }
	];

	const rules = [
		{ ok: true, text: 'Store both keys in environment variables or a secrets manager.' },
		{ ok: true, text: 'Call ElixirPay only from your backend.' },
		{ ok: false, text: 'Never put the secret in a browser, mobile app or public repository.' }
	];

	const toc = [
		{ id: 'request-headers', title: 'Request headers' },
		{ id: 'example', title: 'Example' },
		{ id: 'keep-your-secret-safe', title: 'Keep your secret safe' },
		{ id: 'webhook-secret', title: 'Webhook secret' }
	];
</script>

<DocPage {toc}>
	{#snippet intro()}
		<PageHeader eyebrow="Getting started" title="Authentication">
			Every request is authenticated with two headers: your client key and client secret. There
			are no tokens to refresh.
		</PageHeader>
	{/snippet}

	<section class="section first" aria-labelledby="request-headers">
		<h2 class="section-title" id="request-headers">Request headers</h2>
		<FieldTable fields={headers} columns={['Header', 'Description']} caption="Request headers" />
	</section>

	<section class="section" aria-labelledby="example">
		<h2 class="section-title" id="example">Example</h2>
		<CodeBlock code={authCurl} filename="cURL" />
	</section>

	<section class="section" aria-labelledby="keep-your-secret-safe">
		<h2 class="section-title" id="keep-your-secret-safe">Keep your secret safe</h2>
		<ul class="rules">
			{#each rules as rule (rule.text)}
				<li>
					<svg width="20" height="20" viewBox="0 0 20 20" class:bad={!rule.ok} aria-hidden="true">
						<circle cx="10" cy="10" r="8" />
						{#if rule.ok}
							<path d="M6.5 10.2l2.3 2.3 4.7-4.8" />
						{:else}
							<path d="M7 7l6 6M13 7l-6 6" />
						{/if}
					</svg>
					<span class="visually-hidden">{rule.ok ? 'Do:' : 'Don’t:'}</span>
					{rule.text}
				</li>
			{/each}
		</ul>
		<Callout>
			If your secret is ever exposed, contact ElixirPay straight away so it can be replaced.
		</Callout>
	</section>

	<section class="section" aria-labelledby="webhook-secret">
		<h2 class="section-title" id="webhook-secret">Webhook secret</h2>
		<p class="prose">
			Callbacks from ElixirPay use a separate secret that you choose, 10 to 15 characters long. It
			arrives in the X-Secret-Key header so you can verify the sender. See
			<a class="inline-link" href={resolve('/api/webhooks')}>Payment webhooks</a>.
		</p>
	</section>
</DocPage>

<style>
	.section.first {
		padding-top: 12px;
	}

	.rules {
		display: flex;
		flex-direction: column;
		gap: 12px;
	}

	li {
		display: flex;
		align-items: flex-start;
		gap: 12px;
		font-size: 15px;
		line-height: 22px;
	}

	svg {
		flex-shrink: 0;
		fill: none;
		stroke: var(--color-success);
		stroke-width: 1.6;
	}

	svg.bad {
		stroke: var(--color-danger);
	}
</style>
