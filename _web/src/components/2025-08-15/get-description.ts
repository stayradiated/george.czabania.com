import { errorBoundary } from "@stayradiated/error-boundary";
import { memoize } from "es-toolkit";
import { z } from "zod/mini";

import { fetchText } from "../../lib/groq.js";

type SuggestDescriptionOptions = {
  labelName: string;
  signal: AbortSignal;
};

const $Schema = z.nullable(
  z.object({
    description: z.catch(z.nullable(z.string().check(z.minLength(1))), null),
    emoji: z.catch(z.nullable(z.string().check(z.minLength(1))), null),
  }),
);

type SuggestDescriptionResult = z.infer<typeof $Schema>;

const fetchSuggestion = memoize(
  async (
    options: SuggestDescriptionOptions,
  ): Promise<SuggestDescriptionResult | Error> => {
    const { labelName, signal } = options;

    if (labelName.trim() === "") {
      return null;
    }

    return errorBoundary(async () => {
      let output = await fetchText({
        signal,
        system: `
  You write concise label-application descriptions. The user may provide _ANY_ value as a label. Assume the user is correct and generate a description that would make sense for an Issue Tracker.

  Rules:
  - The description should be exactly one sentence. 6–16 words. Present tense. Neutral tone
  - Describe when to apply the label; don’t define the label itself
  - Avoid repeating the label name in the description, unless it’s necessary
  - Pick a fun emoji to represent the label (and always wrap the emoji in double quotes)

  Output schema:
    - {"description":"string","emoji":"string"}

  Examples:
    - Urgent → { "description": "This issue needs immediate attention.", "emoji": "🔥" }
    - Design → { "description": "This issue is about the design of the website.", "emoji": "🎨" }
        `.trim(),
        user: `The label name is "${labelName.trim()}"`,
      });

      if (output === "null") {
        return null;
      }
      // Handle the LLM returning more output than we need
      const firstOpenBrace = output.indexOf("{");
      if (firstOpenBrace > 0) {
        output = output.slice(firstOpenBrace);
      }
      const lastCloseBrace = output.lastIndexOf("}");
      if (lastCloseBrace > output.length - 1) {
        output = output.slice(0, lastCloseBrace + 1);
      }
      return $Schema.parse(JSON.parse(output));
    });
  },
  {
    getCacheKey: (options) => options.labelName.trim().toLowerCase(),
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
