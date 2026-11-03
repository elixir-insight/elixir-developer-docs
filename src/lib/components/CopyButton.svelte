<script lang="ts">
	interface Props {
		/** Text to copy, or a function that returns it at click time. */
		text: string | (() => string);
		label?: string;
		tone?: 'light' | 'dark';
		/** Accessible name when the visible label is generic ("Copy"). */
		ariaLabel?: string;
	}

	let { text, label = 'Copy', tone = 'light', ariaLabel }: Props = $props();

	let copied = $state(false);
	let failed = $state(false);
	let timer: ReturnType<typeof setTimeout> | undefined;

	function resolveText() {
		const value = typeof text === 'function' ? text() : text;
		return typeof value === 'string' ? value : String(value ?? '');
	}

	function fallbackCopy(value: string) {
		const area = document.createElement('textarea');
		area.value = value;
		area.setAttribute('readonly', '');
		area.style.cssText =
			'position:fixed;top:0;left:0;width:1px;height:1px;padding:0;border:0;opacity:0;';
		document.body.append(area);
		area.focus();
		area.select();
		area.setSelectionRange(0, area.value.length);
		let ok = false;
		try {
			ok = document.execCommand('copy');
		} finally {
			area.remove();
		}
		return ok;
	}

	async function copy(event: MouseEvent) {
		const value = resolveText();
		if (!value) return;

		const button = event.currentTarget as HTMLButtonElement;
		button.focus();

		let ok = false;
		try {
			if (navigator.clipboard?.writeText) {
				await navigator.clipboard.writeText(value);
				ok = true;
			} else {
				ok = fallbackCopy(value);
			}
		} catch {
			ok = fallbackCopy(value);
		}

		clearTimeout(timer);
		if (!ok) {
			failed = true;
			copied = false;
			timer = setTimeout(() => (failed = false), 1600);
			return;
		}

		failed = false;
		copied = true;
		timer = setTimeout(() => (copied = false), 1600);
	}

	const visible = $derived(failed ? 'Failed' : copied ? 'Copied' : label);
	const announced = $derived(
		failed ? 'Copy failed' : copied ? 'Copied to clipboard' : ''
	);
</script>

<button
	type="button"
	class="copy {tone}"
	onclick={copy}
	aria-label={copied || failed ? visible : (ariaLabel ?? label)}
>
	{visible}
</button>
<span class="visually-hidden" aria-live="polite">{announced}</span>

<style>
	.copy {
		display: inline-flex;
		align-items: center;
		flex-shrink: 0;
		border: 1px solid;
		border-radius: var(--radius-sm);
		font-weight: 500;
		white-space: nowrap;
		transition:
			background-color 120ms ease,
			color 120ms ease;
	}

	.light {
		height: 32px;
		padding-inline: 12px;
		background: var(--color-surface-2);
		border-color: var(--color-line);
		color: var(--color-body);
		font-size: var(--text-label);
		line-height: 16px;
	}

	.light:hover {
		background: var(--color-line);
		color: var(--color-ink);
	}

	.dark {
		padding: 4px 10px;
		border-color: var(--color-code-control);
		color: var(--color-code-label);
		font-size: 12px;
		line-height: 16px;
	}

	.dark:hover {
		background: var(--color-code-line);
		color: #ffffff;
	}
</style>
