<script lang="ts">
import Form from "./Form.svelte";
import LabelBadge from "./LabelBadge.svelte";

type Label = {
  name: string;
  icon: string;
  description: string;
};

let labelList = $state<Label[]>([]);

const handleCreateLabel = (label: Label) => {
  labelList.push(label);
};
</script>

<Form oncreate={handleCreateLabel} />

{#each labelList as label}
  <LabelBadge label={label} />
{/each}
