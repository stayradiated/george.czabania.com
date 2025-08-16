import { once } from "es-toolkit";
import Groq from "groq-sdk";

const getClient = once(() => {
  const client = new Groq({
    baseURL: "https://groq-relay.stayradiated.workers.dev",
    apiKey: "public-demo",
    dangerouslyAllowBrowser: true,
  });

  return client;
});

type Options = {
  system: string;
  user: string;
  signal?: AbortSignal;
};

async function* streamText(options: Options): AsyncIterable<string> {
  const { system, user, signal } = options;

  const client = getClient();

  const chatCompletion = await client.chat.completions.create(
    {
      model: "llama-3.1-8b-instant",
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
  const { system, user, signal } = options;

  const client = getClient();

  const chatCompletion = await client.chat.completions.create(
    {
      model: "llama-3.1-8b-instant",
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

export { streamText, fetchText };
