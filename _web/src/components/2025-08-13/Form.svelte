<script lang="ts">
import type { FormEventHandler } from "svelte/elements";

import { streamText } from "../../lib/groq.js";

let aiStatus = $state<"idle" | "loading" | "suggested">("idle");
let isSuggested = $state(false);
let isLocked = $state(false);

let name = $state("");
let description = $state("");
let dirty = $state(false);

let isDescFocused = $state(false);

let descRef: HTMLTextAreaElement | null = null;
let regenTimer: number | null = null;

// derived
const isDescEmpty = $derived(description.trim() === "");
const canAIReplace = $derived(!isLocked && (isDescEmpty || isSuggested));

// --- Mock "AI" description helper (same behavior as given React code)
const describeLabel = async (labelName: string): Promise<string> => {
  const stream = streamText({
    system: `
You write concise label-application descriptions for a software ticket tracker.

Rules:
- Output exactly one sentence and nothing else (no quotes, preambles, or bullets).
- 6–16 words. Present tense. Neutral tone.
- Describe when to apply the label; don’t define the label itself.
- Don’t repeat the label name unless it disambiguates a product/team/component.
- If the label is unclear or generic (e.g., “misc”, “other”, “tbd”), write:
  “Use for tickets that don’t fit any other established label.”

Examples:
- Feature Request → Proposals for new capabilities beyond current functionality.
- Bug → Defects causing incorrect or failing behavior.
- Docs → Changes to project documentation.
- Performance → Improvements to speed, memory usage, or scalability.

Output: only the sentence.
      `.trim(),
    user: labelName.trim(),
  });

  let output = "";
  for await (const chunk of stream) {
    output += chunk;
  }
  return output;
};

// central generator
const generate = async () => {
  const nm = name.trim();
  if (!nm) return;
  if (!canAIReplace) return;

  aiStatus = "loading";
  isLocked = false;

  const text = await describeLabel(nm);
  description = text;

  aiStatus = "suggested";
  isSuggested = true;
  isLocked = false;
};

// Handlers
const handleNameBlur = () => {
  console.log("onNameBlur");
};

const handleDescriptionFocus = () => {
  isDescFocused = true;
  console.log("onDescriptionFocus");
};

const handleDescriptionBlur = () => {
  isDescFocused = false;
  console.log("onDescriptionBlur");
};

const onDescriptionInput: FormEventHandler<HTMLTextAreaElement> = (event) => {
  const value = event.currentTarget.value;
  if (value === "") {
    aiStatus = "idle";
    isSuggested = false;
    isLocked = false;
  } else {
    aiStatus = "idle";
    isSuggested = false;
    isLocked = true;
    dirty = true;
  }
};

const handleSubmit = (e: Event) => {
  e.preventDefault();
  // handle submit as needed
};
</script>

<div class="wrap">
  <form class="card" onsubmit={handleSubmit} aria-describedby="helper">
    <header>
      <h2>Create a new label</h2>
    </header>

    <div class="field">
      <label for="labelName">Name</label>
      <input
        id="labelName"
        type="text"
        placeholder="e.g., Urgent, Design, Finance"
        bind:value={name}
        onblur={handleNameBlur}
      />
    </div>

    <div class="field" class:loading={aiStatus === "loading"}>
      <div class="labelRow">
        <label for="labelDescription">Description</label>
      </div>

      <div class="textareaWrap">
        <textarea
          bind:this={descRef}
          id="labelDescription"
          rows={2}
          placeholder="Add a short description (optional)…"
          bind:value={description}
          oninput={onDescriptionInput}
          onfocus={handleDescriptionFocus}
          onblur={handleDescriptionBlur}
          aria-describedby="descHelp"
        ></textarea>
        {#if aiStatus === "loading"}
          <div class="overlay">
            <span class="spinner" aria-hidden="true"></span> Generating…
          </div>
        {/if}
      </div>

      <div id="descHelp" class="help">
        {#if isSuggested}
          AI drafted this. Start typing to edit; we’ll stop auto-replacing. Clear to get a new draft.
        {:else if isLocked}
          You’re in control. AI won’t overwrite your edits. Clear to unlock AI again.
        {:else}
          Leave blank and AI will suggest something after you name the label.
        {/if}
      </div>
    </div>

    <footer class="footer">
      <button type="submit" class="primary">Create label</button>
    </footer>
  </form>
</div>

<style>
:root {
  --border: #e5e7eb;
  --fg: #111827;
  --muted: #6b7280;
  --bg: #ffffff;
  --chip: #f3f4f6;
}

* {
  box-sizing: border-box;
  font-family:
    ui-sans-serif, system-ui, -apple-system, "Segoe UI", Roboto,
    "Helvetica Neue", Arial, "Apple Color Emoji", "Segoe UI Emoji";
}

.wrap {
  padding: 24px;
  background: #f9fafb;
  min-height: 100vh;
  display: grid;
  place-items: start center;
}

.card {
  width: min(860px, 100%);
  background: var(--bg);
  border: 1px solid var(--border);
  border-radius: 14px;
  padding: 20px 20px 16px;
  box-shadow: 0 1px 10px rgba(0, 0, 0, 0.03);
}

header h2 {
  margin: 0 0 4px;
  font-size: 18px;
}

header p {
  margin: 0 0 8px;
  color: var(--muted);
}

.field {
  margin: 14px 0;
}

.chip {
  width: 18px;
  height: 18px;
  border-radius: 50%;
  border: 1px solid var(--border);
}

label {
  font-weight: 600;
  display: block;
  margin-bottom: 6px;
}

input[type="text"],
textarea {
  width: 100%;
  border: 1px solid var(--border);
  border-radius: 10px;
  padding: 10px 12px;
  font-size: 14px;
  outline: none;
  background: #fff;
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

.right {
  display: flex;
  gap: 8px;
  align-items: center;
}

.ai-badge {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  font-size: 12px;
  color: #374151;
  background: #eef2ff;
  border: 1px solid #e0e7ff;
  border-radius: 999px;
  padding: 3px 8px;
}

.ai-badge.loading {
  background: #f8fafc;
  border-color: #e5e7eb;
}

.sparkle {
  font-size: 13px;
}

.textBtn {
  border: none;
  background: transparent;
  color: #4f46e5;
  font-size: 12px;
  padding: 4px 6px;
  border-radius: 6px;
  cursor: pointer;
}

.textBtn:hover {
  background: #eef2ff;
}

.textareaWrap {
  position: relative;
}

.overlay {
  position: absolute;
  inset: auto 8px 8px auto;
  bottom: 8px;
  right: 8px;
  display: flex;
  gap: 8px;
  align-items: center;
  font-size: 12px;
  color: #374151;
  background: rgba(255, 255, 255, 0.92);
  border: 1px solid var(--border);
  padding: 6px 8px;
  border-radius: 8px;
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

.help {
  color: var(--muted);
  font-size: 12px;
  margin-top: 6px;
}

.footer {
  margin-top: 12px;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.primary {
  background: #111827;
  color: white;
  border: 0;
  padding: 10px 14px;
  border-radius: 10px;
  cursor: pointer;
}
.primary:hover {
  background: #0b1220;
}

.meta {
  color: var(--muted);
  font-size: 12px;
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
</style>
