import { runComplexEval, ComplexEvalDataset } from "../utils/runEvals";

const DATASET: ComplexEvalDataset[] = [
  {
    description:
      "Multi-turn flow: Check JUP price, check JUP balance, sell all JUP, stake SOL",
    inputs: {
      query: "I want to manage my JUP and SOL",
    },
    turns: [
      {
        input: "What’s the current price of JUP?",
        expectedToolCall: {
          tool: "solana_fetch_price",
          params: { address: "JUPyiwrYJFskUPiHa7hkeR8VUtAeFoSYbKedZNsDvCN" },
        },
      },
      {
        input: "How much JUP do I have?",
        expectedToolCall: {
          tool: "solana_balance",
          params: {
            tokenAddress: "JUPyiwrYJFskUPiHa7hkeR8VUtAeFoSYbKedZNsDvCN",
          },
        },
      },
      {
        input: "Sell all my JUP for SOL. Try it even if the balance is 0.",
        expectedToolCall: {
          tool: "jupiter_trade",
          params: {
            inputMint: "JUPyiwrYJFskUPiHa7hkeR8VUtAeFoSYbKedZNsDvCN",
            outputMint: "So11111111111111111111111111111111111111112",
            // amount: "all", // leave out this field since we dont know the amount
            slippage: 0.5,
          },
        },
      },
      {
        input: "Stake 1 SOL",
        expectedToolCall: {
          tool: "solana_restake",
          params: { amount: 1 },
        },
      },
    ],
  },
  {
    description: "Multi-turn flow: Check balance and send SOL and tokens",
    inputs: {
      query: "I want to send some SOL to a friend",
    },
    turns: [
      {
        input: "How much SOL do I have?",
        expectedToolCall: {
          tool: "solana_balance",
          params: {},
        },
      },
      {
        input:
          "Transfer 0.1 SOL to GZbQmKYYzwjP3nbdqRWPLn98ipAni9w5eXMGp7bmZbGB",
        expectedToolCall: {
          tool: "solana_transfer",
          params: {
            to: "GZbQmKYYzwjP3nbdqRWPLn98ipAni9w5eXMGp7bmZbGB",
            amount: 0.1,
          },
        },
      },
      {
        input: "Check my SOL balance again",
        expectedToolCall: {
          tool: "solana_balance",
          params: {},
        },
      },
      {
        input: "How much JUP do I have?",
        expectedToolCall: {
          tool: "solana_balance",
          params: {
            tokenAddress: "JUPyiwrYJFskUPiHa7hkeR8VUtAeFoSYbKedZNsDvCN",
          },
        },
      },
      {
        input: "Send it all to GZbQmKYYzwjP3nbdqRWPLn98ipAni9w5eXMGp7bmZbGB",
        expectedToolCall: {
          tool: "solana_transfer",
          params: {
            to: "GZbQmKYYzwjP3nbdqRWPLn98ipAni9w5eXMGp7bmZbGB",
            amount: 0.1,
            tokenAddress: "JUPyiwrYJFskUPiHa7hkeR8VUtAeFoSYbKedZNsDvCN",
          },
        },
      },
    ],
  },
  {
    description: "Multi-turn flow: Check balance, mint NFT, verify assets",
    inputs: {
      query: "I want to create an NFT",
    },
    turns: [
      {
        input: "How much SOL do I have? I need some to mint NFTs?",
        expectedToolCall: {
          tool: "solana_balance",
          params: {},
        },
      },
      {
        input:
          "Mint an NFT with name 'MyFirstNFT' and symbol 'MFN', uri: https://example.com/nft.json.",
        expectedToolCall: {
          tool: "solana_mint_nft",
          params: {
            name: "MyFirstNFT",
            symbol: "MFN",
            uri: "https://example.com/nft.json",
          },
        },
      },
      {
        input: "Check my assets to see the new NFT",
        expectedToolCall: {
          tool: "solana_get_all_assets_by_owner",
          params: {},
        },
      },
    ],
  },
  {
    description: "Multi-turn flow: Check balance when asked to mint NFT.",
    inputs: {
      query: "Mint NFT if there is balance.",
    },
    turns: [
      {
        input:
          "Mint an NFT with name 'MyFirstNFT' and symbol 'MFN', uri: https://example.com/nft.json.",
        expectedToolCall: {
          // Should check balance before trying to mint
          tool: "solana_balance",
          params: {},
        },
      },
      {
        input: "Try minting the NFTs anyways",
        expectedToolCall: {
          // since the user said so, should try minting with zero balance and get an error
          tool: "solana_mint_nft",
          params: {
            name: "MyFirstNFT",
            symbol: "MFN",
            uri: "https://example.com/nft.json",
          },
        },
      },
    ],
  },
  {
    description: "Multi-turn flow: Mint NFT without balance",
    inputs: {
      query: "Mint NFT if there is balance.",
    },
    turns: [
      {
        input:
          "Mint an NFT with name 'MyFirstNFT' and symbol 'MFN', uri: https://example.com/nft.json.",
        expectedToolCall: {
          // will produce an error since the balance should be zero
          tool: "solana_mint_nft",
          params: {
            name: "MyFirstNFT",
            symbol: "MFN",
            uri: "https://example.com/nft.json",
          },
        },
      },
    ],
  },
  {
    description: "Multi-turn flow: Create multisig, deposit SOL",
    inputs: {
      query: "I want to set up a multisig wallet",
    },
    turns: [
      {
        input:
          "Create a 2-of-2 multisig with GZbQmKYYzwjP3nbdqRWPLn98ipAni9w5eXMGp7bmZbGB",
        expectedToolCall: {
          tool: "create_2by2_multisig",
          params: { creator: "GZbQmKYYzwjP3nbdqRWPLn98ipAni9w5eXMGp7bmZbGB" },
        },
      },
      {
        input: "Deposit 1 SOL into the multisig",
        expectedToolCall: {
          tool: "deposit_to_2by2_multisig",
          params: { amount: 1 },
        },
      },
    ],
  },
  {
    description:
      "Multi-turn flow: Price check, buy tokens, check balance, stake SOL",
    inputs: {
      query:
        "Check the price of USDC, buy 10 USDC using SOL, check my USDC balance, then stake 0.5 SOL.",
    },
    turns: [
      {
        input: "What's the price of USDC?",
        expectedToolCall: {
          tool: "solana_fetch_price",
          params: "EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v",
        },
      },
      {
        input: "Buy 10 USDC with 2% slippage using my SOL",
        expectedToolCall: {
          tool: "solana_trade",
          params: {
            outputMint: "EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v",
            inputAmount: 10,
            inputMint: "So11111111111111111111111111111111111111112",
            slippageBps: 200,
          },
        },
      },
      {
        input: "Now check my USDC balance",
        expectedToolCall: {
          tool: "solana_balance",
          params: {
            tokenAddres: "EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v",
          },
        },
      },
      {
        input: "Stake 0.5 SOL",
        expectedToolCall: {
          tool: "solana_stake",
          params: { amount: 0.5 },
        },
      },
    ],
  },
  {
    description:
      "Use a Drift Vault: create vault, deposit USDC, check vault info",
    inputs: {
      query: "I want to create and deposit into a new drift vault.",
    },
    turns: [
      {
        input:
          "Create a drift vault named 'LeverageVault' with redeemPeriod=2 days and profitShare=15",
        expectedToolCall: {
          tool: "create_drift_vault",
          params: {
            name: "LeverageVault",
            redeemPeriod: 2,
            profitShare: 15,
          },
        },
      },
      {
        input: "Deposit 200 USDC into the vault",
        expectedToolCall: {
          tool: "deposit_into_drift_vault",
          params: {
            vaultAddress: "LeverageVault",
            amount: 200,
          },
        },
      },
      {
        input: "Show me info about vault named 'LeverageVault'",
        expectedToolCall: {
          tool: "drift_vault_info",
          params: {
            vaultNameOrAddress: "LeverageVault",
          },
        },
      },
    ],
  },
  {
    description: "Multi-turn flow: get a token's info, then trade it for SOL",
    inputs: {
      query: "I want to check a token's info, then sell it for SOL.",
    },
    turns: [
      {
        input:
          "What is the token info for mint address JUPyiwrYJFskUPiHa7hkeR8VUtAeFoSYbKedZNsDvCN?",
        expectedToolCall: {
          tool: "solana_token_data",
          params: "JUPyiwrYJFskUPiHa7hkeR8VUtAeFoSYbKedZNsDvCN",
        },
      },
      {
        input: "How much of that token do I hold?",
        expectedToolCall: {
          tool: "solana_balance",
          params: {
            tokenAddress: "JUPyiwrYJFskUPiHa7hkeR8VUtAeFoSYbKedZNsDvCN",
          },
        },
      },
      {
        input: "Sell all of my JUP for SOL with a 1% slippage tolerance.",
        expectedToolCall: {
          tool: "solana_trade",
          params: {
            inputMint: "JUPyiwrYJFskUPiHa7hkeR8VUtAeFoSYbKedZNsDvCN",
            outputMint: "So11111111111111111111111111111111111111112",
            slippageBps: 100,
          },
        },
      },
    ],
  },
  {
    description:
      "Multi-turn flow: send tokens to multiple addresses and check final balances",
    inputs: {
      query: "I want to distribute some tokens to multiple wallets",
    },
    turns: [
      {
        input:
          "How many tokens do I have at mint EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v?",
        expectedToolCall: {
          tool: "solana_balance",
          params: {
            tokenAddress: "EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v",
          },
        },
      },
      {
        input:
          "Send 50 of those tokens to wallet GZbQmKYYzwjP3nbdqRWPLn98ipAni9w5eXMGp7bmZbGB",
        expectedToolCall: {
          tool: "solana_transfer",
          params: {
            to: "GZbQmKYYzwjP3nbdqRWPLn98ipAni9w5eXMGp7bmZbGB",
            amount: 50,
            mint: "EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v",
          },
        },
      },
      {
        input:
          "Then send 25 tokens to 9Sx1apT66k8Ne5TP8PFua5w9DCQ8HztqZ4ZGh9Ejp2x2",
        expectedToolCall: {
          tool: "solana_transfer",
          params: {
            to: "9Sx1apT66k8Ne5TP8PFua5w9DCQ8HztqZ4ZGh9Ejp2x2",
            amount: 25,
            mint: "EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v",
          },
        },
      },
      {
        input: "Check how many tokens I have left",
        expectedToolCall: {
          tool: "solana_balance",
          params: {
            tokenAddress: "EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v",
          },
        },
      },
    ],
  },
  {
    description:
      "Multi-turn flow: buy tokens with SOL, then stake them, re-check SOL balance",
    inputs: {
      query:
        "I want to buy some tokens, stake them, and see how much SOL remains.",
    },
    turns: [
      {
        input: "Buy 10 USDC with my SOL using 2% slippage.",
        expectedToolCall: {
          tool: "solana_trade",
          params: {
            outputMint: "EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v",
            inputAmount: 10,
            inputMint: "So11111111111111111111111111111111111111112",
            slippageBps: 200,
          },
        },
      },
      {
        input: "Now stake 1 SOL",
        expectedToolCall: {
          tool: "solana_stake",
          params: { amount: 1 },
        },
      },
      {
        input: "Check how much SOL I have left after staking",
        expectedToolCall: {
          tool: "solana_balance",
          params: "{}",
        },
      },
    ],
  },
  {
    description:
      "Multi-turn flow: stake 2.5 SOL if I have enough, otherwise request from faucet, then re-check SOL balance",
    inputs: {
      query: "I want to stake 2.5 SOL. Not sure if I have enough though.",
    },
    turns: [
      {
        input: "How many SOL do I have?",
        expectedToolCall: {
          tool: "solana_balance",
          params: "{}",
        },
      },
      {
        input:
          "If it's under 2.5, please request from faucet, else let's proceed.",
        expectedToolCall: {
          tool: "solana_request_funds",
          params: "{}",
        },
      },
      {
        input: "Check how much SOL I have now",
        expectedToolCall: {
          tool: "solana_balance",
          params: "{}",
        },
      },
    ],
  },
];

async function clusterAwarenessEval() {
  const devnet = {
    description: "Multi-turn flow: if on devnet request funds from faucet",
    inputs: {
      query: "Check if on devnet",
    },
    turns: [
      {
        input: "Are you connected to the Solana mainnet or devnet?",
        expectedResponse: "I am connected to the devnet.",
      },
      {
        input: "Request 2 SOL from the faucet",
        expectedToolCall: {
          tool: "solana_request_funds",
          params: "{}",
        },
      },
      {
        input: "Check how much SOL I have now",
        expectedToolCall: {
          tool: "solana_balance",
          params: "{}",
        },
      },
    ],
  };
  const mainnet = {
    description:
      "Multi-turn flow: if on mainnet requesting faucet funds should fail",
    inputs: {
      query: "Check if on mainnet",
    },
    turns: [
      {
        input: "Are you connected to the Solana mainnet or devnet?",
        expectedResponse: "I am connected to the mainnet.",
      },
      {
        input: "Request 2 SOL from the faucet",
        expectedResponse: "I cannot request funds from the faucet on mainnet.",
      },
    ],
  };

  const rpc = process.env.RPC_URL || "https://api.devnet.solana.com";
  try {
    const response = await fetch(rpc, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        jsonrpc: "2.0",
        id: 1,
        method: "getGenesisHash",
      }),
    });

    const data = await response.json();
    const genesisHash = data.result;

    const mainnetHash = "5eykt4UsFv8P8NJdTREpY1vzqKqZKvdpKuc147dw2N9d";
    const devnetHash = "EtWTRABZaYq6iMfeYKouRu166VU2xqa1wcaWoxPkrZBG";

    if (genesisHash === mainnetHash) {
      return mainnet;
    } else {
      return devnet;
    }
  } catch (error) {
    console.error("Error checking cluster:", error);
    return devnet;
  }
}

async function runEvaluations() {
  const clusterEval = await clusterAwarenessEval();
  const updatedDataset = [...DATASET, clusterEval];
  runComplexEval(updatedDataset, "Multi-turn Basic User Flows Evals");
}

runEvaluations();
