# SolanaAgentKit 🦜️🔗 LangChain + Next.js Starter Template

[![Open in GitHub Codespaces](https://github.com/codespaces/badge.svg)](https://codespaces.new/michaelessiet/solana-agent-nextjs-starter-langchain)
[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https%3A%2F%2Fgithub.com%2Fsendaifun%2Fsolana-agent-kit%2Ftree%2Fmain%2Fexamples%2Fagent-kit-nextjs-langchain&env=OPENAI_API_KEY,RPC_URL,SOLANA_PRIVATE_KEY&project-name=solana-agent-kit&repository-name=sak-yourprojectname)

This template scaffolds a SolanaAgentKit + LangChain.js + Next.js starter app.

The agent uses [LangGraph.js](https://langchain-ai.github.io/langgraphjs/), LangChain's framework for building agentic workflows. They use preconfigured helper functions to minimize boilerplate, but you can replace them with custom graphs as desired.

![Demo GIF](/public/images/agent-convo.gif)

It's free-tier friendly too! Check out the [bundle size stats below](#-bundle-size).

## 🚀 Getting Started

First, clone this repo and download it locally.

Next, you'll need to set up environment variables in your repo's `.env.local` file. Copy the `.env.example` file to `.env.local`.
To start, you'll just need to add your OpenAI API key, Solana RPC URL and wallet private key in base 58 string form.

Next, install the required packages using your preferred package manager (e.g. `pnpm`).

```bash
pnpm install
```

Now you're ready to run the development server:

```bash
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result! Ask the bot something and you'll see a streamed response:

![A streaming conversation between the user and the AI](/public/images/chat-conversation.png)

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

Backend logic lives in `app/api/chat/route.ts`. From here, you can change the prompt and model, or add other modules and logic.

## 📚 Learn More

To learn more about what you can do with SolanaAgentKit and LangChain.js, check out the docs here:

- https://github.com/sendaifun/solana-agent-kit
- https://js.langchain.com/docs/

## ▲ Deploy on Vercel

When ready, you can deploy your app on the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme).

Check out the [Next.js deployment documentation](https://nextjs.org/docs/deployment) for more details.

## Thank You!

Thanks for reading! If you have any questions or comments, please drop an issue on this repo or reach out to us on [X](https://x.com/sendaifun)
