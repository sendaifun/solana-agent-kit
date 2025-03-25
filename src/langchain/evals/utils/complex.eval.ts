import { runComplexEval, ComplexEvalDataset } from "./runEvals";

// Existing simple eval datasets
export const TRANSFER_DATASET: ComplexEvalDataset[] = [
  {
    description: "Multi-turn SOL transfer",
    inputs: {
      query: "I want to send some SOL",
    },
    turns: [
      { input: "I want to send some SOL" },
      { input: "Please transfer 0.05 SOL" },
      {
        input: "Send it to wallet GZbQmKYYzwjP3nbdqRWPLn98ipAni9w5eXMGp7bmZbGB",
        expectedToolCall: {
          tool: "solana_transfer",
          params: {
            to: "GZbQmKYYzwjP3nbdqRWPLn98ipAni9w5eXMGp7bmZbGB",
            amount: 0.05,
          },
        },
      },
    ],
  },
];

export const TOKEN_SWAP_DATASET: ComplexEvalDataset[] = [
  {
    description: "Multi-turn token swap",
    inputs: {
      query: "I want to swap some tokens",
    },
    turns: [
      { input: "I want to swap some tokens" },
      { input: "I want to exchange USDC for JUP tokens" },
      {
        input: "Swap 10 USDC for JUP with 1% slippage",
        expectedToolCall: {
          tool: "solana_trade",
          params: {
            outputMint: "JUPyiwrYJFskUPiHa7hkeR8VUtAeFoSYbKedZNsDvCN",
            inputAmount: 10,
            inputMint: "EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v",
            slippageBps: 100,
          },
        },
      },
      {
        input: "Then check my USDC balance",
        expectedToolCall: { tool: "solana_balance", params: {} },
      },
    ],
  },
];

export const STAKING_DATASET: ComplexEvalDataset[] = [
  {
    description: "Multi-turn restake SOL",
    inputs: {
      query: "I want to restake my SOL",
    },
    turns: [
      { input: "I want to restake my SOL" },
      {
        input: "Please restake 1.5 SOL for me",
        expectedToolCall: { tool: "solana_restake", params: { amount: 1.5 } },
      },
      {
        input: "Then check my updated SOL balance",
        expectedToolCall: { tool: "solana_balance", params: {} },
      },
    ],
  },
];

export const PUMPFUN_MULTI_DATASET: ComplexEvalDataset[] = [
  {
    description: "Multi-turn PumpFun token launch",
    inputs: {
      query: "I want to launch a new PumpFun token",
    },
    turns: [
      { input: "I want to launch a new PumpFun token" },
      { input: "I want it to be called YOLO" },
      { input: "The ticker should be YOLO and description 'yolo token'" },
      {
        input: "Use the image URL https://example.com/yolo.png",
        expectedToolCall: {
          tool: "solana_launch_pumpfun_token",
          params: {
            tokenName: "YOLO",
            tokenTicker: "YOLO",
            description: "yolo token",
            imageUrl: "https://example.com/yolo.png",
          },
        },
      },
    ],
  },
];

export const BALANCE_OTHER_MULTI_DATASET: ComplexEvalDataset[] = [
  {
    description: "Multi-turn USDC balance for another wallet",
    inputs: {
      query: "I want to check my friend's balance",
    },
    turns: [
      { input: "I want to check my friend's balance" },
      { input: "Specifically, his USDC balance" },
      {
        input:
          "The wallet address is GZbQmKYYzwjP3nbdqRWPLn98ipAni9w5eXMGp7bmZbGB",
        expectedToolCall: {
          tool: "solana_balance_other",
          params: {
            walletAddress: "GZbQmKYYzwjP3nbdqRWPLn98ipAni9w5eXMGp7bmZbGB",
            tokenAddress: "EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v",
          },
        },
      },
      {
        input: "Also, check my SOL balance",
        expectedToolCall: { tool: "solana_balance", params: {} },
      },
    ],
  },
];

export const CLOSE_EMPTY_ACCOUNTS_MULTI_DATASET: ComplexEvalDataset[] = [
  {
    description: "Multi-turn close empty token accounts",
    inputs: { query: "I have many empty token accounts" },
    turns: [
      { input: "I have many empty token accounts" },
      {
        input: "Please close all my empty accounts",
        expectedToolCall: { tool: "close_empty_token_accounts", params: {} },
      },
    ],
  },
];

export const FETCH_PRICE_MULTI_DATASET: ComplexEvalDataset[] = [
  {
    description: "Multi-turn fetch token price",
    inputs: { query: "What is the price of a token?" },
    turns: [
      { input: "What is the price of a token?" },
      {
        input:
          "Specifically, the token with mint JUPyiwrYJFskUPiHa7hkeR8VUtAeFoSYbKedZNsDvCN",
        expectedToolCall: {
          tool: "solana_fetch_price",
          params: { address: "JUPyiwrYJFskUPiHa7hkeR8VUtAeFoSYbKedZNsDvCN" },
        },
      },
    ],
  },
];

export const CREATE_GIBWORK_TASK_MULTI_DATASET: ComplexEvalDataset[] = [
  {
    description: "Multi-turn create Gibwork task",
    inputs: { query: "I need to create a new Gibwork task" },
    turns: [
      { input: "I need to create a new Gibwork task" },
      { input: "The task is titled 'Fix my website'" },
      { input: "It should be for 1000 JUP tokens with no extra content" },
      {
        input: "Set content and requirements to N/A and tag it as webdev",
        expectedToolCall: {
          tool: "create_gibwork_task",
          params: {
            title: "Fix my website",
            content: "N/A",
            requirements: "N/A",
            tags: ["webdev"],
            tokenMintAddress: "JUPyiwrYJFskUPiHa7hkeR8VUtAeFoSYbKedZNsDvCN",
            amount: 10,
          },
        },
      },
    ],
  },
];

export const TOKEN_SWAP_MULTI_DATASET: ComplexEvalDataset[] = [
  {
    description: "Multi-turn token swap",
    inputs: { query: "I want to swap some tokens" },
    turns: [
      { input: "I want to swap some tokens" },
      { input: "I want to exchange USDC for JUP tokens" },
      {
        input: "Swap 10 USDC for JUP with 1% slippage",
        expectedToolCall: {
          tool: "solana_trade",
          params: {
            outputMint: "JUPyiwrYJFskUPiHa7hkeR8VUtAeFoSYbKedZNsDvCN",
            inputAmount: 10,
            inputMint: "EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v",
            slippageBps: 100,
          },
        },
      },
    ],
  },
];

export const TOKEN_DATA_MULTI_DATASET: ComplexEvalDataset[] = [
  {
    description: "Multi-turn token data inquiry",
    inputs: { query: "I want details on a token" },
    turns: [
      { input: "I want details on a token" },
      {
        input:
          "The mint address is EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v",
        expectedToolCall: {
          tool: "solana_token_data",
          params: { address: "EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v" },
        },
      },
    ],
  },
];

export const TIPLINK_MULTI_DATASET: ComplexEvalDataset[] = [
  {
    description: "Multi-turn tiplink creation for SOL",
    inputs: { query: "I want to create a tiplink" },
    turns: [
      { input: "I want to create a tiplink" },
      { input: "I need to tip some SOL" },
      {
        input: "Tip 0.5 SOL",
        expectedToolCall: { tool: "solana_tiplink", params: { amount: 0.5 } },
      },
    ],
  },
  {
    description: "Multi-turn tiplink creation for SPL token",
    inputs: { query: "Generate a tiplink for my token" },
    turns: [
      { input: "Generate a tiplink for my token" },
      {
        input: "I want to tip 100 tokens",
        expectedToolCall: {
          tool: "solana_tiplink",
          params: {
            amount: 100,
            splmintAddress: "EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v",
          },
        },
      },
    ],
  },
];

export const LIST_NFT_FOR_SALE_MULTI_DATASET: ComplexEvalDataset[] = [
  {
    description: "Multi-turn NFT listing for sale on Tensor",
    inputs: { query: "I want to list an NFT for sale" },
    turns: [
      { input: "I want to list my NFT for sale" },
      { input: "My NFT mint is DDYCpHiiu83DqkG7aaqiUz77rchXx2f4h6BUQAP9Xwcm" },
      {
        input: "Please list it for 2.5 SOL",
        expectedToolCall: {
          tool: "solana_list_nft_for_sale",
          params: {
            nftMint: "DDYCpHiiu83DqkG7aaqiUz77rchXx2f4h6BUQAP9Xwcm",
            price: 2.5,
          },
        },
      },
    ],
  },
];

export const CANCEL_NFT_LISTING_MULTI_DATASET: ComplexEvalDataset[] = [
  {
    description: "Multi-turn cancellation of NFT listing on Tensor",
    inputs: { query: "I need to cancel my NFT listing" },
    turns: [
      { input: "I need to cancel my NFT listing" },
      {
        input: "Cancel the listing for my NFT with mint 4KG7k12",
        expectedToolCall: {
          tool: "solana_cancel_nft_listing",
          params: { nftMint: "4KG7k12" },
        },
      },
    ],
  },
];

export const DEPLOY_COLLECTION_MULTI_DATASET: ComplexEvalDataset[] = [
  {
    description: "Multi-turn NFT collection deployment",
    inputs: { query: "I want to deploy an NFT collection" },
    turns: [
      { input: "I want to deploy an NFT collection" },
      { input: "The collection should be named MyCollection" },
      {
        input: "Its metadata URI is https://metadata.mycoll.io/collection.json",
      },
      {
        input: "Set the royalty to 250 basis points",
        expectedToolCall: {
          tool: "solana_deploy_collection",
          params: {
            name: "MyCollection",
            uri: "https://metadata.mycoll.io/collection.json",
            royaltyBasisPoints: 250,
          },
        },
      },
    ],
  },
];

export const OPENBOOK_CREATE_MARKET_MULTI_DATASET: ComplexEvalDataset[] = [
  {
    description: "Multi-turn openbook market creation",
    inputs: { query: "I need to create a new openbook market" },
    turns: [
      { input: "I need to create a new openbook market" },
      { input: "Let’s use SOL as the base mint" },
      { input: "And USDC as the quote mint" },
      {
        input: "Set the lot size to 100 and tick size to 1.5",
        expectedToolCall: {
          tool: "solana_openbook_create_market",
          params: {
            baseMint: "So11111111111111111111111111111111111111112",
            quoteMint: "EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v",
            lotSize: 100,
            tickSize: 1.5,
          },
        },
      },
    ],
  },
];

// Run every eval

runComplexEval(TRANSFER_DATASET, "Complex transfer test");
runComplexEval(TOKEN_SWAP_DATASET, "Complex token swap test");
runComplexEval(STAKING_DATASET, "Complex staking test");

runComplexEval(PUMPFUN_MULTI_DATASET, "Multi-turn PumpFun token launch test");
runComplexEval(
  BALANCE_OTHER_MULTI_DATASET,
  "Multi-turn SOL balance other test",
);

runComplexEval(
  CLOSE_EMPTY_ACCOUNTS_MULTI_DATASET,
  "Multi-turn close empty accounts test",
);
runComplexEval(FETCH_PRICE_MULTI_DATASET, "Multi-turn fetch price test");
runComplexEval(
  CREATE_GIBWORK_TASK_MULTI_DATASET,
  "Multi-turn create Gibwork task test",
);
runComplexEval(TOKEN_SWAP_MULTI_DATASET, "Multi-turn token swap test");
runComplexEval(TOKEN_DATA_MULTI_DATASET, "Multi-turn token data test");
runComplexEval(TIPLINK_MULTI_DATASET, "Multi-turn tiplink test");
runComplexEval(
  LIST_NFT_FOR_SALE_MULTI_DATASET,
  "Multi-turn list NFT for sale test",
);
runComplexEval(
  CANCEL_NFT_LISTING_MULTI_DATASET,
  "Multi-turn cancel NFT listing test",
);
runComplexEval(
  DEPLOY_COLLECTION_MULTI_DATASET,
  "Multi-turn deploy collection test",
);
runComplexEval(
  OPENBOOK_CREATE_MARKET_MULTI_DATASET,
  "Multi-turn openbook create market test",
);
