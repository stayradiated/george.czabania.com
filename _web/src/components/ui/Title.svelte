<script lang="ts">
import type { Snippet } from 'svelte'

type Props = {
  level?: 1 | 2 | 3 | 4 | 5 | 6
  flex?: boolean
  inline?: boolean
  children: Snippet
}

const { level = 1, flex = false, inline = false, children }: Props = $props()
</script>

{#if level === 1}
  <h1 class:flex class:inline>{@render children()}</h1>
{:else if level === 2}
  <h2 class:flex class:inline>{@render children()}</h2>
{:else if level === 3}
  <h3 class:flex class:inline>{@render children()}</h3>
{:else if level === 4}
  <h4 class:flex class:inline>{@render children()}</h4>
{:else if level === 5}
  <h5 class:flex class:inline>{@render children()}</h5>
{:else if level === 6}
  <h6 class:flex class:inline>{@render children()}</h6>
{/if}

<style>
  h1,
  h2,
  h3,
  h4,
  h5,
  h6 {
    margin: 0 !important;
    font-weight: var(--weight-bold);
    line-height: var(--line-md);
  }
  h1 {
    font-size: var(--scale-4);
  }
  h2 {
    font-size: var(--scale-3);
  }
  h3 {
    font-size: var(--scale-2);
  }
  h4 {
    font-size: var(--scale-1);
  }
  h5 {
    font-size: var(--scale-0);
  }
  h6 {
    font-size: var(--scale-00);
    letter-spacing: var(--letter-xl);
    text-transform: uppercase;
  }
  .flex {
    flex: 1;
  }
  .inline {
    display: inline;
  }
</style>
