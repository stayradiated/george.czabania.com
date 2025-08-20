<script lang="ts">
  import type { Snippet } from "svelte";

  type Props = {
    header?: Snippet;
    children?: Snippet;
    footer?: Snippet;
  };

  const { header, children, footer }: Props = $props();
</script>

<div class="card">
  {#if header}
    <header>
      {@render header()}
    </header>
  {/if}

  <section>
    {@render children?.()}
  </section>

  {#if footer}
    <footer>
      {@render footer()}
    </footer>
  {/if}
</div>

<style>
.card {
  flex: 1;
  background: var(--color-white);
  border: var(--size-px) solid var(--color-grey-200);
  border-radius: var(--radius-sm);
  box-shadow: var(--shadow-md);
  font-family: var(--font-sans);
}

header {
  padding: var(--size-4) var(--size-4) var(--size-2);
}

section {
  padding: var(--size-2) var(--size-4);
}

footer {
  padding: var(--size-4);
  border-top: var(--size-px) solid var(--color-grey-200);
  display: flex;
  justify-content: flex-end;
}
</style>
