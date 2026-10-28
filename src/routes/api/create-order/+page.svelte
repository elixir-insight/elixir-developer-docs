<script lang="ts">
	import { createOrder } from '#lib/api.ts';
	import ApiReference from '#lib/components/ApiReference.svelte';
</script>

<ApiReference endpoint={createOrder} />
