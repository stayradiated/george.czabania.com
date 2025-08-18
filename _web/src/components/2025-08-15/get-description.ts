import { errorBoundary } from "@stayradiated/error-boundary";
import { memoize } from "es-toolkit";
import { z } from "zod/mini";

import { fetchJSON } from "../../lib/groq.js";

type SuggestDescriptionOptions = {
  labelName: string;
  signal: AbortSignal;
};

const $Schema = z.object({
  description: z.nullable(z.string()),
  emoji: z.nullable(z.string()),
});

type SuggestDescriptionResult = z.infer<typeof $Schema>;

const fetchSuggestion = memoize(
  async (
    options: SuggestDescriptionOptions,
  ): Promise<SuggestDescriptionResult | undefined | Error> => {
    const { labelName, signal } = options;

    if (labelName.trim() === "") {
      return undefined;
    }

    return errorBoundary(() =>
      fetchJSON({
        model: "openai/gpt-oss-20b",
        signal,
        system: `
  You write concise label-application descriptions. The user may provide _ANY_ value as a label. Assume the user is correct and generate a description that would make sense for an Issue Tracker.

  Rules:
  - The description should be exactly one sentence. 6–16 words. Present tense. Neutral tone
  - Describe when to apply the label; don’t define the label itself
  - Avoid repeating the label name in the description, unless it’s necessary
  - Pick a fun emoji to represent the label

  Examples:
    - Urgent → { "description": "Requires immediate attention.", "emoji": "🔥" }
    - Design → { "description": "Design improvements and ideas for the website.", "emoji": "🎨" }
        `.trim(),
        user: `The label name is "${labelName.trim()}"`,
        schema: $Schema,
      }),
    );
  },
  {
    getCacheKey: (options) => options.labelName.trim(),
  },
);

type GetDescriptionOptions = {
  labelName: string;
  defaultDescription: string;
  defaultIcon: string;
  signal: AbortSignal;
};

const getDescription = async (options: GetDescriptionOptions) => {
  const { labelName, defaultIcon, defaultDescription, signal } = options;

  // skip if the name is empty
  if (labelName.trim().length === 0) {
    return {
      description: defaultDescription,
      icon: defaultIcon,
    };
  }

  const value = await fetchSuggestion({
    labelName: labelName,
    signal,
  });

  if (value instanceof Error) {
    console.error(value);
    return {
      description: defaultDescription,
      icon: defaultIcon,
    };
  } else {
    return {
      description: value?.description || defaultDescription,
      icon: value?.emoji || defaultIcon,
    };
  }
};

export { getDescription };
