// example.ts
import { SolanaAgentKit, KeypairWallet, createVercelAITools } from 'solana-agent-kit';
import { Keypair } from '@solana/web3.js';
import bs58 from 'bs58';
import OkxPlugin from '../../../packages/plugin-defi/src/okx';
import dotenv from 'dotenv';
import { createOpenAI } from '@ai-sdk/openai';
import { generateText } from 'ai';
import readline from 'readline';

// Use this to import the DefiPlugin if you want to use in tandem with other plugins
// import DefiPlugin from '@solana-agent-kit/plugin-defi';

dotenv.config();

// Interface for swap context
interface SwapContext {
  fromToken?: string;
  toToken?: string;
  amount?: number;
  slippage?: string;
  quote?: any;
  lastAction?: 'quote' | 'swap';
}

async function runOkxExample() {
  // Set up the wallet
  const keyPair = Keypair.fromSecretKey(
    bs58.decode(process.env.SOLANA_PRIVATE_KEY!)
  );

  const wallet = new KeypairWallet(keyPair, process.env.RPC_URL!);

  // Initialize the agent with the OKX plugin
  const agent = new SolanaAgentKit(wallet, process.env.RPC_URL!, {
    OKX_API_KEY: process.env.OKX_API_KEY!,
    OKX_SECRET_KEY: process.env.OKX_SECRET_KEY!,
    OKX_API_PASSPHRASE: process.env.OKX_API_PASSPHRASE!,
    OKX_PROJECT_ID: process.env.OKX_PROJECT_ID || "",
  })
    .use(OkxPlugin);

  // Set up chat interface
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  });

  const tools = createVercelAITools(agent, agent.actions);
  const openAI = createOpenAI({
    apiKey: process.env.OPENAI_API_KEY!
  });

  // Initialize conversation context
  const context: SwapContext = {};
  let conversationHistory = '';

  // Helper function to format numbers
  const formatNumber = (num: string | number, decimals: number = 9) => {
    const n = typeof num === 'string' ? parseFloat(num) : num;
    const adjusted = n / Math.pow(10, decimals);
    if (adjusted >= 1) {
      return adjusted.toLocaleString(undefined, { maximumFractionDigits: 4 });
    } else {
      return adjusted.toLocaleString(undefined, { maximumSignificantDigits: 6 });
    }
  };

  // Helper function to format quote
  const formatQuote = (result: any) => {
    return `Quote received:
From: ${formatNumber(result.fromTokenAmount, parseInt(result.fromToken.decimal))} ${result.fromToken.tokenSymbol}
To: ${formatNumber(result.toTokenAmount, parseInt(result.toToken.decimal))} ${result.toToken.tokenSymbol}
Exchange Rate: ${formatNumber(result.priceImpactPercentage)}%
Price Impact: ${formatNumber(result.priceImpactPercentage)}%
${result.tradeFee ? `Trade Fee: ${formatNumber(result.tradeFee, parseInt(result.toToken.decimal))} ${result.toToken.tokenSymbol}` : ''}
${result.estimateGasFee ? `Estimated Gas Fee: ${formatNumber(result.estimateGasFee, 9)} SOL` : ''}`;
  };

  // Helper function to format transaction signature as OKX Explorer link
  const formatTxLink = (signature: string) => {
    return `https://web3.okx.com/explorer/solana/tx/${signature}`;
  };

  async function chat() {
    // Initial system message
    const initialMessage = `🚀 OKX DEX Chat
────────────────────────────────────────────────────────────
✓ Wallet initialized
  Address: ${wallet.publicKey.toBase58()}
✓ Agent initialized with OKX plugin

Chat started. Type your message or 'exit' to quit.
Example commands:
  - "Get a swap quote for .01 SOL to USDC"
  - "Swap 0.01 SOL to USDC with 0.5% slippage"`;

    // Display initial message
    rl.write(initialMessage + '\n\n');

    conversationHistory = initialMessage;

    async function handleUserInput() {
      rl.question('You: ', async (input) => {
        if (input.toLowerCase() === 'exit') {
          rl.close();
          return;
        }

        try {
          // Update conversation history
          conversationHistory += `\nUser: ${input}\n`;

          const proceedWords = ['proceed', 'continue', 'yes', 'swap', 'do it', 'execute'];
          let prompt = input;

          const response = await generateText({
            model: openAI("gpt-4o"),
            tools,
            prompt,
            maxSteps: 5,
            system: `You are an agent that can call the following tools: ${Object.values(tools).map(t => (t as any).name).join(', ')}. 
When the user says to proceed with a swap, you must call the swap tool with the parameters from the last quote.
Keep your responses concise and avoid repeating information. Only show essential information to the user.
When displaying a quote, format it clearly with all relevant information including:
- Input amount and token
- Output amount and token
- Exchange rate
- Price impact
- Trade fee (if any)
- Estimated gas fee (if any)
When displaying transaction signatures, always format them as OKX Explorer links: https://web3.okx.com/explorer/solana/tx/{signature}`
          });

          // Update conversation history and display response
          conversationHistory += `Assistant: ${response.text}\n`;
          rl.write(response.text + '\n');

          // --- Store the actual tool result in context ---
          const toolResults = response.toolResults as any[] | undefined;
          if (toolResults && toolResults.length > 0) {
            // If the tool result is a swap execution, clear the context
            const swapResult = toolResults.find(tr => tr.result && tr.result.signature);
            if (swapResult) {
              context.lastAction = 'swap';
              context.quote = undefined;
            }
          }

          // When proceeding with swap, use the GET_SWAP tool
          if (proceedWords.some(w => input.toLowerCase().includes(w))) {
            const swapTool = Object.values(tools).find((t: any) => t.id === "OKX_DEX_SWAP");
            if (!swapTool) throw new Error("Swap tool not found in tools");

            // Extract token direction from input
            const fromTokenMatch = input.match(/(?:^|\s)(\d*\.?\d+)\s+(\w+|[\w\d]{32,44})\s+to\s+(\w+|[\w\d]{32,44})/i);
            if (!fromTokenMatch) {
              const errorMsg = '\nCould not parse token direction from input. Please use format: "swap X TOKEN to TOKEN" or "swap X TOKEN_ADDRESS to TOKEN_ADDRESS"\n';
              conversationHistory += errorMsg;
              rl.write(errorMsg);
              handleUserInput();
              return;
            }

            const [_, amount, fromToken, toToken] = fromTokenMatch;
            const parsedAmount = parseFloat(amount);

            // Get quote using swap tool with execute: false
            const quoteResult = await (swapTool as any).execute({
              fromToken: fromToken,
              toToken: toToken,
              amount: parsedAmount,
              slippage: "0.5",
              execute: false
            });

            if (quoteResult.status === "success" && quoteResult.routerResult) {
              const result = quoteResult.routerResult;

              // Add quote to conversation history and display it
              const quoteMessage = formatQuote(result);
              conversationHistory += `\n${quoteMessage}\n`;
              rl.write('\n' + quoteMessage + '\n');

              // Ask for confirmation
              rl.question('\nWould you like to proceed with this swap? (yes/no): ', async (answer) => {
                if (answer.toLowerCase() === 'yes' || answer.toLowerCase() === 'y') {
                  // Execute the swap
                  const swapResult = await (swapTool as any).execute({
                    fromToken: fromToken,
                    toToken: toToken,
                    amount: parsedAmount,
                    slippage: "0.5",
                    execute: true
                  });
                  if (swapResult.signature) {
                    const txLink = formatTxLink(swapResult.signature);
                    const successMsg = `\nSwap executed! Transaction: ${txLink}\n`;
                    conversationHistory += successMsg;
                    rl.write(successMsg);
                  } else {
                    const failMsg = '\nSwap failed. Please try again.\n';
                    conversationHistory += failMsg;
                    rl.write(failMsg);
                  }
                } else {
                  const cancelMsg = '\nSwap cancelled.\n';
                  conversationHistory += cancelMsg;
                  rl.write(cancelMsg);
                }
                context.lastAction = 'swap';
                context.quote = undefined;
                handleUserInput();
              });
              return;
            } else {
              const errorMsg = `\nError getting quote for swap: ${JSON.stringify(quoteResult, null, 2)}\n`;
              conversationHistory += errorMsg;
              rl.write(errorMsg);
              handleUserInput();
            }
          }

          // Only proceed with the rest of the chat if we haven't started a swap flow
          if (!proceedWords.some(w => input.toLowerCase().includes(w))) {
            conversationHistory += `\n${response.text}\n`;
          }

          // Continue chat
          handleUserInput();
        } catch (error: any) {
          const errorMsg = `\nError: ${error.message}\n`;
          conversationHistory += errorMsg;
          rl.write(errorMsg);
          handleUserInput();
        }
      });
    }

    // Start handling user input
    handleUserInput();
  }

  // Start chat
  chat();
}

if (require.main === module) {
  runOkxExample().catch(console.error);
}