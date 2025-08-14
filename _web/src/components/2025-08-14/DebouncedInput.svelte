<script lang="ts">
import { onDestroy, untrack } from "svelte";
import type { HTMLInputAttributes } from "svelte/elements";

type Props = HTMLInputAttributes & {
  // Debounce delay in milliseconds
  delayMs?: number;
};

let { delayMs = 250, value = $bindable(), ...restProps }: Props = $props();

if (delayMs < 0) {
  throw new Error("DebouncedInput: delayMs must be >= 0");
}

let inputValue = $state<Props["value"]>(value);
let timer = $state<ReturnType<typeof setTimeout> | undefined>(undefined);
let isComposing = $state(false);

const schedule = () => {
  if (isComposing) {
    return;
  }
  if (timer) {
    clearTimeout(timer);
  }
  timer = setTimeout(flush, delayMs);
};

const flush = () => {
  if (timer) {
    clearTimeout(timer);
    timer = undefined;
  }
  value = inputValue;
};

const handleInput = () => {
  schedule();
};

const handleKeydown = (event: KeyboardEvent) => {
  if (event.key === "Enter") {
    flush();
  }
};

const handleBlur = () => {
  flush();
};

const handleCompositionStart = () => {
  isComposing = true;
};

const handleCompositionEnd = () => {
  isComposing = false;
};

// If the parent manually updates the value, we need to update the input value
$effect(() => {
  if (value !== untrack(() => inputValue)) {
    inputValue = value;
  }
});

onDestroy(() => {
  if (timer) {
    clearTimeout(timer);
  }
});
</script>

<input
  bind:value={inputValue}
  oninput={handleInput}
  onkeydown={handleKeydown}
  onblur={handleBlur}
  oncompositionstart={handleCompositionStart}
  oncompositionend={handleCompositionEnd}
  {...restProps}
/>

<!--
Copyright © 2025 George Czabania

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the “Software”), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED “AS IS”, WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
-->
