<script lang="ts">
import { untrack } from "svelte";
import { fade } from "svelte/transition";

import DebouncedInput from "../DebouncedInput.svelte";
import { search } from "./search-api.js";

let query = $state("");
let debounceMs = $state(300);

let searchResultsPromise = $state<Promise<string[]>>(Promise.resolve([]));

type RequestLogEntry = {
  index: number;
  query: string;
  numResults: number;
  status: "pending" | "success" | "cancelled";
};
let requestCount = $state(0);
let requestLog = $state<RequestLogEntry[]>([]);

$effect(() => {
  // track the last 10 queries
  untrack(() => {
    requestCount += 1;
    requestLog.unshift({
      index: requestCount,
      query,
      numResults: 0,
      status: "pending",
    });
    if (requestLog.length > 10) {
      requestLog.pop();
    }
  });

  const controller = new AbortController();
  searchResultsPromise = search({
    delayMs: Math.random() * 1000 + 200,
    query,
    signal: controller.signal,
  });

  untrack(() => {
    searchResultsPromise.then((results) => {
      const entry = requestLog.at(0);
      if (entry?.status === "pending") {
        entry.numResults = results.length;
        entry.status = "success";
      }
    });
  });

  return () => {
    controller.abort();

    untrack(() => {
      const entry = requestLog.at(0);
      if (entry?.status === "pending") {
        entry.status = "cancelled";
      }
    });
  };
});

const handleClearQuery = () => {
  query = "";
};

const handleClearHistory = () => {
  requestCount = 0;
  requestLog = [];
};
</script>

<div class="container">
  <div class="card">
    <div class="search">
      <DebouncedInput
        bind:value={query}
        delayMs={debounceMs}
        type="search"
        placeholder="Search grocery items"
        aria-label="Search"
      />

      <svg class="icon" viewBox="0 0 24 24" aria-hidden="true">
        <path d="M15.5 14h-.79l-.28-.27A6.471 6.471 0 0 0 16 9.5 6.5 6.5 0 1 0 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79L20 21.5 21.5 20l-6-6zM10 14.5A4.5 4.5 0 1 1 10 5.5a4.5 4.5 0 0 1 0 9z"/>
      </svg>

      {#if query.length > 0}
        <button class="btn ghost" type="button" onclick={handleClearQuery} transition:fade={{ duration: 100 }} >Clear</button>
      {/if}
    </div>

    <div class="groceryList" aria-live="polite">
      {#await searchResultsPromise}
        <span class="searching">
          {#if query.length > 0}
            Searching for "{query}"
          {:else}
            Loading
          {/if}
          <span class="dots" aria-hidden="true"></span>
        </span>
      {:then results}
        {#if results.length}
          <ul class="results">
            {#each results as item}
              <li>{item}</li>
            {/each}
          </ul>
        {:else}
          <span class="muted">No results found for “{query}”</span>
        {/if}
      {/await}
    </div>
  </div>

  <section class="panel">
    <div class="control">
      <label for="delayMs">Input Debounce</label>
      <p class="subtle">How long to wait after typing before triggering a search.</p>

      <div class="segmented" role="radiogroup" aria-label="Input Debounce">
        <label for="debounceNone">No Delay<span class="ms">(0ms)</span></label>
        <input type="radio" bind:group={debounceMs} value={0} id="debounceNone" />

        <label for="debounceFast">Fast <span class="ms">(150ms)</span></label>
        <input type="radio" bind:group={debounceMs} value={150} id="debounceFast" />

        <label for="debounceMedium">Medium <span class="ms">(300ms)</span></label>
        <input type="radio" bind:group={debounceMs} value={300} id="debounceMedium" />

        <label for="debounceSlow">Slow <span class="ms">(700ms)</span></label>
        <input type="radio" bind:group={debounceMs} value={700} id="debounceSlow" />
      </div>
    </div>
  </section>

  <div class="card">
    <header class="cardHeader">
      <h4>API Request Log</h4>
      <button class="btn ghost" type="button" onclick={handleClearHistory}>Reset</button>
    </header>

    <div class="requestLog">
      <ul>
        {#each requestLog as entry}
          <li>
            <span class="index">{entry.index}.</span>
            <code>{entry.query || '(empty query)'}</code>
            {#if entry.status === 'pending'}
              <span class="spinner" aria-hidden="true"></span>
            {:else if entry.status === 'success'}
              <span class="success">✓ ({entry.numResults} results)</span>
            {:else if entry.status === 'cancelled'}
              <span class="cancelled">✕ Cancelled</span>
            {/if}
          </li>
        {/each}
      </ul>
    </div>
  </div>
</div>

<style>
/* ── Theme tokens (scoped) ─────────────────────────────────────────────── */
.container {
  --bg: #f7f8fb;
  --surface: #ffffff;
  --surface-2: #f2f5fb;
  --border: #e7ecf3;
  --text: #0f172a;
  --muted: #52607a;
  --ring: #1e66ff;
  --accent: #1e66ff;
  --accent-weak: #dbe6ff;
  --shadow: 0 8px 20px rgba(2,12,27,0.08);

  font:
    14px / 1.5 system-ui,
    -apple-system,
    Segoe UI,
    Roboto,
    Ubuntu,
    "Helvetica Neue",
    Arial,
    "Noto Sans",
    "Apple Color Emoji",
    "Segoe UI Emoji";

  display: grid;
  gap: 0.9rem;
}

/* ── Layout / cards ────────────────────────────────────────────────────── */
.panel {
  display: flex;
  gap: 0.75rem;
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: 16px;
  padding: 0.9rem;
  box-shadow: var(--shadow);
}
.card {
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: 16px;
  padding: 0.9rem;
  box-shadow: var(--shadow);
}
.cardHeader {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: .5rem;
  margin: -.1rem 0 .5rem 0;
}
.cardHeader h4 { margin: 0; font-size: .95rem; }

/* ── Buttons ──────────────────────────────────────────────────────────── */
.btn {
  border-radius: 999px;
  padding: 0.45rem 0.9rem;
  border: 1px solid var(--border);
  background: var(--surface);
  color: var(--text);
  cursor: pointer;
  transition: transform 0.06s ease, background 0.2s ease, border-color 0.2s ease, box-shadow .2s ease;
}
.btn:hover { transform: translateY(-1px); }
.btn:active { transform: translateY(0); }
.btn:focus-visible { outline: none; box-shadow: 0 0 0 3px color-mix(in oklab, var(--ring), transparent 80%); }
.btn.ghost:hover { border-color: var(--accent-weak); background: var(--surface-2); }

/* ── Controls ─────────────────────────────────────────────────────────── */
.control {
  flex: 1;
  display: grid;
  grid-template-columns: 1fr;
  align-items: start;
  gap: 0.5rem;
  background: var(--surface-2);
  border: 1px solid var(--border);
  border-radius: 12px;
  padding: 0.7rem;
}
.control > label {
  font-weight: 600;
  letter-spacing: 0.2px;
}
.control > p { margin: 0; }
.subtle { color: var(--muted); margin: -0.25rem 0 0.25rem; }

/* Segmented radio group (no markup reordering needed) */
.segmented {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: .4rem;
}
@media (max-width: 650px) {
  /* stack the radio buttons on small screens */
  .segmented { grid-template-columns: repeat(2, minmax(0, 1fr)); }
}
.segmented input[type="radio"] {
  position: absolute;
  inline-size: 1px;
  block-size: 1px;
  margin: -1px;
  padding: 0;
  border: 0;
  clip: rect(0 0 0 0);
  clip-path: inset(50%);
  overflow: hidden;
  white-space: nowrap;
}
.segmented label {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: .48rem .65rem;
  border: 1px solid var(--border);
  border-radius: 999px;
  background: var(--surface);
  color: var(--text);
  font-weight: 600;
  cursor: pointer;
  transition: background .2s, border-color .2s, transform .06s ease, box-shadow .2s;
}
.segmented label .ms { opacity: .65; font-weight: 500; margin-left: .15rem; }
.segmented label:hover { background: var(--surface-2); transform: translateY(-1px); }
.segmented label:active { transform: translateY(0); }
.segmented label:has(+ input[type="radio"]:checked) {
  background: var(--accent-weak);
  border-color: color-mix(in oklab, var(--accent), white 70%);
  box-shadow: 0 0 0 2px color-mix(in oklab, var(--ring), transparent 85%) inset;
}
.segmented label:has(+ input[type="radio"]:focus-visible) {
  outline: 3px solid color-mix(in oklab, var(--ring), transparent 70%);
  outline-offset: 2px;
}

/* ── Search ───────────────────────────────────────────────────────────── */
.search {
  display: flex;
  position: relative;
  margin: 0 0 0.9rem 0;
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: 12px;
  padding: 0.35rem 0.6rem 0.35rem 2.2rem;
  transition: box-shadow .2s ease, border-color .2s ease;
}
.search:focus-within {
  border-color: var(--ring);
  box-shadow: 0 0 0 3px color-mix(in oklab, var(--ring), transparent 82%), var(--shadow);
}
.search :global(input[type="search"]) {
  width: 100%;
  border: 0;
  background: transparent;
  color: var(--text);
  font-size: 16px;
  padding: 0.55rem 0.4rem;
}
.search :global(input[type="search"]:focus-visible) { outline: none; }
/* Tidy the native clear button (WebKit) */
.search :global(input[type="search"])::-webkit-search-cancel-button {
  -webkit-appearance: none;
  height: 14px; width: 14px; border-radius: 50%;
  background:
    radial-gradient(circle at center, currentColor 45%, transparent 46%) center/100% 100% no-repeat;
  opacity: .4;
}
.search :global(input[type="search"])::-webkit-search-cancel-button:hover { opacity: .7; }
.icon {
  position: absolute;
  left: 0.65rem;
  top: 50%;
  transform: translateY(-50%);
  width: 18px;
  height: 18px;
  opacity: 0.7;
  pointer-events: none;
  fill: currentColor;
}

/* ── Results ──────────────────────────────────────────────────────────── */
.groceryList {
  height: 220px;
  overflow: auto;
  /* subtle edge fade on scrollable area (supported in modern browsers) */
  mask-image: linear-gradient(to bottom, transparent, #000 10px, #000 calc(100% - 10px), transparent);
  padding: 10px;
  margin: -10px;
}
.results {
  list-style: none;
  padding: 0 !important;
  margin: 0;
  display: grid;
  gap: 0.3rem;
}
.results li {
  padding: 0.45rem 0.6rem;
  border: 1px solid var(--border);
  border-radius: 8px;
  background: var(--surface-2);
}
.results li:hover { outline: 2px solid color-mix(in oklab, var(--ring), transparent 75%); }
.muted { color: var(--muted); }

/* Searching indicator */
.searching { font-weight: 600; }
.dots::after {
  content: "";
  display: inline-block;
  width: 1.25em;
  text-align: left;
  animation: dots 1s steps(3, end) infinite;
}
@keyframes dots {
  0% { content: ""; }
  33% { content: "."; }
  66% { content: ".."; }
  100% { content: "..."; }
}

/* ── Request log ──────────────────────────────────────────────────────── */
.requestLog ul {
  margin: 0;
  padding: 0;
  list-style: none;
}
.requestLog li {
  display: flex;
  gap: 0.5rem;
  align-items: baseline;
  padding: 0.4rem 0.5rem;
  border-radius: 8px;
}
.requestLog li:nth-child(odd) { background: var(--surface-2); }
.requestLog .index {
  color: var(--muted);
  width: 2ch;
  text-align: right;
}
.requestLog code {
  font-family: ui-monospace, SFMono-Regular, Menlo, Consolas, "Liberation Mono", monospace;
}
.spinner {
  width: 14px;
  height: 14px;
  border: 2px solid var(--border);
  border-top-color: var(--accent);
  border-radius: 50%;
  animation: spin .8s linear infinite;
  margin-left: .1rem;
}
@keyframes spin { to { transform: rotate(360deg); } }
.success { color: #2f7d32; font-weight: 600; }
.cancelled { color: #b00020; font-weight: 600; }

/* ── A11y / motion ───────────────────────────────────────────────────── */
@media (prefers-reduced-motion: reduce) {
  * { animation-duration: 0.001ms !important; animation-iteration-count: 1 !important; transition: none !important; }
  .btn:hover, .segmented label:hover { transform: none !important; }
}
</style>
