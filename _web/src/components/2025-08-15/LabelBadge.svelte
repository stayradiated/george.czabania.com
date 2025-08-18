<script lang="ts">
import { fade } from "svelte/transition";

import Emoji from "../Emoji.svelte";

type Label = {
  name: string;
  icon: string;
  description: string;
};

type Props = {
  label: Label;
};

const { label }: Props = $props();
</script>

<div class="label" transition:fade>
  <Emoji native={label.icon} size="var(--size-4)" />
  <div class="name">{label.name}</div>
  <div class="description">{label.description}</div>
</div>

<style>
  .label {
    display: flex;
    align-items: center;
    justify-content: flex-start;
    gap: var(--size-2);
    padding: var(--size-2);
    border-radius: var(--radius-sm);
    background: var(--color-grey-50);
    font-size: var(--scale-0);
    font-family: var(--font-sans);
  }

  .name {
    gap: var(--size-2);
    font-weight: var(--weight-bold);
    text-wrap: nowrap;
    text-overflow: ellipsis;
    overflow: hidden;
  }

  .description {
    font-size: var(--scale-00);
    color: var(--color-grey-600);
    line-height: var(--line-sm);
    text-wrap: nowrap;
    text-overflow: ellipsis;
    overflow: hidden;
  }
</style>
