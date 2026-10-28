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
	let timer: ReturnType<typeof setTimeout> | undefined;

	async function copy() {
		const value = typeof text === 'function' ? text() : text;
		try {
			await navigator.clipboard.writeText(value);
		} catch {
			// Clipboard API is unavailable on insecure origins; fall back to a hidden textarea.
			const area = document.createElement('textarea');
			area.value = value;
			area.setAttribute('readonly', '');
			area.style.position = 'fixed';
			area.style.opacity = '0';
			document.body.append(area);
			area.select();
			document.execCommand('copy');
			area.remove();
		}
		copied = true;
		clearTimeout(timer);
		timer = setTimeout(() => (copied = false), 1600);
	}
</script>

<button type="button" class="copy {tone}" onclick={copy} aria-label={ariaLabel}>
	{copied ? 'Copied' : label}
</button>
<span class="visually-hidden" aria-live="polite">{copied ? 'Copied to clipboard' : ''}</span>

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
