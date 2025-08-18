import { errorBoundary } from "@stayradiated/error-boundary";
import { memoize } from "es-toolkit";
import { z } from "zod/mini";

import { fetchJSON } from "../../lib/groq.js";

type Label = {
  name: string;
  description: string;
};

type SuggestLabelOptions = {
  text: string;
  labelList: Label[];
  signal: AbortSignal;
};

const $Schema = z.object({
  suggestedLabels: z.array(z.string()),
});

type Output = z.infer<typeof $Schema>;

const fetchSuggestion = memoize(
  async (options: SuggestLabelOptions): Promise<Output | undefined | Error> => {
    const { text, labelList, signal } = options;

    if (text.trim() === "") {
      return undefined;
    }
    if (labelList.length === 0) {
      return undefined;
    }

    return errorBoundary(() =>
      fetchJSON({
        model: "openai/gpt-oss-20b",
        signal,
        system: `
You analyze text and suggest relevant labels from a predefined list. Only suggest labels that are genuinely applicable to the content.

Available labels:
${labelList.map((l) => `- ${l.name}: ${l.description}`).join("\n")}

Rules:
- Only suggest labels that directly relate to the text content
- Maximum 3 suggestions, ordered by relevance (most relevant first)
- Return empty array if no labels are truly relevant
- Consider both explicit mentions and implicit themes
- A label must add meaningful categorization value to be suggested

Relevance criteria:
- The text explicitly discusses the label's topic
- The text describes a situation where the label's description applies
- The label would help someone quickly understand the text's main focus

Output only the label names that match, not descriptions.
        `.trim(),
        user: `This is my insight:\n---\n${text}\n---\n`,
        schema: $Schema,
      }),
    );
  },
  {
    getCacheKey: (options) => {
      return [
        options.text.trim(),
        ...options.labelList.flatMap((l) => [
          l.name.trim(),
          l.description.trim(),
        ]),
      ].join("•");
    },
  },
);

type GetDescriptionOptions<L extends Label> = {
  text: string;
  labelList: L[];
  signal: AbortSignal;
};

const getLabel = async <L extends Label>(
  options: GetDescriptionOptions<L>,
): Promise<L[]> => {
  const { text, labelList, signal } = options;

  // skip if the name is empty
  if (text.trim().length === 0) {
    return [];
  }

  const value = await fetchSuggestion({
    text,
    labelList,
    signal,
  });

  if (value instanceof Error) {
    console.error(value);
    return [];
  } else {
    return (
      value?.suggestedLabels?.flatMap(
        (labelName) => labelList.find((l) => l.name === labelName) ?? [],
      ) ?? []
    );
  }
};

export { getLabel };
