<script lang="ts">
	import CodeBlock from './CodeBlock.svelte';
	import { highlightJson } from '#lib/highlight.ts';
	import {
		playgroundModel,
		requestBodyIsComplete,
		requestBodySchema,
		responseText,
		// Live proxy — re-enable with LIVE_API below.
		// runOperation,
		type ExecuteResult,
		type HeaderField
	} from '#lib/playground.ts';
	import { toJson, type Json } from '#lib/samples.ts';

	interface Props {
		operationId: string;
	}

	/** Flip to `true` to call POST /api/execute against the real API again. */
	const LIVE_API = false;

	let { operationId }: Props = $props();

	// operationId is fixed per page mount; resolve once so the editor keeps local edits.
	// svelte-ignore state_referenced_locally
	const resolved = playgroundModel(operationId);
	if (!resolved) {
		// svelte-ignore state_referenced_locally
		throw new Error(`No documented POST operation with id "${operationId}".`);
	}
	const model = resolved;
	const bodySchema = requestBodySchema(model.operationId);

	let headers = $state<HeaderField[]>(model.headers.map((h) => ({ ...h })));
	let bodyText = $state(model.bodyText);
	let running = $state(false);
	let result = $state<ExecuteResult | null>(null);
	let clientInvalid = $state(false);
	let highlightEl = $state<HTMLPreElement | undefined>();

	const exampleTabs = $derived(
		model.examples.map((example) => ({
			label: example.label,
			code: toJson(example.value)
		}))
	);

	const highlightedBody = $derived(tokensToHtml(highlightJson(bodyText)));
	const highlightedResponse = $derived(
		result?.kind === 'http' ? tokensToHtml(highlightJson(responseText(result))) : ''
	);

	function escapeHtml(text: string) {
		return text
			.replaceAll('&', '&amp;')
			.replaceAll('<', '&lt;')
			.replaceAll('>', '&gt;')
			.replaceAll('"', '&quot;');
	}

	function tokensToHtml(tokens: ReturnType<typeof highlightJson>) {
		return tokens
			.map((token) => `<span class="tok-${token.type}">${escapeHtml(token.text)}</span>`)
			.join('');
	}

	function mockHttp(status: number, value: Json): ExecuteResult {
		return {
			kind: 'http',
			status,
			ok: status >= 200 && status < 300,
			body: toJson(value),
			json: value
		};
	}

	function findExample(...labels: string[]) {
		return model.examples.find((example) =>
			labels.some((label) => example.label === label || example.status === label)
		);
	}

	function successMock(): ExecuteResult {
		const example =
			findExample('created', 'Success', '201', '200') ??
			model.examples.find((e) => !e.status.startsWith('4') && !e.status.startsWith('5'));
		if (!example) {
			return { kind: 'rejected', message: 'No documented success sample is available.' };
		}
		return mockHttp(Number(example.status) || 201, example.value);
	}

	function failMock(): ExecuteResult {
		const example = findExample('invalid-payload', '400', 'Failure', 'rejected', '502');
		if (example) return mockHttp(Number(example.status) || 400, example.value);
		return mockHttp(400, {
			message: 'Invalid Payload',
			statusCode: 400
		});
	}

	async function run() {
		clientInvalid = false;
		const missingHeader = headers.some((header) => !header.value.trim());

		let body: unknown;
		try {
			body = JSON.parse(bodyText);
		} catch {
			clientInvalid = true;
			result = { kind: 'invalid-json' };
			return;
		}

		running = true;
		result = null;
		try {
			if (!LIVE_API) {
				// Live API temporarily disabled — documented mocks only.
				await new Promise((resolve) => setTimeout(resolve, 180));
				const valid = !missingHeader && requestBodyIsComplete(body, bodySchema);
				result = valid ? successMock() : failMock();
				return;
			}

			// result = await runOperation({
			// 	operationId: model.operationId,
			// 	headers: headers.map(({ name, value }) => ({ name, value })),
			// 	bodyText
			// });
			result = {
				kind: 'rejected',
				message: 'Live API is disabled. Set LIVE_API to true in ApiPlayground.svelte.'
			};
		} finally {
			running = false;
		}
	}
</script>

<div class="stack">
	<section class="playground" aria-label="API playground">
		<div class="toolbar">
			<span class="method">{model.method}</span>
			<input
				class="path"
				readonly
				value={model.path}
				aria-label="Request path"
				spellcheck="false"
			/>
			<button type="button" class="run" disabled={running} onclick={run}>
				{running ? 'Running…' : 'Run request'}
			</button>
		</div>

		<div class="headers" role="group" aria-label="Request headers">
			{#each headers as header, i (header.name)}
				<label class="field">
					<span class="label">{header.name}</span>
					<input
						type={header.secret ? 'password' : 'text'}
						autocomplete="off"
						spellcheck="false"
						bind:value={headers[i].value}
						readonly={header.name === 'Content-Type'}
					/>
				</label>
			{/each}
		</div>

		<div class="section-head">
			<p class="section-label">Request body</p>
			<span class="meta">JSON · editable</span>
		</div>
		<div class="editor" class:invalid={clientInvalid}>
			<pre class="highlight" aria-hidden="true" bind:this={highlightEl}><code
					>{@html highlightedBody}</code
				></pre>
			<textarea
				class="source"
				spellcheck="false"
				aria-label="Request body"
				aria-invalid={clientInvalid}
				bind:value={bodyText}
				oninput={() => (clientInvalid = false)}
				onscroll={(event) => {
					if (!highlightEl) return;
					const area = event.currentTarget;
					highlightEl.scrollTop = area.scrollTop;
					highlightEl.scrollLeft = area.scrollLeft;
				}}
			></textarea>
		</div>

		<div class="response-panel" aria-live="polite">
			<div class="section-head response-head">
				<p class="section-label response-title">Response</p>
				{#if result?.kind === 'http'}
					<span class="status" class:ok={result.ok} class:fail={!result.ok}>{result.status}</span>
				{/if}
			</div>
			<div class="response">
				{#if running}
					<p class="placeholder">{LIVE_API ? 'Waiting for the API…' : 'Loading mock response…'}</p>
				{:else if !result}
					<p class="placeholder">No request has been sent.</p>
				{:else if result.kind === 'invalid-json'}
					<p class="placeholder error">
						The request body is not valid JSON, so nothing was sent.
					</p>
				{:else if result.kind === 'network'}
					<p class="placeholder error">{result.message}</p>
				{:else if result.kind === 'rejected'}
					<p class="placeholder error">{result.message}</p>
				{:else if result.body === ''}
					<p class="placeholder">The response body was empty.</p>
				{:else}
					{#if !LIVE_API}
						<p class="placeholder mock-note">Documented sample — live API temporarily disabled.</p>
					{/if}
					<pre class="body"><code>{@html highlightedResponse}</code></pre>
				{/if}
			</div>
		</div>
	</section>

	{#if exampleTabs.length}
		<section class="examples">
			<div class="examples-copy">
				<h2 class="examples-title">Documented examples</h2>
				<p class="examples-note">
					Samples from the OpenAPI document. Run request uses these as mocks while live API
					is disabled: complete payload → success, missing fields → invalid payload.
				</p>
			</div>
			<CodeBlock tabs={exampleTabs} label="Documented examples" size="sm" />
		</section>
	{/if}
	<CodeBlock tabs={model.samples} syncLanguage label="Request samples" size="sm" />
</div>

<style>
	.stack {
		display: flex;
		flex-direction: column;
		gap: 16px;
		min-width: 0;
	}

	.playground {
		overflow: hidden;
		background: #141816;
		border-radius: 12px;
		color: #e7ece4;
		font-family: var(--font-mono);
		/* box-shadow: 0 24px 50px -28px rgb(0 0 0 / 0.85); */
	}

	.toolbar {
		display: flex;
		flex-wrap: wrap;
		align-items: center;
		gap: 8px;
		padding: 10px 12px;
		border-bottom: 1px solid #2c332e;
	}

	.method {
		flex-shrink: 0;
		padding: 2px 6px;
		background: #9dce97;
		border-radius: 4px;
		color: #142117;
		font-size: 10px;
		font-weight: 700;
		letter-spacing: 0.04em;
		line-height: 16px;
	}

	.path,
	.field input {
		background: #0e120f;
		border: 1px solid #343c36;
		border-radius: 6px;
		color: #d7ddd4;
		font-family: var(--font-mono);
		font-size: 12px;
		line-height: 16px;
		outline: none;
		/* Keep paste/autofill from flashing a white field on dark chrome. */
		color-scheme: dark;
		caret-color: #e7ece4;
	}

	.path {
		flex: 1;
		min-width: 12rem;
		padding: 6px 10px;
	}

	.path:focus,
	.field input:focus {
		border-color: #9dce97;
	}

	.field input {
		display: block;
		width: 100%;
		margin-top: 4px;
		padding: 6px 10px;
	}

	.field input:read-only {
		color: #8b938c;
	}

	/* Chrome/Safari autofill otherwise paints a solid white box on paste. */
	.path:-webkit-autofill,
	.path:-webkit-autofill:hover,
	.path:-webkit-autofill:focus,
	.field input:-webkit-autofill,
	.field input:-webkit-autofill:hover,
	.field input:-webkit-autofill:focus {
		-webkit-text-fill-color: #d7ddd4;
		caret-color: #e7ece4;
		box-shadow: 0 0 0 1000px #0e120f inset;
		transition: background-color 99999s ease-out;
	}

	.run {
		flex-shrink: 0;
		padding: 6px 12px;
		background: #9dce97;
		border-radius: 6px;
		color: #142117;
		font-family: var(--font-sans);
		font-size: 12px;
		font-weight: 600;
		line-height: 16px;
	}

	.run:hover:not(:disabled) {
		filter: brightness(1.04);
	}

	.run:disabled {
		opacity: 0.6;
		cursor: wait;
	}

	.headers {
		display: flex;
		flex-direction: column;
		gap: 12px;
		padding: 12px 16px;
		border-bottom: 1px solid #2c332e;
	}

	.field {
		display: block;
		min-width: 0;
	}

	.label {
		color: #8b938c;
		font-family: var(--font-sans);
		font-size: 11px;
		line-height: 14px;
	}

	.section-head {
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: 12px;
		padding: 8px 16px;
		border-bottom: 1px solid #2c332e;
	}

	.section-label {
		margin: 0;
		color: #c5cdc6;
		font-family: var(--font-sans);
		font-size: 12px;
		line-height: 16px;
	}

	.response-title {
		color: #f3f6f2;
	}

	.meta {
		color: #8b938c;
		font-family: var(--font-sans);
		font-size: 11px;
		line-height: 14px;
	}

	.status {
		font-family: var(--font-mono);
		font-size: 11px;
		line-height: 14px;
	}

	.status.ok {
		color: #7dce8a;
	}

	.status.fail {
		color: #e7b4ae;
	}

	.editor {
		position: relative;
		height: 14rem;
		border-bottom: 1px solid #2c332e;
		overflow: hidden;
	}

	.editor.invalid {
		box-shadow: inset 0 0 0 1px #e7b4ae;
	}

	.highlight,
	.source,
	.body {
		margin: 0;
		font-family: var(--font-mono);
		font-size: 12.5px;
		line-height: 1.7;
		white-space: pre;
		tab-size: 2;
	}

	.highlight {
		position: absolute;
		inset: 0;
		overflow: hidden;
		pointer-events: none;
		color: #e7ece4;
	}

	.highlight code,
	.body code {
		display: block;
		padding: 0.85rem 1rem;
		font: inherit;
		white-space: pre;
	}

	.source {
		position: absolute;
		inset: 0;
		width: 100%;
		height: 100%;
		padding: 0.85rem 1rem;
		resize: none;
		overflow: auto;
		background: transparent;
		border: 0;
		color: transparent;
		caret-color: #e7ece4;
		outline: none;
	}

	.response-panel {
		background: #101410;
	}

	.response-head {
		border-bottom-color: #2c332e;
	}

	.response {
		min-height: 8rem;
		max-height: 15rem;
		overflow: auto;
	}

	.placeholder {
		margin: 0;
		padding: 12px 16px;
		color: #8b938c;
		font-size: 12px;
		line-height: 18px;
	}

	.placeholder.error {
		color: #e7b4ae;
	}

	.placeholder.mock-note {
		padding-bottom: 0;
		color: #8b938c;
	}

	.body {
		color: #e7ece4;
		overflow: auto;
	}

	.playground :global(.tok-key),
	.playground :global(.tok-plain) {
		color: #e7ece4;
	}

	.playground :global(.tok-string),
	.playground :global(.tok-number),
	.playground :global(.tok-boolean),
	.playground :global(.tok-null) {
		color: #7dce8a;
	}

	.examples {
		display: flex;
		flex-direction: column;
		gap: 12px;
	}

	.examples-title {
		margin: 0;
		color: var(--color-ink);
		font-family: var(--font-sans);
		font-size: 14px;
		font-weight: 700;
		line-height: 20px;
	}

	.examples-note {
		margin: 4px 0 0;
		color: var(--color-muted);
		font-family: var(--font-sans);
		font-size: 14px;
		line-height: 22px;
	}

	@media (max-width: 560px) {
		.path {
			flex-basis: 100%;
			order: 1;
		}

		.run {
			margin-left: auto;
		}
	}
</style>
