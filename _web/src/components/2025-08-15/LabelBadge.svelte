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
  <div class="name">
    <Emoji native={label.icon} size="1.5em" />{label.name}</div>
  <div class="description">{label.description}</div>
</div>

<style>
.label {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 12px;
  border-radius: 8px;
  background: var(--chip);
  color: var(--fg);
  font-size: 12px;
  font-weight: 600;
}
.label .name {
  font-weight: 600;
}
.label .description {
  font-size: 12px;
  color: var(--muted);
}
</style>
