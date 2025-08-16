<script lang="ts">
import type { HTMLButtonAttributes } from "svelte/elements";

type Props = HTMLButtonAttributes & {
  variant?: "primary";
};

const { variant, children, ...restProps }: Props = $props();
</script>

<button
  class:primary={variant === 'primary'}
  {...restProps}
>
  {@render children?.()}
</button>

<style>
  .primary {
    background: var(--color-black);
    color: var(--color-white);
    border: none;
    padding: var(--size-3) var(--size-4);
    border-radius: var(--radius-md);
    cursor: pointer;
    transition: opacity 100ms ease-in-out;

    &[disabled] {
      opacity: 0.5;
      cursor: not-allowed;
    }
    &:hover {
      background: var(--color-grey-800);
    }
  }
</style>
