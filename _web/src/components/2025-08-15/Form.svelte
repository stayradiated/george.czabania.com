<script lang="ts">
import { untrack } from "svelte";
import { fade } from "svelte/transition";
import Button from "#src/components/ui/Button.svelte";
import DebouncedInput from "../DebouncedInput.svelte";
import DropdownMenu from "../DropdownMenu.svelte";
import Emoji from "../Emoji.svelte";
import EmojiPicker from "../EmojiPicker.svelte";
import Sparkles from "../icons/Sparkles.svelte";
import { getDescription } from "./get-description.js";

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
let autofilledIcon = $state(DEFAULT_ICON);
let description = $state(DEFAULT_DESCRIPTION);
let autofilledDescription = $state(DEFAULT_DESCRIPTION);
let isLoading = $state(false);

let nameInputRef = $state<HTMLInputElement>();
let showEmojiPicker = $state(false);

const shouldAutofillDescription = $derived(
  description === DEFAULT_DESCRIPTION || description === autofilledDescription,
);
const shouldAutofillIcon = $derived(
  icon === DEFAULT_ICON || icon === autofilledIcon,
);

const isAutofilledDescription = $derived(
  description === autofilledDescription && description !== DEFAULT_DESCRIPTION,
);

const canSubmit = $derived(name.trim().length > 0);

$effect(() => {
  // only regenerate the description if the name has changed
  void name;

  // we wrap the body of the effect in an untracked function to prevent
  // tracking other values (which could cause infinite loops)
  return untrack(() => {
    const abortController = new AbortController();
    isLoading = true;
    getDescription({
      labelName: name,
      defaultDescription: DEFAULT_DESCRIPTION,
      defaultIcon: DEFAULT_ICON,
      signal: abortController.signal,
    }).then((result) => {
      if (shouldAutofillDescription && typeof result.description === "string") {
        description = result.description;
      }
      if (shouldAutofillIcon && typeof result.icon === "string") {
        icon = result.icon;
      }
      autofilledDescription = result.description;
      autofilledIcon = result.icon;
      isLoading = false;
    });
    return () => abortController.abort();
  });
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

<form onsubmit={handleSubmit} class="card">
  <header>
    <h2>Create Label (Demo)</h2>
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
          {#if isLoading && shouldAutofillIcon}
            <span class="spinner" aria-hidden="true"></span>
          {:else}
            <Emoji native={icon} size="1rem" />
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

  <div class="field" class:loading={isLoading && shouldAutofillDescription}>
    <div class="labelRow">
      <label for="labelDescription">Description</label>
    </div>

    <div class="textareaContainer" class:isAutofilled={isAutofilledDescription}>
      <textarea
        id="labelDescription"
        rows={2}
        placeholder="A short description of when to apply this label…"
        bind:value={description}
        aria-describedby="descHelp"
        required
      ></textarea>
      {#if isLoading && shouldAutofillDescription}
        <div class="overlay" transition:fade>
          <div class="spinner" aria-hidden="true"></div>
        </div>
      {:else}
        <div class="overlay" transition:fade>
          <DropdownMenu placement="bottom-end" offset={4}>
            {#snippet button({ toggleMenu })}
              <Button size="sm" variant="outline" type="button" onclick={toggleMenu}>
                <Sparkles size="1.5em" />
              </Button>
            {/snippet}

            {#snippet children()}
              <div class="aiMenu">
                {#if isAutofilledDescription}
                  <strong><Sparkles size="1em" /> Autofilled Description</strong>
                  <span class="description">This description was autofilled by the AI. Review and edit as needed.</span>
                {:else if autofilledDescription.length > 0}
                  <strong><Sparkles size="1em" /> Autofilled Description</strong>
                  <span>{autofilledDescription}</span>
                  <Button variant="primary" size="sm" type="button" onclick={() => description = autofilledDescription}>Replace</Button>
                {:else}
                  <strong><Sparkles size="1em" /> Autofilled Description</strong>
                  <em>No autofill available</em>
                {/if}
              </div>
            {/snippet}
          </DropdownMenu>
        </div>
      {/if}
    </div>
  </div>

  <footer class="footer">
    <Button type="submit" variant="primary" disabled={!canSubmit}>Create label</Button>
  </footer>
</form>

<style>
.card {
  flex: 1;
  background: var(--color-white);
  border: 1px solid var(--color-grey-200);
  border-radius: var(--radius-md);
  padding: var(--size-4);
  box-shadow: var(--shadow-md);
  font-family: var(--font-sans);

  & h2 {
    margin: 0 0 var(--size-2);
    font-size: var(--scale-1);
  }
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
  border-radius: var(--radius-sm);
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;

  border: 1px solid var(--color-grey-300);

  &:hover {
    /* background: #e5e7eb; */
    background: #f3f4f6;
  }

  &:focus {
    outline: none;
    border-color: var(--color-blue-500);
  }
}

.textareaContainer {
  position: relative;
}

.card :global(input[type="text"]),
textarea {
  width: 100%;
  border: 1px solid var(--color-grey-300);
  border-radius: var(--radius-sm);
  padding: var(--size-1) var(--size-3);
  font-size: var(--scale-0);
  outline: none;
  background: var(--color-white);
  box-sizing: border-box;
  font-family: inherit;
  resize: vertical;
  line-height: var(--line-md);
  transition:
    background-color 100ms ease-in-out;

  .textareaContainer.isAutofilled & {
    background: var(--color-blue-50);
  }

  &:focus {
    outline: none;
    border-color: var(--color-blue-500);
  }
}

.labelRow {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
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
  border-radius: var(--radius-100);
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

.aiButton {
  flex: 1;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 4px;
  font-weight: 600;
  text-transform: uppercase;

  opacity: 0;
  background: none;
  border: 1px solid transparent;
  color: var(--color-grey-400);

  transition:
    border-color 100ms ease-in-out,
    opacity 100ms ease-in-out;

  .textareaContainer:hover & {
    opacity: 1;
  }

  .isAutofilled & {
    opacity: 1;
    color: var(--color-blue-500);
  }

  &:hover,
  &.isOpen {
    opacity: 1;
    border-color: #58ADA6;
  }
}

.aiMenu {
  width: 250px;
  padding: 8px;
  display: flex;
  flex-direction: column;
  font-size: var(--scale-0);
  background-color: var(--color-white);
  border-radius: var(--radius-md);

  & strong {
    font-size: 12px;
    display: block;
    font-weight: 600;
    color: #111827;
  }

  & .description {
    font-size: 12px;
    color: #111827;
    line-height: 1.4;
  }

  & button {
    flex: 1;

    font: inherit;
    border-radius: 10px;
    padding: 8px 10px;
    cursor: pointer;
    transition:
      box-shadow 120ms ease,
      border-color 120ms ease,
      transform 60ms ease;
    border: 1px solid var(--color-blue-500);
    background: linear-gradient(#ffffff, #f4f8f8);
    color: #0b3c38;
    font-weight: 700;

   &:hover { box-shadow: 0 0 0 3px rgba(88,173,166,.18); }
   &:active { transform: translateY(1px); }
  }
}

</style>
