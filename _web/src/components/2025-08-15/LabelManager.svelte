<script lang="ts">
import Form from "./Form.svelte";
import InsightForm from "./InsightForm.svelte";
import LabelBadge from "./LabelBadge.svelte";

type Label = {
  name: string;
  icon: string;
  description: string;
};

let labelList = $state<Label[]>([
  {
    name: "Urgent",
    icon: "🔥",
    description: "Requires immediate attention.",
  },
  {
    name: "Design",
    icon: "🎨",
    description: "Design improvements and ideas for the website.",
  },
  {
    name: "Finance",
    icon: "💰",
    description:
      "Tracks budgetary allocations, expenses, and revenue forecasts.",
  },
]);

const handleCreateLabel = (label: Label) => {
  labelList.push(label);
};
</script>

<Form oncreate={handleCreateLabel} />

<h2>Labels</h2>

<div class="labelList">
  {#each labelList as label}
    <LabelBadge label={label} />
  {/each}
</div>

<InsightForm {labelList} />

<style>
.labelList {
  display: flex;
  flex-direction: column;
  gap: var(--size-4);
}
</style>
