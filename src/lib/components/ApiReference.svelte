<script lang="ts">
	import type { Snippet } from 'svelte';
	import { endpointMarkdown, endpointPrompt, endpointSamples, type Endpoint } from '#lib/api.ts';
	import { toJson } from '#lib/samples.ts';
	import Callout from './Callout.svelte';
	import CodeBlock from './CodeBlock.svelte';
	import CopyButton from './CopyButton.svelte';
	import DocPage from './DocPage.svelte';
	import EndpointBar from './EndpointBar.svelte';
	import FieldTable from './FieldTable.svelte';
	import PageHeader from './PageHeader.svelte';
	import ResponseCard from './ResponseCard.svelte';

	interface Props {
		endpoint: Endpoint;
		/** Extra content under the response samples (e.g. the QR preview). */
		afterSamples?: Snippet;
	}

	let { endpoint, afterSamples }: Props = $props();

	const requestTabs = $derived(endpointSamples(endpoint));
	const responseTabs = $derived(
		endpoint.responses.map((r) => ({ label: r.sampleLabel, code: toJson(r.sample) }))
	);
	const [primaryResponse] = $derived(endpoint.responses);
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
		<EndpointBar method={endpoint.method} value={endpoint.url} />
	{/snippet}

	{#snippet samples()}
		<CodeBlock tabs={requestTabs} syncLanguage label="Request samples" size="sm" />
		{#if endpoint.tabbedResponses}
			<CodeBlock tabs={responseTabs} label="Response samples" size="sm" />
		{:else}
			<CodeBlock
				code={toJson(primaryResponse.sample)}
				badge={{ text: primaryResponse.status, tone: primaryResponse.tone }}
				caption={primaryResponse.title}
				label="Response sample"
				size="sm"
			/>
		{/if}
		{@render afterSamples?.()}
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
		{#each endpoint.responses as response, i (response.status)}
			<ResponseCard
				status={response.status}
				tone={response.tone}
				title={response.title}
				fields={response.fields}
				note={response.note}
				open={i === 0}
			/>
		{/each}
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
</style>
