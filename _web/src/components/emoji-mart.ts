import * as emojiMart from "emoji-mart";
import { once } from "es-toolkit";

const initEmojiMart = once(() => {
  return emojiMart.init({
    data: async () => {
      const response = await fetch(
        "https://cdn.jsdelivr.net/npm/@emoji-mart/data",
      );
      return response.json();
    },
  });
});

export { initEmojiMart };
