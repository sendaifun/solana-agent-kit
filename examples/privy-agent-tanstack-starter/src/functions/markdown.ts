import { createServerFn } from "@tanstack/react-start";

export const readHomeMarkdownFile = createServerFn({ method: "GET" }).handler(
  async () => {
    const url =
      "https://raw.githubusercontent.com/michaelessiet/privy-sak-tanstack/refs/heads/main/src/markdown/home.md";
    const text = await (await fetch(url)).text();
    return text;
  },
);
