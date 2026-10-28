<script lang="ts">
	import CodeBlock from '#lib/components/CodeBlock.svelte';
	import DocPage from '#lib/components/DocPage.svelte';
	import PageHeader from '#lib/components/PageHeader.svelte';
	import {
		createOrderNode,
		envMasked,
		envTemplate,
		redirectNode,
		webhookHandler
	} from '#lib/snippets.ts';

	const steps = [
		{
			title: 'Get your keys',
			body: 'ElixirPay gives you an orgId, a client key and a client secret. Add them to your server’s environment — never to frontend code.',
			filename: '.env',
			code: envMasked,
			revealed: envTemplate
		},
		{
			title: 'Create an order',
			body: 'From your server, call Create order with the amount, your own order ID, the customer and three redirect URLs.',
			filename: 'server.js',
			code: createOrderNode
		},
		{
			title: 'Send the customer to checkout',
			body: 'Redirect to the checkoutUrl in the response. When they finish, ElixirPay sends them back to the matching merchantUrl.',
			filename: 'server.js',
			code: redirectNode
		},
		{
			title: 'Confirm with the webhook',
			body: 'Don’t fulfil on the redirect alone. Wait for the callback, check X-Secret-Key matches the secret you shared, then update the order.',
			filename: 'webhook.js',
			code: webhookHandler
		}
	];
</script>

<DocPage wide>
	{#snippet intro()}
		<PageHeader eyebrow="Getting started" title="Quickstart">
			Take your first payment in four steps. Examples use Node.js; every API page has cURL, PHP,
			Python and Java too.
		</PageHeader>
	{/snippet}

	<ol class="steps">
		{#each steps as step, i (step.title)}
			<li class="step">
				<div class="text">
					<div class="rail" aria-hidden="true">
						<span class="num">{i + 1}</span>
						{#if i < steps.length - 1}<span class="line"></span>{/if}
					</div>
					<div class="copy">
						<h2>{step.title}</h2>
						<p>{step.body}</p>
					</div>
				</div>
				<CodeBlock code={step.code} filename={step.filename} revealed={step.revealed} />
			</li>
		{/each}
	</ol>
</DocPage>

<style>
	.steps {
		padding-top: 16px;
	}

	.step {
		display: flex;
		gap: 40px;
		padding-bottom: 48px;
	}

	.step > :global(.panel) {
		flex: 1;
	}

	.text {
		display: flex;
		gap: 16px;
		flex-shrink: 0;
		width: 440px;
	}

	.rail {
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 8px;
		flex-shrink: 0;
		width: 28px;
	}

	.num {
		display: flex;
		align-items: center;
		justify-content: center;
		flex-shrink: 0;
		width: 28px;
		height: 28px;
		background: var(--color-ink);
		border-radius: 14px;
		color: #ffffff;
		font-size: 13px;
		font-weight: 700;
		line-height: 16px;
	}

	.line {
		flex: 1;
		width: 1px;
		background: var(--color-line);
	}

	.copy {
		display: flex;
		flex-direction: column;
		gap: 8px;
		padding-top: 2px;
	}

	h2 {
		color: var(--color-ink);
		font-size: 19px;
		font-weight: 700;
		line-height: 26px;
	}

	p {
		font-size: 15px;
		line-height: 25px;
	}

	@media (max-width: 1100px) {
		.step {
			flex-direction: column;
			gap: 20px;
		}

		.text {
			width: auto;
		}

		.step > :global(.panel) {
			margin-left: 44px;
		}
	}

	@media (max-width: 560px) {
		.step > :global(.panel) {
			margin-left: 0;
		}
	}
</style>
