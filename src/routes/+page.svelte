<script lang="ts">
	import { resolve } from '$app/paths';
	import { BASE_URL, createOrder, upiIntent } from '#lib/api.ts';
	import DocPage from '#lib/components/DocPage.svelte';
	import EndpointBar from '#lib/components/EndpointBar.svelte';
	import FieldTable, { type Field } from '#lib/components/FieldTable.svelte';
	import PageHeader from '#lib/components/PageHeader.svelte';

	const flow = [
		{
			color: 'var(--color-brand-red)',
			title: 'Create an order',
			body: 'Your server calls Create order and gets a checkoutUrl.'
		},
		{
			color: 'var(--color-brand-yellow)',
			title: 'Customer pays',
			body: 'They pay on hosted checkout, or scan a UPI QR.'
		},
		{
			color: 'var(--color-brand-sky)',
			title: 'Customer returns',
			body: 'ElixirPay redirects to your success, cancel or failure URL.'
		},
		{
			color: 'var(--color-primary)',
			title: 'Webhook confirms',
			body: 'Your server receives the final status. Fulfil from here.'
		}
	];

	const apis = [
		{
			method: 'POST',
			title: createOrder.title,
			path: createOrder.path,
			href: '/api/create-order',
			body: 'Hosted checkout for UPI, card and net banking'
		},
		{
			method: 'POST',
			title: upiIntent.title,
			path: upiIntent.path,
			href: '/api/upi-intent',
			body: 'A upi:// link and QR code you show yourself'
		},
		{
			method: 'HOOK',
			title: 'Payment webhooks',
			path: 'Your callback URL',
			href: '/api/webhooks',
			body: 'Final payment status, sent to your server'
		}
	] as const;

	const credentials: Field[] = [
		{ name: 'orgId', description: 'Your organization ID, sent in every request body' },
		{ name: 'X-Client-Key', description: 'Identifies your account' },
		{ name: 'X-Client-Secret', description: 'Authenticates the request. Server only.' }
	];

	const toc = [
		{ id: 'base-url', title: 'Base URL' },
		{ id: 'how-a-payment-works', title: 'How a payment works' },
		{ id: 'apis', title: 'APIs' },
		{ id: 'before-you-start', title: 'Before you start' }
	];
</script>

<DocPage {toc}>
	{#snippet intro()}
		<PageHeader eyebrow="Getting started" title="ElixirPay API" hero>
			Accept payments from your backend with three building blocks: hosted checkout orders, UPI
			intent links with QR codes, and server-to-server webhooks that confirm the result.
		</PageHeader>
	{/snippet}

	<section id="base-url" aria-label="Base URL">
		<EndpointBar label="Base URL" value={BASE_URL} />
		<p class="note">All requests use HTTPS and JSON, and must be sent from your server.</p>
	</section>

	<section class="section roomy" aria-labelledby="how-a-payment-works">
		<h2 class="section-title" id="how-a-payment-works">How a payment works</h2>
		<ol class="flow">
			{#each flow as step, i (step.title)}
				<li>
					<span class="bar" style:background={step.color} aria-hidden="true"></span>
					<span class="step-num">{i + 1}</span>
					<h3>{step.title}</h3>
					<p>{step.body}</p>
				</li>
			{/each}
		</ol>
	</section>

	<section class="section" aria-labelledby="apis">
		<h2 class="section-title" id="apis">APIs</h2>
		<ul class="apis">
			{#each apis as api (api.href)}
				<li>
					<a href={resolve(api.href)}>
						<span class="method" class:hook={api.method === 'HOOK'}>{api.method}</span>
						<span class="api-name">
							<strong>{api.title}</strong>
							<code>{api.path}</code>
						</span>
						<span class="api-desc">{api.body}</span>
					</a>
				</li>
			{/each}
		</ul>
	</section>

	<section class="section" aria-labelledby="before-you-start">
		<h2 class="section-title" id="before-you-start">Before you start</h2>
		<p class="prose">
			ElixirPay issues three values when your account is set up. Keep them in environment
			variables on your server.
		</p>
		<FieldTable fields={credentials} caption="Credentials" />
	</section>
</DocPage>

<style>
	.note {
		padding-top: 10px;
		color: var(--color-muted);
		font-size: var(--text-small);
		line-height: 22px;
	}

	.section {
		padding-top: 52px;
	}

	.section.roomy {
		gap: 18px;
	}

	/* How a payment works: four equal cells in one bordered strip */
	.flow {
		display: grid;
		grid-template-columns: repeat(4, minmax(0, 1fr));
		border: 1px solid var(--color-line);
		border-radius: var(--radius-md);
		overflow: hidden;
	}

	.flow li {
		display: flex;
		flex-direction: column;
		gap: 10px;
		padding: 18px 16px 20px;
	}

	.flow li + li {
		border-left: 1px solid var(--color-line);
	}

	.bar {
		width: 28px;
		height: 4px;
		border-radius: 2px;
	}

	.step-num {
		color: var(--color-muted);
		font-size: var(--text-label);
		font-weight: 600;
		line-height: 16px;
	}

	h3 {
		margin: 0;
		color: var(--color-ink);
		font-size: 15px;
		font-weight: 600;
		line-height: 22px;
	}

	.flow p {
		font-size: var(--text-small);
		line-height: 21px;
	}

	/* API list */
	.apis {
		border: 1px solid var(--color-line);
		border-radius: var(--radius-md);
		overflow: hidden;
	}

	.apis li + li {
		border-top: 1px solid var(--color-line);
	}

	.apis a {
		display: flex;
		align-items: center;
		gap: 16px;
		padding: 16px;
		transition: background-color 120ms ease;
	}

	.apis a:hover {
		background: var(--color-surface-2);
	}

	.method {
		flex-shrink: 0;
		width: 52px;
		padding-block: 4px;
		background: var(--color-success-tint);
		border-radius: var(--radius-sm);
		color: var(--color-success);
		font-family: var(--font-mono);
		font-size: 12px;
		font-weight: 600;
		line-height: 16px;
		text-align: center;
	}

	.method.hook {
		background: var(--color-primary-tint);
		color: var(--color-primary);
	}

	.api-name {
		display: flex;
		flex-direction: column;
		gap: 2px;
		flex: 1;
		min-width: 0;
	}

	strong {
		color: var(--color-ink);
		font-size: 15px;
		font-weight: 600;
		line-height: 18px;
	}

	.apis a:hover strong {
		color: var(--color-primary);
	}

	code {
		color: var(--color-muted);
		font-size: var(--text-label);
		line-height: 16px;
	}

	.api-desc {
		flex-shrink: 0;
		width: 220px;
		font-size: var(--text-small);
		line-height: 18px;
	}

	@media (max-width: 720px) {
		.flow {
			grid-template-columns: repeat(2, minmax(0, 1fr));
		}

		.flow li + li {
			border-left: 0;
		}

		.flow li:nth-child(even) {
			border-left: 1px solid var(--color-line);
		}

		.flow li:nth-child(n + 3) {
			border-top: 1px solid var(--color-line);
		}

		.apis a {
			flex-wrap: wrap;
			align-items: flex-start;
		}

		.api-desc {
			width: auto;
			flex-basis: 100%;
			padding-left: 68px;
		}
	}

	@media (max-width: 420px) {
		.flow {
			grid-template-columns: minmax(0, 1fr);
		}

		.flow li:nth-child(even) {
			border-left: 0;
		}

		.flow li + li {
			border-top: 1px solid var(--color-line);
		}
	}
</style>
