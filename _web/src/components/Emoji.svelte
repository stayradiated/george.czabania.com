<script lang="ts">
import { onMount } from "svelte";

import { initEmojiMart } from "./emoji-mart.js";

type Props = {
  size?: string;
  native: string;
};

const { native, size }: Props = $props();

let isReady = $state(false);

onMount(async () => {
  await initEmojiMart();
  isReady = true;
});
</script>

{#if isReady}
  <em-emoji {native} {size}> </em-emoji>
{/if}
