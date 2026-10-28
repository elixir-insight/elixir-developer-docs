<script lang="ts">
	import { upiIntent } from '#lib/api.ts';
	import sampleQr from '#lib/assets/sample-qr.png';
	import ApiReference from '#lib/components/ApiReference.svelte';
</script>

<ApiReference endpoint={upiIntent}>
	{#snippet afterSamples()}
		<figure class="qr-card">
			<div class="qr">
				<img src={sampleQr} alt="QR code decoded from the sample response" width="96" height="96" />
			</div>
			<figcaption>
				<strong>QR from the sample response</strong>
				<span>
					Drop qrCode straight into an img tag. On mobile, open url instead so the UPI app launches.
				</span>
			</figcaption>
		</figure>
	{/snippet}
</ApiReference>

<style>
	.qr-card {
		display: flex;
		align-items: center;
		gap: 18px;
		margin: 0;
		padding: 18px;
		background: var(--color-surface);
		border: 1px solid var(--color-line);
		border-radius: var(--radius-lg);
	}

	.qr {
		display: flex;
		align-items: center;
		justify-content: center;
		flex-shrink: 0;
		width: 112px;
		height: 112px;
		background: #ffffff;
		border: 1px solid var(--color-line);
		border-radius: var(--radius-md);
	}

	img {
		display: block;
		width: 96px;
		height: 96px;
		image-rendering: pixelated;
	}

	figcaption {
		display: flex;
		flex-direction: column;
		gap: 6px;
	}

	strong {
		color: var(--color-ink);
		font-size: 15px;
		font-weight: 600;
		line-height: 18px;
	}

	span {
		color: var(--color-body);
		font-size: var(--text-small);
		line-height: 21px;
	}
</style>
