<script lang="ts">
import Card from "#src/components/ui/Card.svelte";
import Title from "#src/components/ui/Title.svelte";
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

<div class="container">
  <Form oncreate={handleCreateLabel} />

  <Card>
    {#snippet header()}
      <Title level={2}>Labels</Title>
    {/snippet}

    <div class="labelList">
      {#each labelList as label}
        <LabelBadge label={label} />
      {/each}
    </div>
  </Card>

  <InsightForm {labelList} />
</div>

<style>
.container {
  display: flex;
  flex-direction: column;
  gap: var(--size-4);
}

.labelList {
  display: flex;
  flex-direction: column;
  gap: var(--size-2);
}
</style>
