<script lang="ts">
import type { HTMLButtonAttributes } from "svelte/elements";

type Props = HTMLButtonAttributes & {
  variant?: "primary" | "secondary" | "outline" | "dashed";
  size?: "sm" | "md" | "lg";
};

const { variant, size, children, ...restProps }: Props = $props();
</script>

<button
  class:size-sm={size === 'sm'}
  class:size-md={size === 'md'}
  class:size-lg={size === 'lg'}
  class:primary={variant === 'primary'}
  class:secondary={variant === 'secondary'}
  class:outline={variant === 'outline'}
  class:dashed={variant === 'dashed'}
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
      color: var(--color-grey-100);
      background: var(--color-grey-600);
      cursor: not-allowed;
    }
    &:not([disabled]):hover {
      background: var(--color-grey-800);
    }
  }

  .secondary {
    background: var(--color-white);
    color: var(--color-grey-800);
    border: none;
    padding: var(--size-3) var(--size-4);
    border-radius: var(--radius-md);
    cursor: pointer;
    transition:
      background-color 100ms ease-in-out;

    &[disabled] {
      border: none;
      color: var(--color-grey-300);
      cursor: not-allowed;
    }
    &:not([disabled]):hover {
      background: var(--color-grey-200);
    }
  }

  .outline {
    background: transparent;
    color: var(--color-black);
    border: 1px solid var(--color-grey-300);
    padding: var(--size-3) var(--size-4);
    border-radius: var(--radius-md);
    cursor: pointer;
    transition: opacity 100ms ease-in-out;

    &[disabled] {
      border: none;
      color: var(--color-grey-300);
      cursor: not-allowed;
    }
    &:not([disabled]):hover {
      background: var(--color-grey-100);
    }
  }

  .dashed {
    background: transparent;
    color: var(--color-black);
    border: 1px dashed var(--color-grey-300);
    padding: var(--size-3) var(--size-4);
    border-radius: var(--radius-md);
    cursor: pointer;
    transition: opacity 100ms ease-in-out;

    &[disabled] {
      border: none;
      color: var(--color-grey-300);
      cursor: not-allowed;
    }
    &:not([disabled]):hover {
      background: var(--color-grey-100);
    }
  }

  .size-sm {
    font-size: var(--scale-0);
    padding: var(--size-1) var(--size-2);
  }

  .size-md {
    font-size: var(--scale-0);
    padding: var(--size-2) var(--size-3);
  }

  .size-lg {
    font-size: var(--scale-1);
    padding: var(--size-4) var(--size-5);
  }
</style>
