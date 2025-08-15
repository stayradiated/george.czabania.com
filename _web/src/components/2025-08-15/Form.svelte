<script lang="ts">
import { untrack } from "svelte";
import { fade } from "svelte/transition";
import DebouncedInput from "../DebouncedInput.svelte";
import Emoji from "../Emoji.svelte";
import EmojiPicker from "../EmojiPicker.svelte";
import Sparkles from "../icons/Sparkles.svelte";
import { suggestDescription } from "./suggest-description.js";

type Label = {
  name: string;
  icon: string;
  description: string;
};

type Props = {
  oncreate: (label: Label) => void;
};

const { oncreate }: Props = $props();

const uid = $props.id();

const DEFAULT_ICON = "🏷️";
const DEFAULT_DESCRIPTION = "";

let name = $state("");
let icon = $state(DEFAULT_ICON);
let suggestedIcon = $state(DEFAULT_ICON);
let description = $state(DEFAULT_DESCRIPTION);
let suggestedDescription = $state(DEFAULT_DESCRIPTION);
let isLoadingDescription = $state(false);
let isLoadingIcon = $state(false);

let nameInputRef = $state<HTMLInputElement>();
let showEmojiPicker = $state(false);

const shouldSuggestDescription = $derived(
  description === DEFAULT_DESCRIPTION || description === suggestedDescription,
);
const shouldSuggestIcon = $derived(
  icon === DEFAULT_ICON || icon === suggestedIcon,
);

const isSuggestedDescription = $derived(
  description === suggestedDescription && description !== DEFAULT_DESCRIPTION,
);

const canSubmit = $derived(name.trim().length > 0);

$effect(() => {
  if (untrack(() => !shouldSuggestDescription && !shouldSuggestIcon)) {
    return;
  }
  if (name.trim().length === 0) {
    return;
  }

  untrack(() => {
    if (shouldSuggestDescription) {
      isLoadingDescription = true;
    }
    if (shouldSuggestIcon) {
      isLoadingIcon = true;
    }
  });

  const abortController = new AbortController();
  suggestDescription({
    labelName: name,
    signal: abortController.signal,
  }).then((value) => {
    let nextDescription = "";
    let nextIcon = DEFAULT_ICON;

    if (value instanceof Error) {
      console.error(value);
    } else {
      nextDescription = value?.description || "";
      nextIcon = value?.emoji || DEFAULT_ICON;
    }

    if (shouldSuggestDescription) {
      description = nextDescription;
      suggestedDescription = description;
    }
    if (shouldSuggestIcon) {
      icon = nextIcon;
      suggestedIcon = icon;
    }

    isLoadingDescription = false;
    isLoadingIcon = false;
  });

  return () => {
    abortController.abort();
  };
});

const handleSubmit = (event: SubmitEvent) => {
  event.preventDefault();
  if (name.trim() === "") {
    return;
  }
  oncreate({
    name: name.trim(),
    icon,
    description,
  });
  name = "";
  icon = DEFAULT_ICON;
  description = DEFAULT_DESCRIPTION;
  nameInputRef?.focus();
};
</script>

<div class="wrap">
  <form onsubmit={handleSubmit} class="card">
    <header>
      <h2>Create label</h2>
    </header>

    <div class="field">
      <label for="{uid}-name">Name</label>
      <div class="nameAndIcon">
        <EmojiPicker bind:isOpen={showEmojiPicker} bind:value={icon}>
          <button
            id="{uid}-icon" 
            type="button"
            class="iconButton"
            onclick={() => showEmojiPicker = true}
            title="Change Icon"
            aria-label="{icon}"
          >
            {#if isLoadingIcon}
              <span class="spinner" aria-hidden="true"></span>
            {:else}
              <Emoji native={icon} size="1.5em" />
            {/if}
          </button>
        </EmojiPicker>
        <DebouncedInput
          bind:self={nameInputRef}
          delayMs={500}
          id="{uid}-name"
          type="text"
          placeholder="e.g., Urgent, Design, Finance"
          bind:value={name}
        />
      </div>
    </div>

    <div class="field" class:loading={isLoadingDescription}>
      <div class="labelRow">
        <label for="labelDescription">Description</label>
      </div>

      <div class="textareaWrap">
        <textarea
          id="labelDescription"
          rows={2}
          placeholder="A short description of when to apply this label…"
          bind:value={description}
          aria-describedby="descHelp"
        ></textarea>
        {#if isLoadingDescription}
          <div class="overlay" transition:fade>
            <div class="spinner" aria-hidden="true"></div>
          </div>
        {:else if isSuggestedDescription}
          <div class="overlay" transition:fade>
            <div class="sparkles" title="AI Suggestion"><Sparkles /></div>
          </div>
        {/if}
      </div>
    </div>

    <footer class="footer">
      <button type="submit" class="primary" disabled={!canSubmit}>Create label</button>
    </footer>
  </form>
</div>

<style>
  .wrap {
    --border: #e5e7eb;
    --fg: #111827;
    --muted: #6b7280;
    --bg: #ffffff;
    --chip: #f3f4f6;

    font-family:
      ui-sans-serif, system-ui, -apple-system, "Segoe UI", Roboto,
      "Helvetica Neue", Arial, "Apple Color Emoji", "Segoe UI Emoji";
  }

.card {
  width: min(860px, 100%);
  background: var(--bg);
  border: 1px solid var(--border);
  border-radius: 14px;
  padding: 20px 20px 16px;
  box-shadow: 0 1px 10px rgba(0, 0, 0, 0.03);
}

.wrap header h2 {
  margin: 0 0 4px;
  font-size: 18px;
}

.field {
  margin: 14px 0;
}

label {
  font-weight: 600;
  display: block;
  margin-bottom: 6px;
}

.nameAndIcon {
  display: flex;
  gap: 8px;
}

.iconButton {
  width: 3em;
  height: 3em;
  border: none;
  background: transparent;
  border-radius: 10px;
  background: #f3f4f6;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;

  &:hover {
    background: #e5e7eb;
  }
}

.wrap :global(input[type="text"]),
textarea {
  width: 100%;
  border: 1px solid var(--border);
  border-radius: 10px;
  padding: 10px 12px;
  font-size: 14px;
  outline: none;
  background: #fff;
  box-sizing: border-box;
  font-family: inherit;
}

textarea {
  resize: vertical;
  line-height: 1.4;
}

.labelRow {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
}

.textareaWrap {
  position: relative;
}

.overlay {
  position: absolute;
  top: 8px;
  right: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 2em;
  height: 2em;
}

.spinner {
  width: 14px;
  height: 14px;
  border: 2px solid #cbd5e1;
  border-top-color: #4f46e5;
  border-radius: 50%;
  display: inline-block;
  animation: spin 800ms linear infinite;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

.footer {
  margin-top: 12px;
  display: flex;
  align-items: center;
  justify-content: flex-end;
}

.primary {
  background: #111827;
  color: white;
  border: 0;
  padding: 10px 14px;
  border-radius: 10px;
  cursor: pointer;

  &[disabled] {
    opacity: 0.5;
    cursor: not-allowed;
  }
}
.primary:hover {
  background: #0b1220;
}

.loading textarea {
  background-image: linear-gradient(
    90deg,
    #fff 0%,
    #fff 40%,
    #f3f4f6 50%,
    #fff 60%,
    #fff 100%
  );
  background-size: 200% 100%;
  animation: shimmer 2s infinite linear;
}

@keyframes shimmer {
  0% {
    background-position: 200% 0;
  }
  100% {
    background-position: -200% 0;
  }
}

.spinner {
  width: 14px;
  height: 14px;
  border: 2px solid #cbd5e1;
  border-top-color: #4f46e5;
  border-radius: 50%;
  display: inline-block;
  animation: spin 800ms linear infinite;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

.sparkles {
  flex: 1;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #FDFBC8;
  color: #E5DA00;
  padding: 4px;

  & :global(svg) {
    flex: 1;
  }
}
</style>
