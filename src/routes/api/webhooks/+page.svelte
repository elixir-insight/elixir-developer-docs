<script lang="ts">
	import CodeBlock from '#lib/components/CodeBlock.svelte';
	import DocPage from '#lib/components/DocPage.svelte';
	import EndpointBar from '#lib/components/EndpointBar.svelte';
	import FieldTable, { type Field } from '#lib/components/FieldTable.svelte';
	import PageHeader from '#lib/components/PageHeader.svelte';
	import { callbackSample, webhookHandler } from '#lib/snippets.ts';

	const setup: Field[] = [
		{
			name: 'Payment Callback URL',
			description: 'HTTPS endpoint on your server that receives callbacks'
		},
		{ name: 'Event type', description: 'The payment events you want to receive' },
		{ name: 'Secret key', description: '10 to 15 characters, chosen by you. Sent back in every callback.' }
	];

	const steps = [
		'Read the X-Secret-Key header.',
		'Reject the request if it doesn’t match the secret you shared.',
		'Find the order by clientOrderId, update it, then respond with HTTP 200.'
	];

	const payload: Field[] = [
		{ name: 'status', type: 'string', description: 'Current payment status' },
		{ name: 'orderId', type: 'string', description: 'ElixirPay order ID' },
		{ name: 'attemptId', type: 'string', description: 'Payment attempt ID' },
		{
			name: 'clientOrderId',
			type: 'string',
			accent: true,
			description: 'Your order reference — use it to find the order'
		},
		{ name: 'amount', type: 'string', description: 'Order amount' },
		{ name: 'message', type: 'string', description: 'Human-readable result' }
	];
</script>

<DocPage>
	{#snippet intro()}
		<PageHeader eyebrow="API reference / Webhooks" title="Payment webhooks">
			ElixirPay calls your server when a payment changes state. The body matches the pay-in
			transaction response, so you can reuse the same parsing code.
		</PageHeader>
		<EndpointBar
			method="CALLBACK"
			tone="primary"
			value="ElixirPay → your Payment Callback URL"
			copyable={false}
		/>
	{/snippet}

	{#snippet samples()}
		<CodeBlock code={callbackSample} caption="Callback sent to your server" size="sm" />
		<CodeBlock code={webhookHandler} filename="webhook.js" />
	{/snippet}

	<section class="section" aria-labelledby="set-up">
		<h2 class="section-title" id="set-up">Set up</h2>
		<p class="prose">Share these with ElixirPay to switch callbacks on.</p>
		<FieldTable fields={setup} names="label" caption="Callback settings" />
	</section>

	<section class="section" aria-labelledby="verify">
		<h2 class="section-title" id="verify">Verify each callback</h2>
		<ol class="steps">
			{#each steps as step, i (step)}
				<li><span class="num" aria-hidden="true">{i + 1}</span>{step}</li>
			{/each}
		</ol>
	</section>

	<section class="section" aria-labelledby="payload">
		<h2 class="section-title" id="payload">Payload</h2>
		<FieldTable
			fields={payload}
			columns={['Field', 'Type', 'Description']}
			density="compact"
			caption="Callback payload fields"
		/>
	</section>
</DocPage>

<style>
	.section {
		padding-top: 44px;
	}

	.steps {
		display: flex;
		flex-direction: column;
		gap: 14px;
	}

	li {
		display: flex;
		align-items: flex-start;
		gap: 14px;
		font-size: 15px;
		line-height: 24px;
	}

	.num {
		display: flex;
		align-items: center;
		justify-content: center;
		flex-shrink: 0;
		width: 24px;
		height: 24px;
		background: var(--color-ink);
		border-radius: 12px;
		color: #ffffff;
		font-size: 12px;
		font-weight: 700;
		line-height: 16px;
	}
</style>
