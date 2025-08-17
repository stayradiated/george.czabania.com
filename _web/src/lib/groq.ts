import { once } from "es-toolkit";
import Groq from "groq-sdk";
import { z } from "zod/mini";

type Model = "openai/gpt-oss-20b" | "llama-3.1-8b-instant";

const getClient = once(() => {
  const client = new Groq({
    baseURL: "https://groq-relay.stayradiated.workers.dev",
    apiKey: "public-demo",
    dangerouslyAllowBrowser: true,
  });

  return client;
});

type Options = {
  model: Model;
  system: string;
  user: string;
  signal?: AbortSignal;
};

async function* streamText(options: Options): AsyncIterable<string> {
  const { model, system, user, signal } = options;

  const client = getClient();

  const chatCompletion = await client.chat.completions.create(
    {
      model,
      temperature: 1,
      max_completion_tokens: 1024,
      top_p: 1,
      stream: true,
      stop: null,
      messages: [
        {
          role: "system",
          content: system,
        },
        {
          role: "user",
          content: user,
        },
      ],
    },
    {
      signal,
    },
  );

  for await (const chunk of chatCompletion) {
    const nextChunk = chunk.choices[0].delta?.content;
    if (typeof nextChunk === "string") {
      yield nextChunk;
    }
  }
}

const fetchText = async (options: Options) => {
  const { model, system, user, signal } = options;

  const client = getClient();

  const chatCompletion = await client.chat.completions.create(
    {
      model,
      temperature: 1,
      max_completion_tokens: 1024,
      top_p: 1,
      stop: null,
      messages: [
        {
          role: "system",
          content: system,
        },
        {
          role: "user",
          content: user,
        },
      ],
    },
    {
      signal,
    },
  );

  return chatCompletion.choices[0].message?.content || "";
};

type FetchJSONOptions = Options & {
  schema?: z.ZodMiniObject;
};

const fetchJSON = async (options: FetchJSONOptions) => {
  const { model, system, user, signal, schema } = options;

  const client = getClient();

  const chatCompletion = await client.chat.completions.create(
    {
      model,
      temperature: 1,
      max_completion_tokens: 1024,
      top_p: 1,
      stop: null,
      reasoning_effort: "low",
      response_format: schema
        ? {
            type: "json_schema",
            json_schema: {
              name: "response",
              description: "response",
              schema: z.toJSONSchema(schema),
              strict: true,
            },
          }
        : {
            type: "json_object",
          },
      messages: [
        {
          role: "system",
          content: system,
        },
        {
          role: "user",
          content: user,
        },
      ],
    },
    {
      signal,
    },
  );

  const jsonOutput = JSON.parse(
    chatCompletion.choices[0].message?.content ?? "null",
  );
  return schema ? schema.parse(jsonOutput) : jsonOutput;
};

export { streamText, fetchText, fetchJSON };
