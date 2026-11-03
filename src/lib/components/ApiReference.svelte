<script lang="ts">
	import type { Snippet } from 'svelte';
	import { endpointMarkdown, endpointPrompt, type Endpoint } from '#lib/api.ts';
	import ApiPlayground from './ApiPlayground.svelte';
	import Callout from './Callout.svelte';
	import CopyButton from './CopyButton.svelte';
	import DocPage from './DocPage.svelte';
	import EndpointBar from './EndpointBar.svelte';
	import FieldTable from './FieldTable.svelte';
	import PageHeader from './PageHeader.svelte';
	import ResponseCard from './ResponseCard.svelte';

	interface Props {
		endpoint: Endpoint;
		/** Extra content directly under the Responses heading (e.g. the QR preview). */
		afterResponsesHeading?: Snippet;
	}

	let { endpoint, afterResponsesHeading }: Props = $props();
</script>

<DocPage>
	{#snippet intro()}
		<PageHeader eyebrow={endpoint.eyebrow} title={endpoint.title}>
			{#snippet actions()}
				<CopyButton
					text={() => endpointMarkdown(endpoint)}
					label="Copy page"
					ariaLabel="Copy this page as Markdown"
				/>
				<CopyButton
					text={() => endpointPrompt(endpoint)}
					label="Copy for AI"
					ariaLabel="Copy this page as a prompt for an AI assistant"
				/>
			{/snippet}
			{endpoint.summary}
		</PageHeader>
		<EndpointBar method={endpoint.method} value={endpoint.path} />
	{/snippet}

	{#snippet samples()}
		<ApiPlayground operationId={endpoint.operationId} />
	{/snippet}

	<section class="section" aria-labelledby="headers">
		<h2 class="section-title" id="headers">Headers</h2>
		<FieldTable fields={endpoint.headers} caption="Request headers" />
		<Callout>{endpoint.secretWarning}</Callout>
	</section>

	<section class="section" aria-labelledby="request-body">
		<div class="heading-row">
			<h2 class="section-title" id="request-body">Request body</h2>
			<p class="legend"><span aria-hidden="true">*</span> Required</p>
		</div>
		<FieldTable
			fields={endpoint.body}
			columns={['Field', 'Type', 'Description']}
			caption="Request body fields"
		/>
	</section>

	<section class="section" aria-labelledby="responses">
		<h2 class="section-title" id="responses">Responses</h2>
		{#if afterResponsesHeading}
			<div class="after-heading">{@render afterResponsesHeading()}</div>
		{/if}
		<div class="responses">
			{#each endpoint.responses as response, i (response.sampleLabel)}
				<ResponseCard
					status={response.status}
					tone={response.tone}
					title={response.title}
					fields={response.fields}
					cases={response.cases}
					note={response.note}
					open={i === 0}
				/>
			{/each}
		</div>
	</section>
</DocPage>

<style>
	.section {
		padding-top: 44px;
	}

	.heading-row {
		display: flex;
		align-items: baseline;
		justify-content: space-between;
		gap: 12px;
	}

	.legend {
		color: var(--color-muted);
		font-size: var(--text-label);
		line-height: 16px;
	}

	.legend span {
		color: var(--color-danger);
	}

	.after-heading {
		margin: 16px 0 20px;
	}

	.responses {
		display: flex;
		flex-direction: column;
		gap: 12px;
	}
</style>
