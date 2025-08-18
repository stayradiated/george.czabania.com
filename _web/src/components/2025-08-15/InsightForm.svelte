<script lang="ts">
import { untrack } from "svelte";
import { fade } from "svelte/transition";
import Button from "#src/components/ui/Button.svelte";
import Emoji from "../Emoji.svelte";
import Sparkles from "../icons/Sparkles.svelte";
import { getLabel } from "./get-label.js";

type Label = {
  name: string;
  icon: string;
  description: string;
};

type Props = {
  labelList: Label[];
};

const { labelList }: Props = $props();

let text = $state("");
let suggestedLabels = $state<Label[]>([]);
let labels = $state<Label[]>([]);
let isLoading = $state(false);
let debounceTimer: ReturnType<typeof setTimeout> | null = null;
let abortController: AbortController | null = null;

// Debounced effect to fetch label suggestions
$effect(() => {
  // Track the text value to trigger this effect
  void text;

  return untrack(() => {
    // Clear any existing timer
    if (debounceTimer) {
      clearTimeout(debounceTimer);
    }

    // Abort any in-flight request
    if (abortController) {
      abortController.abort();
    }

    // If text is empty, clear suggestions
    if (text.trim() === "") {
      suggestedLabels = [];
      isLoading = false;
      return;
    }

    // Set loading state immediately when text changes
    isLoading = true;

    // Set up new debounced fetch
    debounceTimer = setTimeout(async () => {
      abortController = new AbortController();

      try {
        const result = await getLabel({
          text: text,
          labelList,
          signal: abortController.signal,
        });

        if (result && !abortController.signal.aborted) {
          suggestedLabels = result;
          isLoading = false;
        }
      } catch (error) {
        if (!abortController?.signal.aborted) {
          console.error("Error fetching label suggestions:", error);
          suggestedLabels = [];
          isLoading = false;
        }
      }
    }, 500);

    // Cleanup function
    return () => {
      if (debounceTimer) {
        clearTimeout(debounceTimer);
      }
      if (abortController) {
        abortController.abort();
      }
    };
  });
});

const handleClear = () => {
  text = "";
  suggestedLabels = [];
  labels = [];
};

const handleSubmit = () => {
  console.log("submit");
  text = "";
  suggestedLabels = [];
  labels = [];
};

const handleAddLabel = (label: Label) => {
  suggestedLabels.splice(suggestedLabels.indexOf(label), 1);
  labels.push(label);
};
</script>

<div class="card">
  <div class="field">
    <div class="labelRow">
      <label for="insightText">Add Insight</label>
    </div>

    <textarea
      id="insightText"
      bind:value={text}
      placeholder="Enter your insight, observation, or note..."
      rows={4}
      class:loading={isLoading}
    ></textarea>
  </div>

  {#if isLoading}
    <div class="loadingIndicator">
      <div class="spinner" aria-hidden="true"></div>
      <span class="loadingText">Finding labels...</span>
    </div>
  {:else if suggestedLabels.length > 0}
    <div class="suggestionsSection" transition:fade={{ duration: 200 }}>
      <div class="suggestionsHeader">
        <Sparkles size="var(--size-4)" color="var(--color-blue-500)" />
        <span>Suggested</span>
      </div>

      <div class="labelList">
        {#each suggestedLabels as label (label.name)}
          <Button variant="dashed" onclick={() => handleAddLabel(label)}>
            <Emoji native={label.icon} size="var(--size-4)" />
            <span class="labelName">{label.name}</span>
          </Button>
        {/each}
      </div>
    </div>
  {/if}

  {#if labels.length > 0}
    <div class="labelList" transition:fade={{ duration: 200 }}>
      {#each labels as label}
        <Button variant="outline" onclick={() => labels.splice(labels.indexOf(label), 1)}>
          <Emoji native={label.icon} size="var(--size-4)" />
          <span class="labelName">{label.name}</span>
        </Button>
      {/each}
    </div>
  {/if}

  <footer class="footer" transition:fade={{ duration: 200 }}>
    <Button variant="secondary" type="button" onclick={handleClear}>
      Clear
    </Button>
    <Button variant="primary" type="button" onclick={handleSubmit}>
      Submit
    </Button>
  </footer>
</div>

<style>
.card {
  background: var(--color-white);
  border: var(--size-px) solid var(--color-grey-200);
  border-radius: var(--radius-md);
  padding: var(--size-4);
  box-shadow: var(--shadow-md);
  font-family: var(--font-sans);
  margin-top: var(--size-6);
}

.field {
  margin: var(--size-3) 0;
}

.labelRow {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: var(--size-2);

  & label {
    font-weight: 600;
    font-size: var(--scale-0);
  }
}

.loadingIndicator {
  display: flex;
  align-items: center;
  gap: var(--size-2);

  .loadingText {
    font-size: var(--scale-00);
    color: var(--color-grey-600);
  }
}

.spinner {
  width: 14px;
  height: 14px;
  border: 2px solid var(--color-grey-300);
  border-top-color: var(--color-blue-500);
  border-radius: 50%;
  animation: spin 800ms linear infinite;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

textarea {
  width: 100%;
  border: var(--size-px) solid var(--color-grey-300);
  border-radius: var(--radius-sm);
  padding: var(--size-3);
  font-size: var(--scale-0);
  font-family: inherit;
  line-height: var(--line-md);
  resize: vertical;
  min-height: 100px;
  box-sizing: border-box;
  transition: border-color 150ms ease-in-out;

  &:focus {
    outline: none;
    border-color: var(--color-blue-500);
  }

  &.loading {
    background-image: linear-gradient(
      90deg,
      #fff 0%,
      #fff 40%,
      #f9fafb 50%,
      #fff 60%,
      #fff 100%
    );
    background-size: 200% 100%;
    animation: shimmer 2s infinite linear;
  }
}

@keyframes shimmer {
  0% {
    background-position: 200% 0;
  }
  100% {
    background-position: -200% 0;
  }
}

.suggestionsSection {
  margin-top: var(--size-4);

  display: flex;
  align-items: center;
  gap: var(--size-2);
}

.suggestionsHeader {
  font-size: var(--scale-0);
  font-weight: 600;
  color: var(--color-grey-700);
}

.labelList {
  display: flex;
  gap: var(--size-2);
}

.footer {
  margin-top: var(--size-4);
  padding-top: var(--size-3);
  border-top: var(--size-px) solid var(--color-grey-200);
  display: flex;
  justify-content: flex-end;
}
</style>
