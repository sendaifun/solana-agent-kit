# Migrating from V1 to V2

## Why we built V2?

We built V2 to improve the performance, compatibility, and usability of the Solana Agent Kit. We designed it to be more compasable, extensible, and easier to use. By going with the plugin architecture, we can add new features and tools without breaking existing ones. This allows us to keep up with the rapidly evolving landscape of AI and Solana development.

Unlike V1, V2 is designed for composability and production readiness. Instead of a monolithic architecture where all protocols are bundled into one package, V2 uses plugins to provide a more modular and flexible approach, also allowing for easier updates and maintenance. It also allows for community contributions through third-party plugins, more on that later.

## Do I still need to provide a private key?

In V1, the private key was required to sign transactions. In V2, the private key is no longer required. Instead, you can use a solana wallet provider like Privy, Phantom, or the solana wallet adapter to provide an interface for signing transactions and messages, and sending them on-chain. However, if you want to use the private key, you can still do so by using the `KeypairWallet` class we provide.

```ts
import {SolanaAgentKit} from 'solana-agent-kit'

const agentKit = new SolanaAgentKit(
  SOLANA_PRIVATE_KEY,
  RPC_URL,
  OPENAI_API_KEY,
)

const tools = createSolanaTools(agentKit)
```

```ts
import {KeypairWallet, SolanaAgentKit } from 'solana-agent-kit'
import TokenPlugin from '@solana-agent-kit/plugin-token'
import { Keypair } from '@solana/web3.js'

const keyPair = Keypair.fromSecretKey(
  bs58.decode(SOLANA_PRIVATE_KEY),
);

// creates a class that implements the Wallet interface
const wallet = new KeypairWallet(keyPair, RPC_URL);

const agent = new SolanaAgentKit(wallet, RPC_URL, {})
  .use(TokenPlugin) // use the plugin you want to use

const tools = createVercelAITools(agent, agent.actions)
```

The latter is what V2 looks like. The private key is no longer required, and you can use any wallet provider you want. This allows for more flexibility and security, as you can use a wallet provider that you trust and that fits your needs. You can also use multiple wallet providers at the same time, which is not possible in V1.

## How do I use the new plugin architecture?

The new plugin architecture is designed to be easy to use and extend. You can use the `use` method to add plugins to your agent. The plugins are designed to be modular and composable, so you can use them in any combination you want. You can also create your own plugins and share them with the community.

### Installing official plugins

Official plugins built by the Solana Agent Kit maintainers are available on NPM under the `@solana-agent-kit` scope. You can install them using npm or yarn:

```bash
npm install @solana-agent-kit/plugin-token @solana-agent-kit/plugin-defi
```

And then use them in your code:

```ts
import {SolanaAgentKit} from 'solana-agent-kit'
import TokenPlugin from '@solana-agent-kit/plugin-token'
import DefiPlugin from '@solana-agent-kit/plugin-defi'


const agent = new SolanaAgentKit(wallet, RPC_URL, {})
  .use(TokenPlugin)
  .use(DefiPlugin)
```

### Creating your own plugins

You can create your own plugins by implementing the `Plugin` interface. The `Plugin` interface is a simple interface that defines the methods and actions a plugin implements. You can use the `Plugin` interface to create a plugin.

```ts
import { type Plugin } from 'solana-agent-kit'
import { z } from 'zod'

const MyPlugin: Plugin = {
  name: 'MyPlugin',
  methods: {
    // agent must be defined if you plan to use the agent, agent.wallet, or agent.connection within you method
    myMethod: async (agent: SolanaAgentKit, myArg: string) => {
      // Your method logic here
    },
  },
  actions: [
    {
      name: 'myAction',
      description: 'My action description',
      similes: ['perform my action', 'run my action'],
      examples: [
        {
          input: {
            text: 'My action input',
          },
          output: {
            result: 'My action output',
          },
          explanation: 'My action explanation',
        },
      ],
      schema: z.object({
        myArg: z.string(),
      }),
      handler: async (agent) => {
        // Your action logic here
        // Call a method defined in the plugin
        const result = await MyPlugin.methods.myMethod(myArg)
        return result
      }
    }
  ],
  initialize: function () {
    // Initialize all methods with the agent instance
    Object.entries(this.methods).forEach(([methodName, method]) => {
      if (typeof method === "function") {
        this.methods[methodName] = method;
      }
    });
  }
}

export default MyPlugin
```

Of course, this is a simple example. You can create more complex plugins that implement multiple methods and actions, and that use the agent, wallet, and connection in different ways. The plugin architecture is designed to be flexible and extensible, so you can create plugins that fit your needs.

## How do I use plugin methods?

The plugin methods are defined in the plugin and can be used from the agent's methods object with full type safety.

```ts
import { SolanaAgentKit } from 'solana-agent-kit'
import MyPlugin from './my-plugin'
import TokenPlugin from '@solana-agent-kit/plugin-token'

const agent = new SolanaAgentKit(wallet, RPC_URL, {})
  .use(MyPlugin)
  .use(TokenPlugin)

// Call a method defined in either of the plugins
const result = await agent.methods.myMethod('myArg')
const tokenResult = await agent.methods.get_token_balance('myTokenAddress')
```

As opposed to V1, where there was no `methods` object and you had to call the methods directly from the agent, in V2 you can use the `methods` object to call the methods defined in the plugins. This allows for better organization and separation of concerns, as well as better type safety and autocompletion.

## Passing plugin actions to Vercel AI and Langchain

Once the plugin is added to the agent, you can pass the plugin actions to Vercel AI or Langchain, using the `createVercelAITools` or `createLangchainTools` functions. This allows you to use the plugin actions in your Vercel AI or Langchain applications.

Let's use the `TokenPlugin` with Vercel AI as an example:

```ts
import { SolanaAgentKit, createVercelAITools } from 'solana-agent-kit'
import { createOpenAI } from '@ai-sdk/openai'
import { generateText } from 'ai'

const agent = new SolanaAgentKit(wallet, RPC_URL, {})
  .use(TokenPlugin)

const tools = createVercelAITools(agent, agent.actions)

const openAI = createOpenAI({
  apiKey: OPENAI_API_KEY
})

const response = await generateText({
  model: openai("gpt-4o"),
  tools,
  prompt: "What is my wallet's token balance?",
  maxSteps: 5,
});
```

Pretty simple, right? You can use the `createVercelAITools` function to create a set of tools that can be used with Vercel AI. The tools are created from the agent's actions and can be used in the same way as the Vercel AI tools.

## Conclusion

With the key differences between V1 and V2 in mind, you should be able to migrate your existing code to V2 with ease. We kept the migration process in mind that's why we tried to keep the API as similar as possible.

If you have any questions or need help with the migration process or creating your own plugins, feel free to reach out to us on [X](https://x.com/sendaifun) or Github. We're here to help you make the most of the Solana Agent Kit and its new features.
