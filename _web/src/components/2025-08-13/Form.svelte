<script lang="ts">
  import { streamText } from "../../lib/groq.js";

  // ----- Types
  type AIState =
    | { status: "idle"; suggested: false; locked: boolean }
    | { status: "loading"; suggested: boolean; locked: boolean }
    | {
        status: "suggested";
        suggested: true;
        locked: boolean;
        generatedAt: number;
        sourceName: string;
      };

  const initialAI: AIState = { status: "idle", suggested: false, locked: false };

  // ----- State (Svelte 5 runes)
  let name = $state("");
  let description = $state("");
  let ai = $state<AIState>(initialAI);
  let dirty = $state(false);

  let isDescFocused = $state(false);

  let descRef: HTMLTextAreaElement | null = null;
  let regenTimer: number | null = null;

  // derived
  const isDescEmpty = $derived(description.trim() === "");
  const canAIReplace = $derived(
    !("locked" in ai && ai.locked) && (isDescEmpty || ("suggested" in ai && ai.suggested))
  );

  // Debounced name
  let debouncedName = $state(name);
  let nameDebounceHandle: number | null = null;
  $effect(() => {
    // re-run when `name` changes
    void name; // track
    if (nameDebounceHandle) clearTimeout(nameDebounceHandle);
    nameDebounceHandle = window.setTimeout(() => {
      debouncedName = name;
    }, 650);
  });

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
    for await (const chunk of stream) output += chunk;
    return output;
  };

  // central generator
  async function generate() {
    const nm = name.trim();
    if (!nm) return;
    if (!canAIReplace) return;

    const prevSuggested = "suggested" in ai ? ai.suggested : false;
    ai = { status: "loading", suggested: Boolean(prevSuggested), locked: false };

    const text = await describeLabel(nm);
    description = text;
    ai = {
      status: "suggested",
      suggested: true,
      locked: false,
      generatedAt: Date.now(),
      sourceName: nm,
    };
  }

  function scheduleGenerate(ms = 250) {
    if (regenTimer) window.clearTimeout(regenTimer);
    regenTimer = window.setTimeout(() => void generate(), ms);
  }

  // 1) Name changes → maybe generate (debounced)
  $effect(() => {
    void debouncedName; // track
    if (!debouncedName.trim()) return;
    if (canAIReplace) scheduleGenerate(250);
  });

  // 2) If description gets cleared manually → regenerate after a short pause
  $effect(() => {
    void description; // track
    if (!name.trim()) return;
    if (isDescEmpty && !("locked" in ai && ai.locked)) {
      scheduleGenerate(400);
    }
  });

  // Handlers
  function onNameBlur() {
    if (canAIReplace) void generate();
  }

  function onDescriptionFocus() {
    isDescFocused = true;
  }

  function onDescriptionBlur() {
    isDescFocused = false;
  }

  function onDescriptionInput(e: Event) {
    // In Svelte we let `bind:value` update description, and then apply the same locking rules.
    const val = (e.target as HTMLTextAreaElement).value;
    description = val;

    if (val === "") {
      ai = { status: "idle", suggested: false, locked: false };
    } else {
      ai = { status: "idle", suggested: false, locked: true };
      dirty = true;
    }
  }

  function onSubmit(e: Event) {
    e.preventDefault();
    // handle submit as needed
  }
</script>

<div class="wrap">
  <form class="card" on:submit|preventDefault={onSubmit} aria-describedby="helper">
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
        on:blur={onNameBlur}
      />
    </div>

    <div class="field" class:loading={ai.status === "loading"}>
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
          on:input={onDescriptionInput}
          on:focus={onDescriptionFocus}
          on:blur={onDescriptionBlur}
          aria-describedby="descHelp"
        />
        {#if ai.status === "loading"}
          <div class="overlay">
            <span class="spinner" aria-hidden></span> Generating…
          </div>
        {/if}
      </div>

      <div id="descHelp" class="help">
        {#if ai.suggested}
          AI drafted this. Start typing to edit; we’ll stop auto-replacing. Clear to get a new draft.
        {:else if "locked" in ai && ai.locked}
          You’re in control. AI won’t overwrite your edits. Clear to unlock AI again.
        {:else}
          Leave blank and AI will suggest something after you name the label.
        {/if}
      </div>
    </div>

    <footer class="footer">
      <button type="submit" class="primary">Create label</button>
      <div class="meta">
        {#if dirty}
          Edited by you
        {:else if ai.suggested}
          AI-generated description
        {:else}
          No description
        {/if}
      </div>
    </footer>
  </form>
</div>

<style>
  :root { --border:#E5E7EB; --fg:#111827; --muted:#6B7280; --bg:#FFFFFF; --chip:#F3F4F6; }
  * { box-sizing: border-box; font-family: ui-sans-serif, system-ui, -apple-system, "Segoe UI", Roboto, "Helvetica Neue", Arial, "Apple Color Emoji","Segoe UI Emoji"; }
  .wrap { padding: 24px; background: #F9FAFB; min-height: 100vh; display: grid; place-items: start center; }
  .card { width: min(860px, 100%); background: var(--bg); border: 1px solid var(--border); border-radius: 14px; padding: 20px 20px 16px; box-shadow: 0 1px 10px rgba(0,0,0,0.03); }
  header h2 { margin: 0 0 4px; font-size: 18px; }
  header p { margin: 0 0 8px; color: var(--muted); }
  .field { margin: 14px 0; }

  .chip { width: 18px; height: 18px; border-radius: 50%; border: 1px solid var(--border); }
  label { font-weight: 600; display:block; margin-bottom: 6px; }
  input[type="text"], textarea {
    width: 100%; border: 1px solid var(--border); border-radius: 10px; padding: 10px 12px; font-size: 14px; outline: none; background: #fff;
  }
  textarea { resize: vertical; line-height: 1.4; }
  .labelRow { display:flex; align-items: center; justify-content: space-between; gap: 8px; }
  .right { display:flex; gap: 8px; align-items:center; }
  .ai-badge { display:inline-flex; align-items:center; gap:6px; font-size:12px; color:#374151; background:#EEF2FF; border:1px solid #E0E7FF; border-radius:999px; padding:3px 8px; }
  .ai-badge.loading { background:#F8FAFC; border-color:#E5E7EB; }
  .sparkle { font-size: 13px; }
  .textBtn { border: none; background: transparent; color: #4F46E5; font-size: 12px; padding: 4px 6px; border-radius: 6px; cursor: pointer; }
  .textBtn:hover { background: #EEF2FF; }
  .textareaWrap { position: relative; }
  .overlay {
    position:absolute; inset:auto 8px 8px auto; bottom:8px; right:8px;
    display:flex; gap:8px; align-items:center; font-size:12px; color:#374151;
    background: rgba(255,255,255,0.92); border:1px solid var(--border); padding:6px 8px; border-radius:8px;
  }
  .spinner {
    width: 14px; height: 14px; border: 2px solid #CBD5E1; border-top-color:#4F46E5; border-radius: 50%; display:inline-block;
    animation: spin 800ms linear infinite;
  }
  @keyframes spin { to { transform: rotate(360deg); } }
  .help { color: var(--muted); font-size: 12px; margin-top: 6px; }
  .footer { margin-top: 12px; display:flex; align-items:center; justify-content: space-between; }
  .primary { background:#111827; color:white; border:0; padding:10px 14px; border-radius: 10px; cursor: pointer; }
  .primary:hover { background:#0B1220; }
  .meta { color: var(--muted); font-size: 12px; }
  .loading textarea { background-image: linear-gradient(90deg, #fff 0%, #fff 40%, #F3F4F6 50%, #fff 60%, #fff 100%);
                      background-size: 200% 100%; animation: shimmer 2s infinite linear; }
  @keyframes shimmer { 0% { background-position: 200% 0; } 100% { background-position: -200% 0; } }
</style>
