<script lang="ts">
import type { Placement } from "@floating-ui/dom";
import { offset } from "@floating-ui/dom";
import * as emojiMart from "emoji-mart";
import type { Snippet } from "svelte";
import { onMount } from "svelte";
import { initEmojiMart } from "./emoji-mart.js";
import { clickOutside } from "./svelte-click-outside.js";
import { createFloatingActions } from "./svelte-floating-ui.js";

type Props = {
  isOpen?: boolean;
  placement?: Placement;
  onselect?: (emoji: string) => void;
  value?: string;
  children?: Snippet;
};

let {
  isOpen = $bindable(false),
  value = $bindable("😃"),
  placement = "bottom-start",
  onselect,
  children,
}: Props = $props();

let [floatingRef, floatingContent] = $derived(
  createFloatingActions({
    placement,
    middleware: [offset(8)],
  }),
);

let emojiRef: HTMLDivElement | undefined = $state(undefined);
let emojiPicker: Node | undefined = $state(undefined);

const hideEmojiPicker = () => {
  isOpen = false;
  if (emojiRef && emojiPicker && emojiPicker.parentNode) {
    // eslint-disable-next-line svelte/no-dom-manipulating
    emojiRef.removeChild(emojiPicker);
  }
};

const showEmojiPicker = () => {
  isOpen = true;
  requestAnimationFrame(() => {
    emojiPicker = new emojiMart.Picker({
      autoFocus: true,
      onEmojiSelect: (emoji: { native: string }, event: Event) => {
        event.stopPropagation();
        event.preventDefault();
        value = emoji.native;
        onselect?.(emoji.native);
        hideEmojiPicker();
      },
    }) as unknown as Node;
    // eslint-disable-next-line svelte/no-dom-manipulating
    emojiRef?.appendChild(emojiPicker);
  });
};

$effect(() => {
  if (isOpen) {
    showEmojiPicker();
  } else {
    hideEmojiPicker();
  }
});

onMount(() => {
  initEmojiMart();
});
</script>

<div use:floatingRef>
  {#if children}
    {@render children()}
  {/if}
</div>

{#if isOpen}
  <div
    class="emojiMart"
    use:floatingContent
    use:clickOutside={hideEmojiPicker}
    bind:this={emojiRef}></div>
{/if}

<style>
  .emojiMart {
    z-index: 10;
  }
</style>
