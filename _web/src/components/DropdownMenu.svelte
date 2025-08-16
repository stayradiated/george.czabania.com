<script lang="ts">
import type { Placement } from "@floating-ui/dom";
import { flip, shift, offset as withOffset } from "@floating-ui/dom";
import type { Snippet } from "svelte";
import { fly } from "svelte/transition";
import { clickOutside } from "./svelte-click-outside.js";
import { createFloatingActions } from "./svelte-floating-ui.js";

type Props = {
  placement?: Placement;
  isOpen?: boolean;
  offset?: number;
  flex?: boolean;

  button: Snippet<[{ isOpen: boolean; toggleMenu: () => void }]>;
  children: Snippet<[{ closeMenu: () => void }]>;
};

let {
  placement = "bottom-start",
  isOpen = $bindable(false),
  offset = 0,
  flex,
  button,
  children,
}: Props = $props();

const transitionFlyY = $derived(placement.startsWith("bottom") ? -10 : 10);

const [floatingRef, floatingContent] = createFloatingActions({
  placement,
  middleware: [withOffset(offset), flip(), shift({ padding: 8 })],
});

const handleToggleMenu = () => {
  isOpen = !isOpen;
};

const handleCloseMenu = () => {
  isOpen = false;
};
</script>

<div class="container" class:flex use:clickOutside={handleCloseMenu}>
  <div use:floatingRef>
    {@render button({ isOpen, toggleMenu: handleToggleMenu })}
  </div>
  {#if isOpen}
    <div
      class="menu"
      use:floatingContent
      transition:fly={{ y: transitionFlyY, duration: 200 }}>
      {@render children({ closeMenu: handleCloseMenu })}
    </div>
  {/if}
</div>

<style>
  .container {
    display: flex;
    align-items: center;

    &.flex {
      flex: 1;
    }
  }
  .menu {
    z-index: var(--layer-2);
  }
</style>
